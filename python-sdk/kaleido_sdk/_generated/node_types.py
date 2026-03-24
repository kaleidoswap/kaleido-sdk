# pyright: reportAssignmentType=false

from __future__ import annotations

from enum import StrEnum
from typing import Annotated, Literal

from pydantic import BaseModel, Field


class AddressResponse(BaseModel):
    address: Annotated[str, Field(examples=["bcrt1qnc5y6j6dmejrkwy93farhvpezk0lf46gk7aecs"])]


class AssetBalanceRequest(BaseModel):
    asset_id: Annotated[
        str, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ]


class AssetBalanceResponse(BaseModel):
    settled: Annotated[int, Field(examples=[777])]
    future: Annotated[int, Field(examples=[777])]
    spendable: Annotated[int, Field(examples=[777])]
    offchain_outbound: Annotated[int, Field(examples=[444])]
    offchain_inbound: Annotated[int, Field(examples=[0])]


class AssetMetadataRequest(BaseModel):
    asset_id: Annotated[
        str, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ]


class AssetSchema(StrEnum):
    NIA = "Nia"
    UDA = "Uda"
    CFA = "Cfa"


class AssignmentAny(BaseModel):
    type: Literal["Any"]


class AssignmentFungible(BaseModel):
    type: Literal["Fungible"]
    value: Annotated[int, Field(examples=[42])]


class AssignmentInflationRight(BaseModel):
    type: Literal["InflationRight"]
    value: Annotated[int, Field(examples=[200])]


class AssignmentNonFungible(BaseModel):
    type: Literal["NonFungible"]


class AssignmentReplaceRight(BaseModel):
    type: Literal["ReplaceRight"]


class BackupRequest(BaseModel):
    backup_path: Annotated[str, Field(examples=["/path/where/to/save/the/backup/file"])]
    password: Annotated[str, Field(examples=["nodepassword"])]


class BitcoinNetwork(StrEnum):
    MAINNET = "Mainnet"
    TESTNET = "Testnet"
    TESTNET4 = "Testnet4"
    SIGNET = "Signet"
    REGTEST = "Regtest"


class BlockTime(BaseModel):
    height: Annotated[int, Field(examples=[805434])]
    timestamp: Annotated[int, Field(examples=[1691160659])]


class BtcBalance(BaseModel):
    settled: Annotated[int, Field(examples=[777000])]
    future: Annotated[int, Field(examples=[777000])]
    spendable: Annotated[int, Field(examples=[777000])]


class BtcBalanceRequest(BaseModel):
    skip_sync: Annotated[bool, Field(examples=[False])]


class BtcBalanceResponse(BaseModel):
    vanilla: BtcBalance
    colored: BtcBalance


class ChangePasswordRequest(BaseModel):
    old_password: Annotated[str, Field(examples=["nodepassword"])]
    new_password: Annotated[str, Field(examples=["nodenewpassword"])]


class ChannelStatus(StrEnum):
    OPENING = "Opening"
    OPENED = "Opened"
    CLOSING = "Closing"


class CheckIndexerUrlRequest(BaseModel):
    indexer_url: Annotated[str, Field(examples=["127.0.0.1:50001"])]


class CheckProxyEndpointRequest(BaseModel):
    proxy_endpoint: Annotated[str, Field(examples=["rpc://127.0.0.1:3000/json-rpc"])]


class CloseChannelRequest(BaseModel):
    channel_id: Annotated[
        str, Field(examples=["8129afe1b1d7cf60d5e1bf4c04b09bec925ed4df5417ceee0484e24f816a105a"])
    ]
    peer_pubkey: Annotated[
        str, Field(examples=["03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d"])
    ]
    force: Annotated[bool, Field(examples=[False])]


class ConnectPeerRequest(BaseModel):
    peer_pubkey_and_addr: Annotated[
        str,
        Field(
            examples=[
                "03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d@localhost:9736"
            ]
        ),
    ]


class CreateUtxosRequest(BaseModel):
    up_to: Annotated[bool, Field(examples=[False])]
    num: Annotated[int | None, Field(examples=[4])] = None
    size: Annotated[int | None, Field(examples=[32500])] = None
    fee_rate: Annotated[int, Field(examples=[5])]
    skip_sync: Annotated[bool, Field(examples=[False])]


class DecodeLNInvoiceRequest(BaseModel):
    invoice: Annotated[
        str,
        Field(
            examples=[
                "lnbcrt30u1pjv6yzndqud3jxktt5w46x7unfv9kz6mn0v3jsnp4qdpc280eur52luxppv6f3nnj8l6vnd9g2hnv3qv6mjhmhvlzf6327pp5tjjasx6g9dqptea3fhm6yllq5wxzycnnvp8l6wcq3d6j2uvpryuqsp5l8az8x3g8fe05dg7cmgddld3da09nfjvky8xftwsk4cj8p2l7kfq9qyysgqcqpcxqzdylzlwfnkyw3jv344x4rzwgkk53ng0fhxy5rdduk4g5tpvea8xa6rfckkza35va28xjn2tqkhgarcxep5umm4x5k56wfcdvu95eq7qzp20vrl4xz76syapsa3c09j7lg5gerkaj63llj0ark7ph8hfketn6fkqzm8laf66dhsncm23wkwm5l5377we9e8lnlknnkwje5eefkccusqm6rqt8"
            ]
        ),
    ]


