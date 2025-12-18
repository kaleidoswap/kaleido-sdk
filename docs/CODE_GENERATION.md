# SDK Code Generation Guide

This guide describes how the Kaleidoswap SDK generates code from OpenAPI specifications.

## Quick Start

```bash
# Full regeneration (fetch specs + generate + verify)
make regenerate

# Or step by step:
make update-specs      # Download latest OpenAPI specs
make generate-models   # Generate Rust code via Docker
cargo check            # Verify compilation
```

> **Prerequisite**: Docker must be installed and running.

---

## 1. Model Generation (OpenAPI → Rust)

Models are auto-generated from OpenAPI specs using `openapi-generator-cli` in Docker.

### Source Files
- `specs/kaleidoswap.json` - Kaleidoswap Maker API (v0.4.0)
- `specs/rgb-lightning-node.yaml` - RGB Lightning Node API

### Output
```
crates/kaleidoswap-core/src/generated/
├── mod.rs           # Re-exports
├── kaleidoswap/     # 66 Kaleidoswap models
│   └── src/models/
└── rgb_node/        # 121 RGB Node models
    └── src/models/
```

### Script
The generation script uses Docker to avoid Java dependency:

```bash
./scripts/generate-rust-models.sh
```

Uses `openapitools/openapi-generator-cli:latest` Docker image with options:
- `-g rust` - Rust generator
- `--global-property=models` - Models only, no API clients
- `--additional-properties=library=reqwest,supportAsync=true`

---

## 2. Binding Generation (Rust → Python/TypeScript)

UniFFI generates language bindings from Rust core.

### Architecture
1. `crates/kaleidoswap-core` - Pure Rust async implementation
2. `crates/kaleidoswap-uniffi` - UniFFI interface wrapper
3. `bindings/python` - Python package (maturin + PyO3)
4. `bindings/typescript` - TypeScript package (NAPI-RS)

### Python
```bash
make build-python
# Uses maturin to build Python wheel
```

### TypeScript
```bash
make build-typescript
# Builds native Node.js addon
```

---

## 3. Deprecated: Standalone SDKs

The `python/` and `typescript/` directories contain legacy standalone SDKs that are **deprecated**.

Use `bindings/python` and `bindings/typescript` instead.

---

## 4. Development Workflow

| Command | Description |
|---------|-------------|
| `make regenerate` | Full spec + model + verify workflow |
| `make generate-models` | Generate Rust from OpenAPI (Docker) |
| `make update-specs` | Download latest OpenAPI specs |
| `make build` | Build all components |
| `make test` | Run all tests |
