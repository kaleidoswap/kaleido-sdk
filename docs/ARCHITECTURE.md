# Kaleidoswap SDK Architecture

This document describes the architecture of the Kaleidoswap SDK, a unified multi-language SDK for interacting with the Kaleidoswap decentralized exchange and RGB Lightning Protocol.

## Overview

The SDK follows a **multi-language architecture** with standalone SDK implementations. Each language SDK is maintained separately and generates its own models directly from OpenAPI specifications:

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenAPI Specifications                        │
│              (crates/kaleidoswap-core/specs/)                   │
│                                                                 │
│              maker.json              rln.yaml                  │
└────────────────────┬──────────────────────┬─────────────────────┘
                     │                      │
                     ▼                      ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │  Python SDK          │  │  TypeScript SDK      │
        │  python-sdk/         │  │  typescript-sdk/     │
        │                      │  │                      │
        │  Generation Script:  │  │  Generation Script:  │
        │  generate_python_    │  │  generate_typescript │
        │  sdk_models.sh       │  │  _types.sh          │
        │                      │  │                      │
        │  Output:             │  │  Output:            │
        │  _generated/         │  │  src/generated/      │
        │  - api_types.py      │  │  - api-types.ts     │
        │  - node_types.py     │  │  - node-types.ts    │
        └──────────────────────┘  └──────────────────────┘
                     │                      │
                     ▼                      ▼
        ┌──────────────────────┐  ┌──────────────────────┐
        │  Standalone Python   │  │  Standalone TS/JS   │
        │  Implementation      │  │  Implementation     │
        │  • Pure Python       │  │  • Pure TypeScript  │
        │  • Pydantic models   │  │  • TypeScript types │
        │  • Single HttpClient │  │  • Promise-based    │
        │  • Async/await       │  │                     │
        └──────────────────────┘  └──────────────────────┘
                     │                      │
                     ▼                      ▼
        ┌─────────────────────────────────────────────────────┐
        │              Core Rust Library                       │
        │         (crates/kaleidoswap-core/)                  │
        │  • Shared business logic (optional dependency)      │
        │  • Can be used independently                        │
        └─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                      Core Rust Library                          │
│                   crates/kaleidoswap-core                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────┐  ┌───────────────────────┐│
│  │ Generated Models│  │  API Layer  │  │        Client         ││
│  │   (OpenAPI)     │  │             │  │    KaleidoClient      ││
│  │ ┌─────────────┐ │  │  market.rs  │  │  • Caching            ││
│  │ │ kaleidoswap │ │  │  swaps.rs   │  │  • Retry logic        ││
│  │ │ (70 models) │ │  │  orders.rs  │  │  • Convenience methods││
│  │ ├─────────────┤ │  │  lsp.rs     │  │                       ││
│  │ │  rgb_node   │ │  │  node.rs    │  │                       ││
│  │ │(121 models) │ │  │             │  │                       ││
│  │ └─────────────┘ │  └─────────────┘  └───────────────────────┘│
│  └─────────────────┘                                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │    HTTP     │  │  WebSocket  │  │        Retry            │  │
│  │   Client    │  │   Client    │  │     (exponential)       │  │
│  │  (reqwest)  │  │  (tungstn)  │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      OpenAPI Specifications                      │
│                          (GitHub)                                │
│  • kaleidoswap/specs - Kaleidoswap Maker API                    │
│  • RGB-Tools/rgb-lightning-node - RGB Lightning Node API        │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
kaleido-sdk/
├── Cargo.toml                 # Workspace configuration
├── crates/                    # Rust crates
│   ├── kaleidoswap-core/      # Core library
│   │   ├── src/
│   │   │   ├── generated/     # Auto-generated from OpenAPI (Docker)
│   │   │   │   ├── mod.rs     # Re-exports
│   │   │   │   ├── kaleidoswap/  # 70 Kaleidoswap API models
│   │   │   │   │   ├── mod.rs
│   │   │   │   │   └── models/   # Layer, SwapRequest, Asset, etc.
│   │   │   │   └── rgb_node/     # 121 RGB Node API models
│   │   │   │       ├── mod.rs
│   │   │   │       └── models/   # Channel, Peer, Payment, etc.
│   │   │   ├── models/        # Re-exports from generated/
│   │   │   ├── api/           # API modules
│   │   │   │   ├── market.rs  # Assets, pairs, quotes
│   │   │   │   ├── swaps.rs   # Atomic swaps
│   │   │   │   ├── orders.rs  # Swap orders
│   │   │   │   ├── lsp.rs     # LSPS1 channel service
│   │   │   │   └── node.rs    # RGB Lightning Node
│   │   │   ├── client.rs      # Main KaleidoClient
│   │   │   ├── http.rs        # HTTP client with retry
│   │   │   ├── websocket.rs   # WebSocket client
│   │   │   ├── error.rs       # Error types
│   │   │   └── lib.rs         # Library exports
│   │   └── Cargo.toml
│   └── kaleidoswap-uniffi/    # UniFFI bindings layer
│       ├── src/
│       │   ├── kaleidoswap.udl  # Interface definition
│       │   └── lib.rs           # FFI wrapper
│       └── Cargo.toml
├── python-sdk/                # Python SDK (pure Python)
│   ├── kaleidoswap_sdk/
│   │   ├── _generated/        # Auto-generated Pydantic models
│   │   │   ├── api_types.py   # Maker API models
│   │   │   └── node_types.py  # RGB Node API models
│   │   ├── _http_client.py    # HttpClient (maker_*, node_*)
│   │   ├── _maker_client.py   # MakerClient
│   │   └── _rln_client.py     # RlnClient
│   ├── pyproject.toml
│   └── tests/
├── typescript-sdk/            # TypeScript SDK (pure TypeScript)
│   ├── src/
│   ├── package.json
│   └── tests/
├── specs/                     # OpenAPI specifications
│   ├── kaleidoswap.json       # Kaleidoswap Maker API
│   └── rgb-lightning-node.yaml
└── scripts/                   # Build and utility scripts
    ├── generate-rust-models.sh  # Docker-based model generation
    └── update-openapi-specs.sh  # Spec download script