class DecodeLNInvoiceResponse(BaseModel):
    amt_msat: Annotated[int | None, Field(examples=[3000000])] = None
    expiry_sec: Annotated[int, Field(examples=[420])]
    timestamp: Annotated[int, Field(examples=[1691160659])]
    asset_id: Annotated[
        str | None, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ] = None
    asset_amount: Annotated[int | None, Field(examples=[42])] = None
    payment_hash: Annotated[
        str, Field(examples=["5ca5d81b482b4015e7b14df7a27fe0a38c226273604ffd3b008b752571811938"])
    ]
    payment_secret: Annotated[
        str, Field(examples=["f9fa239a283a72fa351ec6d0d6fdb16f5e59a64cb10e64add0b57123855ff592"])
    ]
    payee_pubkey: Annotated[
        str | None,
        Field(examples=["0343851df9e0e8aff0c10b3498ce723ff4c9b4a855e6c8819adcafbbb3e24ea2af"]),
    ] = None
    network: BitcoinNetwork


class DecodeRGBInvoiceRequest(BaseModel):
    invoice: Annotated[
        str,
        Field(
            examples=[
                "rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-brRJrzE/RWhwUfTMpuP2Zfx1~j4nswCANGeJrYOqDcKelaMV4zU/~/bcrt:utxob:cbgHUJ4e-7QyKY4U-Jsj5AZw-oI0gxZh-7fxQY2_-tFFUAZN-4CgpX?expiry=1749906951&endpoints=rpcs://proxy.iriswallet.com/0.2/json-rpc"
            ]
        ),
    ]


class DisconnectPeerRequest(BaseModel):
    peer_pubkey: Annotated[
        str, Field(examples=["03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d"])
    ]


class EmbeddedMedia(BaseModel):
    mime: Annotated[str, Field(examples=["text/plain"])]
    data: Annotated[list[int], Field(examples=[[82, 76, 78]])]


class EmptyResponse(BaseModel):
    pass


class EstimateFeeRequest(BaseModel):
    blocks: Annotated[int, Field(examples=[7])]


class EstimateFeeResponse(BaseModel):
    fee_rate: Annotated[float, Field(examples=[9.3])]


class FailTransfersRequest(BaseModel):
    batch_transfer_idx: Annotated[int | None, Field(examples=[None])] = None
    no_asset_only: Annotated[bool, Field(examples=[False])]
    skip_sync: Annotated[bool, Field(examples=[False])]


class FailTransfersResponse(BaseModel):
    transfers_changed: Annotated[bool, Field(examples=[True])]


class GetAssetMediaRequest(BaseModel):
    digest: Annotated[
        str, Field(examples=["5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03"])
    ]


class GetAssetMediaResponse(BaseModel):
    bytes_hex: Annotated[str, Field(examples=["68656c6c6f0a"])]


class GetChannelIdRequest(BaseModel):
    temporary_channel_id: Annotated[
        str, Field(examples=["a8b60c8ce3067b5fc881d4831323e24751daec3b64353c8df3205ec5d838f1c5"])
    ]


class GetChannelIdResponse(BaseModel):
    channel_id: Annotated[
        str, Field(examples=["8129afe1b1d7cf60d5e1bf4c04b09bec925ed4df5417ceee0484e24f816a105a"])
    ]


class GetPaymentRequest(BaseModel):
    payment_hash: Annotated[
        str, Field(examples=["5ca5d81b482b4015e7b14df7a27fe0a38c226273604ffd3b008b752571811938"])
    ]


class GetSwapRequest(BaseModel):
    payment_hash: Annotated[
        str, Field(examples=["5ca5d81b482b4015e7b14df7a27fe0a38c226273604ffd3b008b752571811938"])
    ]
    taker: Annotated[bool, Field(examples=[False])]


class HTLCStatus(StrEnum):
    PENDING = "Pending"
    SUCCEEDED = "Succeeded"
    FAILED = "Failed"


class IndexerProtocol(StrEnum):
    ELECTRUM = "Electrum"
    ESPLORA = "Esplora"


class InitRequest(BaseModel):
    password: Annotated[str, Field(examples=["nodepassword"])]
    mnemonic: Annotated[
        str | None,
        Field(
            examples=[
                "skill lamp please gown put season degree collect decline account monitor insane"
            ]
        ),
    ] = None


class InitResponse(BaseModel):
    mnemonic: Annotated[
        str,
        Field(
            examples=[
                "skill lamp please gown put season degree collect decline account monitor insane"
            ]
        ),
    ]


class InvoiceStatus(StrEnum):
    PENDING = "Pending"
    SUCCEEDED = "Succeeded"
    FAILED = "Failed"
    EXPIRED = "Expired"


class InvoiceStatusRequest(BaseModel):
    invoice: Annotated[
        str,
        Field(
            examples=[
                "lnbcrt30u1pjv6yzndqud3jxktt5w46x7unfv9kz6mn0v3jsnp4qdpc280eur52luxppv6f3nnj8l6vnd9g2hnv3qv6mjhmhvlzf6327pp5tjjasx6g9dqptea3fhm6yllq5wxzycnnvp8l6wcq3d6j2uvpryuqsp5l8az8x3g8fe05dg7cmgddld3da09nfjvky8xftwsk4cj8p2l7kfq9qyysgqcqpcxqzdylzlwfnkyw3jv344x4rzwgkk53ng0fhxy5rdduk4g5tpvea8xa6rfckkza35va28xjn2tqkhgarcxep5umm4x5k56wfcdvu95eq7qzp20vrl4xz76syapsa3c09j7lg5gerkaj63llj0ark7ph8hfketn6fkqzm8laf66dhsncm23wkwm5l5377we9e8lnlknnkwje5eefkccusqm6rqt8"
            ]
        ),
    ]


