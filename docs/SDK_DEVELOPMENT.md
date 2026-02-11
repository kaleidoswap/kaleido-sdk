# SDK Development Guide

This guide documents the complete workflow for developing, testing, and releasing the Kaleidoswap SDKs.

## Overview

The Kaleidoswap SDK monorepo contains:

```
kaleido-sdk/
├── typescript-sdk/          # TypeScript SDK (npm: kaleidoswap-sdk)
├── python-sdk/              # Python SDK (PyPI: kaleidoswap-sdk)
├── bindings/python/         # Python Rust bindings (PyPI: kaleidoswap)
├── crates/
│   └── kaleidoswap-core/
│       └── specs/           # OpenAPI specifications (source of truth)
│           ├── maker.json   # Kaleidoswap Market API
│           └── rln.yaml     # RGB Lightning Node API
└── scripts/                 # Code generation scripts
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OpenAPI Specs                                │
│                    (crates/kaleidoswap-core/specs/)                 │
│                                                                     │
│                    maker.json         rln.yaml                      │
└─────────────────────┬─────────────────────┬─────────────────────────┘
                      │                     │
                      ▼                     ▼
        ┌─────────────────────┐   ┌─────────────────────┐
        │   openapi-typescript │   │ datamodel-codegen   │
        └──────────┬──────────┘   └──────────┬──────────┘
                   │                         │
                   ▼                         ▼
        ┌─────────────────────┐   ┌─────────────────────┐
        │  TypeScript SDK     │   │    Python SDK       │
        │  src/generated/     │   │  generated/         │
        │  - api-types.ts     │   │  - api_types.py     │
        │  - node-types.ts    │   │  - node_types.py    │
        └─────────────────────┘   └─────────────────────┘
```

## Development Workflow

### 1. Setup

```bash
# Clone the repository
git clone <repo-url>
cd kaleido-sdk

# Install dependencies
make dev-typescript      # TypeScript SDK
make dev-python-sdk      # Python SDK
```

### 2. Daily Development

#### TypeScript SDK

```bash
cd typescript-sdk

# Install dependencies
pnpm install

# Run tests
pnpm test

# Type check
pnpm run typecheck

# Lint
pnpm run lint

# Format
pnpm run format
```

#### Python SDK

```bash
cd python-sdk

# Install in dev mode
pip install -e ".[dev]"

# Run tests
pytest tests/ -v

# Type check
mypy kaleidoswap_sdk

# Lint
ruff check kaleidoswap_sdk

# Format
ruff format kaleidoswap_sdk
```

### 3. When OpenAPI Specs Change

When the backend API changes, the OpenAPI specs are updated. You must regenerate the SDK types:

```bash
# From repository root
make generate-models

# This runs:
#   - scripts/generate_typescript_types.sh  → typescript-sdk/src/generated/
#   - scripts/generate_python_sdk_models.sh → python-sdk/kaleidoswap_sdk/generated/
```

**Important:** Always commit the generated files after regeneration.

```bash
git add typescript-sdk/src/generated/ python-sdk/kaleidoswap_sdk/generated/
git commit -m "chore: regenerate SDK models from OpenAPI specs"
```

### 4. Adding New Features

1. **Check the OpenAPI spec** - Ensure the endpoint exists in `maker.json` or `rln.yaml`
2. **Regenerate types** - Run `make generate-models`
3. **Add the method** to the appropriate client:
   - `MakerClient` for market operations
   - `RlnClient` for node operations
4. **Write tests** for the new functionality
5. **Update examples** if needed

#### Example: Adding a new method

**TypeScript:**
```typescript
// typescript-sdk/src/maker-client.ts
async newMethod(body: NewMethodRequest): Promise<NewMethodResponse> {
  const { data } = await this.http.maker.POST("/api/v1/endpoint", { body });
  return data;
}
```

