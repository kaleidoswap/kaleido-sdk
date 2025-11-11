import { HttpClient, HttpClientConfig } from './http/client';
import { WebSocketClient } from './websocket/client';
import WebSocket from 'ws';

import {
  Swap,
  SwapRequest,
  SwapResponse,
  AssetResponse,
  PairResponse,
  PairQuoteResponse,
  ConfirmSwapRequest,
  ConfirmSwapResponse,
  GetInfoResponseModel,
  NetworkInfoResponse,
  // RLN Types
  ListChannelsResponse,
  OpenChannelRequest,
  OpenChannelResponse,
  CloseChannelRequest,
  GetChannelIdRequest,
  GetChannelIdResponse,
  ListPeersResponse,
  ConnectPeerRequest,
  DisconnectPeerRequest,
  ListPaymentsResponse,
  GetPaymentRequest,
  GetPaymentResponse,
  SendPaymentRequest,
  SendPaymentResponse,
  KeysendRequest,
  KeysendResponse,
  LNInvoiceRequest,
  LNInvoiceResponse,
  DecodeLNInvoiceRequest,
  DecodeLNInvoiceResponse,
  InvoiceStatusRequest,
  InvoiceStatusResponse,
  AddressResponse,
  BtcBalanceRequest,
  BtcBalanceResponse,
  SendBtcRequest,
  SendBtcResponse,
  ListTransactionsRequest,
  ListTransactionsResponse,
  ListUnspentsRequest,
  ListUnspentsResponse,
  EstimateFeeRequest,
  EstimateFeeResponse,
  AssetBalanceRequest,
  AssetBalanceResponse,
  AssetMetadataRequest,
  AssetMetadataResponse,
  ListAssetsRequest,
  ListAssetsResponse,
  CreateUtxosRequest,
  ListTransfersRequest,
  ListTransfersResponse,
  FailTransfersRequest,
  FailTransfersResponse,
  RefreshRequest,
  RgbInvoiceRequest,
  RgbInvoiceResponse,
  DecodeRGBInvoiceRequest,
  DecodeRGBInvoiceResponse,
  SendAssetRequest,
  SendAssetResponse,
  IssueAssetNIARequest,
  IssueAssetNIAResponse,
  IssueAssetUDARequest,
  IssueAssetUDAResponse,
  IssueAssetCFARequest,
  IssueAssetCFAResponse,
  PostAssetMediaRequest,
  PostAssetMediaResponse,
  GetAssetMediaRequest,
  GetAssetMediaResponse,
  ListSwapsResponse,
  GetSwapRequest,
  GetSwapResponse,
  MakerInitRequest,
  MakerInitResponse,
  MakerExecuteRequest,
  TakerRequest,
  NodeInfoResponse,
  InitRequest,
  InitResponse,
  UnlockRequest,
  BackupRequest,
  RestoreRequest,
  ChangePasswordRequest,
  CheckIndexerUrlRequest,
  CheckIndexerUrlResponse,
  CheckProxyEndpointRequest,
  SignMessageRequest,
  SignMessageResponse,
  SendOnionMessageRequest,
  RevokeTokenRequest,
  EmptyResponse,
} from './index';

export interface KaleidoConfig extends Omit<HttpClientConfig, 'baseUrl'> {
  baseUrl?: string;
  nodeUrl?: string;
  wsUrl?: string;
}

export class KaleidoClient {
  private readonly apiClient: HttpClient;
  private readonly nodeClient: HttpClient | null;
  private readonly wsClient: WebSocketClient;

  constructor(config: KaleidoConfig) {
    const { nodeUrl, wsUrl, baseUrl, ...apiConfig } = config;
    const finalBaseUrl =
      baseUrl || process.env.KALEIDO_API_URL || 'https://api.regtest.kaleidoswap.com/api/v1';

    this.apiClient = new HttpClient({ ...apiConfig, baseUrl: finalBaseUrl });
    this.nodeClient = nodeUrl
      ? new HttpClient({
          ...apiConfig,
          baseUrl: nodeUrl,
        })
      : null;

    let wsBaseUrl: string;
    if (wsUrl) {
      wsBaseUrl = wsUrl;
    } else {
      const url = new URL(finalBaseUrl);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      wsBaseUrl = url.toString();
    }

    this.wsClient = new WebSocketClient({
      ...apiConfig,
      baseUrl: wsBaseUrl,
    });
  }