class InvoiceStatusResponse(BaseModel):
    status: InvoiceStatus


class IssueAssetCFARequest(BaseModel):
    amounts: Annotated[list[int], Field(examples=[[1000, 600]])]
    name: Annotated[str, Field(examples=["Tether"])]
    details: Annotated[str | None, Field(examples=["asset details"])] = None
    precision: Annotated[int, Field(examples=[0])]
    file_digest: Annotated[
        str | None,
        Field(examples=["5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03"]),
    ] = None


class IssueAssetNIARequest(BaseModel):
    amounts: Annotated[list[int], Field(examples=[[1000, 600]])]
    ticker: Annotated[str, Field(examples=["USDT"])]
    name: Annotated[str, Field(examples=["Tether"])]
    precision: Annotated[int, Field(examples=[0])]


class IssueAssetUDARequest(BaseModel):
    ticker: Annotated[str, Field(examples=["UNI"])]
    name: Annotated[str, Field(examples=["Unique"])]
    details: Annotated[str | None, Field(examples=["asset details"])] = None
    precision: Annotated[int, Field(examples=[0])]
    media_file_digest: Annotated[str | None, Field(examples=["/path/to/media"])] = None
    attachments_file_digests: Annotated[
        list[str],
        Field(
            examples=[
                [
                    "5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03",
                    "d7516e3a27cdf35aa9dcb323b5f556344ef7f57570be30b88de2bfd4ba339b1a",
                ]
            ]
        ),
    ]


class KeysendRequest(BaseModel):
    dest_pubkey: Annotated[
        str, Field(examples=["03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d"])
    ]
    amt_msat: Annotated[int, Field(examples=[3000000])]
    asset_id: Annotated[
        str | None, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ] = None
    asset_amount: Annotated[int | None, Field(examples=[42])] = None


class KeysendResponse(BaseModel):
    payment_hash: Annotated[
        str, Field(examples=["8ffd4c0642047bc51ea01a22e6b2ede0fc001aee0e9929b2e84e41cf6589d61e"])
    ]
    payment_preimage: Annotated[
        str, Field(examples=["89d28bd306aa9bb906fd0ac31092d04c37c919a171b343083167e2a3cdc60578"])
    ]
    status: HTLCStatus


class ListAssetsRequest(BaseModel):
    filter_asset_schemas: Annotated[list[AssetSchema], Field(examples=[["Nia", "Uda", "Cfa"]])]


class ListTransactionsRequest(BaseModel):
    skip_sync: Annotated[bool, Field(examples=[False])]


class ListTransfersRequest(BaseModel):
    asset_id: Annotated[
        str, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ]


class ListUnspentsRequest(BaseModel):
    skip_sync: Annotated[bool, Field(examples=[False])]


class LNInvoiceRequest(BaseModel):
    amt_msat: Annotated[int | None, Field(examples=[3000000])] = None
    expiry_sec: Annotated[int, Field(examples=[420])]
    asset_id: Annotated[
        str | None, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ] = None
    asset_amount: Annotated[int | None, Field(examples=[42])] = None


class LNInvoiceResponse(BaseModel):
    invoice: Annotated[
        str,
        Field(
            examples=[
                "lnbcrt30u1pjv6yzndqud3jxktt5w46x7unfv9kz6mn0v3jsnp4qdpc280eur52luxppv6f3nnj8l6vnd9g2hnv3qv6mjhmhvlzf6327pp5tjjasx6g9dqptea3fhm6yllq5wxzycnnvp8l6wcq3d6j2uvpryuqsp5l8az8x3g8fe05dg7cmgddld3da09nfjvky8xftwsk4cj8p2l7kfq9qyysgqcqpcxqzdylzlwfnkyw3jv344x4rzwgkk53ng0fhxy5rdduk4g5tpvea8xa6rfckkza35va28xjn2tqkhgarcxep5umm4x5k56wfcdvu95eq7qzp20vrl4xz76syapsa3c09j7lg5gerkaj63llj0ark7ph8hfketn6fkqzm8laf66dhsncm23wkwm5l5377we9e8lnlknnkwje5eefkccusqm6rqt8"
            ]
        ),
    ]


class MakerExecuteRequest(BaseModel):
    swapstring: Annotated[
        str,
        Field(
            examples=[
                "30/rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8/10/rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-brRJrzE/1715896416/9d342c6ba006e24abee84a2e034a22d5e30c1f2599fb9c3574d46d3cde3d65a2"
            ]
        ),
    ]
    payment_secret: Annotated[
        str, Field(examples=["777a7756c620868199ed5fdc35bee4095b5709d543e5c2bf0494396bf27d2ea2"])
    ]
    taker_pubkey: Annotated[
        str, Field(examples=["02270dadcd6e7ba0ef707dac72acccae1a3607453a8dd2aef36ff3be4e0d31f043"])
    ]


class MakerInitRequest(BaseModel):
    qty_from: Annotated[int, Field(examples=[30])]
    qty_to: Annotated[int, Field(examples=[10])]
    from_asset: Annotated[
        str | None, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ] = None
    to_asset: Annotated[
        str | None, Field(examples=["rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-brRJrzE"])
    ] = None
    timeout_sec: Annotated[int, Field(examples=[100])]


