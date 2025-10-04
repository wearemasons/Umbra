import asyncio
import logging
from typing import Dict, List

import google.generativeai as genai
from rate_limiter import RateLimiter


class EmbeddingGenerator:
    """Handles the generation of embeddings using Gemini API"""

    def __init__(self, gemini_api_key: str):
        self.gemini_api_key = gemini_api_key
        genai.configure(api_key=gemini_api_key)
        self.logger = logging.getLogger(__name__)
        self.rate_limiter = RateLimiter()
        self.model_name = "text-embedding-004"

    async def generate_embedding(self, text: str) -> List[float]:
        """Generate a 768-dimensional embedding for the given text"""
        try:
            self.logger.info(f"Generating embedding for text of length {len(text)}...")

            # Apply proper rate limiting based on Google's official limits
            await self.rate_limiter.wait_for_rate_limit(self.model_name, text)

            # Use the embedding generation API with timeout
            def embed_sync():
                return genai.embed_content(
                    model=f"models/{self.model_name}",
                    content=text,
                    task_type="RETRIEVAL_DOCUMENT",
                )

            # Run the sync function in a separate thread with timeout
            loop = asyncio.get_event_loop()
            try:
                result = await asyncio.wait_for(
                    loop.run_in_executor(None, embed_sync),
                    timeout=30,  # 30 seconds timeout
                )
            except asyncio.TimeoutError:
                self.logger.error("Embedding generation timed out after 30 seconds")
                return [0.0] * 768

            embedding = result["embedding"]

            # Ensure it's exactly 768 dimensions
            if len(embedding) != 768:
                self.logger.warning(
                    f"Embedding dimension mismatch: got {len(embedding)}, expected 768"
                )
                # Pad or truncate to 768 dimensions
                if len(embedding) < 768:
                    embedding.extend([0.0] * (768 - len(embedding)))
                else:
                    embedding = embedding[:768]

            self.logger.info(
                f"Embedding generated successfully with {len(embedding)} dimensions"
            )

            # Record the successful request for rate limiting
            self.rate_limiter.record_request(self.model_name, text)

            return embedding
        except Exception as e:
            self.logger.error(f"Error generating embedding: {e}")
            # Return a zero embedding in case of error
            return [0.0] * 768

    async def generate_embeddings_for_paper(self, paper_data) -> Dict[str, List[float]]:
        """Generate embeddings for different sections of the paper"""
        self.logger.info(
            f"Starting to generate embeddings for paper: {paper_data.title[:50]}..."
        )
        embeddings = {}

        # Generate embeddings for each section
        sections = {
            "title": paper_data.title,
            "abstract": paper_data.abstract,
            "fullText": paper_data.full_text,  # Add full text to the embeddings
        }

        # Add other sections if they exist as attributes in paper_data
        for attr_name in ["methods", "results", "discussion", "conclusions"]:
            if hasattr(paper_data, attr_name):
                attr_value = getattr(paper_data, attr_name)
                if attr_value and attr_value.strip():
                    sections[attr_name] = attr_value

        self.logger.info(f"Found {len(sections)} sections to generate embeddings for")

        for section_name, section_content in sections.items():
            if (
                section_content.strip()
            ):  # Only generate embedding if content exists and is not just whitespace
                self.logger.info(
                    f"Generating embedding for section: {section_name} (length: {len(section_content)})"
                )
                embedding = await self.generate_embedding(section_content)
                embeddings[section_name] = embedding
                self.logger.info(f"Completed embedding for section: {section_name}")

        self.logger.info(
            f"Completed embeddings generation. Generated embeddings for {len(embeddings)} sections"
        )
        return embeddings
