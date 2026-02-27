# SDK Development Guide

This guide documents the complete workflow for developing, testing, and releasing the Kaleidoswap SDKs.

## Overview

The Kaleidoswap SDK monorepo contains:

```
kaleido-sdk/
├── typescript-sdk/          # TypeScript SDK (npm: kaleidoswap-sdk)
├── python-sdk/              # Python SDK (PyPI: kaleidoswap-sdk)
├── crates/
│   └── kaleidoswap-core/
│       └── specs/           # OpenAPI specifications (source of truth)
│           ├── maker.json   # Kaleidoswap Market API
│           └── rln.yaml     # RGB Lightning Node API
└── scripts/                 # Code generation scripts
```

## Architecture

Each language SDK is **maintained separately** and generates its own models directly from OpenAPI specifications:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OpenAPI Specifications                           │
│              (crates/kaleidoswap-core/specs/)                      │
│                                                                     │
│                    maker.json         rln.yaml                      │
└─────────────────────┬─────────────────────┬─────────────────────────┘
                      │                     │
                      ▼                     ▼
        ┌─────────────────────┐   ┌─────────────────────┐
        │  TypeScript SDK     │   │    Python SDK       │
        │                     │   │                     │
        │  Generation Script: │   │  Generation Script: │
        │  generate_typescript│   │  generate_python_   │
        │  _types.sh          │   │  sdk_models.sh      │
        │                     │   │                     │
        │  Tool:              │   │  Tool:              │
        │  openapi-typescript │   │  datamodel-codegen  │
        │                     │   │                     │
        │  Output:            │   │  Output:            │
        │  src/generated/     │   │  _generated/        │
        │  - api-types.ts     │   │  - api_types.py     │
        │  - node-types.ts    │   │  - node_types.py    │
        └─────────────────────┘   └─────────────────────┘
                      │                     │
                      ▼                     ▼
        ┌─────────────────────┐   ┌─────────────────────┐
        │  Standalone TS/JS   │   │  Standalone Python  │
        │  Implementation     │   │  Implementation     │
        │  • Pure TypeScript  │   │  • Pure Python      │
        │  • No bindings      │   │  • No bindings      │
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
uv sync --all-extras --dev

# Run tests
uv run pytest tests/ -v

# Type check
uv run mypy kaleidoswap_sdk --ignore-missing-imports

# Lint
uv run ruff check kaleidoswap_sdk

# Format
uv run ruff format kaleidoswap_sdk
```

### 3. When OpenAPI Specs Change

When the backend API changes, the OpenAPI specs are updated. Each SDK has its own generation script:

**Regenerate all SDKs:**
```bash
make generate-models
```

**Regenerate specific SDK:**
```bash
# TypeScript SDK
make generate-ts-types
# Or: bash scripts/generate_typescript_types.sh

# Python SDK
make generate-python-sdk-models
# Or: bash scripts/generate_python_sdk_models.sh
```

**What each script does:**
- `scripts/generate_typescript_types.sh` → Generates TypeScript types → `typescript-sdk/src/generated/`
- `scripts/generate_python_sdk_models.sh` → Generates Pydantic models → `python-sdk/kaleidoswap_sdk/_generated/`

**Important:** Always commit the generated files after regeneration.

```bash
git add typescript-sdk/src/generated/ python-sdk/kaleidoswap_sdk/_generated/
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

## Feature Parity: TypeScript ↔ Python

Both SDKs expose identical functionality through a mirrored module structure. When adding or changing a feature, both must be updated together.

### Module Mapping

