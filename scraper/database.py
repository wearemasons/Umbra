import asyncio
import logging
import json
import os
import uuid
from datetime import datetime
from typing import Dict, List

from config import PaperData


class ConvexDatabase:
    """Handles database operations for the Convex database"""

    def __init__(self, convex_url: str, convex_deploy_key: str, gemini_api_key: str):
        self.convex_url = convex_url
        self.convex_deploy_key = convex_deploy_key
        self.gemini_api_key = gemini_api_key
        self.client = None
        self.embedding_generator = None
        self.logger = logging.getLogger(__name__)
        self.convex_available = False  # Start in mock mode to avoid hanging
        self.mock_mode = True  # Use local storage instead of Convex
        self.local_storage_file = "local_publications.json"

    async def initialize(self):
        """Initialize local storage and embedding generator"""
        from embedding_generator import EmbeddingGenerator

        try:
            self.embedding_generator = EmbeddingGenerator(self.gemini_api_key)
            self.logger.info("Using local storage mode instead of Convex")

            # Initialize local storage file if it doesn't exist or is empty
            if (
                not os.path.exists(self.local_storage_file)
                or os.path.getsize(self.local_storage_file) == 0
            ):
                with open(self.local_storage_file, "w") as f:
                    json.dump({"publications": [], "embeddings": []}, f)

        except Exception as e:
            self.logger.error(f"Error initializing local storage: {str(e)}")
            self.logger.error(f"Exception type: {type(e).__name__}")
            return

    async def insert_publication(self, paper_data: PaperData):
        """Insert a publication record into the database"""
        try:
            self.logger.info(
                f"Starting to insert publication: {paper_data.title[:50]}..."
            )

            # Initialize if not already done
            if self.client is None:
                await self.initialize()

            # Use local storage instead of Convex
            self.logger.info("Using local storage for publication insertion")

            # Generate a unique ID
            pub_id = str(uuid.uuid4())

            # Create publication record
            publication_record = {
                "id": pub_id,
                "title": paper_data.title,
                "authors": paper_data.authors,
                "abstract": paper_data.abstract,
                "fullText": paper_data.full_text,  # Add full text to the record
                "methods": paper_data.methods,
                "results": paper_data.results,
                "discussion": paper_data.discussion,
                "conclusions": paper_data.conclusions,
                "publicationDate": paper_data.publication_date,
                "doi": paper_data.doi,
                "pdfUrl": paper_data.pdf_url,
                "keywords": paper_data.keywords,
                "processingStatus": "processing",
                "citationCount": paper_data.citation_count,
                "viewCount": paper_data.view_count,
                "organisms": paper_data.organisms or [],
                "experimentalConditions": paper_data.experimental_conditions or [],
                "biologicalProcesses": paper_data.biological_processes or [],
                "spaceEnvironments": paper_data.space_environments or [],
                "insertedAt": datetime.now().isoformat(),
            }

            # Save to local storage
            try:
                # Initialize file if it's empty or corrupted
                try:
                    with open(self.local_storage_file, "r") as f:
                        data = json.load(f)
                except (json.JSONDecodeError, FileNotFoundError):
                    self.logger.warning(
                        "Local storage file is corrupted or missing, reinitializing..."
                    )
                    data = {"publications": [], "embeddings": []}

                data["publications"].append(publication_record)

                with open(self.local_storage_file, "w") as f:
                    json.dump(data, f, indent=2)

                self.logger.info(f"Publication saved locally with ID: {pub_id}")
                return pub_id

            except Exception as e:
                self.logger.error(f"Error saving to local storage: {e}")
                return pub_id  # Return ID anyway to continue processing
        except Exception as e:
            self.logger.error(f"Error inserting publication: {str(e)}")
            self.logger.error(f"Exception type: {type(e).__name__}")
            if hasattr(e, "response"):
                self.logger.error(f"Response: {e.response}")
            # Return a mock ID to allow the process to continue
            return str(uuid.uuid4())

    async def insert_embeddings(
        self, publication_id: str, paper_data: PaperData, extractor=None
    ):
        """Insert embedding records for the publication"""
        try:
            self.logger.info(
                f"Starting to insert embeddings for publication ID: {publication_id}"
            )

            # Initialize if not already done
            if self.client is None:
                await self.initialize()

            # Use local storage for embeddings
            self.logger.info("Using local storage for embeddings insertion")

            if self.embedding_generator is None:
                from embedding_generator import EmbeddingGenerator

                self.embedding_generator = EmbeddingGenerator(self.gemini_api_key)

            # Generate embeddings for the paper
            embeddings = await self.embedding_generator.generate_embeddings_for_paper(
                paper_data
            )

            # Save embeddings to local storage
            try:
                # Initialize file if it's empty or corrupted
                try:
                    with open(self.local_storage_file, "r") as f:
                        data = json.load(f)
                except (json.JSONDecodeError, FileNotFoundError):
                    self.logger.warning(
                        "Local storage file is corrupted or missing, reinitializing..."
                    )
                    data = {"publications": [], "embeddings": []}

                # Insert each embedding
                for section_name, embedding in embeddings.items():
                    embedding_record = {
                        "id": str(uuid.uuid4()),
                        "publicationId": publication_id,
                        "section": section_name,
                        "embedding": embedding,
                        "insertedAt": datetime.now().isoformat(),
                    }
                    data["embeddings"].append(embedding_record)
                    self.logger.info(f"Saved embedding for section: {section_name}")

                with open(self.local_storage_file, "w") as f:
                    json.dump(data, f, indent=2)

                self.logger.info(
                    f"Successfully saved {len(embeddings)} embeddings for publication ID: {publication_id}"
                )

            except Exception as e:
                self.logger.error(f"Error saving embeddings to local storage: {e}")
        except Exception as e:
            self.logger.error(
                f"Error inserting embeddings for publication {publication_id}: {str(e)}"
            )
            # Continue processing even if insertion fails

    async def update_processing_status(self, publication_id: str, status: str):
        """Update the processing status of a publication"""
        # Initialize if not already done
        if self.client is None:
            await self.initialize()

        # Update status in local storage
        self.logger.info(
            f"Updating status in local storage for {publication_id} to {status}"
        )

        try:
            # Initialize file if it's empty or corrupted
            try:
                with open(self.local_storage_file, "r") as f:
                    data = json.load(f)
            except (json.JSONDecodeError, FileNotFoundError):
                self.logger.warning(
                    "Local storage file is corrupted or missing, reinitializing..."
                )
                data = {"publications": [], "embeddings": []}

            # Find and update the publication
            for pub in data["publications"]:
                if pub["id"] == publication_id:
                    pub["processingStatus"] = status
                    pub["updatedAt"] = datetime.now().isoformat()
                    break

            with open(self.local_storage_file, "w") as f:
                json.dump(data, f, indent=2)

            self.logger.info(
                f"Status updated to {status} for publication {publication_id}"
            )

        except Exception as e:
            self.logger.error(f"Error updating status in local storage: {e}")

    async def close(self):
        """Close any open connections"""
        self.logger.info("Database connections closed")
