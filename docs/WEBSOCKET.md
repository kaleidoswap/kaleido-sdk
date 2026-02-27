# WebSocket Usage Guide

This document provides comprehensive guidance on using WebSocket functionality in the Kaleidoswap SDK for real-time data streams and low-latency operations.

## Table of Contents

- [Overview](#overview)
- [Connection Management](#connection-management)
- [Event Handling](#event-handling)
- [Real-time Quotes](#real-time-quotes)
- [Price Streaming](#price-streaming)
- [Advanced Patterns](#advanced-patterns)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Overview

The Kaleidoswap SDK provides WebSocket support for:

- **Real-time Price Updates**: Live price feeds for trading pairs
- **Low-latency Quotes**: Faster quote requests via WebSocket
- **Order Status Updates**: Real-time swap and order status changes
- **Market Data Streaming**: Continuous market data feeds
- **Event Notifications**: System events and alerts

## Connection Management

### Basic Connection

#### Python

```python
import asyncio
from kaleidoswap_sdk import KaleidoClient

async def basic_websocket():
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        # Connect to WebSocket
        ws = client.maker.enable_websocket("ws://localhost:8000/ws")
        await ws.connect()
        print("WebSocket connected successfully!")
        
        # Your WebSocket operations here
        await asyncio.sleep(10)
        
    finally:
        # Always disconnect when done
        await ws.disconnect()
        await client.close()
        print("WebSocket disconnected")

if __name__ == "__main__":
    asyncio.run(basic_websocket())
```

#### TypeScript

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

async function basicWebSocket() {
    const client = new KaleidoClient({
        baseUrl: 'https://api.kaleidoswap.com',
        nodeUrl: 'https://node.kaleidoswap.com'
    });
    
    try {
        await client.connect();
        console.log('WebSocket connected successfully!');
        
        // Your WebSocket operations here
        await new Promise(resolve => setTimeout(resolve, 10000));
        
    } finally {
        await client.disconnect();
        console.log('WebSocket disconnected');
    }
}

basicWebSocket();
```

### Connection with Context Manager

#### Python

```python
async def websocket_with_context():
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        ws = client.maker.enable_websocket("ws://localhost:8000/ws")
        await ws.connect()
        
        # Your operations here
        print("Connected and ready for WebSocket operations")
    finally:
        await ws.disconnect()
        await client.close()
```

### Advanced Connection Configuration

#### Python

```python
client = KaleidoClient.create(
    base_url="https://api.kaleidoswap.com",
    node_url="https://node.kaleidoswap.com"
)

ws = client.maker.enable_websocket(
    "ws://localhost:8000/ws",
    ping_interval=30,        # Ping every 30 seconds
    ping_timeout=10,         # 10 second ping timeout
    close_timeout=10,        # 10 second close timeout
    max_size=2**20,         # 1MB max message size
    max_queue=32,           # 32 message queue size
    compression=None        # No compression
)
```

## Event Handling

### Basic Event Handlers

#### Python

```python
import asyncio
from kaleidoswap_sdk import KaleidoClient

class WebSocketHandler:
    def __init__(self):
        self.message_count = 0
    
    async def handle_price_update(self, data):
        """Handle price update events."""
        self.message_count += 1
        print(f"Price Update #{self.message_count}:")
        print(f"  Pair: {data.get('pair')}")
        print(f"  Price: ${data.get('price', 0):.2f}")
        print(f"  Timestamp: {data.get('timestamp')}")
        print()
    
    async def handle_quote_response(self, data):
        """Handle quote response events."""
        print(f"Quote Response:")
        print(f"  RFQ ID: {data.get('rfq_id')}")
        print(f"  Price: ${data.get('price', 0):.2f}")
        print(f"  Amount: {data.get('to_amount')}")
        print()
    
    async def handle_swap_update(self, data):
        """Handle swap status update events."""
        print(f"Swap Update:")
        print(f"  Payment Hash: {data.get('payment_hash')}")
        print(f"  Status: {data.get('status')}")
        print(f"  Progress: {data.get('progress', 0):.1%}")
        print()
    
    async def handle_error(self, data):
        """Handle error events."""
        print(f"WebSocket Error:")
        print(f"  Code: {data.get('code')}")
        print(f"  Message: {data.get('message')}")
        print()

async def event_handling_example():
    handler = WebSocketHandler()
    
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        ws = client.maker.enable_websocket("ws://localhost:8000/ws")
        await ws.connect()
        
        # Register event handlers
        ws.on("price_update", handler.handle_price_update)
        ws.on("quote_response", handler.handle_quote_response)
        ws.on("swap_update", handler.handle_swap_update)
        ws.on("error", handler.handle_error)
        
        print("Event handlers registered. Waiting for events...")
        
        # Keep connection alive
        try:
            while True:
                await asyncio.sleep(1)
        except KeyboardInterrupt:
            print("Shutting down...")
    finally:
        await ws.disconnect()
        await client.close()

if __name__ == "__main__":
    asyncio.run(event_handling_example())
```

### Event Handler with State Management

#### Python

```python
import asyncio
from typing import Dict, List
from datetime import datetime

class StatefulEventHandler:
    def __init__(self):
        self.price_history: Dict[str, List] = {}
        self.active_quotes: Dict[str, Dict] = {}
        self.swap_status: Dict[str, str] = {}
    
    async def handle_price_update(self, data):
        """Handle and store price updates."""
        pair = data.get('pair')
        price = data.get('price')
        timestamp = data.get('timestamp', datetime.now().timestamp())
        
        if not pair or not price:
            return
        
        # Store price history
        if pair not in self.price_history:
            self.price_history[pair] = []
        
        self.price_history[pair].append({
            'price': price,
            'timestamp': timestamp
        })
        
        # Keep only last 100 prices
        if len(self.price_history[pair]) > 100:
            self.price_history[pair] = self.price_history[pair][-100:]
        
        # Calculate price change
        if len(self.price_history[pair]) >= 2:
            prev_price = self.price_history[pair][-2]['price']
            change = (price - prev_price) / prev_price * 100
            
            print(f"{pair}: ${price:.2f} ({change:+.2f}%)")
    
    async def handle_quote_response(self, data):
        """Handle and store quote responses."""
        rfq_id = data.get('rfq_id')
        if rfq_id:
            self.active_quotes[rfq_id] = data
            print(f"Quote {rfq_id}: ${data.get('price', 0):.2f}")
    
    async def handle_swap_update(self, data):
        """Handle swap status updates."""
        payment_hash = data.get('payment_hash')
        status = data.get('status')
        
        if payment_hash and status:
            old_status = self.swap_status.get(payment_hash)
            self.swap_status[payment_hash] = status
            
            if old_status != status:
                print(f"Swap {payment_hash[:8]}... status: {old_status} -> {status}")
    
    def get_price_stats(self, pair: str) -> Dict:
        """Get price statistics for a pair."""
        if pair not in self.price_history or not self.price_history[pair]:
            return {}
        
        prices = [p['price'] for p in self.price_history[pair]]
        
        return {
            'current': prices[-1],
            'min': min(prices),
            'max': max(prices),
            'avg': sum(prices) / len(prices),
            'count': len(prices)
        }
    
    def print_stats(self):
        """Print current statistics."""
        print("\n=== Price Statistics ===")
        for pair in self.price_history:
            stats = self.get_price_stats(pair)
            if stats:
                print(f"{pair}:")
                print(f"  Current: ${stats['current']:.2f}")
                print(f"  Range: ${stats['min']:.2f} - ${stats['max']:.2f}")
                print(f"  Average: ${stats['avg']:.2f}")
                print(f"  Updates: {stats['count']}")
        
        print(f"\nActive Quotes: {len(self.active_quotes)}")
        print(f"Tracked Swaps: {len(self.swap_status)}")

async def stateful_handler_example():
    handler = StatefulEventHandler()
    
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        ws = client.maker.enable_websocket("ws://localhost:8000/ws")
        await ws.connect()
        
        # Register handlers
        ws.on("price_update", handler.handle_price_update)
        ws.on("quote_response", handler.handle_quote_response)
        ws.on("swap_update", handler.handle_swap_update)
        
        print("Collecting data... Press Ctrl+C to show stats and exit")
        
        try:
            while True:
                await asyncio.sleep(30)  # Print stats every 30 seconds
                handler.print_stats()
        except KeyboardInterrupt:
            handler.print_stats()
            print("Final statistics printed.")
    finally:
        await ws.disconnect()
        await client.close()

if __name__ == "__main__":
    asyncio.run(stateful_handler_example())
```

## Real-time Quotes

### WebSocket Quote Requests

#### Python

```python
import asyncio
from kaleidoswap_sdk import KaleidoClient
from kaleidoswap_sdk import PairQuoteRequest, SwapLegInput, Layer

async def realtime_quotes():
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        # Request quotes via HTTP
        pairs = [
            ('BTC', 'USDT', 100000000),  # 1 BTC
            ('ETH', 'USDT', 1000000000), # 10 ETH (example)
        ]
        
        for from_asset, to_asset, amount in pairs:
            try:
                print(f"Requesting quote: {from_asset} -> {to_asset}")
                
                quote = await client.maker.get_quote(
                    PairQuoteRequest(
                        from_asset=SwapLegInput(asset_id=from_asset, layer=Layer.BTC_LN, amount=amount),
                        to_asset=SwapLegInput(asset_id=to_asset, layer=Layer.RGB_LN)
                    )
                )
                
                print(f"  Price: ${quote.price:.2f}")
                print(f"  Amount: {quote.to_amount}")
                print(f"  Expires: {quote.expires_at}")
                print()
                
            except Exception as e:
                print(f"Error getting quote: {e}")
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(realtime_quotes())
```

### Batch Quote Requests

#### Python

```python
import asyncio
from kaleidoswap_sdk import KaleidoClient
from kaleidoswap_sdk import PairQuoteRequest, SwapLegInput, Layer

async def batch_quote_requests():
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        # Define multiple quote requests
        amounts = [50000000, 100000000, 200000000]
        requests = [
            PairQuoteRequest(
                from_asset=SwapLegInput(asset_id="BTC", layer=Layer.BTC_LN, amount=amt),
                to_asset=SwapLegInput(asset_id="USDT", layer=Layer.RGB_LN)
            )
            for amt in amounts
        ]
        
        # Execute all requests concurrently via HTTP
        quotes = await asyncio.gather(*[
            client.maker.get_quote(req) for req in requests
        ])
        
        # Display results
        for i, quote in enumerate(quotes):
            amount_btc = amounts[i] / 100000000
            print(f"Quote for {amount_btc} BTC:")
            print(f"  Price: ${quote.price:.2f}")
            print(f"  Total: {quote.to_amount} USDT")
            print(f"  Rate: {quote.to_amount / amounts[i] * 100000000:.2f} USDT/BTC")
            print()
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(batch_quote_requests())
```

## Price Streaming

### Continuous Price Monitoring

#### Python

```python
import asyncio
from typing import Dict, Optional
from kaleidoswap_sdk import KaleidoClient

class PriceStreamer:
    def __init__(self, client: KaleidoClient, ws_url: str):
        self.client = client
        self.ws_url = ws_url
        self.ws = None
        self.subscriptions: Dict[str, bool] = {}
        self.latest_prices: Dict[str, float] = {}
        self.price_callbacks: Dict[str, list] = {}
    
    async def subscribe_to_pair(self, pair: str, callback=None):
        """Subscribe to price updates for a trading pair."""
        if pair not in self.subscriptions:
            self.subscriptions[pair] = True
            self.price_callbacks[pair] = []
            
            # In practice, you would send subscription message via WebSocket
            print(f"Subscribed to {pair}")
        
        if callback:
            self.price_callbacks[pair].append(callback)
    
    async def unsubscribe_from_pair(self, pair: str):
        """Unsubscribe from price updates for a trading pair."""
        if pair in self.subscriptions:
            del self.subscriptions[pair]
            del self.price_callbacks[pair]
            if pair in self.latest_prices:
                del self.latest_prices[pair]
            
            # In practice, you would send unsubscription message
            print(f"Unsubscribed from {pair}")
    
    async def handle_price_update(self, data):
        """Handle incoming price updates."""
        pair = data.get('pair')
        price = data.get('price')
        
        if pair and price and pair in self.subscriptions:
            old_price = self.latest_prices.get(pair)
            self.latest_prices[pair] = price
            
            # Call registered callbacks
            for callback in self.price_callbacks.get(pair, []):
                try:
                    await callback(pair, price, old_price)
                except Exception as e:
                    print(f"Error in price callback: {e}")
    
    async def start_streaming(self):
        """Start the price streaming service."""
        self.ws = self.client.maker.enable_websocket(self.ws_url)
        await self.ws.connect()
        self.ws.on("price_update", self.handle_price_update)
        print("Price streaming started")
    
    async def stop_streaming(self):
        """Stop the price streaming service."""
        if self.ws:
            await self.ws.disconnect()
        print("Price streaming stopped")
    
    def get_latest_price(self, pair: str) -> Optional[float]:
        """Get the latest price for a pair."""
        return self.latest_prices.get(pair)
    
    def get_all_prices(self) -> Dict[str, float]:
        """Get all latest prices."""
        return self.latest_prices.copy()

# Example callbacks
async def price_alert_callback(pair: str, price: float, old_price: Optional[float]):
    """Alert on significant price changes."""
    if old_price and abs(price - old_price) / old_price > 0.01:  # 1% change
        change = (price - old_price) / old_price * 100
        direction = "📈" if change > 0 else "📉"
        print(f"{direction} {pair}: ${price:.2f} ({change:+.2f}%)")

async def price_log_callback(pair: str, price: float, old_price: Optional[float]):
    """Log all price updates."""
    timestamp = asyncio.get_event_loop().time()
    print(f"[{timestamp:.3f}] {pair}: ${price:.2f}")

async def price_streaming_example():
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    streamer = PriceStreamer(client, "ws://localhost:8000/ws")
    
    try:
        await streamer.start_streaming()
        
        # Subscribe to pairs with callbacks
        await streamer.subscribe_to_pair("BTC/USDT", price_alert_callback)
        await streamer.subscribe_to_pair("ETH/USDT", price_log_callback)
        await streamer.subscribe_to_pair("LTC/BTC")  # No callback
        
        print("Streaming prices... Press Ctrl+C to stop")
        
        # Stream for a while
        await asyncio.sleep(60)
        
    except KeyboardInterrupt:
        print("Stopping price streaming...")
    finally:
        await streamer.stop_streaming()
        await client.close()

if __name__ == "__main__":
    asyncio.run(price_streaming_example())
```

## Advanced Patterns

### WebSocket Reconnection Handler

#### Python

```python
import asyncio
import logging
from kaleidoswap_sdk import KaleidoClient

class ReconnectingWebSocketManager:
    def __init__(self, client: KaleidoClient, ws_url: str):
        self.client = client
        self.ws_url = ws_url
        self.ws = None
        self.connected = False
        self.reconnect_attempts = 0
        self.max_reconnect_attempts = 10
        self.reconnect_delay = 5
        self.event_handlers = {}
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    async def connect_with_retry(self):
        """Connect with automatic retry logic."""
        while self.reconnect_attempts < self.max_reconnect_attempts:
            try:
                self.ws = self.client.maker.enable_websocket(self.ws_url)
                await self.ws.connect()
                self.connected = True
                self.reconnect_attempts = 0
                
                # Re-register event handlers
                for event, handler in self.event_handlers.items():
                    self.ws.on(event, handler)
                
                self.logger.info("WebSocket connected successfully")
                return True
                
            except Exception as e:
                self.reconnect_attempts += 1
                self.logger.warning(
                    f"Connection attempt {self.reconnect_attempts} failed: {e}"
                )
                
                if self.reconnect_attempts < self.max_reconnect_attempts:
                    delay = self.reconnect_delay * (2 ** (self.reconnect_attempts - 1))
                    self.logger.info(f"Retrying in {delay} seconds...")
                    await asyncio.sleep(delay)
                else:
                    self.logger.error("Max reconnection attempts reached")
                    return False
        
        return False
    
    async def handle_disconnect(self):
        """Handle unexpected disconnections."""
        if self.connected:
            self.connected = False
            self.logger.warning("WebSocket disconnected unexpectedly")
            
            # Attempt to reconnect
            await self.connect_with_retry()
    
    def register_handler(self, event: str, handler):
        """Register an event handler that persists across reconnections."""
        self.event_handlers[event] = handler
        if self.connected and self.ws:
            self.ws.on(event, handler)
    
    async def start(self):
        """Start the WebSocket manager."""
        return await self.connect_with_retry()
    
    async def stop(self):
        """Stop the WebSocket manager."""
        self.connected = False
        if self.ws:
            await self.ws.disconnect()
        self.logger.info("WebSocket manager stopped")

async def reconnecting_websocket_example():
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    manager = ReconnectingWebSocketManager(client, "ws://localhost:8000/ws")
    
    try:
        # Register persistent event handlers
        async def handle_price(data):
            print(f"Price: {data}")
        
        async def handle_error(data):
            print(f"Error: {data}")
            await manager.handle_disconnect()
        
        manager.register_handler("price_update", handle_price)
        manager.register_handler("error", handle_error)
        
        # Start manager
        if await manager.start():
            try:
                print("WebSocket manager started. Press Ctrl+C to stop")
                while True:
                    await asyncio.sleep(1)
            except KeyboardInterrupt:
                print("Stopping...")
        else:
            print("Failed to start WebSocket manager")
        
        await manager.stop()
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(reconnecting_websocket_example())
```

### Multi-pair Quote Streaming

#### Python

```python
import asyncio
from typing import Dict, List
from kaleidoswap_sdk import KaleidoClient
from kaleidoswap_sdk import PairQuoteRequest, SwapLegInput, Layer

class MultiPairQuoteStreamer:
    def __init__(self, client: KaleidoClient):
        self.client = client
        self.stop_handles: Dict[str, callable] = {}
        self.latest_quotes: Dict[str, Dict] = {}
        self.streaming = False
    
    async def add_pair(self, pair: str, amount: int):
        """Add a pair to stream quotes for."""
        from_asset, to_asset = pair.split('/')
        
        async def on_update(data):
            self.latest_quotes[pair] = data
            price = data.get('price', 0)
            to_amount = data.get('to_amount', 0)
            print(f"📊 {pair}: ${price:.2f} -> {to_amount}")
        
        stop = await self.client.maker.stream_quotes(
            from_asset=from_asset, to_asset=to_asset,
            from_amount=amount,
            from_layer=Layer.BTC_LN, to_layer=Layer.RGB_LN,
            on_update=on_update,
        )
        self.stop_handles[pair] = stop
        
        print(f"Added {pair} to quote stream (amount: {amount})")
    
    def remove_pair(self, pair: str):
        """Remove a pair from quote streaming."""
        if pair in self.stop_handles:
            self.stop_handles[pair]()
            del self.stop_handles[pair]
            if pair in self.latest_quotes:
                del self.latest_quotes[pair]
            print(f"Removed {pair} from quote stream")
    
    def stop_all(self):
        """Stop all quote streams."""
        for pair, stop in self.stop_handles.items():
            stop()
        self.stop_handles.clear()
    
    def get_latest_quote(self, pair: str) -> Dict:
        """Get latest quote for a pair."""
        return self.latest_quotes.get(pair, {})
    
    def get_all_quotes(self) -> Dict[str, Dict]:
        """Get all latest quotes."""
        return self.latest_quotes.copy()

async def multi_pair_streaming_example():
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    streamer = MultiPairQuoteStreamer(client)
    
    try:
        print("Starting multi-pair quote streaming...")
        
        # Add pairs to stream
        await streamer.add_pair("BTC/USDT", 100000000)   # 1 BTC
        await streamer.add_pair("ETH/USDT", 1000000000)  # 10 ETH
        await streamer.add_pair("LTC/BTC", 100000000)    # 1 LTC
        
        # Keep running until interrupted
        while True:
            await asyncio.sleep(1)
    except KeyboardInterrupt:
        print("Stopping quote streaming...")
        streamer.stop_all()
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(multi_pair_streaming_example())
```

## Error Handling

### WebSocket Error Recovery

#### Python

```python
import asyncio
import logging
from kaleidoswap_sdk import KaleidoClient

class RobustWebSocketClient:
    def __init__(self, base_url: str, node_url: str, ws_url: str):
        self.base_url = base_url
        self.node_url = node_url
        self.ws_url = ws_url
        self.client = None
        self.ws = None
        self.connected = False
        self.error_count = 0
        self.max_errors = 5
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    async def initialize(self):
        """Initialize the client."""
        self.client = KaleidoClient.create(
            base_url=self.base_url,
            node_url=self.node_url
        )
    
    async def connect(self):
        """Connect with error handling."""
        if not self.client:
            await self.initialize()
        
        try:
            self.ws = self.client.maker.enable_websocket(self.ws_url)
            await self.ws.connect()
            self.connected = True
            self.error_count = 0
            
            # Register error handler
            self.ws.on("error", self.handle_error)
            self.ws.on("connection_lost", self.handle_connection_lost)
            
            self.logger.info("WebSocket connected")
            return True
            
        except Exception as e:
            self.logger.error(f"Connection failed: {e}")
            return False
    
    async def handle_error(self, error_data):
        """Handle WebSocket errors."""
        self.error_count += 1
        error_message = error_data.get('message', 'Unknown error')
        error_code = error_data.get('code', 'No code')
        
        self.logger.warning(f"WebSocket error #{self.error_count}: {error_message} (Code: {error_code})")
        
        if self.error_count >= self.max_errors:
            self.logger.error("Too many errors, disconnecting")
            await self.disconnect()
        else:
            # Try to recover
            await self.recover_from_error()
    
    async def handle_connection_lost(self, data):
        """Handle connection loss."""
        self.connected = False
        self.logger.warning("WebSocket connection lost")
        
        # Attempt to reconnect
        await asyncio.sleep(5)
        await self.connect()
    
    async def recover_from_error(self):
        """Attempt to recover from errors."""
        if self.connected:
            try:
                # Send a ping to test connection
                await self.send_ping()
                self.logger.info("Connection appears healthy after error")
            except Exception as e:
                self.logger.warning(f"Recovery failed: {e}")
                await self.reconnect()
    
    async def send_ping(self):
        """Send a ping message."""
        # Implementation depends on WebSocket protocol
        pass
    
    async def reconnect(self):
        """Reconnect WebSocket."""
        await self.disconnect()
        await asyncio.sleep(2)
        await self.connect()
    
    async def disconnect(self):
        """Disconnect WebSocket."""
        if self.ws and self.connected:
            await self.ws.disconnect()
            self.connected = False
            self.logger.info("WebSocket disconnected")
    
    async def close(self):
        """Close both WebSocket and HTTP client."""
        await self.disconnect()
        if self.client:
            await self.client.close()

async def robust_websocket_example():
    robust_client = RobustWebSocketClient(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com",
        ws_url="ws://localhost:8000/ws"
    )
    
    try:
        if await robust_client.connect():
            print("Connected successfully, running for 60 seconds...")
            await asyncio.sleep(60)
        else:
            print("Failed to connect")
    finally:
        await robust_client.close()

if __name__ == "__main__":
    asyncio.run(robust_websocket_example())
```

## Best Practices

### 1. Connection Management

- Always use proper connection lifecycle management
- Implement reconnection logic for production applications
- Use context managers when possible for automatic cleanup
- Monitor connection health with ping/pong messages

### 2. Event Handling

- Use async event handlers to avoid blocking
- Implement proper error handling in event callbacks
- Consider using queues for high-frequency events
- Log important events for debugging

### 3. Resource Management

- Limit the number of concurrent connections
- Implement proper cleanup in finally blocks
- Use appropriate queue sizes for message buffering
- Monitor memory usage with long-running connections

### 4. Error Recovery

- Implement exponential backoff for reconnection attempts
- Set maximum retry limits to avoid infinite loops
- Log errors with sufficient context for debugging
- Gracefully degrade functionality when possible

### 5. Performance Optimization

- Batch multiple operations when possible
- Use appropriate ping intervals (not too frequent)
- Implement client-side rate limiting
- Consider message compression for high-throughput scenarios

### Example Production Configuration

#### Python

```python
production_client = KaleidoClient.create(
    base_url="https://api.kaleidoswap.com",
    node_url="https://node.kaleidoswap.com"
)

ws = production_client.maker.enable_websocket(
    "wss://api.kaleidoswap.com/ws",
    ping_interval=30,        # Conservative ping interval
    ping_timeout=10,         # Reasonable timeout
    close_timeout=5,         # Quick close
    max_size=1024*1024,     # 1MB max message
    max_queue=16,           # Moderate queue size
    compression="deflate"    # Enable compression
)
```

This comprehensive WebSocket guide provides all the tools and patterns needed to effectively use real-time features in the Kaleidoswap SDK, from basic connections to production-ready implementations with robust error handling and reconnection logic. 