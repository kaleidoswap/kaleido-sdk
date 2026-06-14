//! SDK error type.

use thiserror::Error;

pub type Result<T> = std::result::Result<T, Error>;

#[derive(Debug, Error)]
pub enum Error {
    /// Transport failure reaching the maker (DNS, TLS, timeout, connection).
    #[error("transport: {0}")]
    Transport(String),

    /// The maker answered with a non-2xx status. Carries the maker's
    /// Boltz-shaped `{error, details}` envelope when present.
    #[error("maker error {status}: {code}{}", .details.as_deref().map(|d| format!(" — {d}")).unwrap_or_default())]
    Maker {
        status: u16,
        code: String,
        details: Option<String>,
    },

    /// A response body didn't deserialize to the expected shape.
    #[error("decode: {0}")]
    Decode(String),

    /// Caller-side input failed pre-flight validation.
    #[error("invalid input: {0}")]
    InvalidInput(String),

    /// The maker's returned lockup didn't match what the taker
    /// independently recomputed — refuse the swap (see `verify`).
    #[error("verification failed: {0}")]
    Verification(String),

    /// A cryptographic primitive failed (`sign`/`spend`): bad key material,
    /// a malformed counterparty nonce/partial, or partial-sig aggregation
    /// that didn't verify (a misbehaving maker or a sighash mismatch).
    #[error("crypto: {0}")]
    Crypto(String),
}
