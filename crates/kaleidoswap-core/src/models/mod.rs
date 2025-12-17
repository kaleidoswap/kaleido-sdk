//! Data models for the Kaleidoswap SDK.
//!
//! Models are auto-generated from OpenAPI specifications.
//! To regenerate: python scripts/generate_models.py

// Auto-generated Kaleidoswap Maker API models
pub mod kaleidoswap;

// Auto-generated RGB Lightning Node models
pub mod rgb_node;

// ============================================================================
// Kaleidoswap API type aliases (preferred SDK interface)
// ============================================================================

// Market types
pub type Asset = kaleidoswap::Asset;
pub type AssetsResponse = kaleidoswap::Assetsresponse;
pub type TradingPair = kaleidoswap::Tradingpair;
pub type PairsResponse = kaleidoswap::Tradingpairsresponse;
pub type QuoteRequest = kaleidoswap::Pairquoterequest;
pub type Quote = kaleidoswap::Pairquoteresponse;
pub type Fee = kaleidoswap::Fee;

// Swap types
pub type SwapRequest = kaleidoswap::Swaprequest;
pub type SwapInitResponse = kaleidoswap::Swapresponse;
pub type SwapConfirmRequest = kaleidoswap::Confirmswaprequest;
pub type SwapConfirmResponse = kaleidoswap::Confirmswapresponse;
pub type SwapStatusRequest = kaleidoswap::Swapstatusrequest;
pub type SwapStatusResponse = kaleidoswap::Swapstatusresponse;
pub type Swap = kaleidoswap::Swap;
pub type SwapStatus = kaleidoswap::Swapstatus;
pub type SwapLeg = kaleidoswap::Swapleg;
pub type SwapLegInput = kaleidoswap::Swapleginput;
pub type SettlementLayer = kaleidoswap::Settlementlayer;
pub type NetworkLayer = kaleidoswap::Networklayer;
pub type AssetProtocol = kaleidoswap::Assetprotocol;

// Swap order types
pub type SwapOrder = kaleidoswap::Swaporder;
pub type SwapOrderStatus = kaleidoswap::Swaporderstatus;
pub type CreateSwapOrderRequest = kaleidoswap::Createswaporderrequest;
pub type CreateSwapOrderResponse = kaleidoswap::Createswaporderresponse;
pub type SwapOrderStatusResponse = kaleidoswap::Swaporderstatusresponse;
pub type SwapOrderRateDecisionRequest = kaleidoswap::Swaporderratedecisionrequest;
pub type SwapOrderRateDecisionResponse = kaleidoswap::Swaporderratedecisionresponse;
pub type OrderHistoryResponse = kaleidoswap::Orderhistoryresponse;
pub type OrderStats = kaleidoswap::Orderstatsresponse;

// Node and LSP types
pub type NodeInfo = kaleidoswap::Nodeinforesponse;
pub type LspInfo = kaleidoswap::Getinforesponsemodel;
pub type LspNetworkInfo = kaleidoswap::Networkinforesponse;
pub type Lsps1OrderRequest = kaleidoswap::Createorderrequest;
pub type Lsps1OrderResponse = kaleidoswap::Orderresponse;
pub type FeeEstimateResponse = kaleidoswap::Channelfees;

// ============================================================================
// RGB Lightning Node type aliases
// ============================================================================

pub type RgbNodeInfo = rgb_node::Nodeinforesponse;
pub type Channel = rgb_node::Channel;
pub type Peer = rgb_node::Peer;
pub type Payment = rgb_node::Payment;
pub type RgbAsset = rgb_node::Assetnia;
pub type RgbAssetBalance = rgb_node::Assetbalanceresponse;
pub type AddressResponse = rgb_node::Addressresponse;
pub type BtcBalance = rgb_node::Btcbalanceresponse;
pub type CloseChannelRequest = rgb_node::Closechannelrequest;
pub type ConnectPeerRequest = rgb_node::Connectpeerrequest;
pub type CreateInvoiceRequest = rgb_node::Lninvoicerequest;
pub type Invoice = rgb_node::Lninvoiceresponse;
pub type KeysendRequest = rgb_node::Keysendrequest;
pub type KeysendResponse = rgb_node::Keysendresponse;
pub type TakerRequest = rgb_node::Takerrequest;
pub type OpenChannelRequest = rgb_node::Openchannelrequest;

// ============================================================================
// Utility types (not from OpenAPI)
// ============================================================================

/// Validation result for amount validation.
#[derive(Debug, Clone)]
pub struct ValidationResult {
    /// Whether the amount is valid
    pub is_valid: bool,
    /// Error message if invalid
    pub error: Option<String>,
    /// Adjusted amount if applicable
    pub adjusted_amount: Option<i64>,
}

impl ValidationResult {
    /// Create a valid result.
    pub fn valid() -> Self {
        Self {
            is_valid: true,
            error: None,
            adjusted_amount: None,
        }
    }

    /// Create an invalid result with an error message.
    pub fn invalid(error: impl Into<String>) -> Self {
        Self {
            is_valid: false,
            error: Some(error.into()),
            adjusted_amount: None,
        }
    }
}

/// Amount conversion utilities.
pub struct AmountConverter;

impl AmountConverter {
    /// Convert amount from display units to smallest units.
    pub fn to_smallest_units(amount: f64, precision: u8) -> i64 {
        let multiplier = 10_i64.pow(precision as u32);
        (amount * multiplier as f64).round() as i64
    }

    /// Convert amount from smallest units to display units.
    pub fn to_display_units(amount: i64, precision: u8) -> f64 {
        let divisor = 10_i64.pow(precision as u32);
        amount as f64 / divisor as f64
    }
}
