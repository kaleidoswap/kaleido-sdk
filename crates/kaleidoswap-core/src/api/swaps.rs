//! Swap API operations (atomic swaps).

use crate::error::Result;
use crate::http::HttpClient;
use crate::models::rgb_node::TakerRequest;
use crate::models::{
    ConfirmSwapRequest, ConfirmSwapResponse, SwapNodeInfoResponse, SwapRequest, SwapResponse,
    SwapStatusResponse,
};
use std::sync::Arc;

/// Swaps API client.
pub struct SwapsApi {
    http: Arc<HttpClient>,
}

impl SwapsApi {
    /// Create a new Swaps API client.
    pub fn new(http: Arc<HttpClient>) -> Self {
        Self { http }
    }

    /// Get node information from the swap service.
    pub async fn get_node_info(&self) -> Result<SwapNodeInfoResponse> {
        self.http.get("/api/v1/swaps/nodeinfo").await
    }

    /// Initialize a swap.
    pub async fn init_swap(&self, request: &SwapRequest) -> Result<SwapResponse> {
        self.http.post("/api/v1/swaps/init", request).await
    }

    /// Execute/confirm a swap.
    pub async fn execute_swap(&self, request: &ConfirmSwapRequest) -> Result<ConfirmSwapResponse> {
        self.http.post("/api/v1/swaps/execute", request).await
    }

    /// Get swap status by payment hash.
    pub async fn get_swap_status(&self, payment_hash: &str) -> Result<SwapStatusResponse> {
        #[derive(serde::Serialize)]
        struct StatusRequest<'a> {
            payment_hash: &'a str,
        }

        let request = StatusRequest { payment_hash };
        self.http
            .post("/api/v1/swaps/atomic/status", &request)
            .await
    }

    /// Whitelist a trade on the taker side.
    pub async fn whitelist_trade(&self, swapstring: &str) -> Result<()> {
        let request = TakerRequest {
            swapstring: Some(swapstring.to_string()),
        };
        let _: serde_json::Value = self.http.post("/api/v1/swaps/taker", &request).await?;
        Ok(())
    }
}
