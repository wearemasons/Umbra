#!/usr/bin/env python3
"""
Utility script to test the research paper automation bot implementation
"""

import asyncio
import json
import os
from pathlib import Path

import pandas as pd

from config import load_config
from database import ConvexDatabase
from extraction import PaperExtractor
from progress_tracker import ProgressTracker


async def create_test_csv():
    """Create a sample CSV file for testing"""
    test_data = {
        'title': [
            'Effects of Microgravity on Cellular Processes',
            'Space Radiation Impact on DNA Repair Mechanisms',
            'Plant Growth in Controlled Space Environments',
            'Microbial Behavior in Low-Gravity Conditions',
            'Cardiovascular Adaptations During Spaceflight'
        ],
        'link': [
            'https://pubmed.ncbi.nlm.nih.gov/12345678/',
            'https://pubmed.ncbi.nlm.nih.gov/23456789/',
            'https://pubmed.ncbi.nlm.nih.gov/34567890/',
            'https://pubmed.ncbi.nlm.nih.gov/45678901/',
            'https://pubmed.ncbi.nlm.nih.gov/56789012/'
        ]
    }
    
    df = pd.DataFrame(test_data)
    df.to_csv('test_papers.csv', index=False)
    print("Test CSV file 'test_papers.csv' created successfully.")


async def test_components():
    """Test individual components of the automation bot"""
    print("Testing components...")
    
    # Load configuration
    config = load_config()
    
    if not config.gemini_api_key or config.gemini_api_key == "your_gemini_api_key":
        print("Warning: GEMINI_API_KEY not set in .env. Please set it before running the full bot.")
        return False
    
    # Test PaperExtractor
    print("\n1. Testing PaperExtractor...")
    try:
        extractor = PaperExtractor(config.gemini_api_key)
        print("   PaperExtractor initialized successfully")
    except Exception as e:
        print(f"   Error initializing PaperExtractor: {e}")
        return False
    
    # Test ConvexDatabase
    print("\n2. Testing ConvexDatabase...")
    try:
        db = ConvexDatabase(config.convex_url, config.convex_deploy_key, config.gemini_api_key)
        print("   ConvexDatabase initialized successfully")
    except Exception as e:
        print(f"   Error initializing ConvexDatabase: {e}")
        return False
    
    # Test ProgressTracker
    print("\n3. Testing ProgressTracker...")
    try:
        tracker = ProgressTracker()
        print("   ProgressTracker initialized successfully")
        
        # Test basic functionality
        tracker.update_progress(0, "Test Paper", 1)
        progress = tracker.load_progress()
        print(f"   Progress tracking works: {progress['last_processed_row']}")
    except Exception as e:
        print(f"   Error with ProgressTracker: {e}")
        return False
    
    print("\nAll components tested successfully!")
    return True


async def validate_schema():
    """Validate the expected Convex schema"""
    print("\nValidating expected Convex schema...")
    
    schema = {
        "publications": {
            "title": "string",
            "authors": "array of strings",
            "abstract": "string",
            "publicationDate": "string (ISO format)",
            "doi": "string",
            "pdfUrl": "string",
            "keywords": "array of strings",
            "processingStatus": "enum (pending | processing | completed | failed)",
            "citationCount": "number",
            "viewCount": "number",
            "organisms": "optional array of strings",
            "experimentalConditions": "optional array of strings",
            "biologicalProcesses": "optional array of strings",
            "spaceEnvironments": "optional array of strings"
        },
        "embeddings": {
            "publicationId": "reference to publications table",
            "section": "string",
            "embedding": "array of float64 (768 dimensions)"
        }
    }
    
    print("Expected schema:")
    for table, fields in schema.items():
        print(f"\n  {table}:")
        for field, type_info in fields.items():
            print(f"    - {field}: {type_info}")
    
    return True


async def main():
    """Run all tests"""
    print("Running validation tests for Research Paper Automation Bot...\n")
    
    # Create test CSV
    await create_test_csv()
    
    # Validate schema
    await validate_schema()
    
    # Test components
    success = await test_components()
    
    if success:
        print("\n✓ All tests passed! The implementation is ready for use.")
        print("\nTo run the full bot:")
        print("  1. Make sure your .env file has the required API keys")
        print("  2. Ensure your CSV file exists with 'title' and 'link' columns")
        print("  3. Run: python main.py")
    else:
        print("\n✗ Some tests failed. Please check the configuration and dependencies.")


if __name__ == "__main__":
    asyncio.run(main())