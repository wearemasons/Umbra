#!/usr/bin/env python3
"""
Research Paper Automation Bot
Processes research papers from a CSV file and populates a Convex database with structured data
"""

import asyncio
import json
import logging
import os
import time
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import pandas as pd

from config import load_config, PaperData
from database import ConvexDatabase
from extraction import PaperExtractor
from progress_tracker import ProgressTracker


def setup_logging():
    """Set up logging configuration"""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s",
        handlers=[logging.FileHandler("automation.log"), logging.StreamHandler()],
    )


async def main():
    """Main function to run the automation bot"""
    setup_logging()
    logger = logging.getLogger(__name__)

    logger.info("Starting Research Paper Automation Bot...")

    # Load configuration
    config = load_config()

    # Initialize components
    convex_db = ConvexDatabase(
        config.convex_url, config.convex_deploy_key, config.gemini_api_key
    )
    extractor = PaperExtractor(config.gemini_api_key)
    progress_tracker = ProgressTracker()

    try:
        # Load CSV file
        df = pd.read_csv(config.input_csv_path)
        total_rows = len(df)

        # Load progress
        progress = progress_tracker.load_progress()
        start_row = progress.get("last_processed_row", -1) + 1

        logger.info(f"Total papers to process: {total_rows}")
        logger.info(f"Starting from row: {start_row}")

        # Process papers
        processed_count = 0
        failed_count = 0

        for idx in range(start_row, total_rows):
            try:
                pub_id = (
                    None  # Initialize pub_id to None at the start of each iteration
                )
                row = df.iloc[idx]
                title = str(row.get("title", row.get("Title", "")))
                link = str(row.get("link", row.get("Link", "")))

                logger.info(f"Processing paper {idx + 1}/{total_rows}: {title[:50]}...")

                logger.info(f"Starting to extract paper data...")
                # Fetch and extract paper data
                paper_data = await extractor.extract_paper_data(link, title)

                logger.info(
                    f"Paper data extraction completed, inserting into database..."
                )
                # Store in database
                pub_id = await convex_db.insert_publication(paper_data)

                logger.info(f"Publication inserted, now inserting embeddings...")
                await convex_db.insert_embeddings(pub_id, paper_data, extractor)

                logger.info(f"Updating processing status to completed...")
                # Update processing status to completed
                await convex_db.update_processing_status(pub_id, "completed")
                logger.info(f"Processing status updated successfully")

                # Update progress
                progress_tracker.update_progress(idx, title, total_rows)
                processed_count += 1
                logger.info(f"Paper {idx + 1}/{total_rows} processed successfully")

                # Minimal delay between papers since rate limiting is handled in individual API calls
                await asyncio.sleep(0.1)

                # Print progress updates every 10 papers
                if (idx + 1) % 10 == 0:
                    logger.info(f"Progress: {idx + 1}/{total_rows} papers processed")

            except Exception as e:
                logger.error(f"Error processing paper at row {idx}: {str(e)}")
                failed_count += 1

                # Update processing status to failed in database if pub_id is available
                try:
                    if pub_id is not None:
                        await convex_db.update_processing_status(pub_id, "failed")
                except Exception as db_error:
                    logger.error(f"Error updating status for paper {idx}: {db_error}")

                # Track failed paper
                try:
                    progress_tracker.add_failed_paper(
                        idx, str(row.get("title", row.get("Title", ""))), str(e)
                    )
                except:
                    progress_tracker.add_failed_paper(idx, title, str(e))

                # Continue with next paper
                continue

        # Final summary
        logger.info(
            f"Processing completed. Total processed: {processed_count}, Failed: {failed_count}"
        )
        logger.info("Research Paper Automation Bot finished.")

    except Exception as e:
        logger.error(f"Critical error in main process: {str(e)}")
        raise
    finally:
        # Close database connection
        try:
            await convex_db.close()
        except:
            pass  # If closing fails, continue


if __name__ == "__main__":
    asyncio.run(main())