class MakerInitResponse(BaseModel):
    payment_hash: Annotated[
        str, Field(examples=["3febfae1e68b190c15461f4c2a3290f9af1dae63fd7d620d2bd61601869026cd"])
    ]
    payment_secret: Annotated[
        str, Field(examples=["777a7756c620868199ed5fdc35bee4095b5709d543e5c2bf0494396bf27d2ea2"])
    ]
    swapstring: Annotated[
        str,
        Field(
            examples=[
                "30/rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8/10/rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-brRJrzE/1715896416/9d342c6ba006e24abee84a2e034a22d5e30c1f2599fb9c3574d46d3cde3d65a2"
            ]
        ),
    ]


class Media(BaseModel):
    file_path: Annotated[str, Field(examples=["/path/to/media"])]
    digest: Annotated[
        str, Field(examples=["5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03"])
    ]
    mime: Annotated[str, Field(examples=["text/plain"])]


class NetworkInfoResponse(BaseModel):
    network: BitcoinNetwork
    height: Annotated[int, Field(examples=[805434])]


class NodeInfoResponse(BaseModel):
    pubkey: Annotated[
        str, Field(examples=["02270dadcd6e7ba0ef707dac72acccae1a3607453a8dd2aef36ff3be4e0d31f043"])
    ]
    num_channels: Annotated[int, Field(examples=[1])]
    num_usable_channels: Annotated[int, Field(examples=[0])]
    local_balance_sat: Annotated[int, Field(examples=[28616])]
    eventual_close_fees_sat: Annotated[int, Field(examples=[892])]
    pending_outbound_payments_sat: Annotated[int, Field(examples=[7852])]
    num_peers: Annotated[int, Field(examples=[1])]
    account_xpub_vanilla: Annotated[
        str,
        Field(
            examples=[
                "tpubDDfzqHEET3ksD81qshMHkw35yp6TuLP1kr5rWWeJcLAqDfMXKDJzmDwAnda6DCqw7kkkhPphuDZFE2a6Sw8h5ZA5NwmtTssEnjMqN7xMzSd"
            ]
        ),
    ]
    account_xpub_colored: Annotated[
        str,
        Field(
            examples=[
                "tpubDDcdKhaxwVV2T6xwigti7dSY1a7LHFwZmKAaLWtNhzrvuTXqjjzo8U7YQkUuPah5yHvnk3cbXmb18ZRFwHEKTFUQmA9dij1nPVA2LCJCiEa"
            ]
        ),
    ]
    max_media_upload_size_mb: Annotated[int, Field(examples=[5])]
    rgb_htlc_min_msat: Annotated[int, Field(examples=[3000000])]
    rgb_channel_capacity_min_sat: Annotated[int, Field(examples=[30010])]
    channel_capacity_min_sat: Annotated[int, Field(examples=[5506])]
    channel_capacity_max_sat: Annotated[int, Field(examples=[16777215])]
    channel_asset_min_amount: Annotated[int, Field(examples=[1])]
    channel_asset_max_amount: Annotated[int, Field(examples=[18446744073709551615])]
    network_nodes: Annotated[int, Field(examples=[987226])]
    network_channels: Annotated[int, Field(examples=[7812821])]


class OpenChannelRequest(BaseModel):
    peer_pubkey_and_opt_addr: Annotated[
        str,
        Field(
            examples=[
                "03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d@localhost:9736"
            ]
        ),
    ]
    capacity_sat: Annotated[int, Field(examples=[30010])]
    push_msat: Annotated[int, Field(examples=[1394000])]
    asset_amount: Annotated[int | None, Field(examples=[333])] = None
    asset_id: Annotated[
        str | None, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ] = None
    push_asset_amount: Annotated[int | None, Field(examples=[100])] = None
    public: Annotated[bool, Field(examples=[True])]
    with_anchors: Annotated[bool, Field(examples=[True])]
    fee_base_msat: Annotated[int | None, Field(examples=[1000])] = None
    fee_proportional_millionths: Annotated[int | None, Field(examples=[0])] = None
    temporary_channel_id: Annotated[
        str | None,
        Field(examples=["a8b60c8ce3067b5fc881d4831323e24751daec3b64353c8df3205ec5d838f1c5"]),
    ] = None


class OpenChannelResponse(BaseModel):
    temporary_channel_id: Annotated[
        str, Field(examples=["a8b60c8ce3067b5fc881d4831323e24751daec3b64353c8df3205ec5d838f1c5"])
    ]


class Payment(BaseModel):
    amt_msat: Annotated[int | None, Field(examples=[3000000])] = None
    asset_amount: Annotated[int | None, Field(examples=[42])] = None
    asset_id: Annotated[
        str | None, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ] = None
    payment_hash: Annotated[
        str, Field(examples=["3febfae1e68b190c15461f4c2a3290f9af1dae63fd7d620d2bd61601869026cd"])
    ]
    inbound: Annotated[bool, Field(examples=[True])]
    status: HTLCStatus
    created_at: Annotated[int, Field(examples=[1691160765])]
    updated_at: Annotated[int, Field(examples=[1691162674])]
    payee_pubkey: Annotated[
        str, Field(examples=["03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d"])
    ]
    preimage: Annotated[
        str | None,
        Field(examples=["89d28bd306aa9bb906fd0ac31092d04c37c919a171b343083167e2a3cdc60578"]),
    ] = None


class Peer(BaseModel):
    pubkey: Annotated[
        str, Field(examples=["03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d"])
    ]


class PostAssetMediaRequest(BaseModel):
    file: bytes


class PostAssetMediaResponse(BaseModel):
    digest: Annotated[
        str, Field(examples=["5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03"])
    ]


