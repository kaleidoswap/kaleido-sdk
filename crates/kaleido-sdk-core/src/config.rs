//! Client configuration — which maker, which chains.

/// Where the maker lives + the chain endpoints the taker watches.
///
/// The maker drives quoting + lockup derivation; the taker independently
/// watches the chains to confirm deposits, observe the maker's lockup,
/// and (on timeout) broadcast its own refund — hence the per-venue
/// Esplora endpoints here.
#[derive(Debug, Clone)]
pub struct Config {
    /// Maker `/v2` base URL, e.g. `https://maker.signet.kaleidoswap.com`.
    pub maker_url: String,
    /// Bitcoin Esplora REST (signet/Mutinynet/mainnet) for the BTC + LN
    /// on-chain legs.
    pub bitcoin_esplora_url: String,
    /// Liquid Esplora REST for the L-BTC / L-USDT legs. `None` disables
    /// the Liquid venue client-side.
    pub liquid_esplora_url: Option<String>,
    /// Arkade server URL for the BTC@ARK legs. `None` disables Arkade.
    pub arkade_server_url: Option<String>,
}

impl Config {
    /// Mutinynet signet defaults (matches the deployed signet maker).
    pub fn mutinynet(maker_url: impl Into<String>) -> Self {
        Self {
            maker_url: maker_url.into(),
            bitcoin_esplora_url: "https://esplora.signet.kaleidoswap.com".to_owned(),
            liquid_esplora_url: Some("https://blockstream.info/liquidtestnet/api".to_owned()),
            arkade_server_url: Some("https://mutinynet.arkade.sh".to_owned()),
        }
    }
}
