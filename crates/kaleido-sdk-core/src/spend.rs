//! Unilateral script-path claim/refund — the no-cooperation fallback.
//!
//! Reverse/chain claim: once the maker's lockup confirms, spend its
//! claim leaf with the preimage. Submarine refund: after the CLTV opens,
//! spend the refund leaf. One builder per venue (BTC, Liquid, Arkade),
//! since the tag math + tx encoding differ.
//!
//! Reuses `maker_musig::spend` (the shared `btc_*` / `liquid_*`
//! BIP-341 pipeline) and the Arkade VHTLC refund/claim via the ark
//! client — the same audited code the maker's sweepers use.
//!
//! TODO(build order #3): implement `claim_*` / `refund_*` per venue.
