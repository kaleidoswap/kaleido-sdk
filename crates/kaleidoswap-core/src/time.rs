//! Cross-platform time utilities for native and WASM environments.

use std::time::Duration;

/// A cross-platform timestamp that works on both native and WASM.
#[derive(Debug, Clone, Copy)]
pub struct Timestamp {
    #[cfg(not(target_arch = "wasm32"))]
    inner: std::time::Instant,
    #[cfg(target_arch = "wasm32")]
    inner: f64, // milliseconds since epoch
}

impl Timestamp {
    /// Get the current timestamp.
    pub fn now() -> Self {
        #[cfg(not(target_arch = "wasm32"))]
        {
            Self {
                inner: std::time::Instant::now(),
            }
        }
        #[cfg(target_arch = "wasm32")]
        {
            Self {
                inner: js_sys::Date::now(),
            }
        }
    }

    /// Get the elapsed time since this timestamp.
    pub fn elapsed(&self) -> Duration {
        #[cfg(not(target_arch = "wasm32"))]
        {
            self.inner.elapsed()
        }
        #[cfg(target_arch = "wasm32")]
        {
            let now = js_sys::Date::now();
            let elapsed_ms = now - self.inner;
            Duration::from_millis(elapsed_ms.max(0.0) as u64)
        }
    }
}

