"""
Utility functions for displaying and formatting SDK models.

Provides pretty-printing, logging helpers, and formatters for common SDK operations.
"""

import logging
from typing import Any


# Configure logger for SDK
def get_logger(name: str = "kaleidoswap") -> logging.Logger:
    """Get a logger instance for SDK usage."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
    return logger


def format_amount(amount: int, ticker: str, layer: str) -> str:
    """
    Format amount with correct units based on layer.

    Args:
        amount: Amount in smallest units
        ticker: Asset ticker (e.g., "BTC", "USDT")
        layer: Layer identifier (e.g., "BTC_LN", "RGB_L1")

    Returns:
        Formatted string with amount and unit

    Example:
        >>> format_amount(600000, "BTC", "BTC_LN")
        '600,000 msat'
    """
    if layer in ("BTC_LN", "RGB_LN"):
        return f"{amount:,} msat"
    else:
        unit = "sat" if "BTC" in ticker else ticker
        return f"{amount:,} {unit}"


def format_price(price: float, decimals: int = 2) -> str:
    """
    Format price with appropriate precision.

    Args:
        price: Price value
        decimals: Number of decimal places

    Returns:
        Formatted price string
    """
    return f"{price:,.{decimals}f}"


def display_asset(asset: Any, verbose: bool = False) -> str:
    """
    Format an Asset object for display.

    Args:
        asset: Asset object
        verbose: Include all details

    Returns:
        Formatted sstring representation
    """
    base = f"{asset.ticker}: {asset.name}"

    if verbose and hasattr(asset, "protocol_ids") and asset.protocol_ids:
        protocols = ", ".join(f"{k}={v[:10]}..." for k, v in asset.protocol_ids.items())
        base += f"\n  Protocols: {protocols}"
        if hasattr(asset, "precision"):
            base += f"\n  Precision: {asset.precision}"

    return base


def display_pair(pair: Any, verbose: bool = False) -> str:
    """
    Format a TradingPair object for display.

    Args:
        pair: TradingPair object
        verbose: Include all details

    Returns:
        Formatted string representation
    """
    base_ticker = pair.base.ticker if pair.base else "?"
    quote_ticker = pair.quote.ticker if pair.quote else "?"

    result = f"{base_ticker}/{quote_ticker}"

    if pair.price:
        result += f" @ {format_price(pair.price)}"

    if verbose and pair.routes:
        result += f"\n  Routes: {len(pair.routes)}"
        if hasattr(pair, "is_active"):
            result += f"\n  Active: {pair.is_active}"

    return result


def display_quote(quote: Any, verbose: bool = False) -> str:
    """
    Format a PairQuoteResponse object for display.

    Args:
        quote: PairQuoteResponse object
        verbose: Include all details

    Returns:
        Formatted string representation
    """
    from_formatted = format_amount(
        quote.from_asset.amount, quote.from_asset.ticker, quote.from_asset.layer
    )
    to_formatted = format_amount(
        quote.to_asset.amount, quote.to_asset.ticker, quote.to_asset.layer
    )

    result = f"{from_formatted} → {to_formatted}"
    result += f"\nPrice: {format_price(quote.price)}"

    if quote.fee:
        fee_formatted = format_amount(
            quote.fee.final_fee, quote.from_asset.ticker, quote.from_asset.layer
        )
        result += f"\nFee: {fee_formatted}"

    if verbose:
        result += f"\nRFQ ID: {quote.rfq_id}"
        if hasattr(quote, "expires_at"):
            result += f"\nExpires: {quote.expires_at}"

    return result


def log_request(logger: logging.Logger, method: str, **kwargs):
    """
    Log an API request.

    Args:
        logger: Logger instance
        method: API method name
        **kwargs: Request parameters
    """
    params = ", ".join(f"{k}={v}" for k, v in kwargs.items() if v is not None)
    logger.debug(f"API Request: {method}({params})")


def log_response(logger: logging.Logger, method: str, result: Any):
    """
    Log an API response.

    Args:
        logger: Logger instance
        method: API method name
        result: Response object
    """
    result_type = type(result).__name__
    logger.debug(f"API Response: {method} -> {result_type}")


def log_error(logger: logging.Logger, method: str, error: Exception):
    """
    Log an API error.

    Args:
        logger: Logger instance
        method: API method name
        error: Exception object
    """
    logger.error(f"API Error: {method} failed - {type(error).__name__}: {error}")
