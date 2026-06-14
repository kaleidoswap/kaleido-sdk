//! Independently recompute the maker's lockup and **refuse** on mismatch
//! — the trust anchor that makes a swap atomic instead of custodial.
//!
//! When the maker returns a swap (lockup address + swap tree), the taker
//! must NOT trust it: rebuild the two-leaf taproot tree from the public
//! inputs (preimage hash, both pubkeys, timeout) and the cooperative
//! key, derive the lockup address, and compare. A mismatch means the
//! maker tried to lock to an address it alone controls → abort.
//!
//! Reuses `maker_musig`: `submarine_swap_tree` / `reverse_swap_tree`,
//! `CooperativeKey` / `AggregatedKey`, `lockup_address` /
//! `liquid_lockup_address`, and the Arkade VHTLC address derivation.
//!
//! TODO(build order #2): implement `verify_lockup(swap_type, venue, …)`.
