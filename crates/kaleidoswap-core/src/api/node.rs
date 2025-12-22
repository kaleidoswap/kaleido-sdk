//! RGB Lightning Node API operations.
//!
//! This module wraps the RGB Lightning Node API for direct node operations.

use crate::error::Result;
use crate::http::HttpClient;
use serde::{Deserialize, Serialize};
use std::sync::Arc;

// ============================================================================
// Node Information Types
// ============================================================================

/// Node information response.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RgbNodeInfo {
    #[serde(default)]
    pub pubkey: String,
    #[serde(default)]
    pub network: String,
    #[serde(default)]
    pub block_height: i64,
    #[serde(default)]
    pub num_channels: i64,
    #[serde(default)]
    pub num_peers: i64,
}

// ============================================================================
// Channel Types
// ============================================================================

/// Channel information.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Channel {
    pub channel_id: String,
    #[serde(default)]
    pub peer_pubkey: String,
    #[serde(default)]
    pub capacity: i64,
    #[serde(default)]
    pub local_balance: i64,
    #[serde(default)]
    pub remote_balance: i64,
    #[serde(default)]
    pub is_active: bool,
    #[serde(default)]
    pub is_public: bool,
}

/// Open channel request.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenChannelRequest {
    pub peer_pubkey: String,
    pub capacity: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub push_amount: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub announce_channel: Option<bool>,
}

/// Close channel request.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CloseChannelRequest {
    pub channel_id: String,
    #[serde(default)]
    pub force: bool,
}

// ============================================================================
// Peer Types
// ============================================================================

/// Peer information.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Peer {
    pub pubkey: String,
    #[serde(default)]
    pub address: Option<String>,
    #[serde(default)]
    pub connected: bool,
}

/// Connect peer request.

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectPeerRequest {
    pub peer_pubkey_and_addr: String,
}

// ============================================================================
// Asset Types
// ============================================================================

/// RGB asset from node.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RgbAsset {
    pub asset_id: String,
    #[serde(default)]
    pub ticker: String,
    #[serde(default)]
    pub name: String,
    #[serde(default)]
    pub precision: u8,
    #[serde(default)]
    pub balance: RgbAssetBalance,
}

/// RGB asset balance.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct RgbAssetBalance {
    #[serde(default)]
    pub settled: i64,
    #[serde(default)]
    pub future: i64,
    #[serde(default)]
    pub spendable: i64,
}

// ============================================================================
// Invoice Types
// ============================================================================

/// Create invoice request.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateInvoiceRequest {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub amount_msat: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub expiry_secs: Option<i64>,
}

/// Invoice response.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Invoice {
    pub bolt11: String,
    pub payment_hash: String,
    #[serde(default)]
    pub amount_msat: Option<i64>,
    #[serde(default)]
    pub expires_at: i64,
}

// ============================================================================
// Payment Types
// ============================================================================

/// Keysend request.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeysendRequest {
    pub dest_pubkey: String,
    pub amount_msat: i64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub asset_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub asset_amount: Option<i64>,
}

/// Payment information.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Payment {
    pub payment_hash: String,
    #[serde(default)]
    pub status: String,
    #[serde(default)]
    pub amount_msat: i64,
    #[serde(default)]
    pub direction: String,
    #[serde(default)]
    pub created_at: i64,
}

// ============================================================================
// Bitcoin Types
// ============================================================================

/// Bitcoin address response.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AddressResponse {
    pub address: String,
}

/// BTC balance response.
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct BtcBalance {
    #[serde(default)]
    pub confirmed: i64,
    #[serde(default)]
    pub unconfirmed: i64,
    #[serde(default)]
    pub total: i64,
}

// ============================================================================
// Node API Client
// ============================================================================

/// RGB Lightning Node API client.
pub struct NodeApi {
    http: Arc<HttpClient>,
}

impl NodeApi {
    /// Create a new Node API client.
    pub fn new(http: Arc<HttpClient>) -> Self {
        Self { http }
    }

    /// Get node information.
    pub async fn get_info(&self) -> Result<RgbNodeInfo> {
        self.http.get("/nodeinfo").await
    }

    // === Channel Operations ===

    /// List all channels.
    pub async fn list_channels(&self) -> Result<Vec<Channel>> {
        #[derive(Deserialize)]
        struct Response {
            channels: Vec<Channel>,
        }
        let resp: Response = self.http.get("/listchannels").await?;
        Ok(resp.channels)
    }

