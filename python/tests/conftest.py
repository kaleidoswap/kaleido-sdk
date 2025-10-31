import logging
import os
import pytest_asyncio
from kaleidoswap_sdk.client import KaleidoClient

# Test configuration
API_URL = "http://localhost:8000/api/v1"
NODE_URL = "http://localhost:3001/"
API_KEY = "test_api_key"

# Create logs directory if it doesn't exist
os.makedirs("logs", exist_ok=True)


# Configure logging
def setup_logging():
    """Configure logging for tests."""
    # Create formatters
    file_formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    console_formatter = logging.Formatter("%(levelname)s: %(message)s")

    # Create handlers
    file_handler = logging.FileHandler("logs/test.log")
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(file_formatter)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(console_formatter)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)

    # Set specific logger levels
    logging.getLogger("asyncio").setLevel(logging.WARNING)
    logging.getLogger("websockets").setLevel(logging.WARNING)


# Setup logging before any tests run
setup_logging()


@pytest_asyncio.fixture
async def client():
    """
    Create a test client instance that can be used across all test files.
    This fixture will create a new client for each test function and properly clean up resources.

    Usage:
        @pytest.mark.asyncio
        async def test_something(client):
            result = await client.some_method()
            assert result
    """
    logger = logging.getLogger(__name__)
    logger.info("Creating new test client instance")

    client = KaleidoClient(
        api_url=API_URL,
        node_url=NODE_URL,
    )

    try:
        yield client
    except Exception as e:
        logger.error(f"Error initializing client: {e}")
        raise
    finally:
        logger.info("Cleaning up test client instance")
        # Use the client's built-in close method to properly clean up all connections
        try:
            await client.close()
        except Exception as e:
            logger.warning(f"Error closing client: {e}")


# Configure pytest-asyncio
def pytest_configure(config):
    """Configure pytest-asyncio settings."""
    config.option.asyncio_mode = "strict"
    config.option.asyncio_default_fixture_loop_scope = "function"
