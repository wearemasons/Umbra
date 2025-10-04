import asyncio
import logging
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class RateLimit:
    """Configuration for rate limits"""

    requests_per_minute: int
    tokens_per_minute: int
    requests_per_day: int


class RateLimiter:
    """
    Rate limiter that enforces Google Gemini API rate limits
    Tracks requests per minute, tokens per minute, and requests per day
    """

    def __init__(self):
        self.logger = logging.getLogger(__name__)

        # Rate limit configurations based on Google's official documentation
        # Free tier limits as of October 2024
        self.rate_limits = {
            # Embedding model
            "text-embedding-004": RateLimit(
                requests_per_minute=100, tokens_per_minute=30000, requests_per_day=1000
            ),
            # Text generation models - using Gemini 2.0 Flash as it has good limits
            "gemini-2.0-flash": RateLimit(
                requests_per_minute=15, tokens_per_minute=1000000, requests_per_day=200
            ),
            # Alternative text generation model
            "gemini-2.5-flash": RateLimit(
                requests_per_minute=10, tokens_per_minute=250000, requests_per_day=250
            ),
        }

        # Track usage per model
        self.request_times: Dict[str, deque] = defaultdict(lambda: deque())
        self.token_usage: Dict[str, deque] = defaultdict(lambda: deque())
        self.daily_requests: Dict[str, Dict[str, int]] = defaultdict(dict)

    def _get_current_date(self) -> str:
        """Get current date string for daily tracking"""
        return time.strftime("%Y-%m-%d", time.localtime())

    def _cleanup_old_records(self, model: str) -> None:
        """Remove old request records outside the tracking window"""
        current_time = time.time()
        one_minute_ago = current_time - 60

        # Clean up request times (keep only last minute)
        while (
            self.request_times[model] and self.request_times[model][0] < one_minute_ago
        ):
            self.request_times[model].popleft()

        # Clean up token usage (keep only last minute)
        while (
            self.token_usage[model] and self.token_usage[model][0][0] < one_minute_ago
        ):
            self.token_usage[model].popleft()

    def _get_requests_in_last_minute(self, model: str) -> int:
        """Get number of requests made in the last minute"""
        self._cleanup_old_records(model)
        return len(self.request_times[model])

    def _get_tokens_in_last_minute(self, model: str) -> int:
        """Get number of tokens used in the last minute"""
        self._cleanup_old_records(model)
        return sum(token_count for _, token_count in self.token_usage[model])

    def _get_requests_today(self, model: str) -> int:
        """Get number of requests made today"""
        current_date = self._get_current_date()
        return self.daily_requests[model].get(current_date, 0)

    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count for text (rough approximation: 1 token = 4 characters)"""
        return max(1, len(text) // 4)

    async def wait_for_rate_limit(
        self, model: str, text: str = "", estimated_tokens: Optional[int] = None
    ) -> None:
        """
        Wait as needed to respect rate limits for the specified model

        Args:
            model: The model being used (e.g., 'text-embedding-004', 'gemini-2.0-flash')
            text: Text being processed (for token estimation if needed)
            estimated_tokens: Pre-calculated token count (optional)
        """
        if model not in self.rate_limits:
            self.logger.warning(f"Unknown model {model}, using default rate limiting")
            # Use conservative defaults for unknown models
            await asyncio.sleep(2.0)
            return

        limits = self.rate_limits[model]

        # Estimate tokens if not provided
        if estimated_tokens is None and text:
            estimated_tokens = self._estimate_tokens(text)
        elif estimated_tokens is None:
            estimated_tokens = 100  # Default estimate

        # Check current usage
        current_rpm = self._get_requests_in_last_minute(model)
        current_tpm = self._get_tokens_in_last_minute(model)
        current_rpd = self._get_requests_today(model)

        self.logger.debug(
            f"Rate limit check for {model}: "
            f"RPM {current_rpm}/{limits.requests_per_minute}, "
            f"TPM {current_tpm}/{limits.tokens_per_minute}, "
            f"RPD {current_rpd}/{limits.requests_per_day}"
        )

        # Check daily limit first (hardest to recover from)
        if current_rpd >= limits.requests_per_day:
            # We've hit the daily limit - need to wait until midnight PT
            # For simplicity, we'll wait a very long time and let the user handle this
            self.logger.error(
                f"Daily request limit exceeded for {model} ({current_rpd}/{limits.requests_per_day})"
            )
            # Wait 1 hour and hope the limit resets
            await asyncio.sleep(3600)
            return

        # Calculate required delays
        delays = []

        # RPM check
        if current_rpm >= limits.requests_per_minute:
            # Need to wait until we can make another request
            if self.request_times[model]:
                oldest_request = self.request_times[model][0]
                wait_time = (
                    60 - (time.time() - oldest_request) + 1
                )  # +1 for safety margin
                delays.append(max(0, wait_time))

        # TPM check
        if current_tpm + estimated_tokens > limits.tokens_per_minute:
            # Need to wait for tokens to become available
            if self.token_usage[model]:
                # Find when enough tokens will be available
                tokens_needed = (
                    current_tpm + estimated_tokens - limits.tokens_per_minute
                )
                total_tokens_to_wait_for = 0

                for timestamp, token_count in self.token_usage[model]:
                    total_tokens_to_wait_for += token_count
                    if total_tokens_to_wait_for >= tokens_needed:
                        wait_time = 60 - (time.time() - timestamp) + 1  # +1 for safety
                        delays.append(max(0, wait_time))
                        break

        # Apply minimum delays based on model type
        min_delays = {
            "text-embedding-004": 0.6,  # 100 RPM = 0.6s minimum
            "gemini-2.0-flash": 4.0,  # 15 RPM = 4s minimum
            "gemini-2.5-flash": 6.0,  # 10 RPM = 6s minimum
        }

        if model in min_delays:
            delays.append(min_delays[model])

        # Use the longest delay needed
        if delays:
            delay = max(delays)
            if delay > 0:
                self.logger.info(
                    f"Rate limiting: waiting {delay:.2f} seconds for {model}"
                )
                await asyncio.sleep(delay)

    def record_request(
        self, model: str, text: str = "", estimated_tokens: Optional[int] = None
    ) -> None:
        """
        Record a successful API request for rate limit tracking

        Args:
            model: The model that was used
            text: Text that was processed (for token counting)
            estimated_tokens: Pre-calculated token count (optional)
        """
        current_time = time.time()
        current_date = self._get_current_date()

        # Record request time
        self.request_times[model].append(current_time)

        # Record token usage
        if estimated_tokens is None and text:
            estimated_tokens = self._estimate_tokens(text)
        elif estimated_tokens is None:
            estimated_tokens = 100  # Default estimate

        self.token_usage[model].append((current_time, estimated_tokens))

        # Record daily usage
        if current_date not in self.daily_requests[model]:
            self.daily_requests[model][current_date] = 0
        self.daily_requests[model][current_date] += 1

        self.logger.debug(f"Recorded request for {model}: {estimated_tokens} tokens")

    def get_usage_stats(self, model: str) -> Dict[str, int]:
        """Get current usage statistics for a model"""
        return {
            "requests_last_minute": self._get_requests_in_last_minute(model),
            "tokens_last_minute": self._get_tokens_in_last_minute(model),
            "requests_today": self._get_requests_today(model),
            "rpm_limit": self.rate_limits[model].requests_per_minute
            if model in self.rate_limits
            else 0,
            "tpm_limit": self.rate_limits[model].tokens_per_minute
            if model in self.rate_limits
            else 0,
            "rpd_limit": self.rate_limits[model].requests_per_day
            if model in self.rate_limits
            else 0,
        }