    /// Open a new channel.
    pub async fn open_channel(&self, request: &OpenChannelRequest) -> Result<serde_json::Value> {
        self.http.post("/openchannel", request).await
    }

    /// Close a channel.
    pub async fn close_channel(&self, request: &CloseChannelRequest) -> Result<serde_json::Value> {
        self.http.post("/closechannel", request).await
    }

    // === Peer Operations ===

    /// List all peers.
    pub async fn list_peers(&self) -> Result<Vec<Peer>> {
        #[derive(Deserialize)]
        struct Response {
            peers: Vec<Peer>,
        }
        let resp: Response = self.http.get("/listpeers").await?;
        Ok(resp.peers)
    }

    /// Connect to a peer.
    pub async fn connect_peer(&self, request: &ConnectPeerRequest) -> Result<serde_json::Value> {
        self.http.post("/connectpeer", request).await
    }

    /// Disconnect from a peer.
    pub async fn disconnect_peer(&self, pubkey: &str) -> Result<serde_json::Value> {
        #[derive(Serialize)]
        struct Request<'a> {
            pubkey: &'a str,
        }
        self.http.post("/disconnectpeer", &Request { pubkey }).await
    }

    // === Payment Operations ===

    /// List all payments.
    pub async fn list_payments(&self) -> Result<Vec<Payment>> {
        #[derive(Deserialize)]
        struct Response {
            payments: Vec<Payment>,
        }
        let resp: Response = self.http.get("/listpayments").await?;
        Ok(resp.payments)
    }

    /// Send a keysend payment.
    pub async fn keysend(&self, request: &KeysendRequest) -> Result<Payment> {
        self.http.post("/keysend", request).await
    }

    // === Invoice Operations ===

    /// Create a Lightning invoice.
    pub async fn create_invoice(&self, request: &CreateInvoiceRequest) -> Result<Invoice> {
        self.http.post("/lninvoice", request).await
    }

    /// Decode a Lightning invoice.
    pub async fn decode_invoice(&self, invoice: &str) -> Result<serde_json::Value> {
        #[derive(Serialize)]
        struct Request<'a> {
            invoice: &'a str,
        }
        self.http
            .post("/decodelninvoice", &Request { invoice })
            .await
    }

    // === RGB Operations ===

    /// List all RGB assets.
    pub async fn list_assets(&self) -> Result<Vec<RgbAsset>> {
        #[derive(Deserialize)]
        struct Response {
            assets: Vec<RgbAsset>,
        }
        let resp: Response = self
            .http
            .post("/listassets", &serde_json::json!({}))
            .await?;
        Ok(resp.assets)
    }

    /// Get asset balance.
    pub async fn get_asset_balance(&self, asset_id: &str) -> Result<RgbAssetBalance> {
        #[derive(Serialize)]
        struct Request<'a> {
            asset_id: &'a str,
        }
        self.http.post("/assetbalance", &Request { asset_id }).await
    }

    // === On-chain Operations ===

    /// Get a new Bitcoin address.
    pub async fn get_address(&self) -> Result<AddressResponse> {
        self.http.post("/address", &serde_json::json!({})).await
    }

    /// Get BTC balance.
    pub async fn get_btc_balance(&self) -> Result<BtcBalance> {
        self.http.post("/btcbalance", &serde_json::json!({})).await
    }

    // === Swap Operations ===

    /// Whitelist a trade (taker side).
    pub async fn whitelist_trade(&self, swapstring: &str) -> Result<serde_json::Value> {
        #[derive(Serialize)]
        struct Request<'a> {
            swapstring: &'a str,
        }
        self.http.post("/taker", &Request { swapstring }).await
    }

    // === Node Management ===

    /// Initialize the node.
    pub async fn init(&self, password: &str) -> Result<serde_json::Value> {
        #[derive(Serialize)]
        struct Request<'a> {
            password: &'a str,
        }
        self.http.post("/init", &Request { password }).await
    }

    /// Unlock the node.
    pub async fn unlock(&self, password: &str) -> Result<serde_json::Value> {
        #[derive(Serialize)]
        struct Request<'a> {
            password: &'a str,
        }
        self.http.post("/unlock", &Request { password }).await
    }

    /// Lock the node.
    pub async fn lock(&self) -> Result<serde_json::Value> {
        self.http.post("/lock", &serde_json::json!({})).await
    }
}
