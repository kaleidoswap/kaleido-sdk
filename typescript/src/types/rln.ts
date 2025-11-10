/**
 * TypeScript types for RGB Lightning Node (RLN) API
 * Generated from OpenAPI specification
 */

// ============================================================================
// Enums
// ============================================================================

export enum AssetSchema {
  Nia = 'Nia',
  Uda = 'Uda',
  Cfa = 'Cfa',
}

export enum BitcoinNetwork {
  Mainnet = 'Mainnet',
  Testnet = 'Testnet',
  Signet = 'Signet',
  Regtest = 'Regtest',
}

export enum ChannelStatus {
  Opening = 'Opening',
  Opened = 'Opened',
  Closing = 'Closing',
}

export enum HTLCStatus {
  Pending = 'Pending',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
}

export enum InvoiceStatus {
  Pending = 'Pending',
  Succeeded = 'Succeeded',
  Failed = 'Failed',
  Expired = 'Expired',
}

export enum SwapStatus {
  Waiting = 'Waiting',
  Pending = 'Pending',
  Succeeded = 'Succeeded',
  Expired = 'Expired',
  Failed = 'Failed',
}

export enum TransferStatus {
  WaitingCounterparty = 'WaitingCounterparty',
  WaitingConfirmations = 'WaitingConfirmations',
  Settled = 'Settled',
  Failed = 'Failed',
}

export enum TransferKind {
  Issuance = 'Issuance',
  ReceiveBlind = 'ReceiveBlind',
  ReceiveWitness = 'ReceiveWitness',
  Send = 'Send',
}

export enum TransactionType {
  RgbSend = 'RgbSend',
  Drain = 'Drain',
  CreateUtxos = 'CreateUtxos',
  User = 'User',
}

export enum RecipientType {
  Blind = 'Blind',
  Witness = 'Witness',
}

export enum IndexerProtocol {
  Electrum = 'Electrum',
  Esplora = 'Esplora',
}

export enum TransportType {
  JsonRpc = 'JsonRpc',
}

// ============================================================================
// Assignment Types
// ============================================================================

export interface AssignmentFungible {
  type: 'Fungible';
  value: number;
}

export interface AssignmentNonFungible {
  type: 'NonFungible';
}

export interface AssignmentInflationRight {
  type: 'InflationRight';
  value: number;
}

export interface AssignmentReplaceRight {
  type: 'ReplaceRight';
}

export interface AssignmentAny {
  type: 'Any';
}

export type Assignment =
  | AssignmentFungible
  | AssignmentNonFungible
  | AssignmentInflationRight
  | AssignmentReplaceRight
  | AssignmentAny;

// ============================================================================
// Common Types
// ============================================================================

export interface BlockTime {
  height: number;
  timestamp: number;
}

export interface Media {
  file_path?: string;
  mime?: string;
}

export interface EmbeddedMedia {
  mime: string;
  data: number[];
}

export interface ProofOfReserves {
  utxo: string;
  proof: number[];
}

export interface Token {
  index: number;
  ticker: string;
  name: string;
  details: string;
  embedded_media?: EmbeddedMedia;
  media?: Media;
  attachments?: Record<string, Media>;
  reserves?: ProofOfReserves;
}

export interface TokenLight {
  index: number;
  ticker: string;
  name: string;
  details: string;
  embedded_media?: boolean;
  media?: Media;
  attachments?: Record<string, Media>;
  reserves?: boolean;
}

export interface RgbAllocation {
  asset_id: string;
  assignment: AssignmentFungible;
  settled: boolean;
}

export interface Utxo {
  outpoint: string;
  btc_amount: number;
  colorable: boolean;
}

export interface Unspent {
  utxo: Utxo;
  rgb_allocations: RgbAllocation[];
}

export interface WitnessData {
  amount_sat: number;
  blinding: number;
}

export interface TransferTransportEndpoint {
  endpoint: string;
  transport_type: TransportType;
  used: boolean;
}

// ============================================================================
// Channels
// ============================================================================

