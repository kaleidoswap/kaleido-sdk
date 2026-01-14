use crate::error::{KaleidoError, Result};
use crate::generated::rln::Client as GeneratedRlnClient;
use crate::generated::rln::Error as RlnError;
use crate::models;

// Error mapping helper
fn map_rln_error<E>(e: RlnError<E>) -> KaleidoError
where
    E: std::fmt::Debug,
{
    let s = format!("{:?}", e);
    if s.contains("status: 404") {
        return KaleidoError::not_found("Resource", "not found in RGB Node");
    }
    KaleidoError::InternalError(format!("RGB Node Error: {}", s))
}

pub struct NodeClient {
    client: GeneratedRlnClient,
}

impl NodeClient {
    pub fn new(url: &str) -> Self {
        Self {
            client: GeneratedRlnClient::new(url),
        }
    }

    /// Get RGB node information.
    pub async fn get_rgb_node_info(&self) -> Result<serde_json::Value> {
        let response = self.client.get_nodeinfo().await.map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// List channels on the RGB node.
    pub async fn list_channels(&self) -> Result<serde_json::Value> {
        let response = self
            .client
            .get_listchannels()
            .await
            .map_err(map_rln_error)?;
        let inner = response.into_inner();
        Ok(serde_json::to_value(inner.channels)?)
    }

    /// Open a channel on the RGB node.
    pub async fn open_channel(
        &self,
        request: &models::rln::OpenChannelRequest,
    ) -> Result<serde_json::Value> {
        let response = self
            .client
            .post_openchannel(request)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Close a channel on the RGB node.
    pub async fn close_channel(
        &self,
        request: &models::rln::CloseChannelRequest,
    ) -> Result<serde_json::Value> {
        let response = self
            .client
            .post_closechannel(request)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// List peers on the RGB node.
    pub async fn list_peers(&self) -> Result<serde_json::Value> {
        let response = self.client.get_listpeers().await.map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner().peers)?)
    }

    /// Connect to a peer on the RGB node.
    pub async fn connect_peer(
        &self,
        request: &models::rln::ConnectPeerRequest,
    ) -> Result<serde_json::Value> {
        let response = self
            .client
            .post_connectpeer(request)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// List RGB assets on the node.
    pub async fn list_node_assets(&self) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::ListAssetsRequest {
            filter_asset_schemas: vec![],
        };
        let response = self
            .client
            .post_listassets(&req)
            .await
            .map_err(map_rln_error)?;

        let inner = response.into_inner();
        let mut all_assets = Vec::new();

        for a in inner.nia {
            all_assets.push(serde_json::to_value(a)?);
        }
        for a in inner.uda {
            all_assets.push(serde_json::to_value(a)?);
        }
        for a in inner.cfa {
            all_assets.push(serde_json::to_value(a)?);
        }
        Ok(serde_json::Value::Array(all_assets))
    }

    /// Get asset balance from the node.
    pub async fn get_asset_balance(&self, asset_id: &str) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::AssetBalanceRequest {
            asset_id: Some(asset_id.to_string()),
        };
        let response = self
            .client
            .post_assetbalance(&req)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Get a Bitcoin address from the node.
    pub async fn get_onchain_address(&self) -> Result<serde_json::Value> {
        let response = self.client.post_address().await.map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Get BTC balance from the node.
    pub async fn get_btc_balance(&self) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::BtcBalanceRequest { skip_sync: None };
        let response = self
            .client
            .post_btcbalance(&req)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Whitelist a trade on the node (taker side).
    pub async fn whitelist_trade(&self, swapstring: &str) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::TakerRequest {
            swapstring: Some(swapstring.to_string()),
        };
        let response = self.client.post_taker(&req).await.map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Create a Lightning invoice on the node.
    pub async fn create_ln_invoice(
        &self,
        amt_msat: Option<i64>,
        expiry_sec: Option<i64>,
        asset_amount: Option<i64>,
        asset_id: Option<String>,
    ) -> Result<serde_json::Value> {
        let rln_request = models::rln::LnInvoiceRequest {
            amt_msat,
            expiry_sec,
            asset_amount,
            asset_id,
        };
        let response = self
            .client
            .post_lninvoice(&rln_request)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Decode a Lightning invoice.
    pub async fn decode_ln_invoice(&self, invoice: &str) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::DecodeLnInvoiceRequest {
            invoice: Some(invoice.to_string()),
        };
        let response = self
            .client
            .post_decodelninvoice(&req)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Send a keysend payment.
    pub async fn keysend(
        &self,
        request: &models::rln::KeysendRequest,
    ) -> Result<serde_json::Value> {
        let response = self
            .client
            .post_keysend(request)
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// List payments on the node.
    pub async fn list_payments(&self) -> Result<serde_json::Value> {
        let response = self
            .client
            .get_listpayments()
            .await
            .map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner().payments)?)
    }

    /// Initialize the node.
    pub async fn init_wallet(&self, password: &str) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::InitRequest {
            password: Some(password.to_string()),
        };
        let response = self.client.post_init(&req).await.map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Unlock the node.
    pub async fn unlock_wallet(&self, password: &str) -> Result<serde_json::Value> {
        let req = crate::generated::rln::types::UnlockRequest {
            password: Some(password.to_string()),
            announce_addresses: vec![],
            announce_alias: None,
            bitcoind_rpc_host: None,
            bitcoind_rpc_password: None,
            bitcoind_rpc_port: None,
            bitcoind_rpc_username: None,
            indexer_url: None,
            proxy_endpoint: None,
        };
        let response = self.client.post_unlock(&req).await.map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }

    /// Lock the node.
    pub async fn lock_wallet(&self) -> Result<serde_json::Value> {
        let response = self.client.post_lock().await.map_err(map_rln_error)?;
        Ok(serde_json::to_value(response.into_inner())?)
    }
}
