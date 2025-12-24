"""Pytest configuration for Kaleidoswap SDK tests."""


def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line(
        "markers", "integration: tests requiring a running Kaleidoswap backend"
    )
