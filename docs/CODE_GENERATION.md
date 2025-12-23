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
- `specs/kaleidoswap.json` - Kaleidoswap Maker API (from [kaleidoswap/specs](https://github.com/kaleidoswap/specs))
- `specs/rgb-lightning-node.yaml` - RGB Lightning Node API (from RGB-Tools/rgb-lightning-node)

### Output
```
crates/kaleidoswap-core/src/generated/
├── mod.rs               # Re-exports: pub mod kaleidoswap; pub mod rgb_node;
├── kaleidoswap/
│   ├── mod.rs           # pub mod models; pub use models::*;
│   └── models/
│       ├── mod.rs       # pub mod asset; pub use asset::*; ...
│       ├── asset.rs     # Asset struct
│       ├── layer.rs     # Layer enum (BTC/LN, RGB/LN, etc.)
│       ├── swap_request.rs
│       └── ... (70 models)
└── rgb_node/
    ├── mod.rs
    └── models/
        ├── mod.rs
        ├── channel.rs
        ├── peer.rs
        └── ... (121 models)
```

### Generated Model Count
| API | Models | Examples |
|-----|--------|----------|
| Kaleidoswap | 70 | `Asset`, `TradingPair`, `Layer`, `SwapRequest`, `PairQuoteResponse` |
| RGB Node | 121 | `Channel`, `Peer`, `Payment`, `Invoice`, `KeysendRequest` |

### Script
The generation script uses Docker to avoid Java dependency:

```bash
./scripts/generate-rust-models.sh
```

Uses `openapitools/openapi-generator-cli:latest` Docker image with options:
- `-g rust` - Rust generator
- `--global-property=models` - Models only, no API clients
- `--additional-properties=library=reqwest,supportAsync=true`

The script also:
1. Fixes up module structure (creates `mod.rs` files)
2. Fixes imports (`use crate::models;` → `use super::*;`)
3. Removes `models::` prefixes from type references

---

## 2. Model Re-exports

The `src/models/mod.rs` re-exports all generated types:

```rust
//! Model re-exports from generated OpenAPI types.

pub use crate::generated::kaleidoswap::models::*;
pub use crate::generated::rgb_node::models as rgb_node;
```

This allows imports like:
```rust
use kaleidoswap_core::models::{Asset, Layer, TradingPair};
use kaleidoswap_core::models::rgb_node::Channel;
```

---

## 3. Binding Generation (Rust → Python/TypeScript)

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

## 4. Deprecated: Standalone SDKs

The `python/` and `typescript/` directories contain legacy standalone SDKs that are **deprecated**.

Use `bindings/python` and `bindings/typescript` instead.

---

## 5. Development Workflow

| Command | Description |
|---------|-------------|
| `make regenerate` | Full spec + model + verify workflow |
| `make generate-models` | Generate Rust from OpenAPI (Docker) |
| `make update-specs` | Download latest OpenAPI specs |
| `make build` | Build all components |
| `make test` | Run all tests |
| `cargo test --all` | Run full Rust test suite (19 tests) |

---

## 6. Troubleshooting

### Docker not found
```
❌ Docker not found. Please install Docker to continue.
```
Solution: Install Docker Desktop or Docker Engine.

### Import errors after regeneration
If you see `use crate::models;` errors, the script's fixup step may have failed.
Manually run:
```bash
# Check that mod.rs files exist
ls crates/kaleidoswap-core/src/generated/kaleidoswap/models/mod.rs
ls crates/kaleidoswap-core/src/generated/rgb_node/models/mod.rs
```

### Type mismatches
Generated models use `i32` for amounts (from OpenAPI integer spec).
Ensure your API calls use `i32` not `i64` for amount fields.
