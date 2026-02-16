# Kaleidoswap SDK Development Roadmap

## Current Status (v0.4.0)

The Kaleidoswap SDK provides complete SDKs for **Python** and **TypeScript**. The core architecture provides a unified, type-safe interface across all supported languages.

## Version 0.4 Status

### ✅ Core Architecture
- [x] **Rust Core Library** (`kaleidoswap-core`)
  - Unified HTTP client with retry logic
  - WebSocket client with auto-reconnection
  - Comprehensive error handling
  - Type-safe models from OpenAPI specs
  - WASM support for browser/Node.js

- [x] **Python SDK**
  - Fully typed Pydantic v2 models
  - Organized sub-clients (Market, Orders, Swaps, LSP, Node)
  - Native async/await support
  - Custom exception hierarchy
  - Quote streaming context manager

- [x] **TypeScript SDK**
  - Pure TypeScript implementation
  - Separated Maker and RLN (RGB Lightning Node) clients
  - Full TypeScript type definitions
  - Promise-based API
  - WebSocket streaming support

### ✅ API Coverage

#### Maker API (Market & Swaps)
- [x] Asset management (list, get by ticker)
- [x] Trading pair management
- [x] Quote requests (pair-based and asset-based)
- [x] Swap order creation and management
- [x] Order history and analytics
- [x] Swap status monitoring
- [x] Node info retrieval

#### LSP (Lightning Service Provider)
- [x] LSP info and network details
- [x] Channel fee estimation
- [x] LSPS1 integration

#### RGB Lightning Node API
- [x] Node information and pubkey
- [x] Channel management (open, close, list)
- [x] RGB asset operations (list, send, receive)
- [x] Bitcoin balance and operations
- [x] Lightning payments (send, keysend, list)
- [x] Invoice handling (decode, create)
- [x] Wallet management (init, unlock, lock)
- [x] Onchain operations (address, send, UTXO management)

### ✅ Protocol Support
- [x] REST API integration
- [x] WebSocket API integration
  - Real-time price updates
  - Quote streaming
  - Swap status updates
  - Auto-reconnection with backoff
  - Event-driven architecture
- [ ] Nostr protocol support (planned for v0.5)

### ✅ Error Handling
- [x] Custom exception hierarchy
  - Python: 20+ exception types inheriting from `KaleidoError`
  - TypeScript: Error mapping from WASM
  - Rust: `thiserror`-based error types
- [x] Typed errors from OpenAPI specs
- [x] Proper error propagation across language boundaries

### ✅ Documentation
- [x] Architecture documentation
- [x] API reference (all languages)
- [x] Usage examples
  - Market data examples
  - Error handling examples
  - WebSocket streaming examples
  - Swap order examples
- [x] Installation guides
- [x] Type definitions documentation
- [x] WebSocket usage guide
- [ ] Video tutorials (planned)
- [ ] Interactive playground (planned)

### 🚧 Testing
- [x] Rust unit tests
- [x] Python basic tests
- [x] TypeScript basic tests
- [ ] Comprehensive integration test suite
- [ ] Cross-language compatibility tests
- [ ] WebSocket stress tests
- [ ] Performance benchmarks

### 📋 Planned Features

#### Advanced Trading (v0.5)
- [ ] Limit orders
- [ ] Stop-loss orders
- [ ] Order book streaming
- [ ] Batch operations
- [ ] Advanced order types

#### Protocol Extensions (v0.5+)
- [ ] Nostr integration
- [ ] Protocol versioning
- [ ] Backward compatibility layer

#### Developer Experience (v0.6)
- [ ] CLI tool for testing
- [ ] Mock API server
- [ ] Debug utilities
- [ ] Code generation for custom types
- [ ] Interactive documentation

#### Additional Language Support (Community-Driven)
- [ ] Swift bindings (iOS/macOS)
- [ ] Kotlin bindings (Android)
- [ ] Go bindings
- [ ] C# bindings

## Development Priorities

1. ✅ Rust core library with comprehensive API coverage
2. ✅ Python and TypeScript SDKs
3. ✅ WebSocket implementation
4. ✅ Error handling across all languages
5. ✅ Basic documentation and examples
6. 🚧 Comprehensive testing suite
7. 📋 Advanced trading features
8. 📋 Nostr protocol support
9. 📋 Mobile SDK (Swift/Kotlin)

## Architecture

### Rust Core (`kaleidoswap-core`)
- **Models**: Auto-generated from OpenAPI specs using `progenitor`
- **Clients**: Type-safe API clients for Maker and RGB Node
- **Error Handling**: Comprehensive error types with `thiserror`
- **WebSocket**: Platform-agnostic implementation (native + WASM)
- **Build System**: Custom build script for OpenAPI codegen

### Python SDK (`python-sdk/`)
- **Implementation**: Pure Python with Pydantic v2 models
- **Models**: Auto-generated from OpenAPI specs
- **API**: Organized sub-clients for clarity
- **Async**: Native Python async/await

### TypeScript SDK (`typescript-sdk/`)
- **Implementation**: Pure TypeScript
- **Build**: Standard TypeScript/Node.js build
- **API**: Separated Maker and RLN clients
- **Types**: Full TypeScript definitions from OpenAPI specs

## Timeline

### Phase 1 (Completed - v0.1.x - v0.2.x)
- ✅ Initial TypeScript SDK
- ✅ OpenAPI-based code generation
- ✅ Basic documentation

### Phase 2 (Completed - v0.3.x)
- ✅ Rust core library
- ✅ Python SDK
- ✅ Error handling
- ✅ WebSocket support

### Phase 3 (Current - v0.4.0)
- ✅ TypeScript SDK
- ✅ Separated Maker/RLN clients
- ✅ Comprehensive examples
- 🚧 Testing improvements

### Phase 4 (Planned - v0.5.0)
- Advanced trading features
- Nostr protocol support
- Performance optimizations
- Comprehensive test coverage

### Phase 5 (Future - v0.6.0+)
- Mobile SDKs (Swift/Kotlin)
- CLI tool
- Interactive documentation
- Community-driven language support

## Infrastructure

### Build & Release
- [x] Multi-crate workspace (Rust)
- [x] PyPI distribution (Python)
- [x] npm distribution (TypeScript)
- [x] Version synchronization across languages
- [x] Automated model regeneration from OpenAPI
- [ ] Automated CI/CD pipeline
- [ ] Automated release process

### Code Quality
- [x] Rust formatting and linting
- [x] Python linting (ruff)
- [x] TypeScript linting
- [x] Pre-commit hooks
- [ ] Automated dependency updates
- [ ] Security audits
- [ ] Code coverage tracking

## Contributing

We welcome contributions to the Kaleidoswap SDK! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

**Key Points:**
- Never edit auto-generated models directly
- Run `make generate-models` after OpenAPI spec changes
- All PRs require tests
- Format code with language-specific formatters
- Update documentation for API changes

## Migration from v0.3.x

See [CHANGELOG.md](./CHANGELOG.md) for breaking changes and migration instructions.

**Major Changes in v0.4.0:**
- TypeScript moved from Node.js native to WASM
- Separated `MakerClient` and `RlnClient` in TypeScript
- Updated error handling across all languages
- Enhanced WebSocket API

## Resources

- **[CHANGELOG.md](./CHANGELOG.md)** - Detailed version history
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Contribution guidelines
- **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - Technical architecture
- **[docs/API_REFERENCE.md](./docs/API_REFERENCE.md)** - API documentation
- **[docs/WEBSOCKET.md](./docs/WEBSOCKET.md)** - WebSocket guide