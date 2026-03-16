#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TAG_INPUT="${1:-${GITHUB_REF_NAME:-${CI_COMMIT_TAG:-}}}"

if [[ -z "${TAG_INPUT}" ]]; then
    echo "Release tag is required"
    exit 1
fi

if [[ "${TAG_INPUT}" != v* ]]; then
    echo "Release tag must start with 'v': ${TAG_INPUT}"
    exit 1
fi

VERSION="${TAG_INPUT#v}"

python_manifest_version="$(sed -n 's/^version = "\(.*\)"/\1/p' "${ROOT_DIR}/python-sdk/pyproject.toml" | head -1)"
python_init_version="$(sed -n 's/^__version__ = "\(.*\)"/\1/p' "${ROOT_DIR}/python-sdk/kaleido_sdk/__init__.py" | head -1)"
python_client_version="$(sed -n 's/^__version__ = "\(.*\)"/\1/p' "${ROOT_DIR}/python-sdk/kaleido_sdk/client.py" | head -1)"
typescript_version="$(sed -n 's/.*"version": "\(.*\)".*/\1/p' "${ROOT_DIR}/typescript-sdk/package.json" | head -1)"

if [[ -z "${python_manifest_version}" || -z "${python_init_version}" || -z "${python_client_version}" || -z "${typescript_version}" ]]; then
    echo "Failed to read one or more SDK versions"
    exit 1
fi

if [[ "${python_manifest_version}" != "${VERSION}" ]]; then
    echo "Python pyproject version ${python_manifest_version} does not match tag ${TAG_INPUT}"
    exit 1
fi

if [[ "${python_init_version}" != "${VERSION}" ]]; then
    echo "Python __init__ version ${python_init_version} does not match tag ${TAG_INPUT}"
    exit 1
fi

if [[ "${python_client_version}" != "${VERSION}" ]]; then
    echo "Python client version ${python_client_version} does not match tag ${TAG_INPUT}"
    exit 1
fi

if [[ "${typescript_version}" != "${VERSION}" ]]; then
    echo "TypeScript package version ${typescript_version} does not match tag ${TAG_INPUT}"
    exit 1
fi

echo "Validated release version ${VERSION}"