**Python:**
```python
# python-sdk/kaleidoswap_sdk/maker_client.py
async def new_method(self, body: NewMethodRequest) -> NewMethodResponse:
    data = await self._http.maker_post("/api/v1/endpoint", body)
    return NewMethodResponse.model_validate(data)
```

## Quality Checks

### Pre-commit Checklist

Before committing, run the pre-commit checks:

```bash
# Run all checks for both SDKs
make pre-commit

# Or run checks individually
make pre-commit-typescript   # TypeScript SDK only
make pre-commit-python-sdk   # Python SDK only
```

The pre-commit checks include:
- [ ] Format check (code style)
- [ ] Linting (code quality)
- [ ] Type checking (type safety)
- [ ] Tests (functionality)

If specs changed, also regenerate models first:
```bash
make generate-models
```

### Makefile Commands

```bash
# Generate models
make generate-models              # Both SDKs
make generate-ts-types            # TypeScript only
make generate-python-sdk-models   # Python SDK only

# Test
make test-typescript              # TypeScript SDK
make test-python-sdk              # Python SDK

# Lint / Format / Type check
make lint-typescript-sdk          # TypeScript SDK
make check-format-python          # Python SDK (format check only)
make check-lint-python            # Python SDK (lint check only)
make typecheck-python             # Python SDK
make check-python                 # Python SDK (format + lint + typecheck)
make lint-python                  # Python SDK (auto-fix format + lint + type hints)

# Format
make format-typescript            # TypeScript SDK
make format-python-sdk            # Python SDK

# Full check (before PR)
make test-typescript lint-typescript-sdk
make test-python-sdk check-python
```

## CI/CD Pipeline

### Pipeline Stages

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GitLab CI/CD                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  .pre      │ update-specs (download latest OpenAPI - tags only)     │
│            │                                                        │
│  generate  │ generate-sdk-models (regenerate TS + Python types)     │
│            │ check-generated-models (MR: verify models committed)   │
│            │                                                        │
│  test      │ test:typescript-sdk    lint:typescript-sdk             │
│            │ test:python-sdk        lint:python-sdk                 │
│            │ typecheck:typescript-sdk  typecheck:python-sdk         │
│            │                                                        │
│  build     │ build:typescript-sdk   build:python-sdk                │
│            │                                                        │
│  deploy    │ deploy:npm (manual)    deploy:pypi-sdk (manual)        │
│            │                                                        │
└─────────────────────────────────────────────────────────────────────┘
```

### Trigger Conditions

| Event | Jobs Run |
|-------|----------|
| Push to `main`/`dev` | test, lint, typecheck |
| Push changes to `specs/` | generate-sdk-models → test |
| Merge Request | check-generated-models, test, lint |
| Git Tag | Full pipeline + manual deploy |

### MR Requirements

The pipeline will **fail** if:
- Generated models are out of date (run `make generate-models`)
- Tests fail
- Type checking fails (warning only)
- Linting fails (warning only)

## Release Process

### 1. Prepare Release

```bash
# Ensure you're on the latest dev branch
git checkout dev
git pull origin dev

# Update versions
# TypeScript: typescript-sdk/package.json
# Python: python-sdk/pyproject.toml

# Update changelogs (if applicable)

# Commit version bump
git add .
git commit -m "chore: bump version to X.Y.Z"
git push origin dev
```

### 2. Create Release Branch (optional)

```bash
git checkout -b release/vX.Y.Z
git push origin release/vX.Y.Z
```

### 3. Merge to Main

```bash
# Create MR from dev → main
# Wait for CI to pass
# Merge
```

### 4. Create Git Tag

```bash
git checkout main
git pull origin main
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

### 5. Manual Release Approval

1. Go to GitLab CI/CD → Pipelines
2. Find the pipeline for the tag
3. Wait for build stage to complete
4. Click **Play** on deploy jobs:
   - `deploy:npm` - Publishes TypeScript SDK to npm
   - `deploy:pypi-sdk` - Publishes Python SDK to PyPI

### 6. Verify Release

