//! Auto-generated models from OpenAPI specifications via Progenitor.
//!
//! DO NOT EDIT - Generated at build time via build.rs
//!
//! Progenitor generates both HTTP clients and type definitions from OpenAPI specs:
//! - maker: Kaleidoswap Maker API client + types
//! - rln: RGB Lightning Node API client + types
//!
//! To regenerate: make regenerate

// Generated Clients + Types (via build.rs + progenitor)
pub mod maker {
    include!(concat!(env!("OUT_DIR"), "/maker_api.rs"));
}

pub mod rln {
    include!(concat!(env!("OUT_DIR"), "/rln_api.rs"));
}
