# Changelog

All notable changes to the Kaleidoswap SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### ✨ Added - WebSocket Support

#### Core Features
- **Full WebSocket Implementation** for real-time data streaming
  - Automatic reconnection with exponential backoff
  - Event-driven architecture with custom event handlers
  - Connection state management
  - Ping/pong keepalive mechanism

#### WebSocket Client Features
- `WebSocketClient` with configurable reconnection settings
- Support for multiple event types:
  - `PriceUpdate` - Real-time price updates
  - `QuoteResponse` - Fast quote responses
  - `SwapUpdate` - Swap status updates
  - `OrderUpdate` - Order status updates
  - `Connected/Disconnected` - Connection lifecycle events
  - `Error` - Error handling

#### KaleidoClient Integration
- `connect_websocket()` - Initialize WebSocket connection
- `connect_websocket_with_config()` - Custom configuration support
- `disconnect_websocket()` - Clean disconnection
- `subscribe_to_pair()` - Subscribe to price updates
- `unsubscribe_from_pair()` - Unsubscribe from updates
- `get_quote_websocket()` - Fast quote requests via WebSocket
- `on_websocket_event()` - Register event handlers
- `reconnect_websocket()` - Manual reconnection

#### Examples Added
- **Rust**: `websocket_streaming.rs`, `websocket_quotes.rs`
- **Python**: `websocket_streaming.py`, `websocket_quotes.py`
- **TypeScript**: `websocket-streaming.ts`, `websocket-quotes.ts`

#### Testing
- Comprehensive integration test suite for WebSocket functionality
- Tests for connection lifecycle, subscriptions, events, and reconnection

#### Documentation
- Complete WebSocket usage guide with examples
- Updated README with WebSocket examples for all languages
- Architecture documentation updated

### 🔄 Changed
- Moved WebSocket documentation from `planned/` to main `docs/` folder
- Updated ROADMAP to reflect completed WebSocket implementation

## [0.2.0] - 2024-11-19

### 🎉 Major Release: Auto-Generated SDK from OpenAPI Specs

This release introduces a complete architectural refactor, moving from hand-written code to auto-generated code from OpenAPI specifications. This ensures type safety, API parity, and easier maintenance.

### ✨ Added

#### Code Generation
- **Auto-generation scripts** for TypeScript and Python SDKs
  - `scripts/generate-typescript.sh` - Generate TypeScript SDK from OpenAPI specs
  - `scripts/generate-python.sh` - Generate Python SDK from OpenAPI specs
  - `scripts/update-openapi-specs.sh` - Fetch latest OpenAPI specs from remote sources

#### Makefile Targets
- `make generate` - Generate both TypeScript and Python SDKs
- `make generate-typescript` - Generate TypeScript SDK only
- `make generate-python` - Generate Python SDK only
- `make update-specs` - Download latest OpenAPI specifications

#### Configuration Files
- OpenAPI generator config for Python (`openapi-config-kaleido.yaml`, `openapi-config-rgb.yaml`)
- Generator ignore files (`.generatorignore`) to protect hand-written code
- CI/CD workflow example (`.github/workflows/generate-sdk.yml.example`)

### 🔄 Changed

#### TypeScript SDK
- **Refactored `KaleidoClient`** to use auto-generated `KaleidoApiClient` and `RgbNodeClient` internally
- **Updated type imports** to use generated code from `./generated/kaleido/` and `./generated/rgb-node/`
- **Re-exported common types** from generated code in `index.ts` for convenience
- Maintained backward compatibility for most public APIs

#### Python SDK
- **Refactored `KaleidoClient`** to use auto-generated clients internally
- **Updated imports** to use generated code from `.generated.kaleido` and `.generated.rgb_node`
- **Re-exported common types** in `__init__.py` for convenience
- Maintained backward compatibility for most public APIs

### ⚠️ Breaking Changes

#### Type Names
- `AssetResponse` → `AssetsResponse` (TypeScript)
- `QuoteResponse` → `PairQuoteResponse` (Python)
- `Quote` → `PairQuoteRequest` (TypeScript, for consistency)

#### Import Paths
**TypeScript:**
```typescript
// Before (v0.1.x)
import { AssetResponse } from 'kaleidoswap-sdk';

// After (v0.2.0)
import { AssetsResponse } from 'kaleidoswap-sdk';
```

**Python:**
```python
# Before (v0.1.x)
from kaleidoswap_sdk import QuoteResponse

# After (v0.2.0)
from kaleidoswap_sdk import PairQuoteResponse
```

#### Response Field Names
- Response fields now strictly follow OpenAPI spec (snake_case in JSON responses)
- TypeScript types enforce the exact field names from the API

### 🐛 Fixed
- Type safety issues by using OpenAPI-generated types
- API parity issues by using auto-generated clients
- Inconsistent naming across languages

### 📝 Documentation
- Updated README with code generation workflow
- Added comprehensive migration guide
- Documented best practices for SDK development
- Created detailed generation documentation

### 🔧 Internal Changes
- Moved to hybrid architecture: auto-generated base + hand-written convenience methods
- Separated generated code (`/generated`) from hand-written code
- Improved maintainability through automated code generation
- Added protection for hand-written code via `.generatorignore` files

### 🎯 Benefits
- ✅ **Type Safety**: All types match OpenAPI specs exactly
- ✅ **API Parity**: Guaranteed compatibility with the API
- ✅ **Easy Updates**: Regenerate SDK when API changes
- ✅ **Better IDE Support**: Enhanced autocomplete from generated types
- ✅ **Future-Proof**: Clean architecture for long-term maintenance

### 📚 Migration
See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration instructions from v0.1.x to v0.2.0.

---

## [0.1.5] - 2024-11-01

### Added
- Python SDK examples
- Additional utility methods for asset management
- WebSocket support for real-time quotes

### Changed
- Improved error handling
- Enhanced retry logic
- Better logging

### Fixed
- Connection timeout issues
- WebSocket reconnection logic
- Cache invalidation bugs

---

## [0.1.0] - 2024-10-15

### Added
- Initial release of Kaleidoswap SDK
- TypeScript SDK with full API coverage
- Python SDK with full API coverage
- Support for Kaleidoswap Maker API
- Support for RGB Lightning Node API
- Comprehensive error handling
- Retry mechanisms
- WebSocket support for quotes
- Utility functions (precision handler, asset mapper)
- Documentation and examples

### Features
- Asset and pair management
- Quote requests (HTTP and WebSocket)
- Atomic swaps (maker flow)
- Swap orders
- LSPS1 channel management
- RGB asset operations
- Lightning Network operations
- On-chain Bitcoin operations

---

## Release Tags

- `[0.2.0]` - 2024-11-19 - Auto-generated SDK from OpenAPI
- `[0.1.5]` - 2024-11-01 - Enhanced features and fixes
- `[0.1.0]` - 2024-10-15 - Initial release

---

## Contributing

When contributing to this project, please:
1. Never edit files in `/generated` directories
2. Run `make generate` after modifying OpenAPI specs
3. Add tests for hand-written code
4. Update this CHANGELOG with your changes
5. Follow the migration guide format for breaking changes

For more information, see [CONTRIBUTING.md](./CONTRIBUTING.md).