export interface Channel {
  channel_id: string;
  funding_txid: string;
  peer_pubkey: string;
  peer_alias?: string | null;
  short_channel_id: number;
  status: ChannelStatus;
  ready: boolean;
  capacity_sat: number;
  local_balance_sat: number;
  outbound_balance_msat: number;
  inbound_balance_msat: number;
  next_outbound_htlc_limit_msat: number;
  next_outbound_htlc_minimum_msat: number;
  is_usable: boolean;
  public: boolean;
  asset_id?: string;
  asset_local_amount?: number;
  asset_remote_amount?: number;
}

export interface ListChannelsResponse {
  channels: Channel[];
}

export interface OpenChannelRequest {
  peer_pubkey_and_opt_addr: string;
  capacity_sat: number;
  push_msat?: number;
  asset_amount?: number;
  asset_id?: string;
  public?: boolean;
  with_anchors?: boolean;
  fee_base_msat?: number;
  fee_proportional_millionths?: number;
  temporary_channel_id?: string;
}

export interface OpenChannelResponse {
  temporary_channel_id: string;
}

export interface CloseChannelRequest {
  channel_id: string;
  peer_pubkey: string;
  force?: boolean;
}

export interface GetChannelIdRequest {
  temporary_channel_id: string;
}

export interface GetChannelIdResponse {
  channel_id: string;
}

// ============================================================================
// Peers
// ============================================================================

export interface Peer {
  pubkey: string;
}

export interface ListPeersResponse {
  peers: Peer[];
}

export interface ConnectPeerRequest {
  peer_pubkey_and_addr: string;
}

export interface DisconnectPeerRequest {
  peer_pubkey: string;
}

// ============================================================================
// Payments
// ============================================================================

export interface Payment {
  amt_msat: number;
  asset_amount?: number;
  asset_id?: string;
  payment_hash: string;
  inbound: boolean;
  status: HTLCStatus;
  created_at: number;
  updated_at: number;
  payee_pubkey?: string;
}

export interface ListPaymentsResponse {
  payments: Payment[];
}

export interface GetPaymentRequest {
  payment_hash: string;
}

export interface GetPaymentResponse {
  payment: Payment;
}

export interface SendPaymentRequest {
  invoice: string;
}

export interface SendPaymentResponse {
  payment_hash: string;
  payment_secret: string;
  status: HTLCStatus;
}

export interface KeysendRequest {
  dest_pubkey: string;
  amt_msat: number;
  asset_id?: string;
  asset_amount?: number;
}

export interface KeysendResponse {
  payment_hash: string;
  payment_preimage: string;
  status: HTLCStatus;
}

// ============================================================================
// Invoices
// ============================================================================

export interface LNInvoiceRequest {
  amt_msat: number;
  expiry_sec?: number;
  asset_id?: string;
  asset_amount?: number;
}

export interface LNInvoiceResponse {
  invoice: string;
}

export interface DecodeLNInvoiceRequest {
  invoice: string;
}

export interface DecodeLNInvoiceResponse {
  amt_msat: number;
  expiry_sec: number;
  timestamp: number;
  asset_id?: string;
  asset_amount?: number;
  payment_hash: string;
  payment_secret: string;
  payee_pubkey: string;
  network: BitcoinNetwork;
}

export interface InvoiceStatusRequest {
  invoice: string;
}

export interface InvoiceStatusResponse {
  status: InvoiceStatus;
}

// ============================================================================
// On-chain
// ============================================================================

export interface AddressResponse {
  address: string;
}

export interface BtcBalance {
  settled: number;
  future: number;
  spendable: number;
}

export interface BtcBalanceRequest {
  skip_sync?: boolean;
}

export interface BtcBalanceResponse {
  vanilla: BtcBalance;
  colored: BtcBalance;
}

export interface SendBtcRequest {
  amount: number;
  address: string;
  fee_rate?: number;
  skip_sync?: boolean;
}

export interface SendBtcResponse {
  txid: string;
}

export interface Transaction {
  transaction_type: TransactionType;
  txid: string;
  received: number;
  sent: number;
  fee: number;
  confirmation_time?: BlockTime;
}

