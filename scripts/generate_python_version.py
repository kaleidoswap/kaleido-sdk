#!/usr/bin/env python3
"""Generate python-sdk/kaleido_sdk/_version.py from pyproject.toml."""

from __future__ import annotations

import re
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
PYPROJECT_PATH = REPO_ROOT / "python-sdk" / "pyproject.toml"
VERSION_PATH = REPO_ROOT / "python-sdk" / "kaleido_sdk" / "_version.py"
SDK_NAME = "kaleido-sdk"


def _read_project_version() -> str:
    text = PYPROJECT_PATH.read_text(encoding="utf-8")
    match = re.search(r'^version\s*=\s*"([^"]+)"', text, flags=re.MULTILINE)
    if not match:
        raise RuntimeError("python-sdk/pyproject.toml must define project.version")
    return match.group(1)


def main() -> None:
    version = _read_project_version()
    source = f'''"""Generated package version helpers. Do not edit manually."""

from __future__ import annotations

__sdk_name__ = "{SDK_NAME}"
__version__ = "{version}"
'''
    VERSION_PATH.write_text(source, encoding="utf-8")
    print(f"Generated python-sdk/kaleido_sdk/_version.py ({version})")


if __name__ == "__main__":
    main()
