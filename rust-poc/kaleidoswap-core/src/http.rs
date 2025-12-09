use reqwest::Client;
use serde::de::DeserializeOwned;
use std::time::Duration;

use crate::error::Result;

/// HTTP client wrapper for making API requests
pub struct HttpClient {
    client: Client,
    base_url: String,
}

impl HttpClient {
    /// Create a new HTTP client
    pub fn new(base_url: String, timeout_secs: Option<u64>) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(timeout_secs.unwrap_or(30)))
            .build()
            .expect("Failed to create HTTP client");

        Self { client, base_url }
    }

    /// Perform a GET request
    pub async fn get<T: DeserializeOwned>(&self, path: &str) -> Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let response = self.client.get(&url).send().await?;
        
        // Check for HTTP errors
        let status = response.status();
        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(crate::error::KaleidoError::ApiError(format!(
                "HTTP {}: {}",
                status, error_text
            )));
        }

        let data = response.json::<T>().await?;
        Ok(data)
    }

    /// Perform a POST request
    pub async fn post<T: DeserializeOwned, B: serde::Serialize>(
        &self,
        path: &str,
        body: &B,
    ) -> Result<T> {
        let url = format!("{}{}", self.base_url, path);
        let response = self.client.post(&url).json(body).send().await?;
        
        // Check for HTTP errors
        let status = response.status();
        if !status.is_success() {
            let error_text = response.text().await.unwrap_or_default();
            return Err(crate::error::KaleidoError::ApiError(format!(
                "HTTP {}: {}",
                status, error_text
            )));
        }

        let data = response.json::<T>().await?;
        Ok(data)
    }
}
