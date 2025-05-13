import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from typing import List, Dict, Any
import uvicorn
import time
import uuid

# Import protobuf generated classes if we need to construct responses
# from kaleidoswap_sdk.generated.kaleidoswap_pb2 import (
#     ClientAsset, AssetIface, Media, AssetBalance, AssetsResponse,
#     Pair, PairsResponse,
#     PairQuoteRequest as PairQuoteRequestProto, # Alias to avoid conflict with Pydantic model
#     PairQuoteResponse as PairQuoteResponseProto, # Alias
#     WebSocketRequest, WebSocketResponse,
#     Subscribe, Unsubscribe, Ping, PriceUpdate, PriceFeedData,
#     SubscriptionConfirmation, UnsubscriptionConfirmation, Pong, Error
# )
# from google.protobuf.timestamp_pb2 import Timestamp


# Pydantic models for request bodies if not using proto directly for HTTP
from pydantic import BaseModel

class MockPairQuoteRequest(BaseModel):
    pair_id: str
    from_asset_id: str
    from_amount: int
    to_asset_id: str


app = FastAPI()

# --- Mock Data Store ---
mock_assets_data = [
    {
        "asset_id": "BTC",
        "asset_iface": "RGB20", # Or use the enum value if constructing proto
        "ticker": "BTC",
        "name": "Bitcoin",
        "precision": 8,
        "issued_supply": 2100000000000000, # Example supply
        "media": {"file_path": "http://bitcoin.org/bitcoin.png"},
        "is_active": True,
        "timestamp_added": int(time.time()) - 86400 * 10, # 10 days ago
        "asset_schema": "Nia", # Or enum value
        "details": "Native Bitcoin",
        "balance": {"settled": 100000000, "future": 0, "spendable": 100000000}
    },
    {
        "asset_id": "rgb:unique_rgb_id_usdt",
        "asset_iface": "RGB20",
        "ticker": "USDT",
        "name": "Tether USD",
        "precision": 6,
        "issued_supply": 1000000000000000, # Example supply
        "media": {"file_path": "http://tether.to/tether.png"},
        "is_active": True,
        "timestamp_added": int(time.time()) - 86400 * 5, # 5 days ago
        "asset_schema": "Nia",
        "details": "USD-pegged stablecoin on RGB",
        "balance": {"settled": 5000000000, "future": 0, "spendable": 5000000000}
    }
]

mock_pairs_data = [
    {
        "id": "BTC_USDT_mock",
        "base_asset_ticker": "BTC",
        "base_asset_id": "BTC",
        "quote_asset_ticker": "USDT",
        "quote_asset_id": "rgb:unique_rgb_id_usdt",
        "is_active": True,
        "min_order_size": 0.0001,
        "max_order_size": 10.0,
        "price_precision": 2, # For USDT/BTC, e.g., 60000.00
        "quantity_precision": 8 # For BTC amount
    }
]

# --- REST Endpoints ---
@app.get("/market/assets")
async def list_assets():
    # In a real scenario, this might convert mock_assets_data to AssetsResponse proto
    return {
        "assets": mock_assets_data,
        "network": "regtest_mock",
        "response_timestamp": int(time.time())
    }

@app.get("/market/pairs")
async def list_pairs():
    return {"pairs": mock_pairs_data}

@app.post("/market/quote")
async def get_quote(request: MockPairQuoteRequest):
    # Find the pair to determine price precision etc.
    pair_info = next((p for p in mock_pairs_data if p["id"] == request.pair_id), None)
    if not pair_info:
        raise HTTPException(status_code=404, detail=f"Pair {request.pair_id} not found")

    if request.from_asset_id == "BTC" and request.to_asset_id == "rgb:unique_rgb_id_usdt":
        # Example: 1 BTC = 60,000 USDT
        # from_amount is in satoshis for BTC
        btc_value = request.from_amount / (10**8) # Convert sats to BTC
        to_amount_usdt_atomic = int(btc_value * 60000 * (10**6)) # 60k price, 6 precision for USDT
        price = 60000.0
    elif request.from_asset_id == "rgb:unique_rgb_id_usdt" and request.to_asset_id == "BTC":
        # Example: 1 USDT = 1/60,000 BTC
        usdt_value = request.from_amount / (10**6) # Convert atomic USDT to USDT
        to_amount_btc_sats = int((usdt_value / 60000) * (10**8))
        price = 1.0/60000.0
    else:
        raise HTTPException(status_code=400, detail="Unsupported asset pair for quoting")

    return {
        "rfq_id": str(uuid.uuid4()),
        "pair_id": request.pair_id,
        "from_asset_id": request.from_asset_id,
        "to_asset_id": request.to_asset_id,
        "from_amount": request.from_amount,
        "to_amount": to_amount_usdt_atomic if request.to_asset_id == "rgb:unique_rgb_id_usdt" else to_amount_btc_sats,
        "price": price,
        "fee": int(0.001 * (to_amount_usdt_atomic if request.to_asset_id == "rgb:unique_rgb_id_usdt" else to_amount_btc_sats)), # Example 0.1% fee
        "fee_rate": 0.001,
        "price_precision": pair_info["price_precision"],
        "timestamp": int(time.time()),
        "expires_at": int(time.time()) + 60 # Quote expires in 60 seconds
    }

# --- WebSocket Endpoint (Basic Structure for later Protobuf integration) ---
# @app.websocket("/ws/{client_id}")
# async def websocket_endpoint(websocket: WebSocket, client_id: str):
#     await websocket.accept()
#     print(f"Mock WebSocket client {client_id} connected.")
#     try:
#         while True:
#             # For now, just keeps connection open.
#             # Later, will receive ClientToServerMessage (Protobuf)
#             # and send ServerToClientMessage (Protobuf)
#             await asyncio.sleep(0.01) # Keep alive, prevent tight loop on disconnect
#             # Example: data_bytes = await websocket.receive_bytes()
#             # req = WebSocketRequest()
#             # req.ParseFromString(data_bytes)
#             # ... process req ...
#             # await websocket.send_bytes(resp.SerializeToString())
#             await websocket.receive_text() # Keep it simple for now

#     except WebSocketDisconnect:
#         print(f"Mock WebSocket client {client_id} disconnected.")
#     except Exception as e:
#         print(f"Mock WebSocket error for {client_id}: {e}")
#     finally:
#         print(f"Closing Mock WebSocket for {client_id}")


if __name__ == "__main__":
    # Note: Run this with `uvicorn mock_server:app --reload --port 8001`
    # (or a different port to avoid conflict with main app)
    # from the `kaleido-sdk/python/tests/` directory.
    uvicorn.run(app, host="0.0.0.0", port=8001) 