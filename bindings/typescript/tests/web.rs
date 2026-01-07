//! Test suite for the Web WASM bindings
//!
//! These tests run in a headless browser using wasm-pack test.
//!
//! Run with:
//!   wasm-pack test --headless --chrome
//!   wasm-pack test --headless --firefox

use kaleidoswap_sdk::{get_sdk_name, get_version, KaleidoClient, KaleidoConfig};
use wasm_bindgen_test::*;

wasm_bindgen_test_configure!(run_in_browser);

#[wasm_bindgen_test]
fn test_version() {
    let version = get_version();
    assert!(!version.is_empty());
    assert!(version.starts_with("0."));
}

#[wasm_bindgen_test]
fn test_sdk_name() {
    let name = get_sdk_name();
    assert_eq!(name, "kaleidoswap-sdk");
}

#[wasm_bindgen_test]
fn test_config_creation() {
    let config = KaleidoConfig::with_defaults("https://api.test.com".to_string());
    assert_eq!(config.get_base_url(), "https://api.test.com");
}

#[wasm_bindgen_test]
fn test_config_with_custom_params() {
    let config = KaleidoConfig::new(
        "https://api.test.com".to_string(),
        Some("http://node.test.com".to_string()),
        Some("test_key".to_string()),
        60.0,
        5,
        120,
    );

    assert_eq!(config.get_base_url(), "https://api.test.com");
}

#[wasm_bindgen_test]
fn test_config_setters() {
    let mut config = KaleidoConfig::with_defaults("https://api.test.com".to_string());

    config.set_node_url(Some("http://node.test.com".to_string()));
    config.set_api_key(Some("test_key".to_string()));

    // Setters should not panic
    assert_eq!(config.get_base_url(), "https://api.test.com");
}

#[wasm_bindgen_test]
fn test_client_creation() {
    let config = KaleidoConfig::with_defaults("https://api.regtest.kaleidoswap.com".to_string());
    let client = KaleidoClient::new(config);

    assert!(client.is_ok());
}

#[wasm_bindgen_test]
fn test_client_has_node() {
    let config = KaleidoConfig::with_defaults("https://api.regtest.kaleidoswap.com".to_string());
    let client = KaleidoClient::new(config).expect("Failed to create client");

    // Should not have node by default
    assert!(!client.has_node());
}

#[wasm_bindgen_test]
fn test_client_accessors() {
    let config = KaleidoConfig::with_defaults("https://api.regtest.kaleidoswap.com".to_string());
    let client = KaleidoClient::new(config).expect("Failed to create client");

    // Check if we can access sub-clients
    let _maker = client.maker();
    let _rln = client.rln();
}

// Note: The following tests would require actual API calls
// which we can't do in a unit test context. These should be
// integration tests run against a test server.

// #[wasm_bindgen_test]
// async fn test_list_assets() {
//     let config = KaleidoConfig::withDefaults("https://api.regtest.kaleidoswap.com".to_string());
//     let client = KaleidoClient::new(config).expect("Failed to create client");
//
//     let assets = client.listAssets().await;
//     assert!(assets.is_ok());
// }