class ProofOfReserves(BaseModel):
    utxo: Annotated[
        str, Field(examples=["efed66f5309396ff43c8a09941c8103d9d5bbffd473ad9f13013ac89fb6b4671:0"])
    ]
    proof: Annotated[list[int], Field(examples=[[6, 36, 87, 13, 5, 17]])]


class RecipientType(StrEnum):
    BLIND = "Blind"
    WITNESS = "Witness"


class RefreshRequest(BaseModel):
    skip_sync: Annotated[bool, Field(examples=[False])]


class RestoreRequest(BaseModel):
    backup_path: Annotated[str, Field(examples=["/path/to/the/backup/file"])]
    password: Annotated[str, Field(examples=["nodepassword"])]


class RevokeTokenRequest(BaseModel):
    token: Annotated[
        str,
        Field(
            examples=[
                "EnYKDBgDIggKBggGEgIYDRIkCAASICqCgqtFMIJ1eLCM3raDzqg9UqV-6nJWzGjjJG0S5IIUGkBpF-itmppHcdcSrSCiKklz9VZT4UmIND_0RFc32Imq3bLR_Y7GYaSpJo5lJfU1cA2BG_hy7P1UN4g5jKTKS88GIiIKIAUKXrrx0Ca-rMZa537VOFw2X8q_KVQ6OC4Z0ztro0sQ"
            ]
        ),
    ]


class RgbInvoiceResponse(BaseModel):
    recipient_id: Annotated[
        str, Field(examples=["bcrt:utxob:cbgHUJ4e-7QyKY4U-Jsj5AZw-oI0gxZh-7fxQY2_-tFFUAZN-4CgpX"])
    ]
    invoice: Annotated[
        str,
        Field(
            examples=[
                "rgb:~/~/~/bcrt:utxob:cbgHUJ4e-7QyKY4U-Jsj5AZw-oI0gxZh-7fxQY2_-tFFUAZN-4CgpX?expiry=1695811760&endpoints=rpc://127.0.0.1:3000/json-rpc"
            ]
        ),
    ]
    expiration_timestamp: Annotated[int | None, Field(examples=[1695811760])] = None
    batch_transfer_idx: Annotated[int, Field(examples=[1])]


class SendBtcRequest(BaseModel):
    amount: Annotated[int, Field(examples=[16900])]
    address: Annotated[str, Field(examples=["bcrt1qwxht5tut39dws8tjcf649tp908r8fr2j75c94k"])]
    fee_rate: Annotated[int, Field(examples=[5])]
    skip_sync: Annotated[bool, Field(examples=[False])]


class SendBtcResponse(BaseModel):
    txid: Annotated[
        str, Field(examples=["7c2c95b9c2aa0a7d140495b664de7973b76561de833f0dd84def3efa08941664"])
    ]


class SendOnionMessageRequest(BaseModel):
    node_ids: list[str]
    tlv_type: Annotated[int, Field(examples=[77])]
    data: Annotated[str, Field(examples=["message to send"])]


class SendPaymentRequest(BaseModel):
    invoice: Annotated[
        str,
        Field(
            examples=[
                "lnbcrt30u1pjv6yzndqud3jxktt5w46x7unfv9kz6mn0v3jsnp4qdpc280eur52luxppv6f3nnj8l6vnd9g2hnv3qv6mjhmhvlzf6327pp5tjjasx6g9dqptea3fhm6yllq5wxzycnnvp8l6wcq3d6j2uvpryuqsp5l8az8x3g8fe05dg7cmgddld3da09nfjvky8xftwsk4cj8p2l7kfq9qyysgqcqpcxqzdylzlwfnkyw3jv344x4rzwgkk53ng0fhxy5rdduk4g5tpvea8xa6rfckkza35va28xjn2tqkhgarcxep5umm4x5k56wfcdvu95eq7qzp20vrl4xz76syapsa3c09j7lg5gerkaj63llj0ark7ph8hfketn6fkqzm8laf66dhsncm23wkwm5l5377we9e8lnlknnkwje5eefkccusqm6rqt8"
            ]
        ),
    ]
    amt_msat: Annotated[int | None, Field(examples=[3000000])] = None
    asset_id: Annotated[
        str | None, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ] = None
    asset_amount: Annotated[int | None, Field(examples=[100])] = None


class SendPaymentResponse(BaseModel):
    payment_id: Annotated[
        str, Field(examples=["3febfae1e68b190c15461f4c2a3290f9af1dae63fd7d620d2bd61601869026cd"])
    ]
    payment_hash: Annotated[
        str | None,
        Field(examples=["3febfae1e68b190c15461f4c2a3290f9af1dae63fd7d620d2bd61601869026cd"]),
    ] = None
    payment_secret: Annotated[
        str | None,
        Field(examples=["777a7756c620868199ed5fdc35bee4095b5709d543e5c2bf0494396bf27d2ea2"]),
    ] = None
    status: HTLCStatus


class SendRgbResponse(BaseModel):
    txid: Annotated[
        str, Field(examples=["7c2c95b9c2aa0a7d140495b664de7973b76561de833f0dd84def3efa08941664"])
    ]


class SignMessageRequest(BaseModel):
    message: Annotated[str, Field(examples=["message to sign"])]


class SignMessageResponse(BaseModel):
    signed_message: Annotated[str, Field(examples=["signed message"])]


class SwapStatus(StrEnum):
    WAITING = "Waiting"
    PENDING = "Pending"
    SUCCEEDED = "Succeeded"
    EXPIRED = "Expired"
    FAILED = "Failed"


