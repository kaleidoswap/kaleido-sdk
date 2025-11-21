"""Tests for retry logic functionality."""

import asyncio
import pytest
from kaleidoswap_sdk.retry import RetryConfig, with_retry
from kaleidoswap_sdk.exceptions import NetworkError, RateLimitError, ValidationError


@pytest.fixture
def retry_config():
    """Create a retry configuration for testing."""
    return RetryConfig(
        max_retries=3,
        initial_delay=0.01,  # Short delay for testing
        max_delay=0.1,
        exponential_base=2.0,
        jitter=False,  # Disable jitter for predictable tests
    )


@pytest.mark.asyncio
async def test_retry_config_defaults():
    """Test default retry configuration."""
    config = RetryConfig()
    assert config.max_retries == 3
    assert config.initial_delay == 1.0
    assert config.max_delay == 10.0
    assert config.exponential_base == 2.0
    assert config.jitter is True
    assert NetworkError in config.retry_on_exceptions
    assert RateLimitError in config.retry_on_exceptions


@pytest.mark.asyncio
async def test_retry_config_custom_values():
    """Test custom retry configuration."""
    config = RetryConfig(
        max_retries=5,
        initial_delay=2.0,
        max_delay=20.0,
        exponential_base=3.0,
        jitter=False,
        retry_on_exceptions=[NetworkError],
    )
    assert config.max_retries == 5
    assert config.initial_delay == 2.0
    assert config.max_delay == 20.0
    assert config.exponential_base == 3.0
    assert config.jitter is False
    assert config.retry_on_exceptions == [NetworkError]


@pytest.mark.asyncio
async def test_retry_successful_on_first_attempt(retry_config):
    """Test function that succeeds on first attempt."""
    call_count = 0

    @with_retry(config=retry_config)
    async def test_func():
        nonlocal call_count
        call_count += 1
        return "success"

    result = await test_func()
    assert result == "success"
    assert call_count == 1


@pytest.mark.asyncio
async def test_retry_successful_after_retries(retry_config):
    """Test function that succeeds after some retries."""
    call_count = 0

    @with_retry(config=retry_config)
    async def test_func():
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise NetworkError("Temporary failure")
        return "success"

    result = await test_func()
    assert result == "success"
    assert call_count == 3


@pytest.mark.asyncio
async def test_retry_max_retries_exceeded(retry_config):
    """Test function that fails after max retries."""
    call_count = 0

    @with_retry(config=retry_config)
    async def test_func():
        nonlocal call_count
        call_count += 1
        raise NetworkError("Persistent failure")

    with pytest.raises(NetworkError):
        await test_func()

    # Should be called max_retries + 1 times (initial + retries)
    assert call_count == retry_config.max_retries + 1


@pytest.mark.asyncio
async def test_retry_non_retryable_exception(retry_config):
    """Test that non-retryable exceptions are not retried."""
    call_count = 0

    @with_retry(config=retry_config)
    async def test_func():
        nonlocal call_count
        call_count += 1
        raise ValidationError("Not retryable")

    with pytest.raises(ValidationError):
        await test_func()

    # Should only be called once
    assert call_count == 1


@pytest.mark.asyncio
async def test_retry_rate_limit_error(retry_config):
    """Test retry with RateLimitError."""
    call_count = 0

    @with_retry(config=retry_config)
    async def test_func():
        nonlocal call_count
        call_count += 1
        if call_count < 2:
            raise RateLimitError("Rate limited")
        return "success"

    result = await test_func()
    assert result == "success"
    assert call_count == 2


@pytest.mark.asyncio
async def test_retry_exponential_backoff():
    """Test exponential backoff delays."""
    config = RetryConfig(
        max_retries=3,
        initial_delay=0.01,
        max_delay=1.0,
        exponential_base=2.0,
        jitter=False,
    )

    call_times = []

    @with_retry(config=config)
    async def test_func():
        call_times.append(asyncio.get_event_loop().time())
        if len(call_times) < 3:
            raise NetworkError("Retry")
        return "success"

    await test_func()

    # Verify delays are increasing exponentially
    assert len(call_times) == 3
    delay1 = call_times[1] - call_times[0]
    delay2 = call_times[2] - call_times[1]

    # Second delay should be approximately double the first
    # Allow for some tolerance due to timing variations
    assert delay2 > delay1 * 1.5


