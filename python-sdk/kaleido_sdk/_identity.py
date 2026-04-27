"""
Client identity helpers for telemetry attribution.
"""

from __future__ import annotations

import os
import time
import uuid
from asyncio import to_thread
from pathlib import Path
from secrets import choice

_INSTALL_ID_FILE_NAME = "install_id"
_INSTALL_ID_PREFIX = "inst_"
_CROCKFORD_BASE32 = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def _install_id_path() -> Path:
    override = os.environ.get("KALEIDO_INSTALL_ID_PATH")
    if override:
        return Path(override).expanduser()

    return Path.home() / ".kaleido" / _INSTALL_ID_FILE_NAME


def _encode_time(timestamp_ms: int) -> str:
    value = timestamp_ms
    encoded = ""

    for _ in range(10):
        value, index = divmod(value, 32)
        encoded = _CROCKFORD_BASE32[index] + encoded

    return encoded


def generate_install_id() -> str:
    """Generate an opaque persistent install ID."""
    random_part = "".join(choice(_CROCKFORD_BASE32) for _ in range(16))
    return f"{_INSTALL_ID_PREFIX}{_encode_time(int(time.time() * 1000))}{random_part}"


def generate_session_id() -> str:
    """Generate a per-client session ID."""
    return str(uuid.uuid4())


def _load_or_create_install_id_sync(override: str | None = None) -> str:
    """Load the persistent install ID, or create it if it does not exist."""
    if override:
        return override

    path = _install_id_path()
    try:
        install_id = path.read_text(encoding="utf-8").strip()
        if install_id:
            return install_id
    except OSError:
        pass

    install_id = generate_install_id()
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(f"{install_id}\n", encoding="utf-8")
        path.chmod(0o600)
    except OSError:
        pass

    return install_id


async def load_or_create_install_id(override: str | None = None) -> str:
    """Load the persistent install ID without blocking the event loop."""
    return await to_thread(_load_or_create_install_id_sync, override)