| TypeScript (`typescript-sdk/src/`) | Python (`python-sdk/kaleidoswap_sdk/`) | Responsibility |
|------------------------------------|----------------------------------------|----------------|
| `client.ts` | `client.py` | `KaleidoClient` — top-level entry point |
| `maker-client.ts` | `maker_client.py` | Market API methods (quotes, swaps, orders) |
| `rln-client.ts` | `rln_client.py` | Node API methods (channels, assets, payments) |
| `http-client.ts` | `http_client.py` | HTTP transport wrapper |
| `ws-client.ts` | `ws_client.py` | WebSocket streaming |
| `ws-types.ts` | *(inline in ws_client.py)* | WebSocket message types |
| `types.ts` | `types.py` | SDK-level types and re-exports |
| `errors.ts` | `errors.py` | Error class hierarchy |
| `utils/precision.ts` | `utils/precision.py` | Asset precision helpers |
| `utils/asset-pair-mapper.ts` | `utils/` | Asset pair utilities |
| `generated/api-types.ts` | `generated/api_types.py` | Auto-generated — Maker API models |
| `generated/node-types.ts` | `generated/node_types.py` | Auto-generated — Node API models |

### Workflow for Adding a New Feature

1. **Update the OpenAPI spec** if it's API-driven, then regenerate:
   ```bash
   make generate-models
   ```

2. **Implement in TypeScript** (`maker-client.ts` or `rln-client.ts`):
   ```typescript
   async newMethod(body: NewMethodRequest): Promise<NewMethodResponse> {
     const { data } = await this.http.maker.POST("/api/v1/endpoint", { body });
     return data;
   }
   ```

3. **Mirror in Python** (`maker_client.py` or `rln_client.py`):
   ```python
   async def new_method(self, body: NewMethodRequest) -> NewMethodResponse:
       data = await self._http.maker_post("/api/v1/endpoint", body)
       return NewMethodResponse.model_validate(data)
   ```
   - TS uses `openapi-fetch` (sync-style promises); Python uses `httpx` with `async`/`await`.
   - TS uses camelCase; Python uses snake_case — the pattern is otherwise identical.

4. **Export the new type/method** from `index.ts` (TS) and `__init__.py` (Python).

5. **Add tests in both** (`typescript-sdk/tests/`, `python-sdk/tests/`).

6. **Run pre-commit checks:**
   ```bash
   make pre-commit
   ```

### Known Issue: Python Model Naming Conflicts

`datamodel-code-generator` can rename types by appending `1` when a field name conflicts with the type name (e.g. `PaymentStatus` → `PaymentStatus1`). This is a known upstream bug.

The generation script (`scripts/generate_python_sdk_models.sh`) has a `CONFLICTS` array that automatically fixes these renames to keep CI stable. When you encounter a new conflict, add it:

```bash
# In scripts/generate_python_sdk_models.sh
CONFLICTS=("PaymentStatus" "YourNewConflict")
```

Then re-run `make generate-python-sdk-models` and commit the fixed output.

---

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

# Bump all versions in one command (Cargo.toml, pyproject.toml, package.json)
bash scripts/sync-versions.sh X.Y.Z

# Check current versions across all SDKs
bash scripts/sync-versions.sh   # no argument → display only

# Update CHANGELOG.md, then commit
git add Cargo.toml python-sdk/pyproject.toml typescript-sdk/package.json CHANGELOG.md
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
git add typescript-sdk/src/generated/ python-sdk/kaleidoswap_sdk/_generated/
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
│   ├── _maker_client.py      # MakerClient
│   ├── _rln_client.py        # RlnClient
│   ├── _http_client.py       # HTTP wrapper
│   ├── _ws_client.py        # WebSocket
│   ├── errors.py             # Error classes
│   ├── types.py              # Re-exports generated types
│   ├── _utils/               # Utilities
│   └── _generated/           # Auto-generated (DO NOT EDIT)
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
| Test Python | `cd python-sdk && uv run pytest` |
| Lint TypeScript | `cd typescript-sdk && pnpm run lint` |
| Lint Python | `cd python-sdk && uv run ruff check kaleidoswap_sdk` |
| Format TypeScript | `cd typescript-sdk && pnpm run format` |
| Format Python | `cd python-sdk && uv run ruff format kaleidoswap_sdk` |
| Type check TypeScript | `cd typescript-sdk && pnpm run typecheck` |
| Type check Python | `cd python-sdk && uv run mypy kaleidoswap_sdk --ignore-missing-imports` |
| Build TypeScript | `cd typescript-sdk && pnpm run build` |
| Build Python | `cd python-sdk && uv build` |