export interface ListTransactionsRequest {
  skip_sync?: boolean;
}

export interface ListTransactionsResponse {
  transactions: Transaction[];
}

export interface ListUnspentsRequest {
  skip_sync?: boolean;
}

export interface ListUnspentsResponse {
  unspents: Unspent[];
}

export interface EstimateFeeRequest {
  blocks: number;
}

export interface EstimateFeeResponse {
  fee_rate: number;
}

// ============================================================================
// RGB
// ============================================================================

export interface AssetBalanceRequest {
  asset_id: string;
}

export interface AssetBalanceResponse {
  settled: number;
  future: number;
  spendable: number;
  offchain_outbound: number;
  offchain_inbound: number;
}

export interface AssetMetadataRequest {
  asset_id: string;
}

export interface AssetMetadataResponse {
  asset_schema: AssetSchema;
  issued_supply: number;
  timestamp: number;
  name?: string;
  precision: number;
  ticker?: string;
  details?: string;
  token?: Token;
}

export interface AssetNIA {
  asset_id: string;
  ticker: string;
  name: string;
  details?: string;
  precision: number;
  issued_supply: number;
  timestamp: number;
  added_at: number;
  balance: AssetBalanceResponse;
  media?: Media;
}

export interface AssetUDA {
  asset_id: string;
  ticker: string;
  name: string;
  details?: string;
  precision: number;
  issued_supply: number;
  timestamp: number;
  added_at: number;
  balance: AssetBalanceResponse;
  token: TokenLight;
}

export interface AssetCFA {
  asset_id: string;
  name: string;
  details?: string;
  precision: number;
  issued_supply: number;
  timestamp: number;
  added_at: number;
  balance: AssetBalanceResponse;
  media?: Media;
}

export interface ListAssetsRequest {
  filter_asset_schemas?: AssetSchema[];
}

export interface ListAssetsResponse {
  nia: AssetNIA[];
  uda: AssetUDA[];
  cfa: AssetCFA[];
}

export interface CreateUtxosRequest {
  up_to?: boolean;
  num?: number;
  size?: number;
  fee_rate?: number;
  skip_sync?: boolean;
}

export interface Transfer {
  idx: number;
  created_at: number;
  updated_at: number;
  status: TransferStatus;
  requested_assignment: AssignmentFungible;
  assignments: AssignmentFungible[];
  kind: TransferKind;
  txid?: string;
  recipient_id?: string;
  receive_utxo?: string;
  change_utxo?: string | null;
  expiration?: number;
  transport_endpoints?: TransferTransportEndpoint[];
}

export interface ListTransfersRequest {
  asset_id?: string;
}

export interface ListTransfersResponse {
  transfers: Transfer[];
}

export interface FailTransfersRequest {
  batch_transfer_idx?: number | null;
  no_asset_only?: boolean;
  skip_sync?: boolean;
}

export interface FailTransfersResponse {
  transfers_changed: boolean;
}

export interface RefreshRequest {
  skip_sync?: boolean;
}

export interface RgbInvoiceRequest {
  min_confirmations?: number;
  asset_id?: string;
  assignment?: Assignment;
  duration_seconds?: number;
  witness?: boolean;
}

export interface RgbInvoiceResponse {
  recipient_id: string;
  invoice: string;
  expiration_timestamp: number;
  batch_transfer_idx: number;
}

export interface DecodeRGBInvoiceRequest {
  invoice: string;
}

export interface DecodeRGBInvoiceResponse {
  recipient_id: string;
  recipient_type: RecipientType;
  asset_schema?: AssetSchema;
  asset_id?: string;
  assignment?: Assignment;
  network: BitcoinNetwork;
  expiration_timestamp?: number;
  transport_endpoints?: string[];
}

export interface SendAssetRequest {
  asset_id: string;
  assignment: AssignmentFungible;
  recipient_id: string;
  witness_data?: WitnessData;
  donation?: boolean;
  fee_rate?: number;
  min_confirmations?: number;
  transport_endpoints?: string[];
  skip_sync?: boolean;
}