  private ensureNodeClient(): void {
    if (!this.nodeClient) {
      throw new Error(
        'Node URL is required for this operation. Please provide nodeUrl in the client configuration.'
      );
    }
  }

  async getLspInfo(): Promise<GetInfoResponseModel> {
    return await this.apiClient.get('/lsps1/get_info');
  }

  async getLspConnectionUrl(): Promise<string> {
    const lspInfo = await this.getLspInfo();
    return lspInfo?.lsp_connection_url;
  }

  async getLspNetworkInfo(): Promise<NetworkInfoResponse> {
    return await this.apiClient.get('/lsps1/network_info');
  }

  // Legacy method - kept for backward compatibility
  async connectPeer(connectionUrl: string): Promise<any> {
    this.ensureNodeClient();
    try {
      return await this.nodeClient!.post('/connectpeer', { peer_pubkey_and_addr: connectionUrl });
    } catch (error) {
      return await this.nodeClient!.post('/connectpeer', { peer_pubkey_and_addr: connectionUrl });
    }
  }

  // Legacy method - kept for backward compatibility
  async getAssetMetadata(assetId: string): Promise<any> {
    this.ensureNodeClient();
    try {
      return await this.nodeClient!.post('/assetmetadata', { asset_id: assetId });
    } catch (error) {
      throw new Error(
        `Failed to get asset metadata: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  // Legacy method - kept for backward compatibility
  async getNodeInfo(): Promise<NodeInfoResponse> {
    this.ensureNodeClient();
    try {
      return await this.nodeClient!.get<NodeInfoResponse>('/nodeinfo');
    } catch (error) {
      throw new Error(
        `Failed to get node info: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async getNodePubkey(): Promise<string> {
    const info = await this.getNodeInfo();
    return info.pubkey;
  }

  async assetList(): Promise<AssetResponse> {
    return await this.apiClient.get<AssetResponse>('/market/assets');
  }

  async pairList(): Promise<PairResponse> {
    return await this.apiClient.get<PairResponse>('/market/pairs');
  }

  async quoteRequest(
    fromAsset: string,
    toAsset: string,
    fromAmount?: number,
    toAmount?: number
  ): Promise<PairQuoteResponse> {
    const requestBody = fromAmount
      ? {
          from_asset: fromAsset,
          to_asset: toAsset,
          from_amount: fromAmount,
        }
      : {
          from_asset: fromAsset,
          to_asset: toAsset,
          to_amount: toAmount,
        };

    return await this.apiClient.post<PairQuoteResponse>('/market/quote', requestBody);
  }

  async quoteRequestWS(
    fromAsset: string,
    toAsset: string,
    fromAmount?: number,
    toAmount?: number
  ): Promise<PairQuoteResponse> {
    if (this.wsClient.getConnectionState() !== WebSocket.OPEN) {
      await this.wsClient.connect();
    }

    return new Promise<PairQuoteResponse>((resolve, reject) => {
      const quoteMessage = fromAmount
        ? {
            action: 'quote_request',
            from_asset: fromAsset,
            to_asset: toAsset,
            from_amount: fromAmount,
            timestamp: Math.floor(Date.now() / 1000),
          }
        : {
            action: 'quote_request',
            from_asset: fromAsset,
            to_asset: toAsset,
            to_amount: toAmount,
            timestamp: Math.floor(Date.now() / 1000),
          };

      const timeoutId = setTimeout(() => {
        this.wsClient.off('quote_response', quoteHandler);
        reject(new Error('Quote request timed out'));
      }, 30000);

      const quoteHandler = (
        response: { error?: { message?: string }; data?: PairQuoteResponse } | PairQuoteResponse
      ) => {
        clearTimeout(timeoutId);
        this.wsClient.off('quote_response', quoteHandler);

        if ('error' in response && response.error) {
          reject(new Error(response.error.message || 'Failed to get quote'));
        } else if ('data' in response && response.data) {
          resolve(response.data);
        } else {
          resolve(response as PairQuoteResponse);
        }
      };

      this.wsClient.on('quote_response', quoteHandler);

      this.wsClient.send(quoteMessage).catch(error => {
        clearTimeout(timeoutId);
        this.wsClient.off('quote_response', quoteHandler);
        reject(new Error(`Failed to send quote request: ${error.message}`));
      });
    });
  }

  async initMakerSwap(request: SwapRequest): Promise<SwapResponse> {
    return await this.apiClient.post<SwapResponse>('/swaps/init', {
      rfq_id: request.rfq_id,
      from_asset: request.from_asset,
      to_asset: request.to_asset,
      from_amount: request.from_amount,
      to_amount: request.to_amount,
    });
  }

  async executeMakerSwap(request: ConfirmSwapRequest): Promise<ConfirmSwapResponse> {
    return await this.apiClient.post<ConfirmSwapResponse>('/swaps/execute', {
      swapstring: request.swapstring,
      payment_hash: request.payment_hash,
      taker_pubkey: request.taker_pubkey,
    });
  }

  async whitelistTrade(swapstring: string): Promise<Record<string, never>> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<Record<string, never>>('/taker', {
      swapstring,
    });
  }

  async atomicSwapStatus(orderId: any): Promise<Swap> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<Swap>(`/swaps/atomic/status`, {
      order_id: orderId,
    });
  }

  async waitForSwapCompletion(
    paymentHash: string,
    timeoutSeconds = 300,
    pollIntervalSeconds = 5
  ): Promise<Swap> {
    const startTime = Date.now();
    const timeoutMs = timeoutSeconds * 1000;
    const pollIntervalMs = pollIntervalSeconds * 1000;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const swap = await this.atomicSwapStatus(paymentHash);

      // Check if swap has reached a terminal state
      if (swap.status && ['Succeeded', 'Failed', 'Expired'].includes(swap.status)) {
        return swap;
      }

      // Check if we've exceeded the timeout
      if (Date.now() - startTime >= timeoutMs) {
        throw new Error(`Swap ${paymentHash} did not complete within ${timeoutSeconds} seconds`);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollIntervalMs));
    }
  }

  async createOrder(request: object): Promise<any> {
    return await this.apiClient.post<any>('/swaps/orders', request);
  }

  async swapOrderStatus(orderId: string): Promise<any> {
    return await this.apiClient.post<any>('/swaps/orders/status', {
      order_id: orderId,
    });
  }

  async swapOrderAnalytic(): Promise<any> {
    return await this.apiClient.get<any>('/swaps/orders/analytics');
  }

  // ============================================================================
  // RLN API Methods - Channels
  // ============================================================================

  /**
   * List all Lightning Network channels
   */
  async listChannels(): Promise<ListChannelsResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.get<ListChannelsResponse>('/listchannels');
  }

  /**
   * Open a new Lightning Network channel
   */
  async openChannel(request: OpenChannelRequest): Promise<OpenChannelResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<OpenChannelResponse>('/openchannel', request);
  }

  /**
   * Close a Lightning Network channel
   */
  async closeChannel(request: CloseChannelRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/closechannel', request);
  }

  /**
   * Get a channel's ID from its temporary channel ID
   */
  async getChannelId(request: GetChannelIdRequest): Promise<GetChannelIdResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<GetChannelIdResponse>('/getchannelid', request);
  }

  // ============================================================================
  // RLN API Methods - Peers
  // ============================================================================

  /**
   * List all Lightning Network peers
   */
  async listPeers(): Promise<ListPeersResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.get<ListPeersResponse>('/listpeers');
  }

  /**
   * Connect to a Lightning Network peer (typed version)
   */
  async connectPeerTyped(request: ConnectPeerRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/connectpeer', request);
  }

  /**
   * Disconnect from a Lightning Network peer
   */
  async disconnectPeer(request: DisconnectPeerRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/disconnectpeer', request);
  }

  // ============================================================================
  // RLN API Methods - Payments
  // ============================================================================

  /**
   * List all Lightning Network payments
   */
  async listPayments(): Promise<ListPaymentsResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.get<ListPaymentsResponse>('/listpayments');
  }

  /**
   * Get a payment by its payment hash
   */
  async getPayment(request: GetPaymentRequest): Promise<GetPaymentResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<GetPaymentResponse>('/getpayment', request);
  }

  /**
   * Send a payment using a Lightning Network invoice
   */
  async sendPayment(request: SendPaymentRequest): Promise<SendPaymentResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<SendPaymentResponse>('/sendpayment', request);
  }

  /**
   * Send a spontaneous payment (keysend) to a peer
   */
  async keysend(request: KeysendRequest): Promise<KeysendResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<KeysendResponse>('/keysend', request);
  }

  // ============================================================================
  // RLN API Methods - Invoices
  // ============================================================================

  /**
   * Create a Lightning Network invoice
   */
  async createLNInvoice(request: LNInvoiceRequest): Promise<LNInvoiceResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<LNInvoiceResponse>('/lninvoice', request);
  }

  /**
   * Decode a Lightning Network invoice
   */
  async decodeLNInvoice(request: DecodeLNInvoiceRequest): Promise<DecodeLNInvoiceResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<DecodeLNInvoiceResponse>('/decodelninvoice', request);
  }

  /**
   * Get the status of a Lightning Network invoice
   */
  async getInvoiceStatus(request: InvoiceStatusRequest): Promise<InvoiceStatusResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<InvoiceStatusResponse>('/invoicestatus', request);
  }

  // ============================================================================
  // RLN API Methods - On-chain
  // ============================================================================

  /**
   * Get a new Bitcoin address from the internal BDK wallet
   */
  async getAddress(): Promise<AddressResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<AddressResponse>('/address', {});
  }

  /**
   * Get the Bitcoin balance for vanilla and colored wallets
   */
  async getBtcBalance(request?: BtcBalanceRequest): Promise<BtcBalanceResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<BtcBalanceResponse>('/btcbalance', request || {});
  }

  /**
   * Send bitcoins on-chain
   */
  async sendBtc(request: SendBtcRequest): Promise<SendBtcResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<SendBtcResponse>('/sendbtc', request);
  }

  /**
   * List on-chain transactions
   */
  async listTransactions(request?: ListTransactionsRequest): Promise<ListTransactionsResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<ListTransactionsResponse>(
      '/listtransactions',
      request || {}
    );
  }

  /**
   * List unspent outputs of the internal BDK wallet
   */
  async listUnspents(request?: ListUnspentsRequest): Promise<ListUnspentsResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<ListUnspentsResponse>('/listunspents', request || {});
  }

  /**
   * Get on-chain fee estimation
   */
  async estimateFee(request: EstimateFeeRequest): Promise<EstimateFeeResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EstimateFeeResponse>('/estimatefee', request);
  }

  // ============================================================================
  // RLN API Methods - RGB
  // ============================================================================

  /**
   * Get the balance of an RGB asset
   */
  async getAssetBalance(request: AssetBalanceRequest): Promise<AssetBalanceResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<AssetBalanceResponse>('/assetbalance', request);
  }

  /**
   * Get the metadata of an RGB asset (typed version)
   */
  async getAssetMetadataTyped(request: AssetMetadataRequest): Promise<AssetMetadataResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<AssetMetadataResponse>('/assetmetadata', request);
  }

  /**
   * List all RGB assets
   */
  async listAssets(request?: ListAssetsRequest): Promise<ListAssetsResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<ListAssetsResponse>('/listassets', request || {});
  }

  /**
   * Create UTXOs for RGB operations
   */
  async createUtxos(request: CreateUtxosRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/createutxos', request);
  }

  /**
   * List RGB transfers
   */
  async listTransfers(request?: ListTransfersRequest): Promise<ListTransfersResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<ListTransfersResponse>('/listtransfers', request || {});
  }

  /**
   * Fail eligible RGB transfers
   */
  async failTransfers(request?: FailTransfersRequest): Promise<FailTransfersResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<FailTransfersResponse>('/failtransfers', request || {});
  }

  /**
   * Refresh RGB pending transfers
   */
  async refreshTransfers(request?: RefreshRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/refreshtransfers', request || {});
  }

  /**
   * Sync the RGB wallet
   */
  async syncRgbWallet(): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/sync', {});
  }

  /**
   * Create an RGB invoice to receive assets on-chain
   */
  async createRgbInvoice(request: RgbInvoiceRequest): Promise<RgbInvoiceResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<RgbInvoiceResponse>('/rgbinvoice', request);
  }

  /**
   * Decode an RGB invoice
   */
  async decodeRgbInvoice(request: DecodeRGBInvoiceRequest): Promise<DecodeRGBInvoiceResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<DecodeRGBInvoiceResponse>('/decodergbinvoice', request);
  }

  /**
   * Send RGB assets on-chain
   */
  async sendAsset(request: SendAssetRequest): Promise<SendAssetResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<SendAssetResponse>('/sendasset', request);
  }

  /**
   * Issue an RGB NIA asset
   */
  async issueAssetNIA(request: IssueAssetNIARequest): Promise<IssueAssetNIAResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<IssueAssetNIAResponse>('/issueassetnia', request);
  }

  /**
   * Issue an RGB UDA asset
   */
  async issueAssetUDA(request: IssueAssetUDARequest): Promise<IssueAssetUDAResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<IssueAssetUDAResponse>('/issueassetuda', request);
  }

  /**
   * Issue an RGB CFA asset
   */
  async issueAssetCFA(request: IssueAssetCFARequest): Promise<IssueAssetCFAResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<IssueAssetCFAResponse>('/issueassetcfa', request);
  }

  /**
   * Post asset media (for CFA and UDA assets)
   * Note: This endpoint uses multipart/form-data
   */
  async postAssetMedia(request: PostAssetMediaRequest): Promise<PostAssetMediaResponse> {
    this.ensureNodeClient();
    // For multipart/form-data, we need to use FormData
    const formData = new FormData();

    // Convert different types to Blob for FormData
    let blob: Blob;
    if (request.file instanceof File || request.file instanceof Blob) {
      blob = request.file;
    } else if (request.file instanceof ArrayBuffer) {
      blob = new Blob([request.file]);
    } else if (request.file instanceof Uint8Array) {
      // Uint8Array can be used directly in Blob constructor
      blob = new Blob([request.file as any]);
    } else {
      throw new Error('Unsupported file type. Expected File, Blob, ArrayBuffer, or Uint8Array');
    }

    formData.append('file', blob);

    const url = `${this.nodeClient!['baseUrl']}/postassetmedia`;
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      headers: this.nodeClient!['apiKey']
        ? {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            Authorization: `Bearer ${this.nodeClient!['apiKey']}`,
          }
        : {},
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Get asset media by digest
   */
  async getAssetMedia(request: GetAssetMediaRequest): Promise<GetAssetMediaResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<GetAssetMediaResponse>('/getassetmedia', request);
  }

  // ============================================================================
  // RLN API Methods - Swaps
  // ============================================================================

  /**
   * List all swaps (maker and taker)
   */
  async listSwaps(): Promise<ListSwapsResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.get<ListSwapsResponse>('/listswaps');
  }

  /**
   * Get a swap by payment hash
   */
  async getSwap(request: GetSwapRequest): Promise<GetSwapResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<GetSwapResponse>('/getswap', request);
  }

  /**
   * Initialize a maker swap
   */
  async makerInit(request: MakerInitRequest): Promise<MakerInitResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<MakerInitResponse>('/makerinit', request);
  }

  /**
   * Execute a maker swap
   */
  async makerExecute(request: MakerExecuteRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/makerexecute', request);
  }

  /**
   * Accept a swap as taker
   */
  async taker(request: TakerRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/taker', request);
  }

  // ============================================================================
  // RLN API Methods - Other
  // ============================================================================

  /**
   * Initialize a new node
   */
  async initNode(request: InitRequest): Promise<InitResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<InitResponse>('/init', request);
  }

  /**
   * Unlock a locked node
   */
  async unlockNode(request: UnlockRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/unlock', request);
  }

  /**
   * Lock an unlocked node
   */
  async lockNode(): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/lock', {});
  }

  // getNodeInfo is already defined above for backward compatibility

  /**
   * Get network information
   */
  async getNetworkInfo(): Promise<NetworkInfoResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.get<NetworkInfoResponse>('/networkinfo');
  }

  /**
   * Backup the node
   */
  async backupNode(request: BackupRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/backup', request);
  }

  /**
   * Restore the node from a backup
   */
  async restoreNode(request: RestoreRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/restore', request);
  }

  /**
   * Change the node password
   */
  async changePassword(request: ChangePasswordRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/changepassword', request);
  }

  /**
   * Check if an indexer URL is valid
   */
  async checkIndexerUrl(request: CheckIndexerUrlRequest): Promise<CheckIndexerUrlResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<CheckIndexerUrlResponse>('/checkindexerurl', request);
  }

  /**
   * Check if a proxy endpoint is valid
   */
  async checkProxyEndpoint(request: CheckProxyEndpointRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/checkproxyendpoint', request);
  }

  /**
   * Sign a message
   */
  async signMessage(request: SignMessageRequest): Promise<SignMessageResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<SignMessageResponse>('/signmessage', request);
  }

  /**
   * Send an onion message via Lightning Network
   */
  async sendOnionMessage(request: SendOnionMessageRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/sendonionmessage', request);
  }

  /**
   * Revoke an authentication token
   */
  async revokeToken(request: RevokeTokenRequest): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/revoketoken', request);
  }

  /**
   * Gracefully shutdown the node
   */
  async shutdownNode(): Promise<EmptyResponse> {
    this.ensureNodeClient();
    return await this.nodeClient!.post<EmptyResponse>('/shutdown', {});
  }
}
