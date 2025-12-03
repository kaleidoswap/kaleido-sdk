import { KaleidoClient } from '../client';
import { KaleidoApiClient } from '../generated/kaleido/KaleidoApiClient';
import { RgbNodeClient } from '../generated/rgb-node/RgbNodeClient';
import { WebSocketClient } from '../websocket/client';
import { SwapStatus } from '../generated/kaleido/models/SwapStatus';

// Define Jest types locally if not available globally in this context
declare const jest: any;
declare const describe: any;
declare const it: any;
declare const beforeEach: any;
declare const expect: any;

jest.mock('../generated/kaleido/KaleidoApiClient');
jest.mock('../generated/rgb-node/RgbNodeClient');
jest.mock('../websocket/client');

describe('Feature Coverage', () => {
  let client: KaleidoClient;
  let mockKaleidoApi: KaleidoApiClient;
  let mockRgbNodeApi: RgbNodeClient;

  beforeEach(() => {
    jest.clearAllMocks();
    
    (KaleidoApiClient as any).mockImplementation(() => ({
      market: {
        listAssetsApiV1MarketAssetsGet: jest.fn(),
        getPairsApiV1MarketPairsGet: jest.fn(),
        getQuoteApiV1MarketQuotePost: jest.fn(),
      },
      swaps: {
        initiateSwapApiV1SwapsInitPost: jest.fn(),
        confirmSwapApiV1SwapsExecutePost: jest.fn(),
        getSwapStatusApiV1SwapsAtomicStatusPost: jest.fn(),
      },
      lsps1: {
        getInfoApiV1Lsps1GetInfoGet: jest.fn(),
      }
    }));

    (RgbNodeClient as any).mockImplementation(() => ({
      swaps: {
        postTaker: jest.fn(),
      },
      other: {
        getNodeinfo: jest.fn(),
      }
    }));

    (WebSocketClient as any).mockImplementation(() => ({
      connect: jest.fn(),
      getConnectionState: jest.fn(),
      on: jest.fn(),
      off: jest.fn(),
      send: jest.fn(),
    }));

    client = new KaleidoClient({
      baseUrl: 'http://mock-api.com',
      nodeUrl: 'http://mock-node.com',
      clientId: 'test-client-id',
    });

    expect(WebSocketClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: 'ws://mock-api.com/api/v1/market/ws',
        clientId: 'test-client-id',
      })
    );

    mockKaleidoApi = (client as any).kaleidoApi;
    mockRgbNodeApi = (client as any).rgbNodeApi;

    setupMocks(mockKaleidoApi, mockRgbNodeApi, (client as any).wsClient);
  });

  it('should find assets by ticker', async () => {
    const btc = await client.getAssetByTicker('BTC');
    const usdt = await client.getAssetByTicker('USDT');

    expect(btc).toMatchObject({ ticker: 'BTC', asset_id: 'btc_id' });
    expect(usdt).toMatchObject({ ticker: 'USDT', asset_id: 'usdt_id' });
  });

  it('should validate trading pairs', async () => {
    const pair = await client.getPairByTicker('BTC', 'USDT');
    
    expect(pair?.canTrade).toBe(true);
    expect(pair?.baseAsset.ticker).toBe('BTC');
    expect(pair?.quoteAsset.ticker).toBe('USDT');
  });

  it('should calculate quotes with precision handling', async () => {
    const btcAmount = 0.0001;
    const quote = await client.getQuoteByPair('BTC/USDT', btcAmount);
    
    expect(quote.rfq_id).toBe('rfq_123');
    expect(quote.fromDisplayAmount).toBe(0.0001);
    expect(quote.toDisplayAmount).toBe(5); 
    expect(mockKaleidoApi.market.getQuoteApiV1MarketQuotePost).toHaveBeenCalledWith(
      expect.objectContaining({ from_amount: 10000 })
    );
  });

  it('should execute complete swap flow', async () => {
    const result = await client.executeSwap(
      'rfq_123',
      'btc_id',
      'usdt_id',
      10000,
      5000000,
      'taker_pubkey',
      { waitForCompletion: true, pollInterval: 10, timeout: 1000 }
    );

    expect(result.payment_hash).toBe('payment_hash_123');
    expect(result.swap?.status).toBe(SwapStatus.SUCCEEDED);
    expect(mockKaleidoApi.swaps.initiateSwapApiV1SwapsInitPost).toHaveBeenCalled();
    expect(mockKaleidoApi.swaps.confirmSwapApiV1SwapsExecutePost).toHaveBeenCalled();
  });
});

function setupMocks(
  kaleidoApi: any, 
  rgbNodeApi: any, 
  wsClient: any
) {
  const assets = [
    { asset_id: 'btc_id', ticker: 'BTC', precision: 8, min_order_size: 1000, max_order_size: 1e8 },
    { asset_id: 'usdt_id', ticker: 'USDT', precision: 6, min_order_size: 1e6, max_order_size: 1e9 },
  ];

  const pairs = [{
    base_asset_id: 'btc_id', quote_asset_id: 'usdt_id', base_asset: 'BTC', quote_asset: 'USDT',
    base_precision: 8, quote_precision: 6, is_active: true,
    min_base_order_size: 1000, max_base_order_size: 1e8, min_quote_order_size: 1e6, max_quote_order_size: 1e9
  }];

  kaleidoApi.market.listAssetsApiV1MarketAssetsGet.mockResolvedValue({ assets });
  kaleidoApi.market.getPairsApiV1MarketPairsGet.mockResolvedValue({ pairs });
  kaleidoApi.market.getQuoteApiV1MarketQuotePost.mockResolvedValue({
    rfq_id: 'rfq_123', from_asset: 'btc_id', to_asset: 'usdt_id',
    from_amount: 10000, to_amount: 5000000, price: 50000, expires_at: Date.now() + 300
  });
  kaleidoApi.swaps.initiateSwapApiV1SwapsInitPost.mockResolvedValue({
    swapstring: 'swap_str', payment_hash: 'payment_hash_123'
  });
  kaleidoApi.swaps.confirmSwapApiV1SwapsExecutePost.mockResolvedValue({
    status: 'Pending', payment_hash: 'payment_hash_123'
  });
  kaleidoApi.swaps.getSwapStatusApiV1SwapsAtomicStatusPost.mockResolvedValue({
    swap: { status: SwapStatus.SUCCEEDED, payment_hash: 'payment_hash_123' }
  });
  
  rgbNodeApi.swaps.postTaker.mockResolvedValue({});
  rgbNodeApi.other.getNodeinfo.mockResolvedValue({ pubkey: 'node_pubkey' });
  
  wsClient.connect.mockResolvedValue(undefined);
  wsClient.getConnectionState.mockReturnValue(1);
}