@pytest.mark.asyncio
async def test_retry_max_delay_cap():
    """Test that delay is capped at max_delay."""
    config = RetryConfig(
        max_retries=5,
        initial_delay=1.0,
        max_delay=2.0,  # Cap at 2 seconds
        exponential_base=10.0,  # Would grow very large without cap
        jitter=False,
    )

    call_times = []

    @with_retry(config=config)
    async def test_func():
        call_times.append(asyncio.get_event_loop().time())
        if len(call_times) < 4:
            raise NetworkError("Retry")
        return "success"

    await test_func()

    # Later delays should be capped at max_delay
    if len(call_times) >= 3:
        delay = call_times[3] - call_times[2]
        # Should be approximately max_delay (2.0 seconds)
        assert delay <= 2.5  # Allow some tolerance


@pytest.mark.asyncio
async def test_retry_with_jitter():
    """Test that jitter adds randomness to delays."""
    config = RetryConfig(
        max_retries=10,
        initial_delay=0.1,
        max_delay=1.0,
        exponential_base=2.0,
        jitter=True,
    )

    delays = []

    for _ in range(5):
        call_times = []

        @with_retry(config=config)
        async def test_func():
            call_times.append(asyncio.get_event_loop().time())
            if len(call_times) < 3:
                raise NetworkError("Retry")
            return "success"

        await test_func()

        if len(call_times) >= 2:
            delays.append(call_times[1] - call_times[0])

    # With jitter, delays should vary
    # Check that we have some variation in delays
    if len(delays) > 1:
        # Not all delays should be exactly the same
        assert len(set(delays)) > 1 or delays[0] != delays[-1]


@pytest.mark.asyncio
async def test_retry_preserves_function_metadata():
    """Test that decorator preserves function metadata."""
    config = RetryConfig()

    @with_retry(config=config)
    async def test_func():
        """Test function docstring."""
        return "success"

    assert test_func.__name__ == "test_func"
    assert test_func.__doc__ == "Test function docstring."


@pytest.mark.asyncio
async def test_retry_with_default_config():
    """Test retry decorator with default configuration."""
    call_count = 0

    @with_retry()  # Use default config
    async def test_func():
        nonlocal call_count
        call_count += 1
        if call_count < 2:
            raise NetworkError("Retry once")
        return "success"

    result = await test_func()
    assert result == "success"
    assert call_count == 2


@pytest.mark.asyncio
async def test_retry_with_none_config():
    """Test retry decorator with None config (should use default)."""
    call_count = 0

    @with_retry(config=None)
    async def test_func():
        nonlocal call_count
        call_count += 1
        if call_count < 2:
            raise NetworkError("Retry once")
        return "success"

    result = await test_func()
    assert result == "success"
    assert call_count == 2


@pytest.mark.asyncio
async def test_retry_with_custom_exception_list():
    """Test retry with custom list of retryable exceptions."""
    config = RetryConfig(
        max_retries=2,
        initial_delay=0.01,
        retry_on_exceptions=[ValueError],  # Only retry ValueError
    )

    call_count_value_error = 0
    call_count_network_error = 0

    @with_retry(config=config)
    async def test_func_value_error():
        nonlocal call_count_value_error
        call_count_value_error += 1
        if call_count_value_error < 2:
            raise ValueError("Retryable")
        return "success"

    @with_retry(config=config)
    async def test_func_network_error():
        nonlocal call_count_network_error
        call_count_network_error += 1
        raise NetworkError("Not in retry list")

    # ValueError should be retried
    result = await test_func_value_error()
    assert result == "success"
    assert call_count_value_error == 2

    # NetworkError should not be retried
    with pytest.raises(NetworkError):
        await test_func_network_error()
    assert call_count_network_error == 1


@pytest.mark.asyncio
async def test_retry_with_function_arguments():
    """Test that decorated function can accept arguments."""
    config = RetryConfig(max_retries=2, initial_delay=0.01, jitter=False)

    call_count = 0

    @with_retry(config=config)
    async def test_func(x, y, z=10):
        nonlocal call_count
        call_count += 1
        if call_count < 2:
            raise NetworkError("Retry")
        return x + y + z

    result = await test_func(1, 2, z=3)
    assert result == 6
    assert call_count == 2


@pytest.mark.asyncio
async def test_retry_returns_correct_value_types():
    """Test that retry decorator preserves return value types."""
    config = RetryConfig(max_retries=1, initial_delay=0.01)

    @with_retry(config=config)
    async def return_int():
        return 42

    @with_retry(config=config)
    async def return_dict():
        return {"key": "value"}

    @with_retry(config=config)
    async def return_none():
        return None

    assert await return_int() == 42
    assert await return_dict() == {"key": "value"}
    assert await return_none() is None
