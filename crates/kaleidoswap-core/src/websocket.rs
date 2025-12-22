//! WebSocket client for real-time quotes and updates.

use crate::error::{KaleidoError, Result};
use futures::{SinkExt, StreamExt};
use serde::{Deserialize, Serialize};
use tokio::sync::mpsc;
use tokio_tungstenite::{connect_async, tungstenite::Message};
use url::Url;

/// WebSocket message types.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum WsMessage {
    /// Subscribe to a trading pair
    #[serde(rename = "subscribe")]
    Subscribe { pair_id: String },
    /// Unsubscribe from a trading pair
    #[serde(rename = "unsubscribe")]
    Unsubscribe { pair_id: String },
    /// Quote update (using dynamic JSON since types aren't generated)
    #[serde(rename = "quote")]
    Quote(serde_json::Value),
    /// Error message
    #[serde(rename = "error")]
    Error { message: String },
    /// Ping for keepalive
    #[serde(rename = "ping")]
    Ping,
    /// Pong response
    #[serde(rename = "pong")]
    Pong,
}

/// WebSocket client for real-time updates.
pub struct WebSocketClient {
    url: Url,
    sender: Option<mpsc::Sender<WsMessage>>,
    receiver: Option<mpsc::Receiver<WsMessage>>,
}

impl WebSocketClient {
    /// Create a new WebSocket client.
    pub fn new(base_url: &str) -> Result<Self> {
        // Convert HTTP URL to WebSocket URL
        let ws_url = base_url
            .replace("https://", "wss://")
            .replace("http://", "ws://");

        let url = Url::parse(&format!("{}/ws", ws_url))
            .map_err(|e| KaleidoError::config(format!("Invalid WebSocket URL: {}", e)))?;

        Ok(Self {
            url,
            sender: None,
            receiver: None,
        })
    }

    /// Connect to the WebSocket server.
    pub async fn connect(&mut self) -> Result<()> {
        let (ws_stream, _) = connect_async(self.url.as_str())
            .await
            .map_err(|e| KaleidoError::websocket(format!("Connection failed: {}", e)))?;

        let (mut write, mut read) = ws_stream.split();

        // Create channels for communication
        let (tx_to_ws, mut rx_from_client) = mpsc::channel::<WsMessage>(32);
        let (tx_to_client, rx_from_ws) = mpsc::channel::<WsMessage>(32);

        // Spawn task to handle outgoing messages
        let tx_to_client_clone = tx_to_client.clone();
        tokio::spawn(async move {
            while let Some(msg) = rx_from_client.recv().await {
                let json = match serde_json::to_string(&msg) {
                    Ok(j) => j,
                    Err(e) => {
                        log::error!("Failed to serialize message: {}", e);
                        continue;
                    }
                };

                if let Err(e) = write.send(Message::Text(json)).await {
                    log::error!("Failed to send message: {}", e);
                    break;
                }
            }
        });

        // Spawn task to handle incoming messages
        tokio::spawn(async move {
            while let Some(msg_result) = read.next().await {
                match msg_result {
                    Ok(Message::Text(text)) => match serde_json::from_str::<WsMessage>(&text) {
                        Ok(ws_msg) => {
                            if tx_to_client_clone.send(ws_msg).await.is_err() {
                                break;
                            }
                        }
                        Err(e) => {
                            log::warn!("Failed to parse WebSocket message: {}", e);
                        }
                    },
                    Ok(Message::Ping(data)) => {
                        log::debug!("Received ping: {:?}", data);
                    }
                    Ok(Message::Pong(_)) => {
                        log::debug!("Received pong");
                    }
                    Ok(Message::Close(_)) => {
                        log::info!("WebSocket connection closed by server");
                        break;
                    }
                    Ok(_) => {}
                    Err(e) => {
                        log::error!("WebSocket error: {}", e);
                        break;
                    }
                }
            }
        });

        self.sender = Some(tx_to_ws);
        self.receiver = Some(rx_from_ws);

        Ok(())
    }

    /// Subscribe to a trading pair.
    pub async fn subscribe(&mut self, pair_id: &str) -> Result<()> {
        let sender = self
            .sender
            .as_ref()
            .ok_or_else(|| KaleidoError::websocket("Not connected"))?;

        sender
            .send(WsMessage::Subscribe {
                pair_id: pair_id.to_string(),
            })
            .await
            .map_err(|e| KaleidoError::websocket(format!("Failed to send subscribe: {}", e)))?;

        Ok(())
    }

    /// Unsubscribe from a trading pair.
    pub async fn unsubscribe(&mut self, pair_id: &str) -> Result<()> {
        let sender = self
            .sender
            .as_ref()
            .ok_or_else(|| KaleidoError::websocket("Not connected"))?;

        sender
            .send(WsMessage::Unsubscribe {
                pair_id: pair_id.to_string(),
            })
            .await
            .map_err(|e| KaleidoError::websocket(format!("Failed to send unsubscribe: {}", e)))?;

        Ok(())
    }

    /// Receive the next message.
    pub async fn recv(&mut self) -> Option<WsMessage> {
        self.receiver.as_mut()?.recv().await
    }

    /// Receive the next quote update.
    pub async fn recv_quote(&mut self) -> Option<serde_json::Value> {
        loop {
            match self.recv().await? {
                WsMessage::Quote(quote) => return Some(quote),
                WsMessage::Error { message } => {
                    log::error!("WebSocket error: {}", message);
                    continue;
                }
                _ => continue,
            }
        }
    }

    /// Disconnect from the WebSocket server.
    pub fn disconnect(&mut self) {
        self.sender = None;
        self.receiver = None;
    }

    /// Check if connected.
    pub fn is_connected(&self) -> bool {
        self.sender.is_some()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_url_conversion() {
        let client = WebSocketClient::new("https://api.example.com").unwrap();
        assert!(client.url.as_str().starts_with("wss://"));
        assert!(client.url.as_str().ends_with("/ws"));
    }

    #[test]
    fn test_message_serialization() {
        let msg = WsMessage::Subscribe {
            pair_id: "BTC/USDT".to_string(),
        };
        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("subscribe"));
    }
}
