# SDK Code Generation Guide

This guide describes how each language SDK generates code from OpenAPI specifications.

## Quick Start

```bash
# Full regeneration (fetch specs + generate + verify)
make regenerate

# Or step by step:
make update-specs              # Download latest OpenAPI specs
make generate-models           # Generate models for all SDKs
make generate-python-sdk-models # Generate Python SDK models only
make generate-ts-types         # Generate TypeScript SDK types only
```

> **Note**: Each language SDK has its own generation script and tooling. No Docker required for Python/TypeScript SDKs.

---

## Architecture

Each language SDK generates its own models independently:

```
OpenAPI Specs (crates/kaleidoswap-core/specs/)
├── maker.json (Kaleidoswap Market API)
└── rln.yaml (RGB Lightning Node API)
    │
    ├─→ Python SDK: scripts/generate_python_sdk_models.sh
    │   └─→ python-sdk/kaleidoswap_sdk/_generated/
    │       ├── api_types.py
    │       └── node_types.py
    │
    ├─→ TypeScript SDK: scripts/generate_typescript_types.sh
    │   └─→ typescript-sdk/src/generated/
    │       ├── api-types.ts
    │       └── node-types.ts
    │
    └─→ Rust Core: scripts/generate-rust-models.sh (optional, requires Docker)
        └─→ crates/kaleidoswap-core/src/generated/
```

---

## 1. Python SDK Model Generation

The Python SDK uses **only** `datamodel-code-generator` for code generation. There is no `openapi-python-client` usage for the Maker API anymore; the attrs-based generated HTTP client has been removed. The Maker client uses `HttpClient` + Pydantic models directly.

### Source Files
- `crates/kaleidoswap-core/specs/maker.json` - Kaleidoswap Market API
- `crates/kaleidoswap-core/specs/rln.yaml` - RGB Lightning Node API

### Output
```
python-sdk/kaleidoswap_sdk/_generated/
├── __init__.py          # Re-exports all types
├── base.py              # Base model utilities
├── api_types.py         # Pydantic models from maker.json
└── node_types.py        # Pydantic models from rln.yaml
```

### Generation Script
```bash
bash scripts/generate_python_sdk_models.sh
# Or via Make:
make generate-python-sdk-models
```

### Tool
- **Tool**: `datamodel-code-generator`
- **Install**: `pip install datamodel-code-generator[http]`
- **Output Format**: Pydantic v2 BaseModel classes

### Features
- Auto-fixes naming conflicts (e.g., `PaymentStatus1` → `PaymentStatus`)
- Generates type-safe Pydantic models
- Includes field constraints and validation

### Note on `generate-python-sdk-client`
The `generate-python-sdk-client` make target still exists but only generates the RLN client (which is unused by the SDK directly). The Maker client no longer needs generated code—it uses `HttpClient` + Pydantic models directly.

---

## 2. TypeScript SDK Type Generation

TypeScript SDK types are generated using `openapi-typescript`:

### Source Files
- `crates/kaleidoswap-core/specs/maker.json` - Kaleidoswap Market API
- `crates/kaleidoswap-core/specs/rln.yaml` - RGB Lightning Node API

### Output
```
typescript-sdk/src/generated/
├── api-types.ts         # TypeScript types from maker.json
└── node-types.ts        # TypeScript types from rln.yaml
```

### Generation Script
```bash
bash scripts/generate_typescript_types.sh
# Or via Make:
make generate-ts-types
```

### Tool
- **Tool**: `openapi-typescript`
- **Install**: `npm install -g openapi-typescript`
- **Output Format**: TypeScript type definitions

---

## 3. Rust Core Model Generation (Optional)

Rust models are auto-generated from OpenAPI specs using `openapi-generator-cli` via Docker.

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

## 4. Development Workflow

| Command | Description |
|---------|-------------|
| `make regenerate` | Full spec + model + verify workflow |
| `make generate-models` | Generate models for all SDKs |
| `make generate-python-sdk-models` | Generate Python SDK models only |
| `make generate-ts-types` | Generate TypeScript SDK types only |
| `make generate-rust-models` | Generate Rust models (requires Docker) |
| `make update-specs` | Download latest OpenAPI specs |
| `make build` | Build all SDKs |
| `make test` | Run all tests |

### When OpenAPI Specs Change

1. **Update specs** (if needed):
   ```bash
   make update-specs  # Downloads latest specs
   ```

2. **Regenerate models for the SDK you're working on**:
   ```bash
   # Python SDK
   make generate-python-sdk-models
   
   # TypeScript SDK
   make generate-ts-types
   
   # Or regenerate all
   make generate-models
   ```

3. **Commit the generated files**:
   ```bash
   git add python-sdk/kaleidoswap_sdk/_generated/
   git add typescript-sdk/src/generated/
   git commit -m "chore: regenerate SDK models from OpenAPI specs"
   ```

---

## 5. SDK Independence

Each SDK is **maintained separately**:
- ✅ **No shared bindings** - Each SDK generates its own models
- ✅ **Independent tooling** - Python uses `datamodel-code-generator`, TypeScript uses `openapi-typescript`
- ✅ **Standalone implementations** - No dependencies between SDKs
- ✅ **Separate generation scripts** - Each language has its own script

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
