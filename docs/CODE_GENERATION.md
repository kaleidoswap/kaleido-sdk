# SDK Code Generation Guide

This guide describes how the Kaleidoswap SDK generates its codebase from API specifications and foreign function interfaces.

## 1. Model Generation (OpenAPI -> Rust)

The Rust data models in `crates/kaleidoswap-core` are auto-generated from the OpenAPI specifications found in `specs/`.

### Source Files
- `specs/kaleidoswap.json`: Kaleidoswap Maker API spec.
- `specs/rgb-lightning-node.yaml`: RGB Lightning Node API spec.

### Command
To regenerate the Rust models, run:

```bash
make generate-models
# Or manually:
python scripts/generate_models.py
```

### Process
1. The script reads the OpenAPI specs.
2. Uses `progenitor` (Rust crate) to generate strictly typed Rust models.
3. Outputs to `crates/kaleidoswap-core/src/models/` (`kaleidoswap.rs` and `rgb_node.rs`).
4. Updates `crates/kaleidoswap-core/src/models/mod.rs` to alias types to cleaner names.

## 2. Binding Generation (Rust -> Python/TypeScript)

The SDK uses [Mozilla UniFFI](https://github.com/mozilla/uniffi-rs) to generate bindings for other languages. The core interface is defined in `crates/kaleidoswap-uniffi/src/kaleidoswap.udl`.

### Structure
1. `crates/kaleidoswap-core`: The pure Rust async implementation.
2. `crates/kaleidoswap-uniffi`: Wraps the core library with a UniFFI-compatible interface (handling runtime bridging and simpler types).
3. `bindings/python`: Generates the Python package.
4. `bindings/typescript`: Generates the TypeScript/Node.js package.

### TypeScript / Node.js
To build the TypeScript bindings:

```bash
make build-typescript
```

This performs two steps:
1. Builds the Rust code as a dynamic library (`.dylib` on macOS, `.so` on Linux).
2. Copies the library to `bindings/typescript/native/kaleidoswap_ts.node`.
3. The TypeScript code in `bindings/typescript/src/index.ts` loads this native module.

**Generating Glue Code:**
For a production setup without manual wrappers, you can use `uniffi-bindgen` to generate the TypeScript source directly:

```bash
cargo run --bin uniffi-bindgen generate crates/kaleidoswap-uniffi/src/kaleidoswap.udl --language typescript --out-dir bindings/typescript/src
```

### Python
To build the Python bindings:

```bash
make build-python
```

This uses `maturin` to build a Python wheel that includes the compiled Rust library. UniFFI symbols are exposed via the `kaleidoswap-python` crate.

**Generating Glue Code:**
Maturin usually handles this, but you can also generate pure Python wrappers:

```bash
cargo run --bin uniffi-bindgen generate crates/kaleidoswap-uniffi/src/kaleidoswap.udl --language python --out-dir bindings/python/python/kaleidoswap
```

## 3. Development Workflow

The `Makefile` automates most tasks:

- `make build-rust`: Build core libraries.
- `make generate-models`: Update Rust models from OpenAPI specs.
- `make build-python`: Build Python wheel in dev mode.
- `make build-typescript`: Build TypeScript/Node.js module.
- `make test`: Run all tests.
