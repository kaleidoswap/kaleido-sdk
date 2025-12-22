//! LSP (Lightning Service Provider) API operations.

use crate::error::Result;
use crate::http::HttpClient;
use crate::models::{
    ChannelFees, ChannelOrderResponse, CreateOrderRequest, GetInfoResponseModel,
    NetworkInfoResponse,
};
use serde::Serialize;
use std::sync::Arc;

/// LSP API client.
pub struct LspApi {
    http: Arc<HttpClient>,
}

impl LspApi {
    /// Create a new LSP API client.
    pub fn new(http: Arc<HttpClient>) -> Self {
        Self { http }
    }

    /// Get LSP information.
    pub async fn get_info(&self) -> Result<GetInfoResponseModel> {
        self.http.get("/api/v1/lsps1/get_info").await
    }

    /// Get network information.
    pub async fn get_network_info(&self) -> Result<NetworkInfoResponse> {
        self.http.get("/api/v1/lsps1/network_info").await
    }

    /// Create an LSPS1 order.
    pub async fn create_order(&self, request: &CreateOrderRequest) -> Result<ChannelOrderResponse> {
        self.http.post("/api/v1/lsps1/create_order", request).await
    }

    /// Get an LSPS1 order.
    pub async fn get_order(&self, order_id: &str) -> Result<ChannelOrderResponse> {
        #[derive(Serialize)]
        struct Request<'a> {
            order_id: &'a str,
        }
        let request = Request { order_id };
        self.http.post("/api/v1/lsps1/get_order", &request).await
    }

    /// Estimate fees for an order.
    pub async fn estimate_fees(&self, channel_size: i64) -> Result<ChannelFees> {
        #[derive(Serialize)]
        struct Request {
            channel_size: i64,
        }
        let request = Request { channel_size };
        self.http
            .post("/api/v1/lsps1/estimate_fees", &request)
            .await
    }

    /// Submit rate decision.
    pub async fn rate_decision(&self, order_id: &str, accept: bool) -> Result<serde_json::Value> {
        #[derive(Serialize)]
        struct Request<'a> {
            order_id: &'a str,
            accept_new_rate: bool,
        }
        let request = Request {
            order_id,
            accept_new_rate: accept,
        };
        self.http
            .post("/api/v1/lsps1/rate_decision", &request)
            .await
    }

    /// Retry asset delivery for an order.
    pub async fn retry_delivery(&self, order_id: &str) -> Result<serde_json::Value> {
        #[derive(Serialize)]
        struct Request<'a> {
            order_id: &'a str,
        }
        let request = Request { order_id };
        self.http
            .post("/api/v1/lsps1/retry_delivery", &request)
            .await
    }
}
