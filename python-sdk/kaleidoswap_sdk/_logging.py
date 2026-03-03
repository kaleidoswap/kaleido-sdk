"""Logging support for kaleidoswap_sdk.

Library logging policy (Python Logging HOWTO + PEP 391):
- A single NullHandler is installed at the root 'kaleidoswap_sdk' logger so
  that by default no output is produced.
- This library NEVER calls logging.basicConfig() or adds any non-NullHandler.
- Users configure output in their own application code.

Child loggers are retrieved by internal modules via get_logger().
The log level is set once at client creation via apply_log_level().
"""

from __future__ import annotations

import logging

# Root logger for the entire package.
_root = logging.getLogger("kaleidoswap_sdk")
_root.addHandler(logging.NullHandler())


def get_logger(name: str) -> logging.Logger:
    """Return the child logger 'kaleidoswap_sdk.<name>'.

    Args:
        name: Sub-logger component, e.g. 'http', 'ws', 'maker', 'rln'.

    Returns:
        A Logger whose parent (and effective level source) is
        'kaleidoswap_sdk' unless overridden by the application.
    """
    return logging.getLogger(f"kaleidoswap_sdk.{name}")


def apply_log_level(level: int | str) -> None:
    """Set the effective level on the root 'kaleidoswap_sdk' logger.

    Called exactly once by KaleidoClient.__init__() using the value from
    KaleidoConfig.log_level.  Applications that want finer control should
    configure the loggers themselves after client creation.

    Args:
        level: A logging-module integer constant (e.g. logging.DEBUG) or
               its string equivalent ('DEBUG', 'INFO', 'WARNING', ...).
    """
    _root.setLevel(level)
