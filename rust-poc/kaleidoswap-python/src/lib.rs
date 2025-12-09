use kaleidoswap_core::{
    Asset as CoreAsset, ClientConfig, KaleidoClient as CoreClient, Quote as CoreQuote,
    TradingPair as CoreTradingPair,
};
use pyo3::exceptions::PyRuntimeError;
use pyo3::prelude::*;
use pyo3_asyncio::tokio::future_into_py;
use std::sync::Arc;

/// Python wrapper for KaleidoClient
#[pyclass(name = "KaleidoClient")]
struct PyKaleidoClient {
    inner: Arc<CoreClient>,
}

#[pymethods]
impl PyKaleidoClient {
    /// Create a new KaleidoClient
    /// 
    /// Args:
    ///     base_url: API base URL (default: https://api.staging.kaleidoswap.com/api/v1)
    ///     api_key: Optional API key for authenticated requests
    #[new]
    #[pyo3(signature = (base_url=None, api_key=None))]
    fn new(base_url: Option<String>, api_key: Option<String>) -> Self {
        let mut config = ClientConfig::default();
        if let Some(url) = base_url {
            config.base_url = url;
        }
        config.api_key = api_key;

        Self {
            inner: Arc::new(CoreClient::new(config)),
        }
    }

    /// List all available assets
    /// 
    /// Returns:
    ///     List[Asset]: List of available assets
    fn list_assets<'py>(&self, py: Python<'py>) -> PyResult<&'py PyAny> {
        let client = self.inner.clone();
        future_into_py(py, async move {
            let assets = client
                .list_assets()
                .await
                .map_err(|e| PyRuntimeError::new_err(e.to_string()))?;
            Ok(assets
                .into_iter()
                .map(PyAsset::from)
                .collect::<Vec<_>>())
        })
    }

    /// List all trading pairs
    /// 
    /// Returns:
    ///     List[TradingPair]: List of available trading pairs
    fn list_pairs<'py>(&self, py: Python<'py>) -> PyResult<&'py PyAny> {
        let client = self.inner.clone();
        future_into_py(py, async move {
            let pairs = client
                .list_pairs()
                .await
                .map_err(|e| PyRuntimeError::new_err(e.to_string()))?;
            Ok(pairs
                .into_iter()
                .map(PyTradingPair::from)
                .collect::<Vec<_>>())
        })
    }

    /// Get a quote by ticker pair (convenience method)
    /// 
    /// Args:
    ///     ticker: Trading pair ticker (e.g., "BTC/USDT")
    ///     from_amount: Amount of base asset (optional, mutually exclusive with to_amount)
    ///     to_amount: Amount of quote asset (optional, mutually exclusive with from_amount)
    /// 
    /// Returns:
    ///     Quote: Quote information
    /// 
    /// Example:
    ///     >>> client = KaleidoClient()
    ///     >>> quote = await client.get_quote_by_pair("BTC/USDT", from_amount=10000.0)
    ///     >>> print(f"Rate: {quote.rate}")
    #[pyo3(signature = (ticker, from_amount=None, to_amount=None))]
    fn get_quote_by_pair<'py>(
        &self,
        py: Python<'py>,
        ticker: String,
        from_amount: Option<f64>,
        to_amount: Option<f64>,
    ) -> PyResult<&'py PyAny> {
        let client = self.inner.clone();
        future_into_py(py, async move {
            let quote = client
                .get_quote_by_pair(&ticker, from_amount, to_amount)
                .await
                .map_err(|e| PyRuntimeError::new_err(e.to_string()))?;
            Ok(PyQuote::from(quote))
        })
    }

    /// Get asset by ticker symbol
    /// 
    /// Args:
    ///     ticker: Asset ticker symbol (e.g., "BTC")
    /// 
    /// Returns:
    ///     Asset: Asset information
    fn get_asset_by_ticker<'py>(&self, py: Python<'py>, ticker: String) -> PyResult<&'py PyAny> {
        let client = self.inner.clone();
        future_into_py(py, async move {
            let asset = client
                .get_asset_by_ticker(&ticker)
                .await
                .map_err(|e| PyRuntimeError::new_err(e.to_string()))?;
            Ok(PyAsset::from(asset))
        })
    }

    /// Get pair by ticker
    /// 
    /// Args:
    ///     ticker: Trading pair ticker (e.g., "BTC/USDT")
    /// 
    /// Returns:
    ///     TradingPair: Trading pair information
    fn get_pair_by_ticker<'py>(&self, py: Python<'py>, ticker: String) -> PyResult<&'py PyAny> {
        let client = self.inner.clone();
        future_into_py(py, async move {
            let pair = client
                .get_pair_by_ticker(&ticker)
                .await
                .map_err(|e| PyRuntimeError::new_err(e.to_string()))?;
            Ok(PyTradingPair::from(pair))
        })
    }

    fn __repr__(&self) -> String {
        "KaleidoClient()".to_string()
    }
}