export interface SendAssetResponse {
  txid: string;
}

export interface IssueAssetNIARequest {
  amounts: number[];
  ticker: string;
  name: string;
  precision: number;
}

export interface IssueAssetNIAResponse {
  asset: AssetNIA;
}

export interface IssueAssetUDARequest {
  ticker: string;
  name: string;
  details?: string;
  precision: number;
  media_file_digest?: string;
  attachments_file_digests?: string[];
}

export interface IssueAssetUDAResponse {
  asset: AssetUDA;
}

export interface IssueAssetCFARequest {
  amounts: number[];
  name: string;
  details?: string;
  precision: number;
  file_digest?: string;
}

export interface IssueAssetCFAResponse {
  asset: AssetCFA;
}

export interface PostAssetMediaRequest {
  file: File | Blob | ArrayBuffer | Uint8Array;
}

export interface PostAssetMediaResponse {
  digest: string;
}

export interface GetAssetMediaRequest {
  digest: string;
}

export interface GetAssetMediaResponse {
  bytes_hex: string;
}

// ============================================================================
// Swaps
// ============================================================================

export interface Swap {
  qty_from: number;
  qty_to: number;
  from_asset: string;
  to_asset: string;
  payment_hash: string;
  status: SwapStatus;
  requested_at: number;
  initiated_at?: number;
  expires_at?: number;
  completed_at?: number;
}

export interface ListSwapsResponse {
  maker: Swap[];
  taker: Swap[];
}

export interface GetSwapRequest {
  payment_hash: string;
  taker: boolean;
}

export interface GetSwapResponse {
  swap: Swap;
}

export interface MakerInitRequest {
  qty_from: number;
  qty_to: number;
  from_asset: string;
  to_asset: string;
  timeout_sec: number;
}

export interface MakerInitResponse {
  payment_hash: string;
  payment_secret: string;
  swapstring: string;
}

export interface MakerExecuteRequest {
  swapstring: string;
  payment_secret: string;
  taker_pubkey: string;
}

export interface TakerRequest {
  swapstring: string;
}

// ============================================================================
// Other
// ============================================================================

export interface NodeInfoResponse {
  pubkey: string;
  num_channels: number;
  num_usable_channels: number;
  local_balance_sat: number;
  eventual_close_fees_sat: number;
  pending_outbound_payments_sat: number;
  num_peers: number;
  account_xpub_vanilla: string;
  account_xpub_colored: string;
  max_media_upload_size_mb: number;
  rgb_htlc_min_msat: number;
  rgb_channel_capacity_min_sat: number;
  channel_capacity_min_sat: number;
  channel_capacity_max_sat: number;
  channel_asset_min_amount: number;
  channel_asset_max_amount: number;
  network_nodes: number;
  network_channels: number;
}

export interface NetworkInfoResponse {
  network: BitcoinNetwork;
  height: number;
}

export interface InitRequest {
  password: string;
}

export interface InitResponse {
  mnemonic: string;
}

export interface UnlockRequest {
  password: string;
  bitcoind_rpc_username?: string;
  bitcoind_rpc_password?: string;
  bitcoind_rpc_host?: string;
  bitcoind_rpc_port?: number;
  indexer_url?: string;
  proxy_endpoint?: string;
  announce_addresses?: string[];
  announce_alias?: string;
}

export interface BackupRequest {
  backup_path: string;
  password: string;
}

export interface RestoreRequest {
  backup_path: string;
  password: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface CheckIndexerUrlRequest {
  indexer_url: string;
}

export interface CheckIndexerUrlResponse {
  indexer_protocol: IndexerProtocol;
}

export interface CheckProxyEndpointRequest {
  proxy_url: string;
}

export interface SignMessageRequest {
  message: string;
}

export interface SignMessageResponse {
  signed_message: string;
}

export interface SendOnionMessageRequest {
  node_ids: string[];
  tlv_type: number;
  data: string;
}

export interface RevokeTokenRequest {
  token: string;
}

export interface EmptyResponse {}

