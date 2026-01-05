//! WebSocket connection trait for cross-platform support.

use crate::error::Result;
use async_trait::async_trait;

/// Common trait for WebSocket implementations across different platforms.
///
/// This trait abstracts over platform-specific WebSocket implementations:
/// - Browser: uses web-sys::WebSocket
/// - Node.js/Native: uses tokio-tungstenite
#[async_trait]
pub trait WebSocketConnection: Send + Sync {
    /// Connect to a WebSocket server.
    ///
    /// # Arguments
    /// * `url` - The WebSocket URL (ws:// or wss://)
    ///
    /// # Returns
    /// A new WebSocket connection instance.
    async fn connect(url: &str) -> Result<Self>
    where
        Self: Sized;

    /// Send a text message through the WebSocket.
    ///
    /// # Arguments
    /// * `message` - The text message to send
    async fn send(&mut self, message: &str) -> Result<()>;

    /// Receive a message from the WebSocket.
    ///
    /// # Returns
    /// - `Ok(Some(String))` if a message was received
    /// - `Ok(None)` if no message is available (non-blocking)
    /// - `Err(_)` on error
    async fn recv(&mut self) -> Result<Option<String>>;

    /// Close the WebSocket connection.
    async fn close(&mut self) -> Result<()>;

    /// Check if the WebSocket is currently connected.
    ///
    /// # Returns
    /// `true` if connected, `false` otherwise
    fn is_connected(&self) -> bool;
}
