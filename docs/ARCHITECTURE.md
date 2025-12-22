# Kaleidoswap SDK Architecture

This document describes the architecture of the Kaleidoswap SDK, a unified multi-language SDK for interacting with the Kaleidoswap decentralized exchange and RGB Lightning Protocol.

## Overview

The SDK follows a **Rust-first architecture** with language bindings generated via UniFFI:

```
┌─────────────────────────────────────────────────────────────────┐
│                        Language Bindings                         │
├───────────────────────┬───────────────────────┬─────────────────┤
│    Python (PyO3)      │   TypeScript (NAPI)   │     Swift       │
│   bindings/python     │  bindings/typescript  │   (planned)     │
└───────────────────────┴───────────────────────┴─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    UniFFI Binding Layer                         │
│                  crates/kaleidoswap-uniffi                      │
│  • FFI interface definition (kaleidoswap.udl)                   │
│  • Type conversions (JsonValue wrapper)                         │
│  • Error handling bridge                                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
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
│                           specs/                                 │
│  • kaleidoswap.json (Kaleidoswap Maker API)                     │
│  • rgb-lightning-node.yaml (RGB Lightning Node API)             │
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
├── bindings/                  # UniFFI-generated bindings (ACTIVE)
│   ├── python/                # Python SDK (maturin + PyO3)
│   │   ├── src/lib.rs
│   │   ├── pyproject.toml
│   │   └── tests/
│   └── typescript/            # TypeScript SDK (NAPI-RS)
│       ├── src/lib.rs
│       ├── package.json
│       └── tests/
├── python/                    # ⚠️ DEPRECATED - Legacy standalone SDK
├── typescript/                # ⚠️ DEPRECATED - Legacy standalone SDK
├── specs/                     # OpenAPI specifications
│   ├── kaleidoswap.json       # Kaleidoswap Maker API
│   └── rgb-lightning-node.yaml
└── scripts/                   # Build and utility scripts
    ├── generate-rust-models.sh  # Docker-based model generation
    └── update-openapi-specs.sh  # Spec download script
```

## Key Components

### 1. Model Generation (Docker-based)

All models are **auto-generated** from OpenAPI specs using `openapi-generator-cli` via Docker:

```bash
# Generate models (requires Docker)
./scripts/generate-rust-models.sh

# Or via Make
make generate-models

# Full workflow: fetch specs + generate + verify
make regenerate
```

This generates **191 total models**:
- `generated/kaleidoswap/models/` - 70 models (Layer, Asset, TradingPair, SwapRequest, etc.)
- `generated/rgb_node/models/` - 121 models (Channel, Peer, Payment, Invoice, etc.)

The `models/mod.rs` re-exports from generated:
```rust
// src/models/mod.rs
pub use crate::generated::kaleidoswap::models::*;
pub use crate::generated::rgb_node::models as rgb_node;
```

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

### 5. Language Bindings

#### Python (`bindings/python/`)

Built with maturin and PyO3:

```python
from kaleidoswap import KaleidoClient, KaleidoConfig

config = KaleidoConfig(base_url="https://api.kaleidoswap.com")
client = KaleidoClient(config)

assets = client.list_assets()  # Returns JSON string
print(f"Found assets: {assets}")
```

#### TypeScript (`bindings/typescript/`)

Native Node.js addon:

```typescript
import { KaleidoClient, KaleidoConfig } from '@kaleidoswap/sdk';

const config = new KaleidoConfig({ baseUrl: 'https://api.kaleidoswap.com' });
const client = new KaleidoClient(config);

const assets = await client.listAssets();  // Returns JSON string
console.log(`Found assets: ${assets}`);
```

## Development Workflow

### Building

```bash
# Build everything
make build

# Build individual components
make build-rust      # Core library
make build-python    # Python bindings
make build-typescript # TypeScript bindings
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
make update-specs      # Download latest OpenAPI specs
make generate-models   # Run Docker-based generator
cargo check            # Verify compilation
make build             # Rebuild bindings
```

> **Note**: Model generation requires Docker to be installed and running.

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
