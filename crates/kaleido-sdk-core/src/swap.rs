//! Taker swap state machines — the high-level surface the bindings expose.
//!
//! One driver per swap kind, composing `client` + `verify` + `sign` +
//! `spend`:
//! - **submarine** — quote → create → `verify` lockup → pay the maker's
//!   invoice → on success done; on timeout `spend` the refund leaf.
//! - **reverse** — quote → create → pay the maker's hold invoice →
//!   `verify` + watch the maker's lockup → `sign` cooperative claim
//!   (fallback `spend` claim leaf with the preimage).
//! - **chain** — atomic X↔Y: lock the from-leg, watch the maker lock the
//!   to-leg, claim (revealing the preimage), which lets the maker claim
//!   the from-leg; refund either leg on timeout.
//!
//! The aim is one `complete_swap(...)` per kind that the UniFFI/wasm
//! bindings expose as a single call, plus lower-level steps for browser
//! hosts that drive their own chain polling.
//!
//! TODO(build order #4): implement the three drivers.
