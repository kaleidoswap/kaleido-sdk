# Examples

This document provides practical examples and usage patterns for the Kaleidoswap SDK.

## Table of Contents

- [Basic Market Data](#basic-market-data)
- [Simple Swap Operations](#simple-swap-operations)
- [Advanced Swap Workflows](#advanced-swap-workflows)
- [LSP Channel Management](#lsp-channel-management)
- [WebSocket Real-time Updates](#websocket-real-time-updates)
- [Error Handling Patterns](#error-handling-patterns)
- [Integration Examples](#integration-examples)

## Basic Market Data

### Get Available Assets and Pairs

#### Python

```python
import asyncio
from kaleidoswap_sdk.client import KaleidoClient

async def explore_market():
    async with KaleidoClient(
        api_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    ) as client:
        
        # Get all available assets
        assets_response = await client.list_assets()
        print(f"Network: {assets_response.network}")
        print(f"Available assets: {len(assets_response.assets)}")
        
        for asset in assets_response.assets:
            print(f"  {asset.ticker} ({asset.name})")
            print(f"    ID: {asset.asset_id}")
            print(f"    Precision: {asset.precision}")
            print(f"    Supply: {asset.issued_supply}")
            print(f"    Active: {asset.is_active}")
        
        # Get all trading pairs
        pairs_response = await client.list_pairs()
        print(f"\nAvailable pairs: {len(pairs_response.pairs)}")
        
        for pair in pairs_response.pairs:
            print(f"  {pair.base_asset}/{pair.quote_asset}")
            print(f"    Pair ID: {pair.id}")
            print(f"    Active: {pair.is_active}")
            print(f"    Min order: {pair.min_base_order_size}")
            print(f"    Max order: {pair.max_base_order_size}")

if __name__ == "__main__":
    asyncio.run(explore_market())
```

#### TypeScript

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

async function exploreMarket() {
    const client = new KaleidoClient({
        baseUrl: 'https://api.kaleidoswap.com',
        nodeUrl: 'https://node.kaleidoswap.com'
    });
    
    try {
        // Get all available assets
        const assetsResponse = await client.listAssets();
        console.log(`Network: ${assetsResponse.network}`);
        console.log(`Available assets: ${assetsResponse.assets.length}`);
        
        assetsResponse.assets.forEach(asset => {
            console.log(`  ${asset.ticker} (${asset.name})`);
            console.log(`    ID: ${asset.asset_id}`);
            console.log(`    Precision: ${asset.precision}`);
            console.log(`    Supply: ${asset.issued_supply}`);
            console.log(`    Active: ${asset.is_active}`);
        });
        
        // Get all trading pairs
        const pairsResponse = await client.listPairs();
        console.log(`\nAvailable pairs: ${pairsResponse.pairs.length}`);
        
        pairsResponse.pairs.forEach(pair => {
            console.log(`  ${pair.base_asset}/${pair.quote_asset}`);
            console.log(`    Pair ID: ${pair.id}`);
            console.log(`    Active: ${pair.is_active}`);
            console.log(`    Min order: ${pair.min_base_order_size}`);
            console.log(`    Max order: ${pair.max_base_order_size}`);
        });
        
    } catch (error) {
        console.error('Error exploring market:', error);
    }
}

exploreMarket();
```

### Get Multiple Quotes

#### Python

```python
async def compare_quotes():
    async with KaleidoClient(
        api_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    ) as client:
        
        # Define trade amounts
        amounts = [10000000, 50000000, 100000000]  # 0.1, 0.5, 1.0 BTC
        
        for amount in amounts:
            try:
                quote = await client.get_quote(
                    from_asset="BTC",
                    to_asset="USDT",
                    from_amount=amount
                )
                
                btc_amount = amount / 100000000  # Convert to BTC
                usdt_amount = quote.to_amount
                price = quote.price
                
                print(f"Quote for {btc_amount} BTC:")
                print(f"  Receives: {usdt_amount} USDT")
                print(f"  Price: ${price:.2f}")
                print(f"  RFQ ID: {quote.rfq_id}")
                print(f"  Expires: {quote.expires_at}")
                print()
                
            except Exception as e:
                print(f"Error getting quote for {amount}: {e}")
```

## Simple Swap Operations

### Basic Maker Swap Flow

#### Python

```python
import asyncio
from kaleidoswap_sdk.client import KaleidoClient
from kaleidoswap_sdk.models import InitMakerSwapRequest

async def simple_maker_swap():
    async with KaleidoClient(
        api_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    ) as client:
        
        try:
            # Step 1: Get a quote
            print("Getting quote...")
            quote = await client.get_quote(
                from_asset="BTC",
                to_asset="USDT",
                from_amount=50000000  # 0.5 BTC
            )
            
            print(f"Quote: {quote.from_amount} BTC -> {quote.to_amount} USDT")
            print(f"Price: ${quote.price:.2f}")
            print(f"RFQ ID: {quote.rfq_id}")
            
            # Step 2: Initialize maker swap
            print("\nInitializing maker swap...")
            swap_init = await client.init_maker_swap(
                InitMakerSwapRequest(
                    rfq_id=quote.rfq_id,
                    from_asset=quote.from_asset,
                    to_asset=quote.to_asset,
                    from_amount=quote.from_amount,
                    to_amount=quote.to_amount
                )
            )
            
            print(f"Payment hash: {swap_init.payment_hash}")
            print(f"Swap string: {swap_init.swapstring}")
            
            # Step 3: Share swap string with taker
            print(f"\nShare this swap string with the taker:")
            print(f"'{swap_init.swapstring}'")
            
            # Step 4: Wait for completion (in real app, taker would execute)
            print("\nWaiting for swap completion...")
            from kaleidoswap_sdk.models import GetSwapStatusRequest
            
            final_status = await client.wait_for_swap_completion(
                GetSwapStatusRequest(payment_hash=swap_init.payment_hash),
                timeout=1800,  # 30 minutes
                poll_interval=10  # Check every 10 seconds
            )
            
            print(f"Final status: {final_status.status}")
            if final_status.completed_at:
                print(f"Completed at: {final_status.completed_at}")
            
        except Exception as e:
            print(f"Error in maker swap: {e}")

if __name__ == "__main__":
    asyncio.run(simple_maker_swap())
```

#### TypeScript

```typescript
import { KaleidoClient } from 'kaleidoswap-sdk';

async function simpleMakerSwap() {
    const client = new KaleidoClient({
        baseUrl: 'https://api.kaleidoswap.com',
        nodeUrl: 'https://node.kaleidoswap.com'
    });
    
    try {
        // Step 1: Get a quote
        console.log('Getting quote...');
        const quote = await client.getQuote('BTC', 'USDT', 50000000); // 0.5 BTC
        
        console.log(`Quote: ${quote.from_amount} BTC -> ${quote.to_amount} USDT`);
        console.log(`Price: $${quote.price.toFixed(2)}`);
        console.log(`RFQ ID: ${quote.rfq_id}`);
        
        // Step 2: Initialize maker swap
        console.log('\nInitializing maker swap...');
        const swapInit = await client.initMakerSwap(
            quote.rfq_id,
            quote.from_asset,
            quote.to_asset,
            quote.from_amount,
            quote.to_amount
        );
        
        console.log(`Payment hash: ${swapInit.payment_hash}`);
        console.log(`Swap string: ${swapInit.swapstring}`);
        
        // Step 3: Share swap string with taker
        console.log(`\nShare this swap string with the taker:`);
        console.log(`'${swapInit.swapstring}'`);
        
        // Step 4: Wait for completion
        console.log('\nWaiting for swap completion...');
        const finalStatus = await client.waitForSwapCompletion(
            swapInit.payment_hash,
            1800, // 30 minutes
            10    // Check every 10 seconds
        );
        
        console.log(`Final status: ${finalStatus.status}`);
        if (finalStatus.completed_at) {
            console.log(`Completed at: ${finalStatus.completed_at}`);
        }
        
    } catch (error) {
        console.error('Error in maker swap:', error);
    }
}

simpleMakerSwap();
```

## Advanced Swap Workflows

### Multi-Asset Portfolio Rebalancing

#### Python

```python
import asyncio
from typing import Dict, List
from kaleidoswap_sdk.client import KaleidoClient
from kaleidoswap_sdk.models import InitMakerSwapRequest

class PortfolioRebalancer:
    def __init__(self, client: KaleidoClient):
        self.client = client
    
    async def get_portfolio_value(self, holdings: Dict[str, int]) -> Dict[str, float]:
        """Get current USD value of portfolio holdings."""
        values = {}
        
        for asset, amount in holdings.items():
            if asset == "USDT":
                values[asset] = amount  # USDT is already in USD
            else:
                # Get quote to USDT
                try:
                    quote = await self.client.get_quote(
                        from_asset=asset,
                        to_asset="USDT",
                        from_amount=amount
                    )
                    values[asset] = quote.to_amount
                except Exception as e:
                    print(f"Error getting value for {asset}: {e}")
                    values[asset] = 0
        
        return values
    
    async def calculate_rebalancing_trades(
        self, 
        current_holdings: Dict[str, int],
        target_allocation: Dict[str, float]
    ) -> List[Dict]:
        """Calculate trades needed to reach target allocation."""
        
        # Get current portfolio value
        current_values = await self.get_portfolio_value(current_holdings)
        total_value = sum(current_values.values())
        
        print(f"Total portfolio value: ${total_value:.2f}")
        
        trades = []
        
        for asset, target_percent in target_allocation.items():
            current_value = current_values.get(asset, 0)
            current_percent = current_value / total_value if total_value > 0 else 0
            target_value = total_value * target_percent
            
            print(f"{asset}: ${current_value:.2f} ({current_percent:.1%}) -> ${target_value:.2f} ({target_percent:.1%})")
            
            value_diff = target_value - current_value
            
            if abs(value_diff) > 100:  # Only trade if difference > $100
                if value_diff > 0:
                    # Need to buy this asset (sell USDT)
                    trades.append({
                        'type': 'buy',
                        'asset': asset,
                        'usd_amount': value_diff,
                        'from_asset': 'USDT',
                        'to_asset': asset
                    })
                else:
                    # Need to sell this asset (buy USDT)
                    trades.append({
                        'type': 'sell',
                        'asset': asset,
                        'usd_amount': abs(value_diff),
                        'from_asset': asset,
                        'to_asset': 'USDT'
                    })
        
        return trades
    
    async def execute_rebalancing(
        self,
        current_holdings: Dict[str, int],
        target_allocation: Dict[str, float]
    ):
        """Execute portfolio rebalancing trades."""
        
        trades = await self.calculate_rebalancing_trades(
            current_holdings, 
            target_allocation
        )
        
        if not trades:
            print("Portfolio is already balanced!")
            return
        
        print(f"\nExecuting {len(trades)} rebalancing trades:")
        
        for trade in trades:
            try:
                print(f"\n{trade['type'].upper()} {trade['asset']} (${trade['usd_amount']:.2f})")
                
                # Get quote
                if trade['type'] == 'buy':
                    # Convert USD amount to USDT amount for quote
                    quote = await self.client.get_quote(
                        from_asset=trade['from_asset'],
                        to_asset=trade['to_asset'],
                        from_amount=int(trade['usd_amount'])
                    )
                else:
                    # Need to calculate how much of the asset to sell
                    # This is simplified - in practice you'd need to calculate exact amounts
                    continue
                
                # Initialize swap
                swap_init = await self.client.init_maker_swap(
                    InitMakerSwapRequest(
                        rfq_id=quote.rfq_id,
                        from_asset=quote.from_asset,
                        to_asset=quote.to_asset,
                        from_amount=quote.from_amount,
                        to_amount=quote.to_amount
                    )
                )
                
                print(f"Swap initialized: {swap_init.payment_hash}")
                print(f"Swap string: {swap_init.swapstring}")
                
            except Exception as e:
                print(f"Error executing trade: {e}")

async def portfolio_rebalancing_example():
    async with KaleidoClient(
        api_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    ) as client:
        
        rebalancer = PortfolioRebalancer(client)
        
        # Current holdings
        current_holdings = {
            'BTC': 150000000,    # 1.5 BTC
            'USDT': 10000,       # $10,000 USDT
        }
        
        # Target allocation (percentages)
        target_allocation = {
            'BTC': 0.6,   # 60% BTC
            'USDT': 0.4,  # 40% USDT
        }
        
        await rebalancer.execute_rebalancing(current_holdings, target_allocation)

if __name__ == "__main__":
    asyncio.run(portfolio_rebalancing_example())
```

### Arbitrage Detection and Execution

#### Python

```python
import asyncio
from typing import List, Dict, Optional
from kaleidoswap_sdk.client import KaleidoClient

class ArbitrageDetector:
    def __init__(self, clients: Dict[str, KaleidoClient]):
        self.clients = clients  # Multiple exchange clients
        self.min_profit_threshold = 0.01  # Minimum 1% profit
    
    async def get_quotes_all_exchanges(
        self, 
        from_asset: str, 
        to_asset: str, 
        amount: int
    ) -> Dict[str, Dict]:
        """Get quotes from all connected exchanges."""
        quotes = {}
        
        for exchange_name, client in self.clients.items():
            try:
                quote = await client.get_quote(
                    from_asset=from_asset,
                    to_asset=to_asset,
                    from_amount=amount
                )
                quotes[exchange_name] = {
                    'quote': quote,
                    'price': quote.price,
                    'to_amount': quote.to_amount
                }
            except Exception as e:
                print(f"Error getting quote from {exchange_name}: {e}")
        
        return quotes
    
    async def detect_arbitrage_opportunities(
        self, 
        trading_pairs: List[tuple], 
        amount: int
    ) -> List[Dict]:
        """Detect arbitrage opportunities across exchanges."""
        opportunities = []
        
        for from_asset, to_asset in trading_pairs:
            print(f"\nChecking {from_asset}/{to_asset}...")
            
            quotes = await self.get_quotes_all_exchanges(
                from_asset, to_asset, amount
            )
            
            if len(quotes) < 2:
                continue
            
            # Find best buy and sell prices
            best_buy = min(quotes.items(), key=lambda x: x[1]['price'])
            best_sell = max(quotes.items(), key=lambda x: x[1]['price'])
            
            buy_exchange, buy_data = best_buy
            sell_exchange, sell_data = best_sell
            
            # Calculate potential profit
            profit_ratio = (sell_data['price'] - buy_data['price']) / buy_data['price']
            
            if profit_ratio > self.min_profit_threshold:
                opportunity = {
                    'pair': f"{from_asset}/{to_asset}",
                    'amount': amount,
                    'buy_exchange': buy_exchange,
                    'sell_exchange': sell_exchange,
                    'buy_price': buy_data['price'],
                    'sell_price': sell_data['price'],
                    'profit_ratio': profit_ratio,
                    'profit_amount': sell_data['to_amount'] - buy_data['to_amount']
                }
                opportunities.append(opportunity)
                
                print(f"🚀 ARBITRAGE OPPORTUNITY:")
                print(f"   Buy on {buy_exchange}: ${buy_data['price']:.2f}")
                print(f"   Sell on {sell_exchange}: ${sell_data['price']:.2f}")
                print(f"   Profit: {profit_ratio:.2%}")
        
        return opportunities
    
    async def execute_arbitrage(self, opportunity: Dict):
        """Execute an arbitrage opportunity."""
        buy_exchange = opportunity['buy_exchange']
        sell_exchange = opportunity['sell_exchange']
        
        print(f"\nExecuting arbitrage on {opportunity['pair']}...")
        
        try:
            # Execute buy order
            buy_client = self.clients[buy_exchange]
            buy_quote = await buy_client.get_quote(
                from_asset=opportunity['pair'].split('/')[1],  # Quote asset
                to_asset=opportunity['pair'].split('/')[0],    # Base asset
                from_amount=opportunity['amount']
            )
            
            # Execute sell order  
            sell_client = self.clients[sell_exchange]
            sell_quote = await sell_client.get_quote(
                from_asset=opportunity['pair'].split('/')[0],  # Base asset
                to_asset=opportunity['pair'].split('/')[1],    # Quote asset
                from_amount=buy_quote.to_amount  # Amount received from buy
            )
            
            print(f"Buy quote: {buy_quote.rfq_id}")
            print(f"Sell quote: {sell_quote.rfq_id}")
            
            # In practice, you would initialize and execute swaps here
            # This example just shows the detection logic
            
        except Exception as e:
            print(f"Error executing arbitrage: {e}")

async def arbitrage_monitoring():
    # Initialize multiple exchange clients
    clients = {
        'kaleidoswap': KaleidoClient(
            api_url="https://api.kaleidoswap.com",
            node_url="https://node.kaleidoswap.com"
        ),
        # Add other exchange clients here
    }
    
    detector = ArbitrageDetector(clients)
    
    # Define trading pairs to monitor
    trading_pairs = [
        ('BTC', 'USDT'),
        ('ETH', 'USDT'),
        ('LTC', 'BTC'),
    ]
    
    # Monitor for arbitrage opportunities
    while True:
        try:
            opportunities = await detector.detect_arbitrage_opportunities(
                trading_pairs, 
                100000000  # 1 BTC worth
            )
            
            for opportunity in opportunities:
                await detector.execute_arbitrage(opportunity)
            
            # Wait before next check
            await asyncio.sleep(30)
            
        except KeyboardInterrupt:
            print("Stopping arbitrage monitoring...")
            break
        except Exception as e:
            print(f"Error in monitoring loop: {e}")
            await asyncio.sleep(5)

if __name__ == "__main__":
    asyncio.run(arbitrage_monitoring())
```

## LSP Channel Management

### Create and Monitor Channel Order

#### Python

```python
import asyncio
from kaleidoswap_sdk.client import KaleidoClient
from kaleidoswap_sdk.models import CreateOrderRequest, GetOrderRequest

async def create_and_monitor_channel():
    async with KaleidoClient(
        api_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    ) as client:
        
        try:
            # Get node info
            node_info = await client.get_node_info()
            print(f"Node pubkey: {node_info.pubkey}")
            
            # Get onchain address for refunds
            address_response = await client.get_onchain_address()
            refund_address = address_response.address
            print(f"Refund address: {refund_address}")
            
            # Create channel order
            print("\nCreating channel order...")
            order = await client.create_order(
                CreateOrderRequest(
                    client_pubkey=node_info.pubkey,
                    lsp_balance_sat=2000000,     # 0.02 BTC LSP balance
                    client_balance_sat=1000000,  # 0.01 BTC client balance
                    required_channel_confirmations=3,
                    funding_confirms_within_blocks=144,
                    channel_expiry_blocks=2016,  # ~2 weeks
                    refund_onchain_address=refund_address,
                    announce_channel=True
                )
            )
            
            print(f"Order created: {order.order_id}")
            print(f"Order state: {order.order_state}")
            print(f"Payment required: {order.payment.bolt11.order_total_sat} sats")
            print(f"Invoice: {order.payment.bolt11.invoice}")
            
            # Monitor order status
            print("\nMonitoring order status...")
            while True:
                current_order = await client.get_order(
                    GetOrderRequest(order_id=order.order_id)
                )
                
                print(f"Order state: {current_order.order_state}")
                print(f"Payment state: {current_order.payment.bolt11.state}")
                
                if current_order.channel and current_order.channel.channel_id:
                    print(f"Channel ID: {current_order.channel.channel_id}")
                    print(f"Funding outpoint: {current_order.channel.funding_outpoint}")
                    break
                
                if current_order.order_state == "FAILED":
                    print("Order failed!")
                    break
                
                await asyncio.sleep(10)  # Check every 10 seconds
            
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(create_and_monitor_channel())
```

## WebSocket Real-time Updates

### Live Price Monitoring

#### Python

```python
import asyncio
from kaleidoswap_sdk.client import KaleidoClient

class PriceMonitor:
    def __init__(self, client: KaleidoClient):
        self.client = client
        self.prices = {}
    
    async def handle_price_update(self, data):
        """Handle incoming price updates."""
        pair = data.get('pair')
        price = data.get('price')
        timestamp = data.get('timestamp')
        
        if pair and price:
            old_price = self.prices.get(pair)
            self.prices[pair] = price
            
            # Calculate price change
            if old_price:
                change = (price - old_price) / old_price * 100
                direction = "📈" if change > 0 else "📉" if change < 0 else "➡️"
                print(f"{direction} {pair}: ${price:.2f} ({change:+.2f}%)")
            else:
                print(f"💰 {pair}: ${price:.2f}")
    
    async def handle_quote_response(self, data):
        """Handle quote responses from WebSocket."""
        print(f"Quote received: {data}")
    
    async def start_monitoring(self, pairs):
        """Start monitoring specified pairs."""
        try:
            # Connect to WebSocket
            await self.client.connect()
            print("WebSocket connected!")
            
            # Register event handlers
            self.client.on("price_update", self.handle_price_update)
            self.client.on("quote_response", self.handle_quote_response)
            
            print(f"Monitoring {len(pairs)} pairs...")
            
            # Subscribe to price updates for each pair
            for pair in pairs:
                # In practice, you would send subscription messages
                # This is a simplified example
                print(f"Subscribed to {pair}")
            
            # Keep monitoring until interrupted
            while True:
                await asyncio.sleep(1)
                
        except KeyboardInterrupt:
            print("\nStopping price monitoring...")
        finally:
            await self.client.disconnect()

async def live_price_monitoring():
    async with KaleidoClient(
        api_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    ) as client:
        
        monitor = PriceMonitor(client)
        
        # Define pairs to monitor
        pairs = ['BTC/USDT', 'ETH/USDT', 'LTC/BTC']
        
        await monitor.start_monitoring(pairs)

if __name__ == "__main__":
    asyncio.run(live_price_monitoring())
```

### Real-time Quote Streaming

#### Python

```python
import asyncio
from kaleidoswap_sdk.client import KaleidoClient
from kaleidoswap_sdk.models import QuoteRequest

class QuoteStreamer:
    def __init__(self, client: KaleidoClient):
        self.client = client
        self.active_quotes = {}
    
    async def stream_quotes(self, pairs: list, amounts: dict):
        """Stream live quotes for specified pairs and amounts."""
        
        await self.client.connect()
        
        try:
            while True:
                for pair in pairs:
                    from_asset, to_asset = pair.split('/')
                    amount = amounts.get(pair, 100000000)  # Default 1 BTC
                    
                    try:
                        # Get quote via WebSocket
                        quote = await self.client.get_quote_websocket(
                            QuoteRequest(
                                from_asset=from_asset,
                                to_asset=to_asset,
                                from_amount=amount
                            )
                        )
                        
                        # Store and display quote
                        old_quote = self.active_quotes.get(pair)
                        self.active_quotes[pair] = quote
                        
                        # Calculate price change
                        if old_quote:
                            price_change = quote.price - old_quote.price
                            change_pct = price_change / old_quote.price * 100
                            
                            if abs(change_pct) > 0.1:  # Only show significant changes
                                direction = "🔥" if price_change > 0 else "❄️"
                                print(f"{direction} {pair}: ${quote.price:.2f} ({change_pct:+.2f}%)")
                        else:
                            print(f"💫 {pair}: ${quote.price:.2f} (Initial)")
                        
                        # Show quote details
                        print(f"   Amount: {amount/100000000:.2f} {from_asset}")
                        print(f"   Receives: {quote.to_amount} {to_asset}")
                        print(f"   Expires: {quote.expires_at}")
                        print()
                        
                    except Exception as e:
                        print(f"Error getting quote for {pair}: {e}")
                
                await asyncio.sleep(5)  # Update every 5 seconds
                
        finally:
            await self.client.disconnect()

async def quote_streaming_example():
    async with KaleidoClient(
        api_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    ) as client:
        
        streamer = QuoteStreamer(client)
        
        # Define pairs and amounts to monitor
        pairs = ['BTC/USDT', 'ETH/USDT']
        amounts = {
            'BTC/USDT': 100000000,  # 1 BTC
            'ETH/USDT': 1000000000, # 10 ETH (example amount)
        }
        
        await streamer.stream_quotes(pairs, amounts)

if __name__ == "__main__":
    asyncio.run(quote_streaming_example())
```

## Error Handling Patterns

### Robust Swap Execution with Retries

#### Python

```python
import asyncio
import time
from kaleidoswap_sdk.client import KaleidoClient
from kaleidoswap_sdk.models import InitMakerSwapRequest, GetSwapStatusRequest
from kaleidoswap_sdk.exceptions import KaleidoSDKError

class RobustSwapExecutor:
    def __init__(self, client: KaleidoClient):
        self.client = client
        self.max_retries = 3
        self.retry_delay = 5
    
    async def execute_swap_with_retries(
        self, 
        from_asset: str, 
        to_asset: str, 
        amount: int
    ):
        """Execute swap with comprehensive error handling and retries."""
        
        for attempt in range(self.max_retries):
            try:
                print(f"Attempt {attempt + 1}/{self.max_retries}")
                
                # Step 1: Get quote with retry
                quote = await self._get_quote_with_retry(
                    from_asset, to_asset, amount
                )
                
                # Step 2: Initialize swap with retry
                swap_init = await self._init_swap_with_retry(quote)
                
                # Step 3: Monitor completion
                final_status = await self._monitor_swap_completion(
                    swap_init.payment_hash
                )
                
                return final_status
                
            except Exception as e:
                print(f"Attempt {attempt + 1} failed: {e}")
                
                if attempt < self.max_retries - 1:
                    print(f"Retrying in {self.retry_delay} seconds...")
                    await asyncio.sleep(self.retry_delay)
                    self.retry_delay *= 2  # Exponential backoff
                else:
                    print("All attempts failed!")
                    raise
    
    async def _get_quote_with_retry(self, from_asset: str, to_asset: str, amount: int):
        """Get quote with retries for temporary failures."""
        for i in range(3):
            try:
                return await self.client.get_quote(
                    from_asset=from_asset,
                    to_asset=to_asset,
                    from_amount=amount
                )
            except Exception as e:
                if "rate limit" in str(e).lower() and i < 2:
                    await asyncio.sleep(2 ** i)  # 1s, 2s delays
                    continue
                raise
    
    async def _init_swap_with_retry(self, quote):
        """Initialize swap with validation."""
        # Validate quote hasn't expired
        current_time = int(time.time())
        if current_time >= quote.expires_at:
            raise ValueError("Quote has expired")
        
        return await self.client.init_maker_swap(
            InitMakerSwapRequest(
                rfq_id=quote.rfq_id,
                from_asset=quote.from_asset,
                to_asset=quote.to_asset,
                from_amount=quote.from_amount,
                to_amount=quote.to_amount
            )
        )
    
    async def _monitor_swap_completion(self, payment_hash: str):
        """Monitor swap with timeout and error handling."""
        timeout = 1800  # 30 minutes
        poll_interval = 10
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                status_response = await self.client.get_swap_status(
                    GetSwapStatusRequest(payment_hash=payment_hash)
                )
                
                status = status_response.swap.status
                print(f"Swap status: {status}")
                
                if status == "completed":
                    return status_response.swap
                elif status == "failed":
                    raise Exception("Swap failed")
                elif status == "expired":
                    raise Exception("Swap expired")
                
                await asyncio.sleep(poll_interval)
                
            except Exception as e:
                if "not found" in str(e).lower():
                    # Swap might not be in system yet
                    await asyncio.sleep(5)
                    continue
                raise
        
        raise TimeoutError("Swap monitoring timed out")

async def robust_swap_example():
    async with KaleidoClient(
        api_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    ) as client:
        
        executor = RobustSwapExecutor(client)
        
        try:
            final_status = await executor.execute_swap_with_retries(
                from_asset="BTC",
                to_asset="USDT",
                amount=50000000  # 0.5 BTC
            )
            
            print(f"Swap completed successfully!")
            print(f"Final status: {final_status.status}")
            print(f"Completed at: {final_status.completed_at}")
            
        except Exception as e:
            print(f"Swap execution failed: {e}")

if __name__ == "__main__":
    asyncio.run(robust_swap_example())
```

## Integration Examples

### Trading Bot with Portfolio Management

#### Python

```python
import asyncio
import json
from typing import Dict, List
from kaleidoswap_sdk.client import KaleidoClient

class TradingBot:
    def __init__(self, client: KaleidoClient, config: Dict):
        self.client = client
        self.config = config
        self.portfolio = {}
        self.running = False
    
    async def initialize(self):
        """Initialize bot with current portfolio state."""
        try:
            # Get node info
            node_info = await self.client.get_node_info()
            print(f"Connected to node: {node_info.pubkey}")
            
            # Load portfolio from config or fetch current balances
            await self._load_portfolio()
            
            # Connect WebSocket for real-time updates
            await self.client.connect()
            self.client.on("price_update", self._handle_price_update)
            
            print("Trading bot initialized successfully!")
            
        except Exception as e:
            print(f"Error initializing bot: {e}")
            raise
    
    async def _load_portfolio(self):
        """Load current portfolio balances."""
        # In practice, you would query actual balances
        self.portfolio = self.config.get("initial_portfolio", {
            "BTC": 100000000,    # 1 BTC
            "USDT": 50000,       # $50,000 USDT
        })
        
        print(f"Portfolio loaded: {self.portfolio}")
    
    async def _handle_price_update(self, data):
        """Handle price updates and check for trading opportunities."""
        pair = data.get('pair')
        price = data.get('price')
        
        if not pair or not price:
            return
        
        # Check trading rules
        await self._check_trading_rules(pair, price)
    
    async def _check_trading_rules(self, pair: str, price: float):
        """Check if current price triggers any trading rules."""
        rules = self.config.get("trading_rules", [])
        
        for rule in rules:
            if rule["pair"] == pair:
                await self._evaluate_rule(rule, price)
    
    async def _evaluate_rule(self, rule: Dict, current_price: float):
        """Evaluate a specific trading rule."""
        rule_type = rule["type"]
        
        if rule_type == "stop_loss":
            if current_price <= rule["trigger_price"]:
                await self._execute_trade(rule["action"])
        
        elif rule_type == "take_profit":
            if current_price >= rule["trigger_price"]:
                await self._execute_trade(rule["action"])
        
        elif rule_type == "dca":  # Dollar Cost Averaging
            # Implement DCA logic
            pass
    
    async def _execute_trade(self, action: Dict):
        """Execute a trading action."""
        try:
            print(f"Executing trade: {action}")
            
            # Get quote
            quote = await self.client.get_quote(
                from_asset=action["from_asset"],
                to_asset=action["to_asset"],
                from_amount=action["amount"]
            )
            
            # Execute swap (simplified)
            print(f"Quote received: {quote.rfq_id}")
            
            # Update portfolio (simplified)
            await self._update_portfolio(action)
            
        except Exception as e:
            print(f"Error executing trade: {e}")
    
    async def _update_portfolio(self, action: Dict):
        """Update portfolio after trade execution."""
        from_asset = action["from_asset"]
        to_asset = action["to_asset"]
        amount = action["amount"]
        
        # Simplified portfolio update
        if from_asset in self.portfolio:
            self.portfolio[from_asset] -= amount
        
        # In practice, you would calculate received amount from quote
        print(f"Portfolio updated: {self.portfolio}")
    
    async def run(self):
        """Main bot loop."""
        self.running = True
        
        try:
            await self.initialize()
            
            print("Trading bot started!")
            
            while self.running:
                # Perform periodic tasks
                await self._periodic_tasks()
                await asyncio.sleep(60)  # Run every minute
                
        except KeyboardInterrupt:
            print("Stopping trading bot...")
        finally:
            await self.stop()
    
    async def _periodic_tasks(self):
        """Perform periodic maintenance tasks."""
        # Portfolio rebalancing check
        await self._check_rebalancing()
        
        # Risk management
        await self._risk_management()
    
    async def _check_rebalancing(self):
        """Check if portfolio needs rebalancing."""
        target_allocation = self.config.get("target_allocation", {})
        
        if not target_allocation:
            return
        
        # Calculate current allocation
        # Implement rebalancing logic
        pass
    
    async def _risk_management(self):
        """Perform risk management checks."""
        max_position_size = self.config.get("max_position_size", 0.1)
        stop_loss_threshold = self.config.get("stop_loss_threshold", 0.05)
        
        # Implement risk management logic
        pass
    
    async def stop(self):
        """Stop the trading bot."""
        self.running = False
        await self.client.disconnect()
        print("Trading bot stopped.")

async def trading_bot_example():
    """Example trading bot configuration and execution."""
    
    # Bot configuration
    config = {
        "initial_portfolio": {
            "BTC": 100000000,  # 1 BTC
            "USDT": 50000,     # $50,000
        },
        "target_allocation": {
            "BTC": 0.6,   # 60%
            "USDT": 0.4,  # 40%
        },
        "trading_rules": [
            {
                "pair": "BTC/USDT",
                "type": "stop_loss",
                "trigger_price": 40000,
                "action": {
                    "from_asset": "BTC",
                    "to_asset": "USDT",
                    "amount": 50000000  # 0.5 BTC
                }
            },
            {
                "pair": "BTC/USDT", 
                "type": "take_profit",
                "trigger_price": 80000,
                "action": {
                    "from_asset": "BTC",
                    "to_asset": "USDT",
                    "amount": 25000000  # 0.25 BTC
                }
            }
        ],
        "max_position_size": 0.1,      # 10% max position
        "stop_loss_threshold": 0.05,   # 5% stop loss
    }
    
    async with KaleidoClient(
        api_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    ) as client:
        
        bot = TradingBot(client, config)
        await bot.run()

if __name__ == "__main__":
    asyncio.run(trading_bot_example())
```

This comprehensive examples document demonstrates practical usage patterns for the Kaleidoswap SDK, from basic operations to advanced trading strategies and real-time monitoring systems. Each example includes proper error handling and follows best practices for production use. 