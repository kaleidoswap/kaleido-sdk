//! Wire types for the maker `/v2` API (taker-facing subset).
//!
//! Mirrors the Boltz-shaped JSON the maker emits. The create-swap
//! responses are typed (the `verify`/`swap` layers consume them); the
//! request bodies stay as [`serde_json::Value`] until the `swap` state
//! machines own key generation.

use serde::{Deserialize, Serialize};

/// Re-exported network enums — the canonical address-derivation params
/// from `maker-musig`. The SDK does not redefine these so the taker's
/// recompute (`verify`) and the maker's derivation can never drift.
pub use maker_musig::{Chain as BitcoinNetwork, LiquidNetwork};

/// Which chain a swap's lockup lives on — selects the address-derivation
/// math used by [`crate::verify`] (and later `spend`).
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Venue {
    /// Bitcoin L1 — BIP-341 taproot lockup (`0xc0` leaves).
    BitcoinL1(BitcoinNetwork),
    /// Liquid / Elements — elements-taproot lockup (`0xc4` leaves).
    Liquid(LiquidNetwork),
    /// Arkade VHTLC. The address depends on the live Ark server's params,
    /// so offline recompute can't verify it yet — it lands with the
    /// ark-client wiring (build order #3). [`crate::verify`] returns
    /// [`crate::Error::InvalidInput`] for this venue until then.
    Arkade,
}

/// Swap kind — matches the maker's `swapType` enum.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum SwapType {
    Submarine,
    Reverse,
    Chain,
}

/// `GET /v2/info`.
#[derive(Debug, Clone, Deserialize)]
pub struct NodeInfo {
    pub network: String,
    #[serde(rename = "publicKey")]
    pub public_key: String,
    #[serde(rename = "blockHeight")]
    pub block_height: u64,
    pub version: String,
}

/// `POST /v2/quote` request.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuoteRequest {
    pub swap_type: SwapType,
    pub pair_id: String,
    /// Amount in the from-asset's smallest units.
    pub from_amount: u64,
}

/// `POST /v2/quote` response.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Quote {
    pub pair_id: String,
    pub from_amount: u64,
    pub to_amount: u64,
}

/// One entry from a swap's append-only event log.
#[derive(Debug, Clone, Deserialize)]
pub struct SwapEvent {
    pub ts: i64,
    pub kind: String,
}

/// `GET /v2/swap/{id}` — current status + event log.
#[derive(Debug, Clone, Deserialize)]
pub struct SwapStatus {
    pub id: String,
    #[serde(rename = "type")]
    pub swap_type: SwapType,
    pub status: String,
    #[serde(rename = "failureReason", default)]
    pub failure_reason: Option<String>,
    #[serde(rename = "failureDetails", default)]
    pub failure_details: Option<String>,
    #[serde(default)]
    pub events: Vec<SwapEvent>,
}

// ── create-swap responses ───────────────────────────────────────────────────
//
// The maker emits these as Boltz-shaped JSON (see `maker-api/src/swap/*`).
// Field-name quirks are preserved deliberately: submarine/chain return the
// taker-funded lockup as `address`, reverse returns it as `lockupAddress`.

/// One tapscript leaf, as published in a swap's `swapTree`.
#[derive(Debug, Clone, Deserialize)]
pub struct SwapLeafJson {
    /// Tapleaf version byte (`0xc0` Bitcoin / `0xc4` Liquid), as a number.
    pub version: u8,
    /// The leaf script, hex.
    pub output: String,
}

/// The two-leaf taproot tree (claim + refund) committed to by a lockup
/// address. The taker recomputes this and the address from public inputs.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SwapTreeJson {
    pub claim_leaf: SwapLeafJson,
    pub refund_leaf: SwapLeafJson,
}

/// `POST /v2/swap/submarine` response — on-chain → LN.
/// Role split: **maker = claim, taker = refund**.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmarineResponse {
    pub id: String,
    /// The maker's 33-byte compressed claim pubkey, hex.
    pub claim_public_key: String,
    /// The P2TR / VHTLC lockup address the taker funds.
    pub address: String,
    pub swap_tree: SwapTreeJson,
    pub timeout_block_height: u32,
    /// Amount, smallest units, the taker must lock.
    pub expected_amount: u64,
}

/// `POST /v2/swap/reverse` response — LN → on-chain.
/// Role split: **taker = claim, maker = refund**.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReverseResponse {
    pub id: String,
    /// The maker's BOLT11 hold invoice the taker pays.
    pub invoice: String,
    /// The maker's 33-byte compressed refund pubkey, hex.
    pub refund_public_key: String,
    /// The lockup the maker funds and the taker claims. (Reverse uses
    /// `lockupAddress`, unlike submarine's `address`.)
    pub lockup_address: String,
    pub swap_tree: SwapTreeJson,
    pub timeout_block_height: u32,
    /// Amount, smallest units, the taker receives on-chain.
    pub onchain_amount: u64,
}

/// The maker-funded "to" leg of a chain swap (atomic pairs only).
/// Role split: **taker = claim, maker = refund**.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ServerLockup {
    pub address: String,
    /// Present for the Liquid server leg; absent for an Arkade leg.
    #[serde(default)]
    pub swap_tree: Option<SwapTreeJson>,
    pub timeout_block_height: u32,
    /// The maker's 33-byte compressed refund pubkey for this leg, hex.
    pub refund_public_key: String,
    pub amount: u64,
}

/// `POST /v2/swap/chain` response — atomic X↔Y.
///
/// The taker locks the "from" leg at [`address`](Self::address)
/// (**maker = claim, taker = refund**); for an atomic pair the maker locks
/// the "to" leg at [`server_lockup`](Self::server_lockup)`.address`
/// (**taker = claim, maker = refund**). Both legs use the submarine tree
/// shape.
#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ChainResponse {
    pub id: String,
    /// The maker's claim pubkey for the from-leg, hex.
    pub claim_public_key: String,
    /// The from-leg lockup the taker funds.
    pub address: String,
    pub swap_tree: SwapTreeJson,
    pub timeout_block_height: u32,
    /// Amount, smallest units, the taker locks on the from-leg.
    pub expected_amount: u64,
    /// Amount, smallest units, the taker receives on the to-leg.
    pub payout_amount: u64,
    /// The taker's destination address for the to-asset.
    pub user_address: String,
    /// The maker-funded to-leg — absent for the plain-send pair.
    #[serde(default)]
    pub server_lockup: Option<ServerLockup>,
}
