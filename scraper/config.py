import os
from dataclasses import dataclass
from typing import List, Optional, Dict, Any

@dataclass
class PaperData:
    """Data class for paper information"""
    title: str
    authors: List[str]
    abstract: str
    publication_date: str
    doi: str
    pdf_url: str
    keywords: List[str]
    full_text: str = ""  # Add field for the entire paper content
    methods: str = ""
    results: str = ""
    discussion: str = ""
    conclusions: str = ""
    citation_count: int = 0
    view_count: int = 0
    organisms: Optional[List[str]] = None
    experimental_conditions: Optional[List[str]] = None
    biological_processes: Optional[List[str]] = None
    space_environments: Optional[List[str]] = None

@dataclass
class Configuration:
    """Configuration class for the automation bot"""
    convex_url: str
    convex_deploy_key: str
    gemini_api_key: str
    input_csv_path: str

def load_config() -> Configuration:
    """Load configuration from environment variables"""
    from dotenv import load_dotenv
    load_dotenv()
    
    return Configuration(
        convex_url=os.getenv("CONVEX_URL", ""),
        convex_deploy_key=os.getenv("CONVEX_DEPLOY_KEY", ""),
        gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
        input_csv_path=os.getenv("INPUT_CSV_PATH", "papers.csv")
    )