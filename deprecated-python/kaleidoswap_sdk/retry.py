import asyncio
import random
from typing import TypeVar, Callable, Any, Optional, Type, List, Awaitable
from functools import wraps
from .exceptions import NetworkError, RateLimitError

T = TypeVar("T")


class RetryConfig:
    """Configuration for retry behavior."""

    def __init__(
        self,
        max_retries: int = 3,
        initial_delay: float = 1.0,
        max_delay: float = 10.0,
        exponential_base: float = 2.0,
        jitter: bool = True,
        retry_on_exceptions: Optional[List[Type[Exception]]] = None,
    ):
        self.max_retries = max_retries
        self.initial_delay = initial_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
        self.jitter = jitter
        self.retry_on_exceptions = retry_on_exceptions or [NetworkError, RateLimitError]


def with_retry(
    config: Optional[RetryConfig] = None,
) -> Callable[[Callable[..., Awaitable[T]]], Callable[..., Awaitable[T]]]:
    """Decorator to add retry behavior to async functions.

    Args:
        config: Optional retry configuration

    Returns:
        Decorated function with retry behavior
    """
    if config is None:
        config = RetryConfig()

    def decorator(func: Callable[..., Awaitable[T]]) -> Callable[..., Awaitable[T]]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            last_exception: Optional[Exception] = None

            for attempt in range(config.max_retries + 1):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    last_exception = e

                    # Check if we should retry this exception
                    should_retry = any(
                        isinstance(e, exc_type)
                        for exc_type in config.retry_on_exceptions
                    )

                    if not should_retry or attempt == config.max_retries:
                        raise

                    # Calculate delay with exponential backoff
                    delay = min(
                        config.initial_delay * (config.exponential_base**attempt),
                        config.max_delay,
                    )

                    # Add jitter if enabled
                    if config.jitter:
                        delay = delay * (0.5 + random.random())

                    # Wait before retrying
                    await asyncio.sleep(delay)

            # This should never be reached due to the raise in the loop
            raise last_exception or Exception("Unexpected error in retry logic")

        return wrapper

    return decorator
