//! Error types for WASM bindings.
//!
//! Provides structured error information that can be properly mapped
//! to TypeScript exception classes on the JavaScript side.

use kaleidoswap_core::error::KaleidoError as CoreError;
use serde::Serialize;
use wasm_bindgen::prelude::*;

/// Structured error for WASM bindings.
///
/// This struct is serialized to JavaScript and can be caught and mapped
/// to typed TypeScript exceptions.
#[derive(Debug, Clone, Serialize)]
pub struct WasmError {
    /// Error code for programmatic handling (e.g., "API_ERROR", "NETWORK_ERROR")
    pub code: String,
    /// Human-readable error message
    pub message: String,
    /// HTTP status code (for API errors)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status_code: Option<u16>,
    /// Additional error details
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<String>,
}

impl WasmError {
    /// Convert to JsValue for throwing as an exception
    pub fn into_js_value(self) -> JsValue {
        serde_wasm_bindgen::to_value(&self)
            .unwrap_or_else(|_| JsValue::from_str(&format!("{}: {}", self.code, self.message)))
    }
}

impl From<CoreError> for WasmError {
    fn from(e: CoreError) -> Self {
        match e {
            CoreError::ApiError { status, message, details } => WasmError {
                code: "API_ERROR".into(),
                message,
                status_code: Some(status),
                details,
            },
            CoreError::NetworkError { message, .. } => WasmError {
                code: "NETWORK_ERROR".into(),
                message,
                status_code: None,
                details: None,
            },
            CoreError::ValidationError { message } => WasmError {
                code: "VALIDATION_ERROR".into(),
                message,
                status_code: None,
                details: None,
            },
            CoreError::TimeoutError { timeout_secs } => WasmError {
                code: "TIMEOUT_ERROR".into(),
                message: format!("Request timed out after {}s", timeout_secs),
                status_code: None,
                details: None,
            },
            CoreError::WebSocketError { message, .. } => WasmError {
                code: "WEBSOCKET_ERROR".into(),
                message,
                status_code: None,
                details: None,
            },
            CoreError::NotFoundError { resource_type, identifier } => WasmError {
                code: "NOT_FOUND".into(),
                message: format!("{} not found: {}", resource_type, identifier),
                status_code: Some(404),
                details: None,
            },
            CoreError::ConfigError { message } => WasmError {
                code: "CONFIG_ERROR".into(),
                message,
                status_code: None,
                details: None,
            },
            CoreError::SwapError { message, swap_id } => WasmError {
                code: "SWAP_ERROR".into(),
                message,
                status_code: None,
                details: swap_id,
            },
            CoreError::NodeNotConfigured => WasmError {
                code: "NODE_NOT_CONFIGURED".into(),
                message: "RGB Node not configured. This operation requires a connected RGB Lightning Node.".into(),
                status_code: None,
                details: None,
            },
            CoreError::JsonError(e) => WasmError {
                code: "JSON_ERROR".into(),
                message: e.to_string(),
                status_code: None,
                details: None,
            },
            CoreError::UrlError(e) => WasmError {
                code: "URL_ERROR".into(),
                message: e.to_string(),
                status_code: None,
                details: None,
            },
            CoreError::NotImplemented => WasmError {
                code: "NOT_IMPLEMENTED".into(),
                message: "This feature is not implemented".into(),
                status_code: None,
                details: None,
            },
            CoreError::InternalError(msg) => WasmError {
                code: "INTERNAL_ERROR".into(),
                message: msg,
                status_code: None,
                details: None,
            },
        }
    }
}

/// Helper to convert CoreError to JsValue for Promise rejection
pub fn to_js_error(e: CoreError) -> JsValue {
    WasmError::from(e).into_js_value()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_api_error_conversion() {
        let core_error = CoreError::api(404, "Not found");
        let wasm_error = WasmError::from(core_error);

        assert_eq!(wasm_error.code, "API_ERROR");
        assert_eq!(wasm_error.status_code, Some(404));
    }

    #[test]
    fn test_network_error_conversion() {
        let core_error = CoreError::network("Connection refused");
        let wasm_error = WasmError::from(core_error);

        assert_eq!(wasm_error.code, "NETWORK_ERROR");
        assert_eq!(wasm_error.message, "Connection refused");
    }
}
