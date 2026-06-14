//! Wire types for the maker `/v2` API (taker-facing subset).
//!
//! Mirrors the Boltz-shaped JSON the maker emits. Rich create-swap
//! responses stay as [`serde_json::Value`] for now and get typed as the
//! `swap` state machines that consume them land.

use serde::{Deserialize, Serialize};

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