/// Asset information
#[pyclass(name = "Asset")]
#[derive(Clone)]
struct PyAsset {
    #[pyo3(get)]
    asset_id: String,
    #[pyo3(get)]
    ticker: String,
    #[pyo3(get)]
    name: String,
    #[pyo3(get)]
    precision: u8,
}

#[pymethods]
impl PyAsset {
    fn __repr__(&self) -> String {
        format!("Asset(ticker='{}', name='{}')", self.ticker, self.name)
    }
}

impl From<CoreAsset> for PyAsset {
    fn from(asset: CoreAsset) -> Self {
        Self {
            asset_id: asset.asset_id,
            ticker: asset.ticker,
            name: asset.name,
            precision: asset.precision,
        }
    }
}

/// Trading pair information
#[pyclass(name = "TradingPair")]
#[derive(Clone)]
struct PyTradingPair {
    #[pyo3(get)]
    pair_id: String,
    #[pyo3(get)]
    ticker: String,
    #[pyo3(get)]
    base_asset: PyAsset,
    #[pyo3(get)]
    quote_asset: PyAsset,
}

#[pymethods]
impl PyTradingPair {
    fn __repr__(&self) -> String {
        format!("TradingPair(ticker='{}')", self.ticker)
    }
}

impl From<CoreTradingPair> for PyTradingPair {
    fn from(pair: CoreTradingPair) -> Self {
        Self {
            pair_id: pair.pair_id,
            ticker: pair.ticker,
            base_asset: PyAsset::from(pair.base_asset),
            quote_asset: PyAsset::from(pair.quote_asset),
        }
    }
}

/// Quote information
#[pyclass(name = "Quote")]
#[derive(Clone)]
struct PyQuote {
    #[pyo3(get)]
    rfq_id: String,
    #[pyo3(get)]
    from_asset_id: String,
    #[pyo3(get)]
    to_asset_id: String,
    #[pyo3(get)]
    from_amount: f64,
    #[pyo3(get)]
    to_amount: f64,
    #[pyo3(get)]
    rate: f64,
    #[pyo3(get)]
    expires_at: String,
}

#[pymethods]
impl PyQuote {
    fn __repr__(&self) -> String {
        format!(
            "Quote(from_amount={}, to_amount={}, rate={})",
            self.from_amount, self.to_amount, self.rate
        )
    }
}

impl From<CoreQuote> for PyQuote {
    fn from(quote: CoreQuote) -> Self {
        Self {
            rfq_id: quote.rfq_id,
            from_asset_id: quote.from_asset_id,
            to_asset_id: quote.to_asset_id,
            from_amount: quote.from_amount,
            to_amount: quote.to_amount,
            rate: quote.rate,
            expires_at: quote.expires_at,
        }
    }
}

/// Kaleidoswap SDK for Python
#[pymodule]
fn kaleidoswap_sdk(_py: Python, m: &PyModule) -> PyResult<()> {
    m.add_class::<PyKaleidoClient>()?;
    m.add_class::<PyAsset>()?;
    m.add_class::<PyTradingPair>()?;
    m.add_class::<PyQuote>()?;
    Ok(())
}