```

## Key Components

### 1. Model Generation (Language-Specific)

Each language SDK generates its own models directly from OpenAPI specs using language-specific tools:

**Python SDK:**
```bash
# Generate Python models
make generate-python-sdk-models
# Uses: datamodel-code-generator
# Output: python-sdk/kaleidoswap_sdk/_generated/
```

**TypeScript SDK:**
```bash
# Generate TypeScript types
make generate-ts-types
# Uses: openapi-typescript
# Output: typescript-sdk/src/generated/
```

**Rust Core (optional):**
```bash
# Generate Rust models (requires Docker)
make generate-rust-models
# Uses: openapi-generator-cli via Docker
# Output: crates/kaleidoswap-core/src/generated/
```

**All SDKs:**
```bash
# Generate models for all languages
make generate-models

# Full workflow: fetch specs + generate + verify
make regenerate
```

Each SDK maintains its own generation script:
- `scripts/generate_python_sdk_models.sh` - Python SDK models
- `scripts/generate_typescript_types.sh` - TypeScript SDK types
- `scripts/generate-rust-models.sh` - Rust core models (optional)

### 2. Core Client (`client.rs`)

The `KaleidoClient` is the main entry point:

```rust
use kaleidoswap_core::{KaleidoClient, KaleidoConfig};
use kaleidoswap_core::models::Layer;

let config = KaleidoConfig::new("https://api.kaleidoswap.com")
    .with_node_url("http://localhost:3000");

let client = KaleidoClient::new(config)?;

// Market operations
let assets = client.list_assets().await?;
let pairs = client.list_pairs().await?;
let quote = client.get_quote_by_pair("BTC/USDT", Some(100000), None, Layer::BtcSlashLn).await?;

// Swap operations
let swap = client.complete_swap(&quote).await?;
```

### 3. API Layer (`api/`)

Each API module wraps a specific domain:

| Module | Purpose | Key Methods |
|--------|---------|-------------|
| `market.rs` | Assets, pairs, quotes | `list_assets()`, `get_quote()` |
| `swaps.rs` | Atomic swaps | `init_swap()`, `execute_swap()` |
| `orders.rs` | Swap orders | `create_order()`, `get_status()` |
| `lsp.rs` | LSPS1 channels | `create_order()`, `estimate_fees()` |
| `node.rs` | RGB Lightning Node | `list_channels()`, `keysend()` |

### 4. UniFFI Bindings (`kaleidoswap-uniffi/`)

The UniFFI layer exposes the Rust API to other languages:

```
┌─────────────────────────────────────────────────┐
│                kaleidoswap.udl                  │
│  Interface definition language (IDL)            │
│  Defines types, methods, and errors exposed     │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌──────────────┬──────────────┬──────────────────┐
│   Python     │  TypeScript  │     Swift        │
│  .py stubs   │   .ts types  │   .swift         │
└──────────────┴──────────────┴──────────────────┘
```

### 5. Language SDKs

Each SDK is a **standalone implementation** that generates its own models from OpenAPI specs:

#### Python SDK (`python-sdk/`)

- **Pure Python** implementation (no Rust dependencies)
- **Model Generation**: `scripts/generate_python_sdk_models.sh`
  - Uses `datamodel-code-generator` to generate Pydantic v2 models into `_generated/api_types.py` and `_generated/node_types.py`
  - Output: `python-sdk/kaleidoswap_sdk/_generated/`
- **Architecture**: Single `HttpClient` (in `_http_client.py`) wraps `httpx.AsyncClient`; provides `maker_get()`, `maker_post()`, `node_get()`, `node_post()`. `MakerClient` (in `_maker_client.py`) and `RlnClient` (in `_rln_client.py`) use `HttpClient` + Pydantic models directly. No generated HTTP client, no attrs models.
- **Models**: Auto-generated Pydantic models from OpenAPI specs
- **Dependencies**: Standard Python libraries (httpx, pydantic, etc.)

```python
from kaleidoswap_sdk import KaleidoClient

