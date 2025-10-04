import asyncio
import logging
import re
import time
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin

import bs4
import google.generativeai as genai
import httpx
import requests
from bs4 import BeautifulSoup

from config import PaperData
from rate_limiter import RateLimiter


class PaperExtractor:
    """Handles fetching and extracting content from research papers"""

    def __init__(self, gemini_api_key: str):
        self.gemini_api_key = gemini_api_key
        genai.configure(api_key=gemini_api_key)
        self.model = genai.GenerativeModel("models/gemini-2.0-flash")
        self.model_name = "gemini-2.0-flash"
        self.logger = logging.getLogger(__name__)
        self.rate_limiter = RateLimiter()

    async def extract_paper_data(self, link: str, title: str) -> PaperData:
        """Extract paper data from the provided link"""
        try:
            # Fetch the paper content
            content = await self.fetch_paper_content(link)

            # Parse the content to extract structured data
            parsed_data = self.parse_paper_content(content, link)

            # Create initial PaperData object with full text
            paper_data = PaperData(
                title=parsed_data.get("title", title),
                authors=parsed_data.get("authors", []),
                abstract=parsed_data.get("abstract", ""),
                publication_date=parsed_data.get("publication_date", ""),
                doi=parsed_data.get("doi", ""),
                pdf_url=parsed_data.get("pdf_url", ""),
                keywords=parsed_data.get("keywords", []),
                full_text=content,  # Store the entire paper content
                methods=parsed_data.get("methods", ""),
                results=parsed_data.get("results", ""),
                discussion=parsed_data.get("discussion", ""),
                conclusions=parsed_data.get("conclusions", ""),
                citation_count=parsed_data.get("citation_count", 0),
                view_count=parsed_data.get("view_count", 0),
            )

            self.logger.info(
                f"Starting entity extraction for paper: {paper_data.title[:50]}..."
            )
            # Extract entities using Gemini API (using the full content if available, otherwise abstract)
            full_content_for_gemini = content
            entities = await self.extract_entities_with_gemini(full_content_for_gemini)
            paper_data.organisms = entities.get("organisms", [])
            paper_data.experimental_conditions = entities.get(
                "experimental_conditions", []
            )
            paper_data.biological_processes = entities.get("biological_processes", [])
            paper_data.space_environments = entities.get("space_environments", [])

            self.logger.info(
                f"Entity extraction completed. Found {len(paper_data.organisms)} organisms, {len(paper_data.experimental_conditions)} experimental conditions, {len(paper_data.biological_processes)} biological processes, {len(paper_data.space_environments)} space environments"
            )

            return paper_data
        except Exception as e:
            self.logger.error(f"Error extracting paper data from {link}: {str(e)}")
            # Return a minimal PaperData object with required fields in case of error
            return PaperData(
                title=title,
                authors=[],
                abstract="",
                publication_date="",
                doi="",
                pdf_url="",
                keywords=[],
                full_text="",
                methods="",
                results="",
                discussion="",
                conclusions="",
                citation_count=0,
                view_count=0,
                organisms=[],
                experimental_conditions=[],
                biological_processes=[],
                space_environments=[],
            )

    async def fetch_paper_content(self, link: str, max_retries: int = 3) -> str:
        """Fetch paper content from the link with retry logic"""
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }

        for attempt in range(max_retries):
            try:
                # Use httpx with follow_redirects=True to handle redirects
                async with httpx.AsyncClient(
                    timeout=30.0, follow_redirects=True
                ) as client:
                    response = await client.get(link, headers=headers)
                    response.raise_for_status()
                    return response.text
            except Exception as e:
                self.logger.warning(
                    f"Attempt {attempt + 1} failed to fetch {link}: {e}"
                )
                if attempt < max_retries - 1:
                    # Exponential backoff
                    wait_time = (2**attempt) + 1
                    await asyncio.sleep(wait_time)
                else:
                    raise e

        raise Exception(f"Failed to fetch content after {max_retries} attempts")

    def parse_paper_content(self, content: str, link: str) -> Dict:
        """Parse the HTML content to extract structured data"""
        soup = BeautifulSoup(content, "html.parser")

        # Extract title
        title = ""
        title_tag = soup.find(["h1", "h2"], class_=re.compile(r".*title.*", re.I))
        if title_tag:
            title = title_tag.get_text().strip()
        else:
            title_tag = soup.find("title")
            if title_tag:
                title = title_tag.get_text().strip()

        # Extract authors
        authors = []
        # Try to find authors using common selectors
        author_selectors = [
            'meta[name="citation_author"]',
            'meta[name="authors"]',
            ".author",
            ".authors",
            ".citation-author",
            '[data-test-id="author-name"]',
        ]

        for selector in author_selectors:
            author_tags = soup.select(selector)
            if author_tags:
                authors = [tag.get_text().strip() for tag in author_tags]
                break

        # Extract abstract
        abstract = ""
        abstract_selectors = [
            ".abstract",
            ".Abstract",
            "#abstract",
            '[id*="abstract"]',
            ".abstract-text",
            ".abstract-title",
        ]

        for selector in abstract_selectors:
            abstract_tag = soup.select_one(selector)
            if abstract_tag:
                # Clean up abstract text
                abstract = abstract_tag.get_text().strip()
                # Remove "Abstract" heading if present
                abstract = re.sub(r"^\s*Abstract\s*", "", abstract, flags=re.IGNORECASE)
                break

        # Extract methods section - improved selector approach
        methods = ""
        # Try to find methods section by looking for h2/h3 headers with methods-related text
        header_selectors = ["h2", "h3", "h4"]
        methods_keywords = ["methods", "method", "material", "materials", "materials and methods", "methodology"]
        
        for header_selector in header_selectors:
            headers = soup.select(header_selector)
            for header in headers:
                header_text = header.get_text().lower().strip()
                if any(keyword in header_text for keyword in methods_keywords):
                    # Get the next sibling element which typically contains the content
                    next_elem = header.find_next_sibling()
                    if next_elem:
                        methods = next_elem.get_text().strip()
                        break
            if methods:
                break
        
        # If methods not found with header approach, try CSS selectors
        if not methods:
            methods_selectors = [
                ".methods",
                ".method",
                "#methods",
                "#method",
                '[id*="methods"]',
                '[id*="method"]',
            ]
            
            for selector in methods_selectors:
                methods_tag = soup.select_one(selector)
                if methods_tag:
                    methods = methods_tag.get_text().strip()
                    break

        # Extract results section - improved selector approach
        results = ""
        results_keywords = ["results", "result", "findings", "outcome", "outcomes"]
        
        for header_selector in header_selectors:
            headers = soup.select(header_selector)
            for header in headers:
                header_text = header.get_text().lower().strip()
                if any(keyword in header_text for keyword in results_keywords):
                    next_elem = header.find_next_sibling()
                    if next_elem:
                        results = next_elem.get_text().strip()
                        break
            if results:
                break
        
        # If results not found with header approach, try CSS selectors
        if not results:
            results_selectors = [
                ".results",
                "#results",
                '[id*="results"]',
                ".result",
                "#result",
                '[id*="result"]',
            ]
            
            for selector in results_selectors:
                results_tag = soup.select_one(selector)
                if results_tag:
                    results = results_tag.get_text().strip()
                    break

        # Extract discussion section - improved selector approach
        discussion = ""
        discussion_keywords = ["discussion", "discuss", "interpretation"]
        
        for header_selector in header_selectors:
            headers = soup.select(header_selector)
            for header in headers:
                header_text = header.get_text().lower().strip()
                if any(keyword in header_text for keyword in discussion_keywords):
                    next_elem = header.find_next_sibling()
                    if next_elem:
                        discussion = next_elem.get_text().strip()
                        break
            if discussion:
                break
                
        # If discussion not found with header approach, try CSS selectors
        if not discussion:
            discussion_selectors = [
                ".discussion",
                "#discussion",
                '[id*="discussion"]',
            ]
            
            for selector in discussion_selectors:
                discussion_tag = soup.select_one(selector)
                if discussion_tag:
                    discussion = discussion_tag.get_text().strip()
                    break

        # Extract conclusions section - improved selector approach
        conclusions = ""
        conclusion_keywords = ["conclusion", "conclusions", "summary", "concluding", "final remarks"]
        
        for header_selector in header_selectors:
            headers = soup.select(header_selector)
            for header in headers:
                header_text = header.get_text().lower().strip()
                if any(keyword in header_text for keyword in conclusion_keywords):
                    next_elem = header.find_next_sibling()
                    if next_elem:
                        conclusions = next_elem.get_text().strip()
                        break
            if conclusions:
                break
                
        # If conclusions not found with header approach, try CSS selectors
        if not conclusions:
            conclusions_selectors = [
                ".conclusion",
                ".conclusions",
                "#conclusion",
                "#conclusions",
                '[id*="conclusion"]',
                '[id*="conclusions"]',
            ]
            
            for selector in conclusions_selectors:
                conclusions_tag = soup.select_one(selector)
                if conclusions_tag:
                    conclusions = conclusions_tag.get_text().strip()
                    break

        # Extract publication date
        pub_date = ""
        date_selectors = [
            'meta[name="citation_publication_date"]',
            'meta[property*="date"]',
            ".pub-date",
            ".publication-date",
            ".article-date",
        ]

        for selector in date_selectors:
            date_tag = soup.select_one(selector)
            if date_tag:
                pub_date = date_tag.get("content") or date_tag.get_text().strip()
                break

        # Extract DOI
        doi = ""
        doi_selectors = [
            'meta[name="citation_doi"]',
            'meta[name="doi"]',
            ".doi",
            ".DOI",
            '[id*="doi"]',
        ]

        for selector in doi_selectors:
            doi_tag = soup.select_one(selector)
            if doi_tag:
                doi = doi_tag.get("content") or doi_tag.get_text().strip()
                break

        # Extract keywords
        keywords = []
        keyword_selectors = [
            'meta[name="keywords"]',
            ".keyword",
            ".keywords",
            ".kwd",
            ".Keyword",
        ]

        for selector in keyword_selectors:
            keyword_tag = soup.select_one(selector)
            if keyword_tag:
                content = keyword_tag.get("content") or keyword_tag.get_text()
                keywords = [k.strip() for k in content.split(",") if k.strip()]
                # Clean up keywords to remove extra text
                clean_keywords = []
                for keyword in keywords:
                    # Remove common prefixes like "Keywords:"
                    clean_keyword = re.sub(r"^[Kk]eywords:\s*", "", keyword)
                    if clean_keyword.strip():
                        clean_keywords.append(clean_keyword.strip())
                keywords = clean_keywords
                break

        # Extract PDF URL if available
        pdf_url = ""
        pdf_selectors = [
            'a[href$=".pdf"]',
            'a[title*="PDF"]',
            'a[title*="pdf"]',
            'a[href*="pdf"]',
        ]

        for selector in pdf_selectors:
            pdf_tag = soup.select_one(selector)
            if pdf_tag:
                href = pdf_tag.get("href")
                if href:
                    pdf_url = urljoin(link, href)
                    break

        # Extract citation and view counts (specific to NCBI PubMed)
        citation_count = 0
        view_count = 0

        # Look for citation count - avoiding :contains selector due to deprecation
        citation_selectors = [
            ".citation-count",
            ".cited-by",
            '[data-test-id*="cited"]',
        ]

        for selector in citation_selectors:
            citation_tag = soup.select_one(selector)
            if citation_tag:
                text = citation_tag.get_text()
                match = re.search(r"\d+", text)
                if match:
                    citation_count = int(match.group())
                    break

        return {
            "title": title,
            "authors": authors,
            "abstract": abstract,
            "methods": methods,
            "results": results,
            "discussion": discussion,
            "conclusions": conclusions,
            "publication_date": pub_date,
            "doi": doi,
            "pdf_url": pdf_url,
            "keywords": keywords,
            "citation_count": citation_count,
            "view_count": view_count,
        }

    async def extract_entities_with_gemini(self, content: str) -> Dict[str, List[str]]:
        """Extract entities using Gemini API"""
        # Limit content to avoid exceeding token limits
        max_length = 40000  # Roughly 30k tokens
        if len(content) > max_length:
            content = content[:max_length]

        # Define the entity extraction prompt
        prompt = f"""
        Analyze the following research paper content and extract the following information:

        1. Organisms: Species, microorganisms, cell types mentioned in the paper
        2. Experimental Conditions: Temperature, pressure, radiation, microgravity, etc.
        3. Biological Processes: Cellular processes, molecular pathways, physiological responses
        4. Space Environments: ISS, microgravity, cosmic radiation, specific mission contexts

        Paper Content:
        {content}

        Provide the results as a JSON object with the following keys:
        {{
          "organisms": [list of organisms],
          "experimental_conditions": [list of experimental conditions],
          "biological_processes": [list of biological processes],
          "space_environments": [list of space environments]
        }}

        Return only the JSON object with no additional text.
        """

        try:
            self.logger.info("Starting Gemini API call for entity extraction...")
            # Apply proper rate limiting based on Google's official limits
            await self.rate_limiter.wait_for_rate_limit(self.model_name, prompt)

            # Add timeout to the API call
            import concurrent.futures
            import time

            def call_gemini_api():
                return self.model.generate_content_async(prompt)

            # Since asyncio.wait_for doesn't work well with nested async calls in this context,
            # let's set a timeout by using a separate thread with a timeout
            loop = asyncio.get_event_loop()
            try:
                response = await asyncio.wait_for(
                    self.model.generate_content_async(prompt),
                    timeout=60,  # 60 seconds timeout
                )
            except asyncio.TimeoutError:
                self.logger.error("Gemini API call timed out after 60 seconds")
                return {
                    "organisms": [],
                    "experimental_conditions": [],
                    "biological_processes": [],
                    "space_environments": [],
                }

            self.logger.info("Gemini API call completed, processing response...")

            # Extract JSON from response
            text = response.text.strip()

            # Clean up the response to extract JSON
            if text.startswith("```json"):
                text = text[7:]  # Remove ```json
            if text.endswith("```"):
                text = text[:-3]  # Remove ```

            import json

            result = json.loads(text)

            self.logger.info("Entity extraction response processed successfully")

            return {
                "organisms": result.get("organisms", []),
                "experimental_conditions": result.get("experimental_conditions", []),
                "biological_processes": result.get("biological_processes", []),
                "space_environments": result.get("space_environments", []),
            }
        except Exception as e:
            self.logger.error(f"Error extracting entities with Gemini: {e}")
            # Return empty lists in case of error
            return {
                "organisms": [],
                "experimental_conditions": [],
                "biological_processes": [],
                "space_environments": [],
            }
