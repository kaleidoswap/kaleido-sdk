import { HttpClientConfig } from './http/client';
import { AssetResponse, TradingPair, PairResponse, PairQuoteResponse, SwapRequest, ConfirmSwapRequest, ConfirmSwapResponse, Swap, ClientAsset, Pair } from './index';
export type OrderStatusType = 'pending' | 'payment_pending' | 'payment_confirmed' | 'processing' | 'completed' | 'failed' | 'expired' | 'cancelled';
export interface OrderCreate {
    from_asset_type: 'btc' | 'rgb';
    from_asset_id?: string;
    from_amount: number;
    to_asset_type: 'btc' | 'rgb';
    to_asset_id?: string;
    session_id?: string;
}
export interface OrderResponse {
    id: number;
    order_id: string;
    from_asset_type: 'btc' | 'rgb';
    from_asset_id: string | null;
    from_amount: number;
    to_asset_type: 'btc' | 'rgb';
    to_asset_id: string | null;
    to_amount: number;
    exchange_rate: number;
    service_fee: number;
    network_fee: number;
    deposit_address: string | null;
    deposit_rgb_invoice: string | null;
    payout_address: string | null;
    payout_rgb_invoice: string | null;
    status: OrderStatusType;
    payment_txid: string | null;
    payout_txid: string | null;
    created_at: string;
    updated_at: string | null;
    expires_at: string;
    session_id: string | null;
}
export interface OrderPaymentUpdate {
    payout_address?: string;
    payout_rgb_invoice?: string;
}
export interface APIResponse {
    success: boolean;
    message: string;
    data?: Record<string, any> | null;
}
export interface WalletStatus {
    is_online: boolean;
    btc_balance: number;
    btc_spendable: number;
    last_sync: string | null;
    sync_height: number;
    next_address_index: number;
}
export interface AssetBalance {
    asset_id: string;
    settled: number;
    future: number;
    spendable: number;
}
export interface WalletBalances {
    btc_balance: number;
    btc_spendable: number;
    rgb_balances: AssetBalance[];
}
export interface OrderQuote {
    from_asset_type: 'btc' | 'rgb';
    from_asset_id?: string | null;
    from_amount: number;
    to_asset_type: 'btc' | 'rgb';
    to_asset_id?: string | null;
    to_amount: number;
    exchange_rate: number;
    service_fee: number;
    network_fee: number;
    total_fee: number;
    valid_for_seconds: number;
}
export interface MarketPrice {
    pair: string;
    price: number;
    volume_24h?: number;
    price_change_24h?: number;
}
export interface FeeEstimate {
    service_fee: number;
    network_fee: number;
    total_fee: number;
}
export interface OnchainTradingPairResponse extends Pair {
    is_active: boolean;
    min_trade_amount: number;
    max_trade_amount: number | null;
    last_price: number | null;
    volume_24h: number | null;
    price_change_24h: number | null;
    maker_fee: number | null;
    taker_fee: number | null;
    description: string | null;
    created_at: string;
    updated_at: string | null;
}
export interface OnchainTradingPairCreate {
    base_asset: string;
    quote_asset: string;
    base_asset_id: string;
    quote_asset_id: string;
    is_active?: boolean;
    min_trade_amount?: number;
    max_trade_amount?: number | null;
}
export interface KaleidoConfig extends HttpClientConfig {
    nodeUrl: string;
    wsUrl?: string;
}
export declare class KaleidoClient {
    private readonly apiClient;
    private readonly nodeClient;
    private readonly wsClient;
    constructor(config: KaleidoConfig);
    getLspInfo(): Promise<any>;
    getLspConnectionUrl(): Promise<any>;
    getLspNetworkInfo(): Promise<any>;
    createOrder(order: any): Promise<any>;
    getOrder(orderId: string): Promise<any>;
    connectPeer(connectionUrl: string): Promise<any>;
    listPeers(): Promise<any>;
    getOnchainAddress(): Promise<any>;
    getAssetMetadata(assetId: string): Promise<any>;
    getNodeInfo(): Promise<{
        pubkey: string;
    }>;
    getNodePubkey(): Promise<string>;
    listAssets(): Promise<AssetResponse>;
    listPairs(): Promise<PairResponse>;
    getPairByAssets(baseAsset: string, quoteAsset: string): Promise<TradingPair | null>;
    getQuote(fromAsset: string, toAsset: string, fromAmount: number): Promise<PairQuoteResponse>;
    getQuoteWS(fromAsset: string, toAsset: string, fromAmount: number): Promise<PairQuoteResponse>;
    initMakerSwap(rfqId: string, fromAsset: string, toAsset: string, fromAmount: number, toAmount: number): Promise<SwapRequest>;
    executeMakerSwap(request: ConfirmSwapRequest): Promise<ConfirmSwapResponse>;
    whitelistTrade(swapstring: string): Promise<Record<string, never>>;
    getSwapStatus(paymentHash: string): Promise<Swap>;
    /**
     * Waits for a swap to reach a terminal state (Succeeded, Failed, or Expired)
     * @param paymentHash - The payment hash of the swap to monitor
     * @param timeoutSeconds - Maximum time to wait in seconds (default: 300)
     * @param pollIntervalSeconds - Time between status checks in seconds (default: 5)
     * @returns Promise that resolves with the final swap status
     * @throws {TimeoutError} If the swap doesn't complete within the timeout
     * @throws {SwapError} If there's an error checking the swap status
     */
    waitForSwapCompletion(paymentHash: string, timeoutSeconds?: number, pollIntervalSeconds?: number): Promise<Swap>;
    onchainListAssets(): Promise<ClientAsset[]>;
    onchainGetAsset(assetId: string): Promise<ClientAsset>;
    onchainListSupportedAssets(): Promise<ClientAsset[]>;
    onchainGetAssetBalance(assetId: string): Promise<{
        balance: number;
    }>;
    onchainListTradingPairs(): Promise<OnchainTradingPairResponse[]>;
    onchainCreateTradingPair(pair: OnchainTradingPairCreate): Promise<OnchainTradingPairResponse>;
    onchainGetPairTickers(): Promise<string[]>;
    onchainGetTradingPair(pairId: string): Promise<OnchainTradingPairResponse>;
    onchainGetTradingPairByAssets(baseAsset: string, quoteAsset: string): Promise<OnchainTradingPairResponse>;
    onchainCreateOrder(order: OrderCreate): Promise<OrderResponse>;
    onchainGetOrder(orderId: string): Promise<OrderResponse>;
    onchainUpdateOrderPayment(orderId: string, payment: OrderPaymentUpdate): Promise<OrderResponse>;
    onchainCancelOrder(orderId: string): Promise<APIResponse>;
    onchainGetOrdersByStatus(status: OrderStatusType): Promise<OrderResponse[]>;
    onchainGetExpiredOrders(): Promise<OrderResponse[]>;
    onchainGetOrderStatistics(): Promise<Record<string, any>>;
    onchainGetWalletStatus(): Promise<WalletStatus>;
    onchainGetWalletBalances(): Promise<WalletBalances>;
    onchainSyncWallet(): Promise<APIResponse>;
    onchainCreateAllocations(numAllocations?: number): Promise<Record<string, any>>;
    onchainGetNewAddress(): Promise<Record<string, any>>;
    onchainGenerateRgbInvoice(assetId: string, amount?: number): Promise<Record<string, any>>;
    onchainGetBtcTransactions(limit?: number): Promise<Record<string, any>>;
    onchainValidateBitcoinAddress(address: string): Promise<Record<string, any>>;
    onchainValidateRgbInvoice(invoice: string): Promise<Record<string, any>>;
    onchainGetQuote(fromAssetType: 'btc' | 'rgb', toAssetType: 'btc' | 'rgb', fromAmount: number, fromAssetId?: string, toAssetId?: string): Promise<OrderQuote>;
    onchainGetMarketPrices(): Promise<MarketPrice[]>;
    onchainGetPairPrice(pair: string): Promise<Record<string, any>>;
    onchainEstimateFees(fromAssetType: 'btc' | 'rgb', toAssetType: 'btc' | 'rgb', fromAmount: number): Promise<FeeEstimate>;
    onchainGetQuotesHealth(): Promise<Record<string, any>>;
    onchainRefreshPrices(): Promise<APIResponse>;
    getSwapOrderStatus(orderId: string): Promise<any>;
}