class TakerRequest(BaseModel):
    swapstring: Annotated[
        str,
        Field(
            examples=[
                "30/rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8/10/rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-brRJrzE/1715896416/9d342c6ba006e24abee84a2e034a22d5e30c1f2599fb9c3574d46d3cde3d65a2"
            ]
        ),
    ]


class Token(BaseModel):
    index: Annotated[int, Field(examples=[0])]
    ticker: Annotated[str | None, Field(examples=["TKN"])] = None
    name: Annotated[str | None, Field(examples=["Token"])] = None
    details: Annotated[str | None, Field(examples=["token details"])] = None
    embedded_media: EmbeddedMedia | None = None
    media: Media | None = None
    attachments: Annotated[
        dict[str, Media],
        Field(
            examples=[
                {
                    0: {
                        "file_path": "path/to/attachment0",
                        "digest": "5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03",
                        "mime": "text/plain",
                    },
                    1: {
                        "file_path": "path/to/attachment1",
                        "digest": "d7516e3a27cdf35aa9dcb323b5f556344ef7f57570be30b88de2bfd4ba339b1a",
                        "mime": "image/png",
                    },
                }
            ]
        ),
    ]
    reserves: ProofOfReserves | None = None


class TokenLight(BaseModel):
    index: Annotated[int, Field(examples=[0])]
    ticker: Annotated[str | None, Field(examples=["TKN"])] = None
    name: Annotated[str | None, Field(examples=["Token"])] = None
    details: Annotated[str | None, Field(examples=["token details"])] = None
    embedded_media: Annotated[bool, Field(examples=[True])]
    media: Media | None = None
    attachments: Annotated[
        dict[str, Media],
        Field(
            examples=[
                {
                    0: {
                        "file_path": "path/to/attachment0",
                        "digest": "5891b5b522d5df086d0ff0b110fbd9d21bb4fc7163af34d08286a2e846f6be03",
                        "mime": "text/plain",
                    },
                    1: {
                        "file_path": "path/to/attachment1",
                        "digest": "d7516e3a27cdf35aa9dcb323b5f556344ef7f57570be30b88de2bfd4ba339b1a",
                        "mime": "image/png",
                    },
                }
            ]
        ),
    ]
    reserves: Annotated[bool, Field(examples=[False])]


class TransactionType(StrEnum):
    RGB_SEND = "RgbSend"
    DRAIN = "Drain"
    CREATE_UTXOS = "CreateUtxos"
    USER = "User"


class TransferKind(StrEnum):
    ISSUANCE = "Issuance"
    RECEIVE_BLIND = "ReceiveBlind"
    RECEIVE_WITNESS = "ReceiveWitness"
    SEND = "Send"
    INFLATION = "Inflation"


class TransferStatus(StrEnum):
    WAITING_COUNTERPARTY = "WaitingCounterparty"
    WAITING_CONFIRMATIONS = "WaitingConfirmations"
    SETTLED = "Settled"
    FAILED = "Failed"


class UnlockRequest(BaseModel):
    password: Annotated[str, Field(examples=["nodepassword"])]
    bitcoind_rpc_username: Annotated[str, Field(examples=["user"])]
    bitcoind_rpc_password: Annotated[str, Field(examples=["password"])]
    bitcoind_rpc_host: Annotated[str, Field(examples=["localhost"])]
    bitcoind_rpc_port: Annotated[int, Field(examples=[18443])]
    indexer_url: Annotated[str | None, Field(examples=["127.0.0.1:50001"])] = None
    proxy_endpoint: Annotated[str | None, Field(examples=["rpc://127.0.0.1:3000/json-rpc"])] = None
    announce_addresses: list[str]
    announce_alias: Annotated[str | None, Field(examples=["nodeAlias"])] = None


class Utxo(BaseModel):
    outpoint: Annotated[
        str, Field(examples=["efed66f5309396ff43c8a09941c8103d9d5bbffd473ad9f13013ac89fb6b4671:0"])
    ]
    btc_amount: Annotated[int, Field(examples=[1000])]
    colorable: Annotated[bool, Field(examples=[True])]


class WitnessData(BaseModel):
    amount_sat: Annotated[int, Field(examples=[1000])]
    blinding: Annotated[int | None, Field(examples=[439017309])] = None


class AssetCFA(BaseModel):
    asset_id: Annotated[
        str, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ]
    name: Annotated[str, Field(examples=["Collectible"])]
    details: Annotated[str | None, Field(examples=["asset details"])] = None
    precision: Annotated[int, Field(examples=[0])]
    issued_supply: Annotated[int, Field(examples=[777])]
    timestamp: Annotated[int, Field(examples=[1691160565])]
    added_at: Annotated[int, Field(examples=[1691161979])]
    balance: AssetBalanceResponse
    media: Media | None = None


class AssetMetadataResponse(BaseModel):
    asset_schema: AssetSchema
    initial_supply: Annotated[int, Field(examples=[777])]
    max_supply: Annotated[int, Field(examples=[777])]
    known_circulating_supply: Annotated[int, Field(examples=[777])]
    timestamp: Annotated[int, Field(examples=[1691160565])]
    name: Annotated[str, Field(examples=["Collectible"])]
    precision: Annotated[int, Field(examples=[0])]
    ticker: Annotated[str | None, Field(examples=["USDT"])] = None
    details: Annotated[str | None, Field(examples=["asset details"])] = None
    token: Token | None = None


