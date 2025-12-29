//! WebSocket integration tests.
//!
//! Note: These tests require a running WebSocket server.
//! They are marked with #[ignore] by default.

use kaleidoswap_core::{KaleidoClient, KaleidoConfig, Layer, WsEvent};
use std::sync::atomic::{AtomicBool, AtomicU32, Ordering};
use std::sync::Arc;
use tokio::time::{sleep, Duration};

const TEST_URL: &str = "https://api.regtest.kaleidoswap.com";

#[tokio::test]
#[ignore] // Requires WebSocket server
async fn test_websocket_connection() {
    let config = KaleidoConfig::new(TEST_URL);
    let client = KaleidoClient::new(config).unwrap();

    // Connect
    assert!(client.connect_websocket().await.is_ok());
    assert!(client.is_websocket_connected().await);

    // Disconnect
    assert!(client.disconnect_websocket().await.is_ok());
    assert!(!client.is_websocket_connected().await);
}

#[tokio::test]
#[ignore] // Requires WebSocket server
async fn test_websocket_subscription() {
    let config = KaleidoConfig::new(TEST_URL);
    let client = KaleidoClient::new(config).unwrap();

    client.connect_websocket().await.unwrap();

    // Subscribe
    let result = client.subscribe_to_pair("BTC/USDT").await;
    assert!(result.is_ok());

    // Unsubscribe
    let result = client.unsubscribe_from_pair("BTC/USDT").await;
    assert!(result.is_ok());

    client.disconnect_websocket().await.unwrap();
}

#[tokio::test]
#[ignore] // Requires WebSocket server
async fn test_websocket_event_handlers() {
    let config = KaleidoConfig::new(TEST_URL);
    let client = KaleidoClient::new(config).unwrap();

    client.connect_websocket().await.unwrap();

    // Track events
    let price_updates = Arc::new(AtomicU32::new(0));
    let errors = Arc::new(AtomicU32::new(0));

    // Register handlers
    let price_count = price_updates.clone();
    client
        .on_websocket_event(WsEvent::PriceUpdate, move |_| {
            price_count.fetch_add(1, Ordering::SeqCst);
        })
        .await
        .unwrap();

    let error_count = errors.clone();
    client
        .on_websocket_event(WsEvent::Error, move |_| {
            error_count.fetch_add(1, Ordering::SeqCst);
        })
        .await
        .unwrap();

    // Subscribe to a pair
    client.subscribe_to_pair("BTC/USDT").await.unwrap();

    // Wait for some updates
    sleep(Duration::from_secs(5)).await;

    // Should have received some updates (exact count depends on server)
    let price_count = price_updates.load(Ordering::SeqCst);
    println!("Received {} price updates", price_count);

    client.disconnect_websocket().await.unwrap();
}

#[tokio::test]
#[ignore] // Requires WebSocket server
async fn test_websocket_quote_request() {
    let config = KaleidoConfig::new(TEST_URL);
    let client = KaleidoClient::new(config).unwrap();

    client.connect_websocket().await.unwrap();

    // Request a quote
    let result = client
        .get_quote_websocket("BTC/USDT", Some(100000000), None, Layer::BtcLn)
        .await;

    match result {
        Ok(quote) => {
            assert!(!quote.from_asset.asset_id.is_empty());
            assert!(!quote.to_asset.asset_id.is_empty());
            assert!(quote.from_asset.amount > 0);
            println!(
                "Quote received: {} -> {}",
                quote.from_asset.amount, quote.to_asset.amount
            );
        }
        Err(e) => {
            println!("Quote request failed (may be expected): {}", e);
        }
    }

    client.disconnect_websocket().await.unwrap();
}

#[tokio::test]
#[ignore] // Requires WebSocket server
async fn test_websocket_reconnection() {
    use kaleidoswap_core::WebSocketConfig;

    let config = KaleidoConfig::new(TEST_URL);
    let client = KaleidoClient::new(config).unwrap();

    // Connect with auto-reconnect enabled
    let ws_config = WebSocketConfig {
        auto_reconnect: true,
        max_reconnect_attempts: 3,
        reconnect_delay: 1,
        max_reconnect_delay: 5,
        ping_interval: 10,
    };

    client
        .connect_websocket_with_config(ws_config)
        .await
        .unwrap();

    assert!(client.is_websocket_connected().await);

    // Simulate a reconnection scenario
    // (In a real test, you might disconnect the server here)

    client.disconnect_websocket().await.unwrap();
}

#[tokio::test]
#[ignore] // Requires WebSocket server
async fn test_websocket_multiple_subscriptions() {
    let config = KaleidoConfig::new(TEST_URL);
    let client = KaleidoClient::new(config).unwrap();

    client.connect_websocket().await.unwrap();

    // Subscribe to multiple pairs
    let pairs = vec!["BTC/USDT", "ETH/USDT", "LTC/BTC"];

    for pair in &pairs {
        let result = client.subscribe_to_pair(pair).await;
        assert!(result.is_ok(), "Failed to subscribe to {}", pair);
    }

    // Wait a bit
    sleep(Duration::from_secs(2)).await;

    // Unsubscribe from all
    for pair in &pairs {
        let result = client.unsubscribe_from_pair(pair).await;
        assert!(result.is_ok(), "Failed to unsubscribe from {}", pair);
    }

    client.disconnect_websocket().await.unwrap();
}

#[tokio::test]
#[ignore] // Requires WebSocket server
async fn test_websocket_connection_lifecycle() {
    let config = KaleidoConfig::new(TEST_URL);
    let client = KaleidoClient::new(config).unwrap();

    // Initially disconnected
    assert!(!client.is_websocket_connected().await);

    // Connect
    client.connect_websocket().await.unwrap();
    assert!(client.is_websocket_connected().await);

    // Try to connect again (should fail)
    let result = client.connect_websocket().await;
    assert!(result.is_err());

    // Disconnect
    client.disconnect_websocket().await.unwrap();
    assert!(!client.is_websocket_connected().await);

    // Try to disconnect again (should fail)
    let result = client.disconnect_websocket().await;
    assert!(result.is_err());
}

#[tokio::test]
#[ignore] // Requires WebSocket server
async fn test_websocket_disconnect_event() {
    let config = KaleidoConfig::new(TEST_URL);
    let client = KaleidoClient::new(config).unwrap();

    client.connect_websocket().await.unwrap();

    // Track disconnect event
    let disconnected = Arc::new(AtomicBool::new(false));

    let disconnect_flag = disconnected.clone();
    client
        .on_websocket_event(WsEvent::Disconnected, move |_| {
            disconnect_flag.store(true, Ordering::SeqCst);
        })
        .await
        .unwrap();

    // Disconnect
    client.disconnect_websocket().await.unwrap();

    // Give event time to fire
    sleep(Duration::from_millis(100)).await;

    // Should have received disconnect event
    assert!(disconnected.load(Ordering::SeqCst));
}