```bash
# TypeScript
npm info kaleidoswap-sdk

# Python
pip index versions kaleidoswap-sdk
```

## Versioning

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking API changes
- **MINOR** (0.X.0): New features, backward compatible
- **PATCH** (0.0.X): Bug fixes, backward compatible

### Pre-release Versions

- `X.Y.Z-alpha.N` - Alpha releases
- `X.Y.Z-beta.N` - Beta releases
- `X.Y.Z-rc.N` - Release candidates

Pre-release versions are published with the `beta` tag on npm.

## Troubleshooting

### Generated models out of date

```bash
# Error: "Generated models are out of date"
make generate-models
git add typescript-sdk/src/generated/ python-sdk/kaleidoswap_sdk/generated/
git commit -m "chore: regenerate SDK models"
```

### Type errors after spec changes

1. Regenerate models: `make generate-models`
2. Check if method signatures changed in the spec
3. Update client code to match new types

### Import errors in Python SDK

```bash
# Verify syntax
python3 -m py_compile python-sdk/kaleidoswap_sdk/types.py

# Check what's exported
python3 -c "from kaleidoswap_sdk.types import *"
```

### CI pipeline failures

1. Check the failed job logs
2. Run the same commands locally
3. Common issues:
   - Missing generated files → `make generate-models`
   - Test failures → Fix tests or code
   - Lint errors → `make format-typescript-sdk format-python-sdk`

## Environment Variables (CI/CD)

Required GitLab CI/CD variables:

| Variable | Description |
|----------|-------------|
| `NPM_TOKEN` | npm authentication token for publishing |
| `PYPI_TOKEN` | PyPI API token for publishing |

## File Structure Reference

### TypeScript SDK

```
typescript-sdk/
├── src/
│   ├── index.ts              # Public exports
│   ├── client.ts             # KaleidoClient
│   ├── maker-client.ts       # MakerClient
│   ├── rln-client.ts         # RlnClient
│   ├── http-client.ts        # HTTP wrapper
│   ├── ws-client.ts          # WebSocket
│   ├── errors.ts             # Error classes
│   ├── types.ts              # SDK types
│   └── generated/            # Auto-generated (DO NOT EDIT)
│       ├── api-types.ts
│       └── node-types.ts
├── tests/
├── examples/
└── package.json
```

### Python SDK

```
python-sdk/
├── kaleidoswap_sdk/
│   ├── __init__.py           # Public exports
│   ├── client.py             # KaleidoClient
│   ├── maker_client.py       # MakerClient
│   ├── rln_client.py         # RlnClient
│   ├── http_client.py        # HTTP wrapper
│   ├── ws_client.py          # WebSocket
│   ├── errors.py             # Error classes
│   ├── types.py              # Re-exports generated types
│   ├── utils/                # Utilities
│   └── generated/            # Auto-generated (DO NOT EDIT)
│       ├── api_types.py
│       └── node_types.py
├── tests/
├── examples/
└── pyproject.toml
```

## Quick Reference

| Task | Command |
|------|---------|
| **Pre-commit (all checks)** | `make pre-commit` |
| Pre-commit TypeScript | `make pre-commit-typescript` |
| Pre-commit Python | `make pre-commit-python-sdk` |
| Regenerate all models | `make generate-models` |
| Test TypeScript | `cd typescript-sdk && pnpm test` |
| Test Python | `cd python-sdk && pytest` |
| Lint TypeScript | `cd typescript-sdk && pnpm run lint` |
| Lint Python | `cd python-sdk && ruff check kaleidoswap_sdk` |
| Format TypeScript | `cd typescript-sdk && pnpm run format` |
| Format Python | `cd python-sdk && ruff format kaleidoswap_sdk` |
| Type check TypeScript | `cd typescript-sdk && pnpm run typecheck` |
| Type check Python | `cd python-sdk && mypy kaleidoswap_sdk` |
| Build TypeScript | `cd typescript-sdk && pnpm run build` |
| Build Python | `cd python-sdk && python -m build` |
