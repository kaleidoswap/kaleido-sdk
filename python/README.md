# ⚠️ DEPRECATED: Python Standalone SDK

> **This SDK is deprecated.** Please use the new UniFFI-based SDK in `bindings/python/` instead.

## Migration Guide

The Kaleidoswap SDK has been consolidated to a Rust-first architecture with UniFFI bindings. This provides:

- **Single source of truth**: All languages share the same core implementation
- **Feature parity**: Guaranteed identical functionality across Python, TypeScript, and Rust
- **Better performance**: Native bindings instead of HTTP-only clients

### New Installation

```bash
pip install kaleidoswap
```

### New Package Location

See [`bindings/python/`](../bindings/python/) for the new SDK.

### Legacy SDK

The code in this directory (`python/`) is kept for reference but will not receive updates. If you need to continue using it during migration, install with:

```bash
cd python
pip install -e .
```

---

**Last Update**: v0.2.0  
**Replaced By**: `bindings/python/` (UniFFI)
