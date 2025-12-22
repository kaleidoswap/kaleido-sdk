//! Swap Orders API operations.

use crate::error::Result;
use crate::http::HttpClient;
use crate::models::{
    CreateSwapOrderRequest, CreateSwapOrderResponse, OrderHistoryResponse, OrderStatsResponse,
    SwapOrderRateDecisionRequest, SwapOrderRateDecisionResponse, SwapOrderStatusResponse,
};
use std::sync::Arc;

/// Swap Orders API client.
pub struct OrdersApi {
    http: Arc<HttpClient>,
}

impl OrdersApi {
    /// Create a new Orders API client.
    pub fn new(http: Arc<HttpClient>) -> Self {
        Self { http }
    }

    /// Create a new swap order.
    pub async fn create_order(
        &self,
        request: &CreateSwapOrderRequest,
    ) -> Result<CreateSwapOrderResponse> {
        self.http.post("/api/v1/swaps/orders", request).await
    }

    /// Get swap order status.
    pub async fn get_order_status(&self, order_id: &str) -> Result<SwapOrderStatusResponse> {
        #[derive(serde::Serialize)]
        struct StatusRequest<'a> {
            order_id: &'a str,
        }

        let request = StatusRequest { order_id };
        self.http
            .post("/api/v1/swaps/orders/status", &request)
            .await
    }

    /// Get order history.
    pub async fn get_order_history(
        &self,
        status: Option<&str>,
        limit: i32,
        skip: i32,
    ) -> Result<OrderHistoryResponse> {
        let mut url = format!("/api/v1/swaps/orders/history?limit={}&skip={}", limit, skip);
        if let Some(s) = status {
            url.push_str(&format!("&status={}", s));
        }
        self.http.get(&url).await
    }

    /// Get order analytics.
    pub async fn get_order_analytics(&self) -> Result<OrderStatsResponse> {
        self.http.get("/api/v1/swaps/orders/analytics").await
    }

    /// Submit rate decision for an order.
    pub async fn rate_decision(
        &self,
        order_id: &str,
        accept: bool,
    ) -> Result<SwapOrderRateDecisionResponse> {
        let request = SwapOrderRateDecisionRequest {
            order_id: order_id.to_string(),
            accept_new_rate: accept,
        };
        self.http
            .post("/api/v1/swaps/orders/rate_decision", &request)
            .await
    }
}
