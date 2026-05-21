"""Logging support for kaleido_sdk.

Library logging policy (Python Logging HOWTO + PEP 391):
- A single NullHandler is installed at the root 'kaleido_sdk' logger so
  that by default no output is produced.
- This library NEVER calls logging.basicConfig() or adds any non-NullHandler.
- Users configure output in their own application code.

Child loggers are retrieved by internal modules via get_logger().
The log level is set once at client creation via apply_log_level().

For applications that want to plug a non-stdlib logger (loguru, structlog,
or anything matching the `SdkLogger` Protocol) into the SDK, pass it via
`KaleidoConfig.logger` and the SDK will install a handler that forwards
every `LogRecord` to that logger. Mirrors the TypeScript SDK's `SdkLogger`
contract.
"""

from __future__ import annotations

import logging
from typing import Any, Protocol, runtime_checkable

# Root logger for the entire package.
_root = logging.getLogger("kaleido_sdk")
_root.addHandler(logging.NullHandler())


@runtime_checkable
class SdkLogger(Protocol):
    """Minimal logger interface accepted by ``KaleidoConfig.logger``.

    Stdlib ``logging.Logger`` instances satisfy this Protocol natively, and so
    do most third-party loggers (loguru, structlog adapters, custom wrappers).
    """

    def debug(self, msg: str, *args: Any, **kwargs: Any) -> None: ...
    def info(self, msg: str, *args: Any, **kwargs: Any) -> None: ...
    def warning(self, msg: str, *args: Any, **kwargs: Any) -> None: ...
    def error(self, msg: str, *args: Any, **kwargs: Any) -> None: ...


class _SdkLoggerHandler(logging.Handler):
    """Bridge stdlib ``LogRecord`` events into a caller-supplied SdkLogger."""

    def __init__(self, logger: SdkLogger) -> None:
        super().__init__()
        self._sdk_logger = logger

    def emit(self, record: logging.LogRecord) -> None:
        try:
            msg = self.format(record)
        except Exception:  # pragma: no cover - defensive
            msg = record.getMessage()

        level = record.levelno
        if level >= logging.ERROR:
            self._sdk_logger.error(msg)
        elif level >= logging.WARNING:
            self._sdk_logger.warning(msg)
        elif level >= logging.INFO:
            self._sdk_logger.info(msg)
        else:
            self._sdk_logger.debug(msg)


def get_logger(name: str) -> logging.Logger:
    """Return the child logger 'kaleido_sdk.<name>'.

    Args:
        name: Sub-logger component, e.g. 'http', 'ws', 'maker', 'rln'.

    Returns:
        A Logger whose parent (and effective level source) is
        'kaleido_sdk' unless overridden by the application.
    """
    return logging.getLogger(f"kaleido_sdk.{name}")


def apply_log_level(level: int | str) -> None:
    """Set the effective level on the root 'kaleido_sdk' logger.

    Called exactly once by KaleidoClient.__init__() using the value from
    KaleidoConfig.log_level.  Applications that want finer control should
    configure the loggers themselves after client creation.

    Args:
        level: A logging-module integer constant (e.g. logging.DEBUG) or
               its string equivalent ('DEBUG', 'INFO', 'WARNING', ...).
    """
    _root.setLevel(level)


def set_logger(logger: SdkLogger | None) -> None:
    """Install a custom ``SdkLogger`` as a handler on the root SDK logger.

    Idempotent: replaces any previously installed ``_SdkLoggerHandler`` so
    repeated calls don't stack handlers. Passing ``None`` removes the custom
    handler and restores the default ``NullHandler``-only behaviour.
    """
    # Remove any existing SDK-logger bridge handlers so we don't duplicate.
    for existing in list(_root.handlers):
        if isinstance(existing, _SdkLoggerHandler):
            _root.removeHandler(existing)

    if logger is None:
        return

    _root.addHandler(_SdkLoggerHandler(logger))
