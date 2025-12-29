//! WebSocket Streaming Example
//!
//! This example demonstrates:
//! 1. Connecting to WebSocket
//! 2. Subscribing to price updates
//! 3. Handling real-time events
//! 4. Requesting quotes via WebSocket
//!
//! Run with: cargo run --example websocket_streaming

use kaleidoswap_core::{KaleidoClient, KaleidoConfig, Layer, WsEvent};
use std::sync::atomic::{AtomicU32, Ordering};
use std::sync::Arc;
use tokio::time::{sleep, Duration};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize logging
    env_logger::init();

    println!("=".repeat(60));
    println!("Kaleidoswap WebSocket Streaming Example");
    println!("=".repeat(60));

    // Create client
    let config = KaleidoConfig::new("https://api.regtest.kaleidoswap.com")
        .with_timeout(30.0)
        .with_max_retries(3);

    let client = KaleidoClient::new(config)?;

    // Connect to WebSocket
    println!("\n📡 Connecting to WebSocket...");
    client.connect_websocket().await?;
    println!("✅ WebSocket connected!");

    // Counter for events
    let update_count = Arc::new(AtomicU32::new(0));

    // Register price update handler
    let count_clone = update_count.clone();
    client
        .on_websocket_event(WsEvent::PriceUpdate, move |data| {
            let count = count_clone.fetch_add(1, Ordering::SeqCst) + 1;
            println!("\n📊 Price Update #{}", count);
            if let Some(pair) = data.get("pair").and_then(|v| v.as_str()) {
                println!("  Pair: {}", pair);
            }
            if let Some(price) = data.get("price").and_then(|v| v.as_f64()) {
                println!("  Price: ${:.2}", price);
            }
            if let Some(volume) = data.get("volume").and_then(|v| v.as_f64()) {
                println!("  Volume: {:.2}", volume);
            }
        })
        .await?;

    // Register quote response handler
    client
        .on_websocket_event(WsEvent::QuoteResponse, |data| {
            println!("\n💱 Quote Response Received");
            if let Some(rfq_id) = data.get("rfq_id").and_then(|v| v.as_str()) {
                println!("  RFQ ID: {}", rfq_id);
            }
            if let Some(price) = data.get("price").and_then(|v| v.as_f64()) {
                println!("  Price: ${:.2}", price);
            }
        })
        .await?;

    // Register error handler
    client
        .on_websocket_event(WsEvent::Error, |data| {
            println!("\n❌ WebSocket Error");
            if let Some(message) = data.get("message").and_then(|v| v.as_str()) {
                println!("  Message: {}", message);
            }
            if let Some(code) = data.get("code").and_then(|v| v.as_str()) {
                println!("  Code: {}", code);
            }
        })
        .await?;

    // Register disconnect handler
    client
        .on_websocket_event(WsEvent::Disconnected, |data| {
            println!("\n⚠️  WebSocket Disconnected");
            if let Some(reason) = data.get("reason").and_then(|v| v.as_str()) {
                println!("  Reason: {}", reason);
            }
        })
        .await?;

    // Subscribe to trading pairs
    println!("\n📥 Subscribing to trading pairs...");
    client.subscribe_to_pair("BTC/USDT").await?;
    client.subscribe_to_pair("ETH/USDT").await?;
    println!("✅ Subscribed to BTC/USDT and ETH/USDT");

    // Request a WebSocket quote
    println!("\n📊 Requesting quote via WebSocket...");
    match client
        .get_quote_websocket("BTC/USDT", Some(100000000), None, Layer::BtcLn)
        .await
    {
        Ok(quote) => {
            println!("✅ Quote received:");
            println!("  From: {} {}", quote.from_asset.amount, quote.from_asset.asset_id);
            println!("  To: {} {}", quote.to_asset.amount, quote.to_asset.asset_id);
            println!("  Price: {:?}", quote.price);
        }
        Err(e) => {
            println!("⚠️  Quote request failed: {}", e);
        }
    }

    // Stream for 30 seconds
    println!("\n👂 Listening for updates... (30 seconds)");
    println!("   Press Ctrl+C to stop early");

    sleep(Duration::from_secs(30)).await;

    // Unsubscribe and disconnect
    println!("\n📤 Unsubscribing from pairs...");
    client.unsubscribe_from_pair("BTC/USDT").await?;
    client.unsubscribe_from_pair("ETH/USDT").await?;

    println!("\n🔌 Disconnecting WebSocket...");
    client.disconnect_websocket().await?;

    let final_count = update_count.load(Ordering::SeqCst);
    println!("\n" .repeat(60));
    println!("✅ Session complete!");
    println!("   Received {} price updates", final_count);
    println!("=".repeat(60));

    Ok(())
}