client = KaleidoClient.create(base_url="https://api.kaleidoswap.com")
assets = await client.maker.list_assets()
print(f"Found assets: {assets}")
```

#### TypeScript SDK (`typescript-sdk/`)

- **Pure TypeScript** implementation (no Rust dependencies)
- **Model Generation**: `scripts/generate_typescript_types.sh`
  - Uses `openapi-typescript` to generate TypeScript types
  - Output: `typescript-sdk/src/generated/`
- **Models**: Auto-generated TypeScript types from OpenAPI specs
- **Dependencies**: Standard Node.js libraries (axios, etc.)

```typescript
import { KaleidoClient } from '@kaleidoswap/sdk';

const client = new KaleidoClient({ baseUrl: 'https://api.kaleidoswap.com' });

const assets = await client.listAssets();
console.log(`Found assets: ${assets}`);
```

#### Rust Core (`crates/kaleidoswap-core/`)

- **Optional** Rust library for shared business logic
- **Model Generation**: `scripts/generate-rust-models.sh` (requires Docker)
- Can be used independently or as a dependency

## Development Workflow

### Building

```bash
# Build everything
make build

# Build individual components
make build-rust         # Core library
make build-python-sdk   # Python SDK
make build-typescript   # TypeScript SDK
```

### Testing

```bash
# Run all tests
make test

# Run specific tests
make test-rust       # Rust unit tests (12 core + 6 UniFFI)
cargo test --all     # Full test suite
```

### Regenerating Models

When the API changes:

```bash
# Full regeneration workflow (recommended)
make regenerate

# Or step by step:
make update-specs              # Download latest OpenAPI specs
make generate-models           # Generate models for all SDKs
make generate-python-sdk-models  # Generate Python SDK models only
make generate-ts-types         # Generate TypeScript SDK types only
cargo check                    # Verify Rust compilation (if using Rust core)
make build                     # Rebuild SDKs
```

> **Note**: Model generation requires Docker to be installed and running.
> OpenAPI specifications are automatically fetched from the [kaleidoswap/specs](https://github.com/kaleidoswap/specs) repository.

## API Coverage

The SDK supports these Kaleidoswap APIs:

| API | Endpoints | Status |
|-----|-----------|--------|
| Market | `/api/v1/market/*` | ✅ Complete |
| Swaps | `/api/v1/swaps/*` | ✅ Complete |
| Swap Orders | `/api/v1/swaps/orders/*` | ✅ Complete |
| LSPS1 | `/api/v1/lsps1/*` | ✅ Complete |
| RGB Node | All endpoints | ✅ Complete |

## Error Handling

All errors are typed and propagated consistently:

```rust
pub enum KaleidoError {
    NetworkError { message: String, status_code: Option<u16> },
    ApiError { message: String, status_code: u16 },
    ValidationError { message: String },
    TimeoutError { timeout_secs: f64 },
    WebSocketError { message: String },
    NotFoundError { resource_type: String, identifier: String },
    NodeNotConfigured,
    // ...
}
```

In Python/TypeScript, errors are converted to native exceptions.

## Performance Considerations

1. **Caching**: Assets and pairs are cached with configurable TTL
2. **Retry**: Automatic exponential backoff for transient failures
3. **Connection pooling**: HTTP connections are reused via reqwest
4. **Zero-copy JSON**: Where possible, avoid unnecessary allocations

## Security

1. **No credentials in SDK**: API keys passed at runtime
2. **TLS verification**: Enforced by default
3. **No logging of secrets**: Sensitive data is never logged
