//! Browser WebSocket implementation using web-sys.

#[cfg(target_arch = "wasm32")]
use crate::error::{KaleidoError, Result};
use futures::channel::mpsc::{unbounded, UnboundedReceiver, UnboundedSender};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use web_sys::{CloseEvent, ErrorEvent, MessageEvent, WebSocket};

/// Browser-based WebSocket implementation using web-sys.
///
/// This implementation uses the native browser WebSocket API via web-sys.
/// Messages are queued internally and can be retrieved asynchronously.
pub struct BrowserWebSocket {
    ws: WebSocket,
    rx: Arc<tokio::sync::Mutex<UnboundedReceiver<String>>>,
    #[allow(dead_code)] // Used in closures for sending messages
    tx: UnboundedSender<String>,
    connected: Arc<AtomicBool>,
    _closures: ClosureHandlers,
}

/// Holds the JavaScript closures to prevent them from being dropped.
/// These must be kept alive for the lifetime of the WebSocket connection.
struct ClosureHandlers {
    _onmessage: Closure<dyn FnMut(MessageEvent)>,
    _onerror: Closure<dyn FnMut(ErrorEvent)>,
    _onclose: Closure<dyn FnMut(CloseEvent)>,
    _onopen: Closure<dyn FnMut(JsValue)>,
}

#[cfg(target_arch = "wasm32")]
impl BrowserWebSocket {
    pub async fn connect(url: &str) -> Result<Self> {
        // Create WebSocket
        let ws = WebSocket::new(url)
            .map_err(|e| KaleidoError::websocket(format!("Failed to create WebSocket: {:?}", e)))?;

        // Set binary type to arraybuffer (though we're using text)
        ws.set_binary_type(web_sys::BinaryType::Arraybuffer);

        // Create message channel
        let (tx, rx) = unbounded::<String>();
        let rx = Arc::new(tokio::sync::Mutex::new(rx));

        // Track connection state
        let connected = Arc::new(AtomicBool::new(false));

        // Setup onopen handler
        let connected_clone = Arc::clone(&connected);
        let onopen = Closure::wrap(Box::new(move |_: JsValue| {
            connected_clone.store(true, Ordering::SeqCst);
            web_sys::console::log_1(&"WebSocket connected".into());
        }) as Box<dyn FnMut(JsValue)>);
        ws.set_onopen(Some(onopen.as_ref().unchecked_ref()));

        // Setup onmessage handler
        let tx_clone = tx.clone();
        let onmessage = Closure::wrap(Box::new(move |e: MessageEvent| {
            if let Ok(txt) = e.data().dyn_into::<js_sys::JsString>() {
                let message: String = txt.into();
                // Send to channel (ignore errors if receiver is dropped)
                let _ = tx_clone.unbounded_send(message);
            }
        }) as Box<dyn FnMut(MessageEvent)>);
        ws.set_onmessage(Some(onmessage.as_ref().unchecked_ref()));

        // Setup onerror handler
        let connected_clone = Arc::clone(&connected);
        let onerror = Closure::wrap(Box::new(move |e: ErrorEvent| {
            connected_clone.store(false, Ordering::SeqCst);
            web_sys::console::error_1(&format!("WebSocket error: {:?}", e.message()).into());
        }) as Box<dyn FnMut(ErrorEvent)>);
        ws.set_onerror(Some(onerror.as_ref().unchecked_ref()));

        // Setup onclose handler
        let connected_clone = Arc::clone(&connected);
        let onclose = Closure::wrap(Box::new(move |e: CloseEvent| {
            connected_clone.store(false, Ordering::SeqCst);
            web_sys::console::log_1(
                &format!("WebSocket closed: code={}, reason={}", e.code(), e.reason()).into(),
            );
        }) as Box<dyn FnMut(CloseEvent)>);
        ws.set_onclose(Some(onclose.as_ref().unchecked_ref()));

        // Store closures to prevent them from being dropped
        let closures = ClosureHandlers {
            _onmessage: onmessage,
            _onerror: onerror,
            _onclose: onclose,
            _onopen: onopen,
        };

        // Wait for connection to open
        // In browser, this happens asynchronously, so we'll wait a bit
        gloo_timers::future::TimeoutFuture::new(100).await;

        Ok(BrowserWebSocket {
            ws,
            rx,
            tx,
            connected,
            _closures: closures,
        })
    }

    pub async fn send(&mut self, message: &str) -> Result<()> {
        if !self.is_connected() {
            return Err(KaleidoError::websocket("WebSocket not connected"));
        }

        self.ws
            .send_with_str(message)
            .map_err(|e| KaleidoError::websocket(format!("Failed to send message: {:?}", e)))?;

        Ok(())
    }

    pub async fn recv(&mut self) -> Result<Option<String>> {
        // Try to receive a message from the queue
        let mut rx = self.rx.lock().await;

        // Non-blocking receive
        match rx.try_next() {
            Ok(Some(msg)) => Ok(Some(msg)),
            Ok(None) => Ok(None), // Channel closed
            Err(_) => Ok(None),   // No message available
        }
    }

    pub async fn close(&mut self) -> Result<()> {
        self.connected.store(false, Ordering::SeqCst);

        self.ws
            .close()
            .map_err(|e| KaleidoError::websocket(format!("Failed to close WebSocket: {:?}", e)))?;

        Ok(())
    }

    pub fn is_connected(&self) -> bool {
        self.connected.load(Ordering::SeqCst) && self.ws.ready_state() == WebSocket::OPEN
    }
}

// For non-WASM targets, provide a stub implementation
#[cfg(not(target_arch = "wasm32"))]
pub struct BrowserWebSocket;

#[cfg(not(target_arch = "wasm32"))]
impl BrowserWebSocket {
    async fn connect(_url: &str) -> Result<Self> {
        Err(KaleidoError::websocket(
            "BrowserWebSocket is only available on WASM targets",
        ))
    }

    async fn send(&mut self, _message: &str) -> Result<()> {
        Err(KaleidoError::websocket(
            "BrowserWebSocket is only available on WASM targets",
        ))
    }

    async fn recv(&mut self) -> Result<Option<String>> {
        Err(KaleidoError::websocket(
            "BrowserWebSocket is only available on WASM targets",
        ))
    }

    async fn close(&mut self) -> Result<()> {
        Ok(())
    }

    fn is_connected(&self) -> bool {
        false
    }
}
