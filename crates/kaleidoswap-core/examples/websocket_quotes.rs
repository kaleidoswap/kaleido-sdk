//! WebSocket Quotes Example
//!
//! Simple example showing how to get real-time quotes via WebSocket.
//!
//! Run with: cargo run --example websocket_quotes

use kaleidoswap_core::{KaleidoClient, KaleidoConfig, Layer};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    println!("📊 WebSocket Quotes Example\n");

    // Create client
    let config = KaleidoConfig::new("https://api.regtest.kaleidoswap.com");
    let client = KaleidoClient::new(config)?;

    // Connect WebSocket
    println!("Connecting to WebSocket...");
    client.connect_websocket().await?;
    println!("✅ Connected!\n");

    // Request multiple quotes
    let pairs = vec![
        ("BTC/USDT", 100000000),  // 1 BTC
        ("BTC/USDT", 50000000),   // 0.5 BTC
        ("BTC/USDT", 200000000),  // 2 BTC
    ];

    for (pair, amount) in pairs {
        println!("Requesting quote for {} {} sats...", pair, amount);

        match client
            .get_quote_websocket(pair, Some(amount), None, Layer::BtcLn)
            .await
        {
            Ok(quote) => {
                let from_btc = quote.from_asset.amount as f64 / 100_000_000.0;
                println!("  ✅ Quote received:");
                println!("     From: {:.8} BTC", from_btc);
                println!("     To: {} USDT", quote.to_asset.amount);
                if let Some(price) = quote.price {
                    println!("     Price: ${:.2}/BTC", price);
                }
                println!();
            }
            Err(e) => {
                println!("  ❌ Error: {}\n", e);
            }
        }
    }

    // Disconnect
    client.disconnect_websocket().await?;
    println!("Disconnected. Done!");

    Ok(())
}