class AssetNIA(BaseModel):
    asset_id: Annotated[
        str, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ]
    ticker: Annotated[str, Field(examples=["USDT"])]
    name: Annotated[str, Field(examples=["Tether"])]
    details: Annotated[str | None, Field(examples=["asset details"])] = None
    precision: Annotated[int, Field(examples=[0])]
    issued_supply: Annotated[int, Field(examples=[777])]
    timestamp: Annotated[int, Field(examples=[1691160565])]
    added_at: Annotated[int, Field(examples=[1691161979])]
    balance: AssetBalanceResponse
    media: Media | None = None


class AssetUDA(BaseModel):
    asset_id: Annotated[
        str, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ]
    ticker: Annotated[str, Field(examples=["UNI"])]
    name: Annotated[str, Field(examples=["Unique"])]
    details: Annotated[str | None, Field(examples=["asset details"])] = None
    precision: Annotated[int, Field(examples=[0])]
    timestamp: Annotated[int, Field(examples=[1691160565])]
    added_at: Annotated[int, Field(examples=[1691161979])]
    balance: AssetBalanceResponse
    token: TokenLight | None = None


class Channel(BaseModel):
    channel_id: Annotated[
        str, Field(examples=["8129afe1b1d7cf60d5e1bf4c04b09bec925ed4df5417ceee0484e24f816a105a"])
    ]
    funding_txid: Annotated[
        str | None,
        Field(examples=["5a106a814fe28404eece1754dfd45e92ec9bb0044cbfe1d560cfd7b1e1af2981"]),
    ] = None
    peer_pubkey: Annotated[
        str, Field(examples=["03b79a4bc1ec365524b4fab9a39eb133753646babb5a1da5c4bc94c53110b7795d"])
    ]
    peer_alias: Annotated[str | None, Field(examples=[None])] = None
    short_channel_id: Annotated[int | None, Field(examples=[120946279120896])] = None
    status: ChannelStatus
    ready: Annotated[bool, Field(examples=[False])]
    capacity_sat: Annotated[int, Field(examples=[30010])]
    local_balance_sat: Annotated[int, Field(examples=[28616])]
    outbound_balance_msat: Annotated[int, Field(examples=[21616000])]
    inbound_balance_msat: Annotated[int, Field(examples=[6394000])]
    next_outbound_htlc_limit_msat: Annotated[int, Field(examples=[3001000])]
    next_outbound_htlc_minimum_msat: Annotated[int, Field(examples=[1])]
    is_usable: Annotated[bool, Field(examples=[False])]
    public: Annotated[bool, Field(examples=[True])]
    asset_id: Annotated[
        str | None, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ] = None
    asset_local_amount: Annotated[int | None, Field(examples=[777])] = None
    asset_remote_amount: Annotated[int | None, Field(examples=[0])] = None


class CheckIndexerUrlResponse(BaseModel):
    indexer_protocol: IndexerProtocol


class DecodeRGBInvoiceResponse(BaseModel):
    recipient_id: Annotated[
        str, Field(examples=["bcrt:utxob:cbgHUJ4e-7QyKY4U-Jsj5AZw-oI0gxZh-7fxQY2_-tFFUAZN-4CgpX"])
    ]
    recipient_type: RecipientType
    asset_schema: AssetSchema | None = None
    asset_id: Annotated[
        str | None, Field(examples=["rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-brRJrzE"])
    ] = None
    assignment: Annotated[
        AssignmentFungible
        | AssignmentNonFungible
        | AssignmentInflationRight
        | AssignmentReplaceRight
        | AssignmentAny,
        Field(discriminator="type"),
    ]
    network: BitcoinNetwork
    expiration_timestamp: Annotated[int | None, Field(examples=[1698325849])] = None
    transport_endpoints: list[str]


class GetPaymentResponse(BaseModel):
    payment: Payment


class IssueAssetCFAResponse(BaseModel):
    asset: AssetCFA


class IssueAssetNIAResponse(BaseModel):
    asset: AssetNIA


class IssueAssetUDAResponse(BaseModel):
    asset: AssetUDA


class ListAssetsResponse(BaseModel):
    nia: list[AssetNIA]
    uda: list[AssetUDA]
    cfa: list[AssetCFA]


class ListChannelsResponse(BaseModel):
    channels: list[Channel]


class ListPaymentsResponse(BaseModel):
    payments: list[Payment]


class ListPeersResponse(BaseModel):
    peers: list[Peer]


class Recipient(BaseModel):
    recipient_id: Annotated[
        str, Field(examples=["bcrt:utxob:2FZsSuk-iyVQLVuU4-Gc6J4qkE8-mLS17N4jd-MEx6cWz9F-MFkyE1n"])
    ]
    witness_data: WitnessData | None = None
    assignment: Annotated[
        AssignmentFungible
        | AssignmentNonFungible
        | AssignmentInflationRight
        | AssignmentReplaceRight
        | AssignmentAny,
        Field(discriminator="type"),
    ]
    transport_endpoints: list[str]


class RgbAllocation(BaseModel):
    asset_id: Annotated[
        str | None, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ] = None
    assignment: Annotated[
        AssignmentFungible
        | AssignmentNonFungible
        | AssignmentInflationRight
        | AssignmentReplaceRight
        | AssignmentAny,
        Field(discriminator="type"),
    ]
    settled: Annotated[bool, Field(examples=[False])]


class RgbInvoiceRequest(BaseModel):
    min_confirmations: Annotated[int, Field(examples=[1])]
    asset_id: Annotated[
        str | None, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ] = None
    assignment: (
        AssignmentFungible
        | AssignmentNonFungible
        | AssignmentInflationRight
        | AssignmentReplaceRight
        | AssignmentAny
        | None
    ) = None
    duration_seconds: Annotated[int | None, Field(examples=[86400])] = None
    witness: Annotated[bool, Field(examples=[False])]


