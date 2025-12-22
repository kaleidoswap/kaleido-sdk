//! HTTP client wrapper with retry logic and error handling.

use crate::error::{KaleidoError, Result};
use crate::retry::RetryConfig;
use reqwest::{Client, Method, RequestBuilder, Response};
use serde::{de::DeserializeOwned, Serialize};
use std::time::Duration;

/// HTTP client wrapper with built-in retry logic.
#[derive(Debug, Clone)]
pub struct HttpClient {
    client: Client,
    base_url: String,
    retry_config: RetryConfig,
}

impl HttpClient {
    /// Create a new HTTP client.
    pub fn new(
        base_url: impl Into<String>,
        timeout: Duration,
        retry_config: RetryConfig,
    ) -> Result<Self> {
        let client = Client::builder()
            .timeout(timeout)
            .build()
            .map_err(|e| KaleidoError::config(format!("Failed to create HTTP client: {}", e)))?;

        Ok(Self {
            client,
            base_url: base_url.into(),
            retry_config,
        })
    }

    /// Get the base URL.
    pub fn base_url(&self) -> &str {
        &self.base_url
    }

    /// Build a URL from the base and path.
    fn build_url(&self, path: &str) -> String {
        format!("{}{}", self.base_url.trim_end_matches('/'), path)
    }

    /// Execute a GET request.
    pub async fn get<T: DeserializeOwned>(&self, path: &str) -> Result<T> {
        self.request_with_retry(Method::GET, path, None::<&()>)
            .await
    }

    /// Execute a POST request with a JSON body.
    pub async fn post<B: Serialize, T: DeserializeOwned>(&self, path: &str, body: &B) -> Result<T> {
        self.request_with_retry(Method::POST, path, Some(body))
            .await
    }

    /// Execute a request with retry logic.
    async fn request_with_retry<B: Serialize, T: DeserializeOwned>(
        &self,
        method: Method,
        path: &str,
        body: Option<&B>,
    ) -> Result<T> {
        let url = self.build_url(path);
        let mut last_error: Option<KaleidoError> = None;
        let mut attempt = 0;

        while attempt <= self.retry_config.max_retries {
            if attempt > 0 {
                let delay = self.retry_config.delay_for_attempt(attempt);
                log::debug!(
                    "Retry attempt {} after {}ms for {} {}",
                    attempt,
                    delay.as_millis(),
                    method,
                    url
                );
                tokio::time::sleep(delay).await;
            }

            let mut request = self.client.request(method.clone(), &url);

            if let Some(b) = body {
                request = request.json(b);
            }

            match self.execute_request(request).await {
                Ok(response) => return self.parse_response(response).await,
                Err(e) => {
                    if e.is_retryable() && attempt < self.retry_config.max_retries {
                        log::warn!(
                            "Request failed (attempt {}), will retry: {}",
                            attempt + 1,
                            e
                        );
                        last_error = Some(e);
                        attempt += 1;
                    } else {
                        return Err(e);
                    }
                }
            }
        }

        Err(last_error.unwrap_or_else(|| KaleidoError::network("Max retries exceeded")))
    }

    /// Execute a single request without retry.
    async fn execute_request(&self, request: RequestBuilder) -> Result<Response> {
        let response = request.send().await?;

        let status = response.status();
        if status.is_success() {
            Ok(response)
        } else {
            let status_code = status.as_u16();
            let error_text = response.text().await.unwrap_or_default();
            Err(KaleidoError::api_with_details(
                status_code,
                status.canonical_reason().unwrap_or("Unknown error"),
                error_text,
            ))
        }
    }

    /// Parse a response as JSON.
    async fn parse_response<T: DeserializeOwned>(&self, response: Response) -> Result<T> {
        let bytes = response.bytes().await?;
        serde_json::from_slice(&bytes).map_err(|e| {
            log::error!("Failed to parse response: {}", e);
            log::debug!("Response body: {:?}", String::from_utf8_lossy(&bytes));
            KaleidoError::JsonError(e)
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_url() {
        let client = HttpClient::new(
            "https://api.example.com/",
            Duration::from_secs(30),
            RetryConfig::default(),
        )
        .unwrap();

        assert_eq!(
            client.build_url("/api/v1/assets"),
            "https://api.example.com/api/v1/assets"
        );
    }

    #[test]
    fn test_build_url_without_trailing_slash() {
        let client = HttpClient::new(
            "https://api.example.com",
            Duration::from_secs(30),
            RetryConfig::default(),
        )
        .unwrap();

        assert_eq!(
            client.build_url("/api/v1/assets"),
            "https://api.example.com/api/v1/assets"
        );
    }
}
