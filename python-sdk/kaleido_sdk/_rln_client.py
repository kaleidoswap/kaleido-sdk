"""
RLN Client - RGB Lightning Node Operations

Type-safe client for RGB Lightning Node API.
All Node API endpoints use POST method (except for some GET endpoints).
"""

from __future__ import annotations

from typing import TYPE_CHECKING

# Import NetworkInfoResponse from generated types
from ._generated.node_types import (
    AddressResponse,
    AssetBalanceRequest,
    AssetBalanceResponse,
    AssetMetadataRequest,
    AssetMetadataResponse,
    AssetSchema,
    BackupRequest,
    BtcBalanceRequest,
    BtcBalanceResponse,
    ChangePasswordRequest,
    CheckIndexerUrlRequest,
    CheckIndexerUrlResponse,
    CheckProxyEndpointRequest,
    CloseChannelRequest,
    ConnectPeerRequest,
    CreateUtxosRequest,
    DecodeLNInvoiceRequest,
    DecodeLNInvoiceResponse,
    DecodeRGBInvoiceRequest,
    DecodeRGBInvoiceResponse,
    DisconnectPeerRequest,
    EmptyResponse,
    EstimateFeeRequest,
    EstimateFeeResponse,
    FailTransfersRequest,
    FailTransfersResponse,
    GetAssetMediaRequest,
    GetAssetMediaResponse,
    GetChannelIdRequest,
    GetChannelIdResponse,
    GetPaymentRequest,
    GetPaymentResponse,
    GetSwapRequest,
    GetSwapResponse,
    InflateRequest,
    InflateResponse,
    InitRequest,
    InitResponse,
    InvoiceStatusRequest,
    InvoiceStatusResponse,
    IssueAssetCFARequest,
    IssueAssetCFAResponse,
    IssueAssetIFARequest,
    IssueAssetIFAResponse,
    IssueAssetNIARequest,
    IssueAssetNIAResponse,
    IssueAssetUDARequest,
    IssueAssetUDAResponse,
    KeysendRequest,
    KeysendResponse,
    ListAssetsRequest,
    ListAssetsResponse,
    ListChannelsResponse,
    ListPaymentsResponse,
    ListPeersResponse,
    ListSwapsResponse,
    ListTransactionsRequest,
    ListTransactionsResponse,
    ListTransfersRequest,
    ListTransfersResponse,
    ListUnspentsRequest,
    ListUnspentsResponse,
    LNInvoiceRequest,
    LNInvoiceResponse,
    MakerExecuteRequest,
    MakerInitRequest,
    MakerInitResponse,
    NodeInfoResponse,
    OpenChannelRequest,
    OpenChannelResponse,
    PostAssetMediaRequest,
    PostAssetMediaResponse,
    RefreshRequest,
    RestoreRequest,
    RevokeTokenRequest,
    RgbInvoiceRequest,
    RgbInvoiceResponse,
    SendBtcRequest,
    SendBtcResponse,
    SendOnionMessageRequest,
    SendPaymentRequest,
    SendPaymentResponse,
    SendRgbRequest,
    SendRgbResponse,
    SignMessageRequest,
    SignMessageResponse,
    TakerRequest,
    UnlockRequest,
)
from ._generated.node_types import NetworkInfoResponse as NodeNetworkInfoResponse
from ._logging import get_logger
from .errors import TimeoutError

if TYPE_CHECKING:
    from ._http_client import HttpClient

_log = get_logger("rln")


