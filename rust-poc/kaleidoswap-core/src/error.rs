use thiserror::Error;

pub type Result<T> = std::result::Result<T, KaleidoError>;

#[derive(Debug, Error)]
pub enum KaleidoError {
    #[error("HTTP error: {0}")]
    Http(#[from] reqwest::Error),
    
    #[error("Invalid ticker format: {0}")]
    InvalidTicker(String),
    
    #[error("Asset not found: {0}")]
    AssetNotFound(String),
    
    #[error("Pair not found: {0}")]
    PairNotFound(String),
    
    #[error("Invalid amount: must specify either from_amount or to_amount")]
    InvalidAmount,
    
    #[error("API error: {0}")]
    ApiError(String),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
}
