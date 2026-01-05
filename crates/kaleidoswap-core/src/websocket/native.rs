//! Native WebSocket implementation using tokio-tungstenite.
//!
//! This module provides WebSocket functionality for native targets (Node.js, desktop).
//! The main implementation remains in the parent `websocket.rs` module for now,
//! as it's already well-tested and working.
//!
//! This file serves as a marker for conditional compilation and future refactoring.

#[cfg(not(target_arch = "wasm32"))]
pub use super::{ConnectionState, WebSocketClient, WebSocketConfig, WsEvent, WsMessage};

// Re-export for trait compatibility
#[cfg(not(target_arch = "wasm32"))]
pub type NativeWebSocket = WebSocketClient;

#[cfg(target_arch = "wasm32")]
pub struct NativeWebSocket;