class RlnClient:
    """
    RGB Lightning Node operations client.

    Provides methods for:
    - Wallet management (init, unlock, lock, backup, restore)
    - BTC operations (address, balance, send, transactions)
    - RGB asset operations (list, balance, issue, send, transfers)
    - Lightning channels (list, open, close)
    - Lightning peers (list, connect, disconnect)
    - Lightning invoices and payments
    - Maker/Taker swap operations
    - Utility methods (sign message, check URLs, etc.)
    """

    def __init__(self, http: HttpClient) -> None:
        """
        Initialize RlnClient.

        Args:
            http: HTTP client for API communication
        """
        self._http = http

    # =========================================================================
    # Wallet Management
    # =========================================================================

    async def get_node_info(self) -> NodeInfoResponse:
        """Get node information."""
        _log.debug("rln.get_node_info()")
        data = await self._http.node_get("/nodeinfo")
        return NodeInfoResponse.model_validate(data)

    async def get_network_info(self) -> NodeNetworkInfoResponse:
        """Get network information."""
        _log.debug("rln.get_network_info()")
        data = await self._http.node_get("/networkinfo")
        return NodeNetworkInfoResponse.model_validate(data)

    async def init_wallet(self, body: InitRequest) -> InitResponse:
        """
        Initialize a new wallet.

        Args:
            body: Wallet initialization request with password
        """
        _log.info("rln.init_wallet()")
        data = await self._http.node_post("/init", body)
        result = InitResponse.model_validate(data)
        _log.info("rln.init_wallet() -> ok")
        return result

    async def unlock_wallet(self, body: UnlockRequest) -> None:
        """
        Unlock the wallet.

        Args:
            body: Unlock request with password
        """
        _log.info("rln.unlock_wallet()")
        try:
            await self._http.node_post("/unlock", body)
            _log.debug("rln.unlock_wallet() -> ok")
        except TimeoutError as exc:
            raise TimeoutError(
                "Unlock request timed out. If the node has been offline or locked for a long "
                "time, it may still be syncing. Wait a few minutes and check the node state again."
            ) from exc

    async def lock_wallet(self) -> None:
        """Lock the wallet."""
        _log.info("rln.lock_wallet()")
        await self._http.node_post("/lock")

    async def change_password(self, body: ChangePasswordRequest) -> None:
        """
        Change wallet password.

        Args:
            body: Request with old and new password
        """
        _log.info("rln.change_password()")
        await self._http.node_post("/changepassword", body)
        _log.debug("rln.change_password() -> ok")

    async def backup(self, body: BackupRequest) -> None:
        """
        Create a backup of the node.

        Args:
            body: Backup request with path and password
        """
        _log.info("rln.backup()")
        await self._http.node_post("/backup", body)
        _log.info("rln.backup() -> ok")

    async def restore(self, body: RestoreRequest) -> None:
        """
        Restore node from backup.

        Args:
            body: Restore request with backup path and password
        """
        _log.info("rln.restore()")
        await self._http.node_post("/restore", body)
        _log.info("rln.restore() -> ok")

    async def shutdown(self) -> None:
        """Gracefully shutdown the node."""
        _log.info("rln.shutdown()")
        await self._http.node_post("/shutdown")

    # =========================================================================
    # BTC Operations
    # =========================================================================

    async def get_address(self) -> AddressResponse:
        """Get a new Bitcoin address."""
        data = await self._http.node_post("/address")
        return AddressResponse.model_validate(data)

    async def get_btc_balance(self, skip_sync: bool = False) -> BtcBalanceResponse:
        """
        Get BTC balance.

        Args:
            skip_sync: Skip blockchain sync before getting balance
        """
        data = await self._http.node_post("/btcbalance", BtcBalanceRequest(skip_sync=skip_sync))
        return BtcBalanceResponse.model_validate(data)

    async def send_btc(self, body: SendBtcRequest) -> SendBtcResponse:
        """
        Send BTC on-chain.

        Args:
            body: Send request with address, amount, and fee rate
        """
        _log.info("rln.send_btc(): address=%s amount=%s", body.address, body.amount)
        data = await self._http.node_post("/sendbtc", body)
        result = SendBtcResponse.model_validate(data)
        _log.info("rln.send_btc() -> txid=%s", result.txid)
        return result

    async def list_transactions(
        self, body: ListTransactionsRequest | None = None
    ) -> ListTransactionsResponse:
        """
        List on-chain transactions.

        Args:
            body: Optional request with skip_sync flag
        """
        data = await self._http.node_post(
            "/listtransactions", body or ListTransactionsRequest(skip_sync=False)
        )
        return ListTransactionsResponse.model_validate(data)

    async def list_unspents(self, body: ListUnspentsRequest | None = None) -> ListUnspentsResponse:
        """
        List unspent outputs.

        Args:
            body: Optional request with skip_sync flag
        """
        data = await self._http.node_post(
            "/listunspents", body or ListUnspentsRequest(skip_sync=False)
        )
        return ListUnspentsResponse.model_validate(data)

    async def create_utxos(self, body: CreateUtxosRequest) -> None:
        """
        Create UTXOs for RGB operations.

        Args:
            body: UTXO creation request
        """
        # Node expects fee_rate as u64; Pydantic model uses float for
        # compatibility, so we manually cast to int before serialization.
        json_data = body.model_dump(mode="json", exclude_none=True)
        if "fee_rate" in json_data and json_data["fee_rate"] is not None:
            json_data["fee_rate"] = int(json_data["fee_rate"])
        await self._http.node_post("/createutxos", json_data)

    async def estimate_fee(self, body: EstimateFeeRequest) -> EstimateFeeResponse:
        """
        Estimate on-chain fee.

        Args:
            body: Fee estimation request with blocks target
        """
        data = await self._http.node_post("/estimatefee", body)
        return EstimateFeeResponse.model_validate(data)

    # =========================================================================
    # RGB Asset Operations
    # =========================================================================

    async def list_assets(
        self, filter_asset_schemas: list[AssetSchema] | None = None
    ) -> ListAssetsResponse:
        """
        List RGB assets.

        Args:
            filter_asset_schemas: Optional list of asset schemas to filter by
        """
        body = ListAssetsRequest(filter_asset_schemas=filter_asset_schemas or [])
        data = await self._http.node_post("/listassets", body)
        data = {
            "nia": data.get("nia") or [],
            "uda": data.get("uda") or [],
            "cfa": data.get("cfa") or [],
        }
        return ListAssetsResponse.model_validate(data)

    async def get_asset_balance(self, body: AssetBalanceRequest) -> AssetBalanceResponse:
        """
        Get balance for an RGB asset.

        Args:
            body: Request with asset_id
        """
        data = await self._http.node_post("/assetbalance", body)
        return AssetBalanceResponse.model_validate(data)

    async def get_asset_metadata(self, body: AssetMetadataRequest) -> AssetMetadataResponse:
        """
        Get metadata for an RGB asset.

        Args:
            body: Request with asset_id
        """
        data = await self._http.node_post("/assetmetadata", body)
        return AssetMetadataResponse.model_validate(data)

    async def get_asset_media(self, body: GetAssetMediaRequest) -> GetAssetMediaResponse:
        """
        Get media for an RGB asset.

        Args:
            body: Request with media digest
        """
        data = await self._http.node_post("/getassetmedia", body)
        return GetAssetMediaResponse.model_validate(data)

    async def post_asset_media(self, body: PostAssetMediaRequest) -> PostAssetMediaResponse:
        """
        Upload media for later asset issuance.

        Args:
            body: Multipart media upload request
        """
        data = await self._http.node_post_multipart(
            "/postassetmedia",
            files={"file": ("asset-media", body.file, "application/octet-stream")},
        )
        return PostAssetMediaResponse.model_validate(data)

    async def inflate(self, body: InflateRequest) -> InflateResponse:
        """
        Inflate an RGB asset on-chain.

        Args:
            body: Inflation request
        """
        _log.info("rln.inflate(): asset_id=%s", body.asset_id)
        data = await self._http.node_post("/inflate", body)
        result = InflateResponse.model_validate(data)
        _log.info("rln.inflate() -> txid=%s", result.txid)
        return result

    async def issue_asset_nia(self, body: IssueAssetNIARequest) -> IssueAssetNIAResponse:
        """
        Issue an RGB NIA (fungible) asset.

        Args:
            body: Asset issuance request
        """
        _log.info("rln.issue_asset_nia(): ticker=%s", body.ticker)
        data = await self._http.node_post("/issueassetnia", body)
        result = IssueAssetNIAResponse.model_validate(data)
        _log.info(
            "rln.issue_asset_nia() -> asset_id=%s",
            result.asset.asset_id if result.asset else "<none>",
        )
        return result

    async def issue_asset_ifa(self, body: IssueAssetIFARequest) -> IssueAssetIFAResponse:
        """
        Issue an RGB IFA asset.

        Args:
            body: Asset issuance request
        """
        _log.info("rln.issue_asset_ifa(): ticker=%s", body.ticker)
        data = await self._http.node_post("/issueassetifa", body)
        result = IssueAssetIFAResponse.model_validate(data)
        _log.info(
            "rln.issue_asset_ifa() -> asset_id=%s",
            result.asset.asset_id if result.asset else "<none>",
        )
        return result

    async def issue_asset_cfa(self, body: IssueAssetCFARequest) -> IssueAssetCFAResponse:
        """
        Issue an RGB CFA (collectible) asset.

        Args:
            body: Asset issuance request
        """
        _log.info("rln.issue_asset_cfa(): name=%s", body.name)
        data = await self._http.node_post("/issueassetcfa", body)
        result = IssueAssetCFAResponse.model_validate(data)
        _log.info(
            "rln.issue_asset_cfa() -> asset_id=%s",
            result.asset.asset_id if result.asset else "<none>",
        )
        return result

    async def issue_asset_uda(self, body: IssueAssetUDARequest) -> IssueAssetUDAResponse:
        """
        Issue an RGB UDA (unique digital) asset.

        Args:
            body: Asset issuance request
        """
        _log.info("rln.issue_asset_uda(): ticker=%s", body.ticker)
        data = await self._http.node_post("/issueassetuda", body)
        result = IssueAssetUDAResponse.model_validate(data)
        _log.info(
            "rln.issue_asset_uda() -> asset_id=%s",
            result.asset.asset_id if result.asset else "<none>",
        )
        return result

    async def send_rgb(self, body: SendRgbRequest) -> SendRgbResponse:
        """
        Send RGB assets on-chain.

        Supports batch transfers to multiple recipients and/or multiple
        assets in a single transaction via the recipient_map field.

        Args:
            body: Send request with recipient_map and transfer options
        """
        _log.info("rln.send_rgb()")
        data = await self._http.node_post("/sendrgb", body)
        result = SendRgbResponse.model_validate(data)
        _log.info("rln.send_rgb() -> txid=%s", result.txid)
        return result

    async def list_transfers(self, body: ListTransfersRequest) -> ListTransfersResponse:
        """
        List RGB transfers.

        Args:
            body: Request with optional asset_id filter
        """
        data = await self._http.node_post("/listtransfers", body)
        return ListTransfersResponse.model_validate(data)

    async def refresh_transfers(self, body: RefreshRequest | None = None) -> None:
        """
        Refresh pending RGB transfers.

        Args:
            body: Optional refresh request
        """
        await self._http.node_post("/refreshtransfers", body or RefreshRequest(skip_sync=False))

    async def sync_rgb_wallet(self) -> None:
        """Sync the RGB wallet with the blockchain."""
        await self._http.node_post("/sync")

    async def fail_transfers(self, body: FailTransfersRequest) -> FailTransfersResponse:
        """
        Fail pending RGB transfers.

        Args:
            body: Fail transfers request
        """
        data = await self._http.node_post("/failtransfers", body)
        return FailTransfersResponse.model_validate(data)

    # =========================================================================
    # Lightning Network - Channels
    # =========================================================================

    async def list_channels(self) -> ListChannelsResponse:
        """List Lightning channels."""
        data = await self._http.node_get("/listchannels")
        return ListChannelsResponse.model_validate(data)

    async def open_channel(self, body: OpenChannelRequest) -> OpenChannelResponse:
        """
        Open a Lightning channel.

        Args:
            body: Channel opening request
        """
        _log.info(
            "rln.open_channel(): peer=%s capacity_sat=%s",
            body.peer_pubkey_and_opt_addr,
            body.capacity_sat,
        )
        data = await self._http.node_post("/openchannel", body)
        result = OpenChannelResponse.model_validate(data)
        _log.info("rln.open_channel() -> temp_channel_id=%s", result.temporary_channel_id)
        return result

    async def close_channel(self, body: CloseChannelRequest) -> None:
        """
        Close a Lightning channel.

        Args:
            body: Channel closing request
        """
        _log.info("rln.close_channel(): channel_id=%s", body.channel_id)
        await self._http.node_post("/closechannel", body)
        _log.info("rln.close_channel() -> initiated: channel_id=%s", body.channel_id)

    async def get_channel_id(self, body: GetChannelIdRequest) -> GetChannelIdResponse:
        """
        Get channel ID from temporary channel ID.

        Args:
            body: Request with temporary_channel_id
        """
        data = await self._http.node_post("/getchannelid", body)
        return GetChannelIdResponse.model_validate(data)

    # =========================================================================
    # Lightning Network - Peers
    # =========================================================================

    async def list_peers(self) -> ListPeersResponse:
        """List Lightning peers."""
        data = await self._http.node_get("/listpeers")
        return ListPeersResponse.model_validate(data)

    async def connect_peer(self, body: ConnectPeerRequest) -> None:
        """
        Connect to a Lightning peer.

        Args:
            body: Request with peer_pubkey_and_addr
        """
        _log.info("rln.connect_peer(): peer=%s", body.peer_pubkey_and_addr)
        await self._http.node_post("/connectpeer", body)

    async def disconnect_peer(self, body: DisconnectPeerRequest) -> None:
        """
        Disconnect from a Lightning peer.

        Args:
            body: Request with peer_pubkey
        """
        _log.info("rln.disconnect_peer(): pubkey=%s", body.peer_pubkey)
        await self._http.node_post("/disconnectpeer", body)

    # =========================================================================
    # Lightning Network - Invoices & Payments
    # =========================================================================

    async def create_ln_invoice(self, body: LNInvoiceRequest) -> LNInvoiceResponse:
        """
        Create a Lightning invoice.

        Args:
            body: Invoice creation request
        """
        data = await self._http.node_post("/lninvoice", body)
        return LNInvoiceResponse.model_validate(data)

    async def create_rgb_invoice(self, body: RgbInvoiceRequest) -> RgbInvoiceResponse:
        """
        Create an RGB invoice.

        Args:
            body: RGB invoice creation request
        """
        data = await self._http.node_post("/rgbinvoice", body)
        return RgbInvoiceResponse.model_validate(data)

    async def decode_ln_invoice(
        self, body: DecodeLNInvoiceRequest | str
    ) -> DecodeLNInvoiceResponse:
        """
        Decode a Lightning invoice.

        Args:
            body: Request with invoice string, or just the invoice string
        """
        if isinstance(body, str):
            body = DecodeLNInvoiceRequest(invoice=body)
        data = await self._http.node_post("/decodelninvoice", body)
        return DecodeLNInvoiceResponse.model_validate(data)

    async def decode_rgb_invoice(self, body: DecodeRGBInvoiceRequest) -> DecodeRGBInvoiceResponse:
        """
        Decode an RGB invoice.

        Args:
            body: Request with invoice string

        Returns:
            Decoded invoice details including recipient_type, asset info, and
            transport endpoints.
        """
        data = await self._http.node_post("/decodergbinvoice", body)
        return DecodeRGBInvoiceResponse.model_validate(data)

    async def get_invoice_status(self, body: InvoiceStatusRequest) -> InvoiceStatusResponse:
        """
        Get invoice status.

        Args:
            body: Request with invoice string
        """
        data = await self._http.node_post("/invoicestatus", body)
        return InvoiceStatusResponse.model_validate(data)

    async def send_payment(self, body: SendPaymentRequest) -> SendPaymentResponse:
        """
        Send a Lightning payment.

        Args:
            body: Payment request with invoice
        """
        _log.info(
            "rln.send_payment(): invoice=%s...", body.invoice[:30] if body.invoice else "<empty>"
        )
        data = await self._http.node_post("/sendpayment", body)
        result = SendPaymentResponse.model_validate(data)
        _log.info(
            "rln.send_payment() -> payment_hash=%s status=%s",
            result.payment_hash,
            result.status,
        )
        return result

    async def keysend(self, body: KeysendRequest) -> KeysendResponse:
        """
        Send a spontaneous payment (keysend).

        Args:
            body: Keysend request with destination and amount
        """
        data = await self._http.node_post("/keysend", body)
        return KeysendResponse.model_validate(data)

    async def list_payments(self) -> ListPaymentsResponse:
        """List Lightning payments."""
        data = await self._http.node_get("/listpayments")
        return ListPaymentsResponse.model_validate(data)

    async def get_payment(self, body: GetPaymentRequest) -> GetPaymentResponse:
        """
        Get payment by payment hash.

        Args:
            body: Request with payment_hash
        """
        data = await self._http.node_post("/getpayment", body)
        return GetPaymentResponse.model_validate(data)

    # =========================================================================
    # Maker/Taker Swap Operations
    # =========================================================================

    async def get_taker_pubkey(self) -> str:
        """Get the node's public key (for taker operations)."""
        node_info = await self.get_node_info()
        return node_info.pubkey or ""

    async def whitelist_swap(self, body: TakerRequest | str) -> None:
        """
        Whitelist a swap (accept swap on taker side).

        Args:
            body: Request with swapstring, or just the swapstring
        """
        if isinstance(body, str):
            body = TakerRequest(swapstring=body)
        _log.info("rln.whitelist_swap(): swapstring=%.20s...", body.swapstring)
        await self._http.node_post("/taker", body)

    async def maker_init(self, body: MakerInitRequest) -> MakerInitResponse:
        """
        Initialize a maker swap.

        Args:
            body: Maker swap initialization request
        """
        _log.info(
            "rln.maker_init(): from_asset=%s to_asset=%s qty_from=%s",
            body.from_asset,
            body.to_asset,
            body.qty_from,
        )
        data = await self._http.node_post("/makerinit", body)
        result = MakerInitResponse.model_validate(data)
        _log.info("rln.maker_init() -> ok")
        return result

    async def maker_execute(self, body: MakerExecuteRequest) -> EmptyResponse:
        """
        Execute a swap on the maker side.

        Args:
            body: Maker execute request
        """
        _log.info("rln.maker_execute()")
        data = await self._http.node_post("/makerexecute", body)
        result = EmptyResponse.model_validate(data)
        _log.info("rln.maker_execute() -> ok")
        return result

    async def list_swaps(self) -> ListSwapsResponse:
        """List all swaps (maker and taker)."""
        data = await self._http.node_get("/listswaps")
        return ListSwapsResponse.model_validate(data)

    async def get_swap(self, body: GetSwapRequest) -> GetSwapResponse:
        """
        Get swap by payment hash.

        Args:
            body: Request with payment_hash and taker flag
        """
        data = await self._http.node_post("/getswap", body)
        return GetSwapResponse.model_validate(data)

    # =========================================================================
    # Utility Methods
    # =========================================================================

    async def sign_message(self, body: SignMessageRequest) -> SignMessageResponse:
        """
        Sign a message with the node's key.

        Args:
            body: Request with message to sign
        """
        data = await self._http.node_post("/signmessage", body)
        return SignMessageResponse.model_validate(data)

    async def send_onion_message(self, body: SendOnionMessageRequest) -> None:
        """
        Send an onion message via Lightning.

        Args:
            body: Onion message request
        """
        await self._http.node_post("/sendonionmessage", body)

    async def check_indexer_url(self, body: CheckIndexerUrlRequest) -> CheckIndexerUrlResponse:
        """
        Check if an indexer URL is valid.

        Args:
            body: Request with indexer_url
        """
        data = await self._http.node_post("/checkindexerurl", body)
        return CheckIndexerUrlResponse.model_validate(data)

    async def check_proxy_endpoint(self, body: CheckProxyEndpointRequest) -> None:
        """
        Check if a proxy endpoint is valid.

        Args:
            body: Request with proxy_url
        """
        await self._http.node_post("/checkproxyendpoint", body)

    async def revoke_token(self, body: RevokeTokenRequest) -> None:
        """
        Revoke an authentication token.

        Args:
            body: Request with token to revoke
        """
        await self._http.node_post("/revoketoken", body)
