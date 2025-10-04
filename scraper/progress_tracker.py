import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, List


class ProgressTracker:
    """Handles progress tracking for the automation bot"""
    
    def __init__(self, progress_file: str = "progress.json"):
        self.progress_file = progress_file
    
    def load_progress(self) -> Dict[str, Any]:
        """Load progress from the progress file"""
        if os.path.exists(self.progress_file):
            with open(self.progress_file, 'r') as f:
                return json.load(f)
        else:
            return {
                "last_processed_row": -1,
                "total_rows": 0,
                "last_processed_title": "",
                "timestamp": "",
                "failed_papers": []
            }
    
    def update_progress(self, row: int, title: str, total_rows: int):
        """Update progress with the last processed row"""
        progress = self.load_progress()
        
        progress["last_processed_row"] = row
        progress["last_processed_title"] = title
        progress["total_rows"] = total_rows
        progress["timestamp"] = datetime.now().isoformat()
        
        with open(self.progress_file, 'w') as f:
            json.dump(progress, f, indent=2)
    
    def add_failed_paper(self, row: int, title: str, error: str):
        """Add a failed paper to the progress tracking"""
        progress = self.load_progress()
        
        failed_paper = {
            "row": row,
            "title": title,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        
        progress["failed_papers"].append(failed_paper)
        
        with open(self.progress_file, 'w') as f:
            json.dump(progress, f, indent=2)