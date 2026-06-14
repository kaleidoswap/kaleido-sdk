//! MuSig2 cooperative claim/refund — the taker's half of the two-party
//! key-path spend (the fast, cheap, private settlement path).
//!
//! Reverse claim: the taker produces a partial signature over the
//! maker's lockup spend and posts it to `…/claim`; the maker aggregates
//! and broadcasts. Submarine/chain refund is the mirror. Falls back to
//! `spend` (unilateral script path) if the maker won't cooperate.
//!
//! Reuses `maker_musig::session` (`CooperativeKey`, `AggregatedKey`,
//! `MakerSession`/taker session, nonce + partial-sig exchange) and
//! `sk_from_bytes`. Nonces must be fresh per session — never reused.
//!
//! TODO(build order #3): implement the taker partial-sign + nonce flow.