class SendRgbRequest(BaseModel):
    donation: Annotated[bool, Field(examples=[False])]
    fee_rate: Annotated[int, Field(examples=[5])]
    min_confirmations: Annotated[int, Field(examples=[1])]
    recipient_map: Annotated[
        dict[str, list[Recipient]],
        Field(
            examples=[
                {
                    "rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8": [
                        {
                            "recipient_id": "utxob:2FjRqgQ-eEWCVHY5-zmpFtYzT-gGm3MdR-sTnxNcS-7RtUbY9-4NYuuh",
                            "assignment": {"Fungible": 400},
                            "transport_endpoints": ["rpc://127.0.0.1:3000/json-rpc"],
                        },
                        {
                            "recipient_id": "utxob:3GkRrhR-fFXDLIZ6-0anqGuzU-hHn4NeS-tUoyOdT-8SuVcZ0-5OZvvi",
                            "assignment": {"Fungible": 200},
                            "transport_endpoints": ["rpc://127.0.0.1:3000/json-rpc"],
                        },
                    ],
                    "rgb:d8qDVS5X-ICVG2uM-CPr3yO4-lfBhgjt-7FN1EPE-ApY1LcM": [
                        {
                            "recipient_id": "utxob:4HlSsiS-gGYEMKA7-1borHvaV-iIo5OfT-uVpzPeU-9TvWdA1-6PAwwj",
                            "assignment": {"Fungible": 100},
                            "transport_endpoints": ["rpc://127.0.0.1:3000/json-rpc"],
                        }
                    ],
                }
            ]
        ),
    ]
    skip_sync: Annotated[bool, Field(examples=[False])]


class Swap(BaseModel):
    qty_from: Annotated[int, Field(examples=[30])]
    qty_to: Annotated[int, Field(examples=[10])]
    from_asset: Annotated[
        str | None, Field(examples=["rgb:CJkb4YZw-jRiz2sk-~PARPio-wtVYI1c-XAEYCqO-wTfvRZ8"])
    ] = None
    to_asset: Annotated[
        str | None, Field(examples=["rgb:icfqnK9y-wObZKTu-XJcDL98-sKbE5Mh-OuDJhiI-brRJrzE"])
    ] = None
    payment_hash: Annotated[
        str, Field(examples=["7c2c95b9c2aa0a7d140495b664de7973b76561de833f0dd84def3efa08941664"])
    ]
    status: SwapStatus
    requested_at: Annotated[int, Field(examples=[1691160765])]
    initiated_at: Annotated[int | None, Field(examples=[1691168512])] = None
    expires_at: Annotated[int, Field(examples=[1691172703])]
    completed_at: Annotated[int | None, Field(examples=[1691171075])] = None


class Transaction(BaseModel):
    transaction_type: TransactionType
    txid: Annotated[
        str, Field(examples=["7c2c95b9c2aa0a7d140495b664de7973b76561de833f0dd84def3efa08941664"])
    ]
    received: Annotated[int, Field(examples=[650])]
    sent: Annotated[int, Field(examples=[1050])]
    fee: Annotated[int, Field(examples=[100])]
    confirmation_time: BlockTime | None = None


class TransferTransportEndpoint(BaseModel):
    endpoint: Annotated[str, Field(examples=["http://127.0.0.1:3000/json-rpc"])]
    transport_type: Literal["JsonRpc"]
    used: Annotated[bool, Field(examples=[False])]


class Unspent(BaseModel):
    utxo: Utxo
    rgb_allocations: list[RgbAllocation]


class GetSwapResponse(BaseModel):
    swap: Swap


class ListSwapsResponse(BaseModel):
    maker: list[Swap]
    taker: list[Swap]


class ListTransactionsResponse(BaseModel):
    transactions: list[Transaction]


class ListUnspentsResponse(BaseModel):
    unspents: list[Unspent]


class Transfer(BaseModel):
    idx: Annotated[int, Field(examples=[1])]
    created_at: Annotated[int, Field(examples=[1691160765])]
    updated_at: Annotated[int, Field(examples=[1691162674])]
    status: TransferStatus
    requested_assignment: (
        AssignmentFungible
        | AssignmentNonFungible
        | AssignmentInflationRight
        | AssignmentReplaceRight
        | AssignmentAny
        | None
    ) = None
    assignments: list[
        Annotated[
            AssignmentFungible
            | AssignmentNonFungible
            | AssignmentInflationRight
            | AssignmentReplaceRight
            | AssignmentAny,
            Field(discriminator="type"),
        ]
    ]
    kind: TransferKind
    txid: Annotated[
        str | None,
        Field(examples=["7c2c95b9c2aa0a7d140495b664de7973b76561de833f0dd84def3efa08941664"]),
    ] = None
    recipient_id: Annotated[
        str | None, Field(examples=["61qsVbWtkNmU54F2i6qtB9uSmEGsPoaeypCi5uC5uctZ"])
    ] = None
    receive_utxo: Annotated[
        str | None,
        Field(examples=["efed66f5309396ff43c8a09941c8103d9d5bbffd473ad9f13013ac89fb6b4671:0"]),
    ] = None
    change_utxo: Annotated[str | None, Field(examples=[None])] = None
    expiration: Annotated[int | None, Field(examples=[1691171612])] = None
    transport_endpoints: list[TransferTransportEndpoint]


class ListTransfersResponse(BaseModel):
    transfers: list[Transfer]
