//! Typed async client over the maker `/v2` REST surface.
//!
//! Transport only — no protocol logic. The `swap` state machines call
//! these, interleaving the client-side `verify`/`sign`/`spend` steps.

use serde::de::DeserializeOwned;
use serde_json::Value;

use crate::config::Config;
use crate::error::{Error, Result};
use crate::types::{NodeInfo, Quote, QuoteRequest, SwapStatus, SwapType};

/// Async client bound to one maker. Cheap to clone (wraps a pooled
/// `reqwest::Client`).
#[derive(Debug, Clone)]
pub struct MakerClient {
    http: reqwest::Client,
    base: String,
}

impl MakerClient {
    /// Build a client from [`Config`]. Errors only on a TLS/resolver
    /// misconfiguration in the HTTP stack.
    pub fn new(config: &Config) -> Result<Self> {
        let http = reqwest::Client::builder()
            .user_agent(concat!("kaleido-sdk/", env!("CARGO_PKG_VERSION")))
            .build()
            .map_err(|e| Error::Transport(e.to_string()))?;
        Ok(Self {
            http,
            base: config.maker_url.trim_end_matches('/').to_owned(),
        })
    }

    // ── reads ──────────────────────────────────────────────────────────────

    /// `GET /v2/health` → true iff the maker answers `2xx`.
    pub async fn health(&self) -> Result<bool> {
        let r = self
            .http
            .get(format!("{}/v2/health", self.base))
            .send()
            .await
            .map_err(|e| Error::Transport(e.to_string()))?;
        Ok(r.status().is_success())
    }

    /// `GET /v2/info` — maker node identity.
    pub async fn info(&self) -> Result<NodeInfo> {
        self.get("/v2/info").await
    }

    /// `GET /v2/swap/{type}/pairs` — rate cards for one swap type.
    pub async fn pairs(&self, swap_type: SwapType) -> Result<Value> {
        let t = match swap_type {
            SwapType::Submarine => "submarine",
            SwapType::Reverse => "reverse",
            SwapType::Chain => "chain",
        };
        self.get(&format!("/v2/swap/{t}/pairs")).await
    }

    /// `POST /v2/quote` — price a swap for a specific amount.
    pub async fn quote(&self, req: &QuoteRequest) -> Result<Quote> {
        self.post("/v2/quote", req).await
    }

    /// `GET /v2/swap/{id}` — current status + event log.
    pub async fn swap_status(&self, id: &str) -> Result<SwapStatus> {
        self.get(&format!("/v2/swap/{id}")).await
    }

    // ── creates (rich responses kept as Value until the swap state
    //    machines type them) ───────────────────────────────────────────────

    /// `POST /v2/swap/submarine`.
    pub async fn create_submarine(&self, body: &Value) -> Result<Value> {
        self.post("/v2/swap/submarine", body).await
    }

    /// `POST /v2/swap/reverse`.
    pub async fn create_reverse(&self, body: &Value) -> Result<Value> {
        self.post("/v2/swap/reverse", body).await
    }

    /// `POST /v2/swap/chain`.
    pub async fn create_chain(&self, body: &Value) -> Result<Value> {
        self.post("/v2/swap/chain", body).await
    }

    // ── cooperative endpoints (taker side of the MuSig2 dance) ──────────────

    /// `POST /v2/swap/reverse/{id}/claim` — submit the taker's partial sig.
    pub async fn cooperative_claim_reverse(&self, id: &str, body: &Value) -> Result<Value> {
        self.post(&format!("/v2/swap/reverse/{id}/claim"), body)
            .await
    }

    /// `POST /v2/swap/submarine/{id}/refund` — cooperative refund partial sig.
    pub async fn cooperative_refund_submarine(&self, id: &str, body: &Value) -> Result<Value> {
        self.post(&format!("/v2/swap/submarine/{id}/refund"), body)
            .await
    }

    // ── plumbing ───────────────────────────────────────────────────────────

    async fn get<T: DeserializeOwned>(&self, path: &str) -> Result<T> {
        let r = self
            .http
            .get(format!("{}{path}", self.base))
            .send()
            .await
            .map_err(|e| Error::Transport(e.to_string()))?;
        Self::parse(r).await
    }

    async fn post<B: serde::Serialize, T: DeserializeOwned>(
        &self,
        path: &str,
        body: &B,
    ) -> Result<T> {
        let r = self
            .http
            .post(format!("{}{path}", self.base))
            .json(body)
            .send()
            .await
            .map_err(|e| Error::Transport(e.to_string()))?;
        Self::parse(r).await
    }

    /// Map a response into `T`, or the maker's `{error, details}` envelope
    /// into [`Error::Maker`].
    async fn parse<T: DeserializeOwned>(r: reqwest::Response) -> Result<T> {
        let status = r.status();
        let bytes = r
            .bytes()
            .await
            .map_err(|e| Error::Transport(e.to_string()))?;
        if !status.is_success() {
            let env: Option<Value> = serde_json::from_slice(&bytes).ok();
            let code = env
                .as_ref()
                .and_then(|v| v.get("error"))
                .and_then(|v| v.as_str())
                .unwrap_or("http_error")
                .to_owned();
            let details = env
                .as_ref()
                .and_then(|v| v.get("details"))
                .and_then(|v| v.as_str())
                .map(|s| s.to_owned());
            return Err(Error::Maker {
                status: status.as_u16(),
                code,
                details,
            });
        }
        serde_json::from_slice(&bytes).map_err(|e| Error::Decode(e.to_string()))
    }
}
