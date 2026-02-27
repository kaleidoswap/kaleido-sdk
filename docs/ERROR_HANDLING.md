# Error Handling & Troubleshooting

This document provides comprehensive guidance on error handling, troubleshooting, and debugging issues with the Kaleidoswap SDK.

## Table of Contents

- [Common Error Types](#common-error-types)
- [Exception Handling](#exception-handling)
- [Retry Patterns](#retry-patterns)
- [Logging and Debugging](#logging-and-debugging)
- [Network Issues](#network-issues)
- [Authentication Errors](#authentication-errors)
- [Rate Limiting](#rate-limiting)
- [Troubleshooting Guide](#troubleshooting-guide)

## Common Error Types

### Connection Errors

**HTTP Connection Failed**
```python
# Error: Connection refused or timeout
try:
    await client.maker.list_assets()
except NetworkError as e:
    print(f"Connection failed: {e}")
    # Check network connectivity and API URL
```

**WebSocket Connection Failed**
```python
try:
    ws = client.maker.enable_websocket("ws://localhost:8000/ws")
    await ws.connect()
except WebSocketError as e:
    print(f"WebSocket connection failed: {e}")
    # Check WebSocket URL and firewall settings
```

### API Errors

**Invalid Request Parameters**
```python
from kaleidoswap_sdk import KaleidoError, ValidationError
from kaleidoswap_sdk import PairQuoteRequest, SwapLegInput, Layer

try:
    quote = await client.maker.get_quote(
        PairQuoteRequest(
            from_asset=SwapLegInput(asset_id="INVALID_ASSET", layer=Layer.BTC_LN, amount=100000000),
            to_asset=SwapLegInput(asset_id="USDT", layer=Layer.RGB_LN)
        )
    )
except KaleidoError as e:
    print(f"API Error: {e}")
    # Check asset IDs and parameters
```

**Insufficient Liquidity**
```python
try:
    quote = await client.maker.get_quote(
        PairQuoteRequest(
            from_asset=SwapLegInput(asset_id="BTC", layer=Layer.BTC_LN, amount=10000000000),
            to_asset=SwapLegInput(asset_id="USDT", layer=Layer.RGB_LN)
        )
    )
except ValidationError as e:
    print(f"Quote error: {e}")
    # Reduce amount or try different pair
```

### Swap Errors

**Expired Quote**
```python
try:
    # Quote expires before use
    swap_init = await client.maker.init_swap(SwapRequest(expired_quote))
except SwapError as e:
    print(f"Swap error: {e}")
    # Get fresh quote
```

**Swap Timeout**
```python
try:
    final_status = await client.wait_for_swap_completion(
        payment_hash, timeout=1800
    )
except TimeoutError as e:
    print(f"Swap timed out: {e}")
    # Check swap status manually
```

## Exception Handling

### Basic Exception Handling

#### Python

```python
import asyncio
import logging
from kaleidoswap_sdk import KaleidoClient
from kaleidoswap_sdk import (
    KaleidoError,
    NetworkError,
    TimeoutError,
    SwapError,
    ValidationError
)

async def robust_operation():
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        # Attempt operation
        assets = await client.maker.list_assets()
        return assets
        
    except NetworkError as e:
        logging.error(f"Connection failed: {e}")
        # Handle connection issues
        return None
        
    except TimeoutError as e:
        logging.error(f"Operation timed out: {e}")
        # Handle timeout
        return None
        
    except ValidationError as e:
        logging.error(f"Validation failed: {e}")
        # Handle validation errors
        return None
        
    except KaleidoError as e:
        logging.error(f"SDK error: {e}")
        # Handle general SDK errors
        return None
        
    except Exception as e:
        logging.error(f"Unexpected error: {e}")
        # Handle unexpected errors
        return None
    
    finally:
        await client.close()
```

### Comprehensive Error Handler

#### Python

```python
import asyncio
import logging
from typing import Optional, Any, Callable
from kaleidoswap_sdk import KaleidoClient

class ErrorHandler:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.error_counts = {}
        self.max_retries = 3
    
    async def handle_with_retry(
        self, 
        operation: Callable,
        *args,
        **kwargs
    ) -> Optional[Any]:
        """Execute operation with comprehensive error handling and retries."""
        
        operation_name = operation.__name__
        retry_count = 0
        
        while retry_count < self.max_retries:
            try:
                result = await operation(*args, **kwargs)
                
                # Reset error count on success
                if operation_name in self.error_counts:
                    del self.error_counts[operation_name]
                
                return result
                
            except NetworkError as e:
                retry_count += 1
                self.logger.warning(f"Connection error in {operation_name} (attempt {retry_count}): {e}")
                
                if retry_count < self.max_retries:
                    delay = 2 ** retry_count  # Exponential backoff
                    await asyncio.sleep(delay)
                    continue
                else:
                    self.logger.error(f"Max retries exceeded for {operation_name}")
                    return None
            
            except TimeoutError as e:
                retry_count += 1
                self.logger.warning(f"Timeout in {operation_name} (attempt {retry_count}): {e}")
                
                if retry_count < self.max_retries:
                    await asyncio.sleep(5)
                    continue
                else:
                    return None
            
            except ValidationError as e:
                self.logger.error(f"Quote error in {operation_name}: {e}")
                # Don't retry quote errors - they're usually parameter issues
                return None
            
            except SwapError as e:
                self.logger.error(f"Swap error in {operation_name}: {e}")
                # Handle swap-specific errors
                return await self._handle_swap_error(e, operation, *args, **kwargs)
            
            except Exception as e:
                self.logger.error(f"Unexpected error in {operation_name}: {e}")
                return None
        
        return None
    
    async def _handle_swap_error(self, error, operation, *args, **kwargs):
        """Handle swap-specific errors."""
        error_message = str(error).lower()
        
        if "expired" in error_message:
            self.logger.info("Quote expired, will need fresh quote")
            return None
        
        elif "insufficient" in error_message:
            self.logger.warning("Insufficient liquidity or balance")
            return None
        
        elif "invalid" in error_message:
            self.logger.error("Invalid swap parameters")
            return None
        
        else:
            # Unknown swap error, don't retry
            return None
    
    def track_error(self, operation_name: str, error: Exception):
        """Track error occurrences for monitoring."""
        if operation_name not in self.error_counts:
            self.error_counts[operation_name] = {}
        
        error_type = type(error).__name__
        if error_type not in self.error_counts[operation_name]:
            self.error_counts[operation_name][error_type] = 0
        
        self.error_counts[operation_name][error_type] += 1
    
    def get_error_stats(self) -> dict:
        """Get error statistics."""
        return self.error_counts.copy()

# Example usage
async def error_handling_example():
    handler = ErrorHandler()
    
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        # Use error handler for operations
        assets = await handler.handle_with_retry(client.maker.list_assets)
        
        if assets:
            print(f"Got {len(assets.assets)} assets")
        else:
            print("Failed to get assets")
        
        # Get error statistics
        stats = handler.get_error_stats()
        if stats:
            print(f"Error statistics: {stats}")
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(error_handling_example())
```

## Retry Patterns

### Exponential Backoff

#### Python

```python
import asyncio
import random
from typing import Optional, Callable, Any

class RetryManager:
    def __init__(
        self,
        max_retries: int = 3,
        base_delay: float = 1.0,
        max_delay: float = 60.0,
        exponential_base: float = 2.0,
        jitter: bool = True
    ):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base
        self.jitter = jitter
    
    async def retry_with_backoff(
        self,
        operation: Callable,
        *args,
        retry_on: tuple = (Exception,),
        **kwargs
    ) -> Optional[Any]:
        """Retry operation with exponential backoff."""
        
        for attempt in range(self.max_retries + 1):
            try:
                return await operation(*args, **kwargs)
                
            except retry_on as e:
                if attempt == self.max_retries:
                    # Final attempt failed
                    raise e
                
                # Calculate delay
                delay = min(
                    self.base_delay * (self.exponential_base ** attempt),
                    self.max_delay
                )
                
                # Add jitter to prevent thundering herd
                if self.jitter:
                    delay = delay * (0.5 + random.random() * 0.5)
                
                print(f"Attempt {attempt + 1} failed: {e}")
                print(f"Retrying in {delay:.2f} seconds...")
                
                await asyncio.sleep(delay)
        
        return None

# Example usage
async def retry_example():
    retry_manager = RetryManager(
        max_retries=5,
        base_delay=1.0,
        max_delay=30.0
    )
    
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        # Retry operation with backoff
        assets = await retry_manager.retry_with_backoff(
            client.maker.list_assets,
            retry_on=(NetworkError, TimeoutError)
        )
        
        if assets:
            print(f"Successfully got {len(assets.assets)} assets")
        
    except Exception as e:
        print(f"Operation failed after all retries: {e}")
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(retry_example())
```

### Circuit Breaker Pattern

#### Python

```python
import asyncio
import time
from typing import Optional, Callable, Any
from enum import Enum

class CircuitState(Enum):
    CLOSED = "closed"      # Normal operation
    OPEN = "open"          # Failing, reject requests
    HALF_OPEN = "half_open"  # Testing recovery

class CircuitBreaker:
    def __init__(
        self,
        failure_threshold: int = 5,
        recovery_timeout: float = 60.0,
        expected_exception: tuple = (Exception,)
    ):
        self.failure_threshold = failure_threshold
        self.recovery_timeout = recovery_timeout
        self.expected_exception = expected_exception
        
        self.failure_count = 0
        self.last_failure_time = 0
        self.state = CircuitState.CLOSED
    
    async def call(self, operation: Callable, *args, **kwargs) -> Optional[Any]:
        """Execute operation through circuit breaker."""
        
        if self.state == CircuitState.OPEN:
            if time.time() - self.last_failure_time > self.recovery_timeout:
                self.state = CircuitState.HALF_OPEN
                print("Circuit breaker: Half-open, testing recovery")
            else:
                raise Exception("Circuit breaker: Open, rejecting request")
        
        try:
            result = await operation(*args, **kwargs)
            
            # Success - reset circuit
            if self.state == CircuitState.HALF_OPEN:
                self.state = CircuitState.CLOSED
                self.failure_count = 0
                print("Circuit breaker: Closed, recovered")
            
            return result
            
        except self.expected_exception as e:
            self._record_failure()
            raise e
    
    def _record_failure(self):
        """Record a failure and update circuit state."""
        self.failure_count += 1
        self.last_failure_time = time.time()
        
        if self.failure_count >= self.failure_threshold:
            self.state = CircuitState.OPEN
            print(f"Circuit breaker: Opened after {self.failure_count} failures")

# Example usage
async def circuit_breaker_example():
    circuit_breaker = CircuitBreaker(
        failure_threshold=3,
        recovery_timeout=30.0,
        expected_exception=(NetworkError, TimeoutError)
    )
    
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        for i in range(10):
            try:
                assets = await circuit_breaker.call(client.maker.list_assets)
                print(f"Request {i + 1}: Success")
                
            except Exception as e:
                print(f"Request {i + 1}: Failed - {e}")
            
            await asyncio.sleep(5)
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(circuit_breaker_example())
```

## Logging and Debugging

### Comprehensive Logging Setup

#### Python

```python
import logging
import asyncio
from logging.handlers import RotatingFileHandler
from kaleidoswap_sdk import KaleidoClient

def setup_logging():
    """Set up comprehensive logging configuration."""
    
    # Create logger
    logger = logging.getLogger('kaleidoswap_sdk')
    logger.setLevel(logging.DEBUG)
    
    # Create formatters
    detailed_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(funcName)s:%(lineno)d - %(message)s'
    )
    
    simple_formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(message)s'
    )
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(simple_formatter)
    
    # File handler with rotation
    file_handler = RotatingFileHandler(
        'kaleidoswap.log',
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(detailed_formatter)
    
    # Error file handler
    error_handler = RotatingFileHandler(
        'kaleidoswap_errors.log',
        maxBytes=5*1024*1024,   # 5MB
        backupCount=3
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(detailed_formatter)
    
    # Add handlers to logger
    logger.addHandler(console_handler)
    logger.addHandler(file_handler)
    logger.addHandler(error_handler)
    
    return logger

async def logging_example():
    """Example with comprehensive logging."""
    logger = setup_logging()
    
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        logger.info("Starting Kaleidoswap operations")
        
        logger.debug("Fetching assets list")
        assets = await client.maker.list_assets()
        logger.info(f"Retrieved {len(assets.assets)} assets")
        
        logger.debug("Fetching trading pairs")
        pairs = await client.maker.list_pairs()
        logger.info(f"Retrieved {len(pairs.pairs)} trading pairs")
        
        # Log specific operations
        logger.debug("Requesting quote for BTC/USDT")
        quote = await client.maker.get_quote(
            PairQuoteRequest(
                from_asset=SwapLegInput(asset_id="BTC", layer=Layer.BTC_LN, amount=100000000),
                to_asset=SwapLegInput(asset_id="USDT", layer=Layer.RGB_LN)
            )
        )
        logger.info(f"Quote received: {quote.rfq_id}, Price: ${quote.price:.2f}")
        
    except Exception as e:
        logger.error(f"Operation failed: {e}", exc_info=True)
    
    finally:
        logger.info("Kaleidoswap operations completed")
        await client.close()

if __name__ == "__main__":
    asyncio.run(logging_example())
```

### Debug Mode with Request/Response Logging

#### Python

```python
import asyncio
import json
import logging
from kaleidoswap_sdk import KaleidoClient

class DebugWrapper:
    """Wrapper around KaleidoClient with debug logging."""
    
    def __init__(self, client: KaleidoClient, debug=False):
        self.client = client
        self.debug = debug
        
        if debug:
            logging.basicConfig(level=logging.DEBUG)
            self.logger = logging.getLogger(__name__)
    
    def _log_request(self, method: str, endpoint: str, data=None):
        """Log request details."""
        if self.debug:
            self.logger.debug(f"REQUEST: {method} {endpoint}")
            if data:
                self.logger.debug(f"REQUEST DATA: {json.dumps(data, indent=2)}")
    
    def _log_response(self, response_data):
        """Log response details."""
        if self.debug:
            self.logger.debug(f"RESPONSE: {json.dumps(response_data, indent=2)}")
    
    async def list_assets(self):
        self._log_request("GET", "/market/assets")
        result = await self.client.maker.list_assets()
        self._log_response(result.model_dump() if hasattr(result, 'model_dump') else result)
        return result
    
    async def get_quote(self, request):
        self._log_request("POST", "/market/quote", request.model_dump() if hasattr(request, 'model_dump') else str(request))
        result = await self.client.maker.get_quote(request)
        self._log_response(result.model_dump() if hasattr(result, 'model_dump') else result)
        return result

async def debug_example():
    """Example with debug logging."""
    from kaleidoswap_sdk import PairQuoteRequest, SwapLegInput, Layer
    
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    debug = DebugWrapper(client, debug=True)
    
    try:
        print("=== Debug mode enabled ===")
        
        # Operations will be logged with full request/response details
        assets = await debug.list_assets()
        quote = await debug.get_quote(
            PairQuoteRequest(
                from_asset=SwapLegInput(asset_id="BTC", layer=Layer.BTC_LN, amount=100000000),
                to_asset=SwapLegInput(asset_id="USDT", layer=Layer.RGB_LN)
            )
        )
        
        print("=== Debug example completed ===")
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(debug_example())
```

## Network Issues

### Connection Diagnostics

#### Python

```python
import asyncio
import aiohttp
import socket
from urllib.parse import urlparse

async def diagnose_connectivity(api_url: str, node_url: str):
    """Diagnose network connectivity issues."""
    
    print("=== Network Connectivity Diagnosis ===")
    
    # Test basic connectivity
    await test_basic_connectivity(api_url)
    await test_basic_connectivity(node_url)
    
    # Test DNS resolution
    await test_dns_resolution(api_url)
    await test_dns_resolution(node_url)
    
    # Test HTTP connectivity
    await test_http_connectivity(api_url)
    await test_http_connectivity(node_url)

async def test_basic_connectivity(url: str):
    """Test basic network connectivity."""
    parsed = urlparse(url)
    host = parsed.hostname
    port = parsed.port or (443 if parsed.scheme == 'https' else 80)
    
    try:
        # Test socket connection
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print(f"✅ Basic connectivity to {host}:{port} - OK")
        else:
            print(f"❌ Basic connectivity to {host}:{port} - FAILED")
    
    except Exception as e:
        print(f"❌ Basic connectivity to {host}:{port} - ERROR: {e}")

async def test_dns_resolution(url: str):
    """Test DNS resolution."""
    parsed = urlparse(url)
    host = parsed.hostname
    
    try:
        ip_address = socket.gethostbyname(host)
        print(f"✅ DNS resolution for {host} -> {ip_address}")
    except Exception as e:
        print(f"❌ DNS resolution for {host} - ERROR: {e}")

async def test_http_connectivity(url: str):
    """Test HTTP connectivity."""
    try:
        timeout = aiohttp.ClientTimeout(total=10)
        
        async with aiohttp.ClientSession(timeout=timeout) as session:
            async with session.get(url + "/health") as response:
                if response.status == 200:
                    print(f"✅ HTTP connectivity to {url} - OK")
                else:
                    print(f"⚠️ HTTP connectivity to {url} - Status: {response.status}")
    
    except aiohttp.ClientConnectorError as e:
        print(f"❌ HTTP connectivity to {url} - Connection error: {e}")
    except asyncio.TimeoutError:
        print(f"❌ HTTP connectivity to {url} - Timeout")
    except Exception as e:
        print(f"❌ HTTP connectivity to {url} - ERROR: {e}")

# Example usage
async def connectivity_check():
    await diagnose_connectivity(
        "https://api.kaleidoswap.com",
        "https://node.kaleidoswap.com"
    )

if __name__ == "__main__":
    asyncio.run(connectivity_check())
```

## Rate Limiting

### Rate Limit Handler

#### Python

```python
import asyncio
import time
from collections import deque
from typing import Optional

class RateLimiter:
    def __init__(self, max_requests: int, time_window: float):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()
    
    async def acquire(self) -> bool:
        """Acquire permission to make a request."""
        now = time.time()
        
        # Remove old requests outside the time window
        while self.requests and self.requests[0] <= now - self.time_window:
            self.requests.popleft()
        
        # Check if we can make a request
        if len(self.requests) < self.max_requests:
            self.requests.append(now)
            return True
        
        # Calculate wait time
        oldest_request = self.requests[0]
        wait_time = oldest_request + self.time_window - now
        
        if wait_time > 0:
            print(f"Rate limit reached, waiting {wait_time:.2f} seconds")
            await asyncio.sleep(wait_time)
            return await self.acquire()
        
        return True

class RateLimitedClient:
    def __init__(self, client: KaleidoClient, rate_limiter: RateLimiter):
        self.client = client
        self.rate_limiter = rate_limiter
    
    async def rate_limited_call(self, operation, *args, **kwargs):
        """Make a rate-limited API call."""
        await self.rate_limiter.acquire()
        return await operation(*args, **kwargs)
    
    async def list_assets(self):
        return await self.rate_limited_call(self.client.maker.list_assets)
    
    async def get_quote(self, *args, **kwargs):
        return await self.rate_limited_call(self.client.maker.get_quote, *args, **kwargs)

# Example usage
async def rate_limiting_example():
    # Allow 10 requests per minute
    rate_limiter = RateLimiter(max_requests=10, time_window=60.0)
    
    client = KaleidoClient.create(
        base_url="https://api.kaleidoswap.com",
        node_url="https://node.kaleidoswap.com"
    )
    
    try:
        rate_limited_client = RateLimitedClient(client, rate_limiter)
        
        # Make multiple requests (will be rate limited)
        for i in range(15):
            try:
                assets = await rate_limited_client.list_assets()
                print(f"Request {i + 1}: Got {len(assets.assets)} assets")
            except Exception as e:
                print(f"Request {i + 1}: Failed - {e}")
    finally:
        await client.close()

if __name__ == "__main__":
    asyncio.run(rate_limiting_example())
```

## Troubleshooting Guide

### Common Issues and Solutions

#### 1. Connection Refused

**Problem**: `ConnectionRefusedError` when trying to connect

**Solutions**:
- Check if the API URL is correct
- Verify network connectivity
- Check firewall settings
- Ensure the service is running

```python
# Test connectivity
await diagnose_connectivity(api_url, node_url)
```

#### 2. SSL Certificate Issues

**Problem**: SSL verification errors

**Solutions**:
- Update your certificate store
- Check system time
- Use proper HTTPS URLs
- For development, temporarily disable SSL verification (not recommended for production)

```python
# For development only - disable SSL verification
import ssl
ssl_context = ssl.create_default_context()
ssl_context.check_hostname = False
ssl_context.verify_mode = ssl.CERT_NONE
```

#### 3. Timeout Errors

**Problem**: Operations timing out

**Solutions**:
- Increase timeout values
- Check network latency
- Use retry logic with exponential backoff
- Implement proper error handling

```python
client = KaleidoClient.create(
    base_url="https://api.kaleidoswap.com",
    node_url="https://node.kaleidoswap.com",
    timeout=60  # Increase timeout
)
```

#### 4. WebSocket Disconnections

**Problem**: WebSocket connections dropping frequently

**Solutions**:
- Implement reconnection logic
- Check firewall/proxy settings
- Use appropriate ping intervals
- Handle connection state properly

```python
# Use the ReconnectingWebSocketManager from earlier examples
```

#### 5. Rate Limiting

**Problem**: Getting rate limit errors

**Solutions**:
- Implement client-side rate limiting
- Use exponential backoff
- Batch operations when possible
- Contact support for rate limit increases

```python
# Use the RateLimitedClient from earlier examples
```

### Debugging Checklist

1. **Check Configuration**
   - Verify API URLs
   - Check authentication credentials
   - Validate network settings

2. **Test Connectivity**
   - Basic network connectivity
   - DNS resolution
   - HTTP/HTTPS access
   - WebSocket connectivity

3. **Review Logs**
   - Enable debug logging
   - Check error patterns
   - Monitor resource usage

4. **Validate Requests**
   - Check request parameters
   - Verify data formats
   - Test with minimal examples

5. **Monitor Performance**
   - Check response times
   - Monitor error rates
   - Track resource usage

### Getting Help

If you continue to experience issues:

1. **Enable Debug Mode**: Use detailed logging to capture request/response data
2. **Check Documentation**: Review this guide and API documentation
3. **Search Issues**: Check existing GitHub issues for similar problems
4. **Create Issue**: If the problem persists, create a detailed issue report including:
   - SDK version
   - Error messages and stack traces
   - Code samples that reproduce the issue
   - Environment details (OS, Python version, etc.)

This comprehensive error handling guide should help you identify, debug, and resolve most issues you might encounter while using the Kaleidoswap SDK. 