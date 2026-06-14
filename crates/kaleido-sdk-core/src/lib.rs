//! `kaleido-sdk-core` — taker SDK for the KaleidoSwap maker `/v2` API.
//!
//! See `docs/REWRITE.md`. Layering:
//! - [`client`] — typed `/v2` REST (+ WS, forthcoming) transport.
//! - [`verify`] — recompute the maker's lockup tree/address; the trust
//!   anchor that makes a swap atomic rather than custodial. **Implemented**
//!   for Bitcoin L1 and Liquid (Arkade lands with the ark-client wiring).
//! - [`sign`] — MuSig2 cooperative claim/refund (taker side).
//! - [`spend`] — unilateral script-path claim/refund (BTC/Liquid/Arkade).
//! - [`swap`] — taker state machines tying it together.
//!
//! `verify`/`sign`/`spend` reuse `maker-musig` — the maker's audited
//! tree/MuSig2/taproot primitives — rather than reimplementing
//! consensus-critical code. `sign`/`spend`/`swap` are stubbed and land next.

#![forbid(unsafe_code)]

pub mod client;
pub mod config;
pub mod error;
pub mod types;
pub mod verify;

// Protocol layers — scaffolded; implemented on top of `maker-musig` next
// (build order in docs/REWRITE.md).
pub mod sign;
pub mod spend;
pub mod swap;

pub use client::MakerClient;
pub use config::Config;
pub use error::{Error, Result};
pub use types::{
    BitcoinNetwork, ChainResponse, LiquidNetwork, NodeInfo, Quote, QuoteRequest, ReverseResponse,
    SubmarineResponse, SwapEvent, SwapStatus, SwapType, Venue,
};
pub use verify::{verify_chain_lockup, verify_reverse_lockup, verify_submarine_lockup};
