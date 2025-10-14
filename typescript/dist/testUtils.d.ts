import { KaleidoClient } from './client';
import type { OnchainTradingPairResponse, OrderResponse } from './client';
import { SwapRequest, SwapResponse, ClientAsset } from './index';
interface TestConfig {
    nodeUrl: string;
    baseUrl: string;
    apiKey: string;
}
interface AssetPairIds {
    baseAssetId: string;
    quoteAssetId: string;
}
export declare const testConfig: TestConfig & {
    wsUrl?: string;
};
export declare const testOnchainConfig: {
    baseUrl: string;
    nodeUrl: string;
    apiKey: string;
    wsUrl?: string;
};
export declare const createTestClient: (isOnchain?: boolean) => KaleidoClient;
export declare const getTestRgbAsset: (client: KaleidoClient) => Promise<ClientAsset>;
export declare const getTestTradingPair: (client: KaleidoClient) => Promise<OnchainTradingPairResponse>;
export declare const createTestOrder: (client: KaleidoClient) => Promise<OrderResponse>;
export declare const getPairAssetIds: (client: KaleidoClient) => Promise<AssetPairIds>;
export declare const assetListResponse: (client: KaleidoClient) => Promise<{
    fromAsset: string;
    toAsset: string;
    fromAmount: number;
}>;
export declare const testWhiteListTrade: (client: KaleidoClient, maxRetries?: number, retryDelay?: number) => Promise<(SwapRequest & SwapResponse) | null>;
export declare const withWebSocketTest: (testFn: (client: KaleidoClient) => Promise<void>, timeout?: number) => Promise<void>;
export {};
