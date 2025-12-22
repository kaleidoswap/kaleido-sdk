//! Data models for the Kaleidoswap SDK.
//!
//! Models are auto-generated from OpenAPI specifications.
//! To regenerate: ./scripts/generate-rust-models.sh

// Re-export generated models directly
pub use crate::generated::kaleidoswap::models::*;

pub use crate::generated::rgb_node::models as rgb_node;

// ============================================================================
// Utility types (not from OpenAPI)
// ============================================================================

/// Validation result for amount validation.
#[derive(Debug, Clone)]
pub struct ValidationResult {
    /// Whether the amount is valid
    pub is_valid: bool,
    /// Error message if invalid
    pub error: Option<String>,
    /// Adjusted amount if applicable
    pub adjusted_amount: Option<i64>,
}

impl ValidationResult {
    /// Create a valid result.
    pub fn valid() -> Self {
        Self {
            is_valid: true,
            error: None,
            adjusted_amount: None,
        }
    }

    /// Create an invalid result with an error message.
    pub fn invalid(error: impl Into<String>) -> Self {
        Self {
            is_valid: false,
            error: Some(error.into()),
            adjusted_amount: None,
        }
    }
}

/// Amount conversion utilities.
pub struct AmountConverter;

impl AmountConverter {
    /// Convert amount from display units to smallest units.
    pub fn to_smallest_units(amount: f64, precision: u8) -> i64 {
        let multiplier = 10_i64.pow(precision as u32);
        (amount * multiplier as f64).round() as i64
    }

    /// Convert amount from smallest units to display units.
    pub fn to_display_units(amount: i64, precision: u8) -> f64 {
        let divisor = 10_i64.pow(precision as u32);
        amount as f64 / divisor as f64
    }
}
