/**
 * React Example for Kaleidoswap SDK Web
 *
 * This example shows how to use the Kaleidoswap SDK in a React application.
 *
 * Installation:
 *   npm install @kaleidoswap/sdk-web react
 *
 * Usage:
 *   import { KaleidoswapProvider, useKaleidoswap } from './KaleidoswapProvider';
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import init, { KaleidoClient, KaleidoConfig } from '@kaleidoswap/sdk-web';

interface KaleidoswapContextType {
  client: KaleidoClient | null;
  isInitialized: boolean;
  error: Error | null;
}

const KaleidoswapContext = createContext<KaleidoswapContextType>({
  client: null,
  isInitialized: false,
  error: null,
});

interface KaleidoswapProviderProps {
  baseUrl: string;
  children: ReactNode;
}

export function KaleidoswapProvider({ baseUrl, children }: KaleidoswapProviderProps) {
  const [client, setClient] = useState<KaleidoClient | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initializeSDK() {
      try {
        // Initialize WASM
        await init();

        if (!mounted) return;

        // Create configuration
        const config = KaleidoConfig.withDefaults(baseUrl);

        // Create client
        const kaleidoClient = new KaleidoClient(config);

        setClient(kaleidoClient);
        setIsInitialized(true);
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize SDK'));
        }
      }
    }

    initializeSDK();

    return () => {
      mounted = false;
    };
  }, [baseUrl]);

  return (
    <KaleidoswapContext.Provider value={{ client, isInitialized, error }}>
      {children}
    </KaleidoswapContext.Provider>
  );
}

export function useKaleidoswap() {
  const context = useContext(KaleidoswapContext);
  if (!context) {
    throw new Error('useKaleidoswap must be used within a KaleidoswapProvider');
  }
  return context;
}

// ============================================================================
// Example Components
// ============================================================================

export function AssetList() {
  const { client, isInitialized } = useKaleidoswap();
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAssets = async () => {
    if (!client) return;

    try {
      setLoading(true);
      setError(null);
      const result = await client.listActiveAssets();
      setAssets(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized) {
      loadAssets();
    }
  }, [isInitialized]);

  if (!isInitialized) {
    return <div>Initializing SDK...</div>;
  }

  if (loading) {
    return <div>Loading assets...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  return (
    <div>
      <h2>Active Assets ({assets.length})</h2>
      <ul>
        {assets.map((asset) => (
          <li key={asset.asset_id}>
            <strong>{asset.ticker}</strong>: {asset.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function QuoteForm() {
  const { client, isInitialized } = useKaleidoswap();
  const [pair, setPair] = useState('BTC/USDT');
  const [amount, setAmount] = useState('100000');
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;

    try {
      setLoading(true);
      setError(null);
      const result = await client.getQuoteByPair(pair, parseInt(amount), null, 'BTC_LN', 'RGB_LN');
      setQuote(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get quote');
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return <div>Initializing SDK...</div>;
  }

  return (
    <div>
      <h2>Get Quote</h2>
      <form onSubmit={getQuote}>
        <div>
          <label>
            Pair:
            <input
              type="text"
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              placeholder="BTC/USDT"
            />
          </label>
        </div>
        <div>
          <label>
            Amount:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="100000"
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Get Quote'}
        </button>
      </form>

      {error && <div style={{ color: 'red' }}>Error: {error}</div>}

      {quote && (
        <div style={{ background: '#f5f5f5', padding: '20px', marginTop: '20px' }}>
          <h3>Quote</h3>
          <p>
            <strong>RFQ ID:</strong> {quote.rfq_id}
          </p>
          <p>
            <strong>Exchange Rate:</strong> {quote.exchange_rate}
          </p>
          <p>
            <strong>From:</strong> {quote.from_asset.amount} {quote.from_asset.asset_id}
          </p>
          <p>
            <strong>To:</strong> {quote.to_asset.amount} {quote.to_asset.asset_id}
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Example App
// ============================================================================

export default function App() {
  return (
    <KaleidoswapProvider baseUrl="https://api.regtest.kaleidoswap.com">
      <div style={{ padding: '20px' }}>
        <h1>Kaleidoswap SDK - React Example</h1>
        <AssetList />
        <hr />
        <QuoteForm />
      </div>
    </KaleidoswapProvider>
  );
}
