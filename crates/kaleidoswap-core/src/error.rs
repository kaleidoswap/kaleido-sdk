//! Error types for the Kaleidoswap SDK.

use thiserror::Error;

/// Result type alias using KaleidoError.
pub type Result<T> = std::result::Result<T, KaleidoError>;

/// Errors that can occur when using the Kaleidoswap SDK.
#[derive(Error, Debug)]
pub enum KaleidoError {
    /// Network-related errors (connection failed, DNS resolution, etc.)
    #[error("Network error: {message}")]
    NetworkError {
        message: String,
        #[source]
        source: Option<Box<dyn std::error::Error + Send + Sync>>,
    },

    /// API returned an error response
    #[error("API error ({status}): {message}")]
    ApiError {
        status: u16,
        message: String,
        details: Option<String>,
    },

    /// Request or response validation failed
    #[error("Validation error: {message}")]
    ValidationError { message: String },

    /// Request timed out
    #[error("Request timed out after {timeout_secs}s")]
    TimeoutError { timeout_secs: f64 },

    /// WebSocket connection or communication error
    #[error("WebSocket error: {message}")]
    WebSocketError {
        message: String,
        #[source]
        source: Option<Box<dyn std::error::Error + Send + Sync>>,
    },

    /// Not implemented error
    #[error("Not implemented")]
    NotImplemented,

    /// JSON serialization/deserialization error
    #[error("JSON error: {0}")]
    JsonError(#[from] serde_json::Error),

    /// URL parsing error
    #[error("Invalid URL: {0}")]
    UrlError(#[from] url::ParseError),

    /// Configuration error
    #[error("Configuration error: {message}")]
    ConfigError { message: String },

    /// Resource not found
    #[error("{resource_type} not found: {identifier}")]
    NotFoundError {
        resource_type: String,
        identifier: String,
    },

    /// Swap-related errors
    #[error("Swap error: {message}")]
    SwapError {
        message: String,
        swap_id: Option<String>,
    },

    /// Node operation requires node_url but it's not configured
    #[error("Node URL not configured. This operation requires a connected RGB Lightning Node.")]
    NodeNotConfigured,

    /// Generic internal error
    #[error("Internal error: {0}")]
    InternalError(String),
}

impl KaleidoError {
    /// Create a network error with a message.
    pub fn network(message: impl Into<String>) -> Self {
        Self::NetworkError {
            message: message.into(),
            source: None,
        }
    }

    /// Create a network error with a source.
    pub fn network_with_source(
        message: impl Into<String>,
        source: impl std::error::Error + Send + Sync + 'static,
    ) -> Self {
        Self::NetworkError {
            message: message.into(),
            source: Some(Box::new(source)),
        }
    }

    /// Create an API error.
    pub fn api(status: u16, message: impl Into<String>) -> Self {
        Self::ApiError {
            status,
            message: message.into(),
            details: None,
        }
    }

    /// Create an API error with details.
    pub fn api_with_details(
        status: u16,
        message: impl Into<String>,
        details: impl Into<String>,
    ) -> Self {
        Self::ApiError {
            status,
            message: message.into(),
            details: Some(details.into()),
        }
    }

    /// Create a validation error.
    pub fn validation(message: impl Into<String>) -> Self {
        Self::ValidationError {
            message: message.into(),
        }
    }

    /// Create a timeout error.
    pub fn timeout(timeout_secs: f64) -> Self {
        Self::TimeoutError { timeout_secs }
    }

    /// Create a WebSocket error.
    pub fn websocket(message: impl Into<String>) -> Self {
        Self::WebSocketError {
            message: message.into(),
            source: None,
        }
    }

    /// Create a not found error.
    pub fn not_found(resource_type: impl Into<String>, identifier: impl Into<String>) -> Self {
        Self::NotFoundError {
            resource_type: resource_type.into(),
            identifier: identifier.into(),
        }
    }

    /// Create a swap error.
    pub fn swap(message: impl Into<String>) -> Self {
        Self::SwapError {
            message: message.into(),
            swap_id: None,
        }
    }

    /// Create a swap error with swap ID.
    pub fn swap_with_id(message: impl Into<String>, swap_id: impl Into<String>) -> Self {
        Self::SwapError {
            message: message.into(),
            swap_id: Some(swap_id.into()),
        }
    }

    /// Create a configuration error.
    pub fn config(message: impl Into<String>) -> Self {
        Self::ConfigError {
            message: message.into(),
        }
    }

    /// Check if this error is retryable.
    pub fn is_retryable(&self) -> bool {
        match self {
            Self::NetworkError { .. } => true,
            Self::TimeoutError { .. } => true,
            Self::ApiError { status, .. } => {
                // Retry on 5xx errors and 429 (rate limit)
                *status >= 500 || *status == 429
            }
            Self::WebSocketError { .. } => true,
            _ => false,
        }
    }
}

impl From<reqwest::Error> for KaleidoError {
    fn from(err: reqwest::Error) -> Self {
        if err.is_timeout() {
            Self::TimeoutError { timeout_secs: 30.0 }
        } else if err.is_connect() {
            Self::network_with_source("Connection failed", err)
        } else if err.is_status() {
            let status = err.status().map(|s| s.as_u16()).unwrap_or(0);
            Self::api(status, err.to_string())
        } else {
            Self::network_with_source("HTTP request failed", err)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_error_display() {
        let err = KaleidoError::api(404, "Not found");
        assert_eq!(err.to_string(), "API error (404): Not found");
    }

    #[test]
    fn test_is_retryable() {
        assert!(KaleidoError::network("test").is_retryable());
        assert!(KaleidoError::timeout(30.0).is_retryable());
        assert!(KaleidoError::api(500, "Server error").is_retryable());
        assert!(KaleidoError::api(429, "Rate limited").is_retryable());
        assert!(!KaleidoError::api(400, "Bad request").is_retryable());
        assert!(!KaleidoError::validation("Invalid").is_retryable());
    }
}
