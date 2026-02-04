# Error Handling

The Kaleidoswap SDK provides typed error classes for proper error handling.

## Error Hierarchy

```
KaleidoError (base class)
├── APIError           - Server returned an error
├── NetworkError       - Connection/network issues
├── TimeoutError       - Request timed out
├── ValidationError    - Invalid input parameters
├── NotFoundError      - Resource not found
├── ConfigError        - Configuration issues
├── SwapError          - Swap-specific errors
├── QuoteExpiredError  - Quote has expired
├── InsufficientBalanceError - Not enough funds
├── NodeNotConfiguredError - RLN node not set up
├── RateLimitError     - Rate limit exceeded
└── WebSocketError     - WebSocket connection issues
```

## Importing Error Classes

```typescript
import {
  KaleidoError,
  APIError,
  NetworkError,
  TimeoutError,
  ValidationError,
  NotFoundError,
  QuoteExpiredError,
  InsufficientBalanceError,
  NodeNotConfiguredError,
  RateLimitError,
  WebSocketError,
} from 'kaleidoswap-sdk';
```

## Basic Error Handling

```typescript
try {
  const quote = await client.maker.getQuote({ ... });
} catch (error) {
  if (error instanceof QuoteExpiredError) {
    // Quote expired - get a new one
    console.log('Quote expired, requesting new quote...');
  } else if (error instanceof ValidationError) {
    // Invalid parameters
    console.log('Invalid parameters:', error.message);
  } else if (error instanceof APIError) {
    // Server error
    console.log('API error:', error.message);
    console.log('Status code:', error.statusCode);
  } else {
    // Unknown error
    console.log('Error:', error);
  }
}
```

## Error Classes in Detail

### APIError

Thrown when the server returns an error response:

```typescript
try {
  await client.maker.getSwapOrderStatus({ order_id: 'invalid' });
} catch (error) {
  if (error instanceof APIError) {
    console.log('Message:', error.message);
    console.log('Status Code:', error.statusCode);
    console.log('Retryable:', error.isRetryable());
    
    // Check if we should retry
    if (error.isRetryable()) {
      // Implement retry logic
    }
  }
}
```

### ValidationError

Thrown when input parameters are invalid:

```typescript
try {
  // Invalid amount
  const validation = precisionHandler.validateOrderSize(-100, btcAsset);
  if (!validation.valid) {
    throw new ValidationError(validation.error);
  }
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Validation failed:', error.message);
  }
}
```

### NetworkError & TimeoutError

Thrown for connection issues:

```typescript
try {
  await client.maker.listAssets();
} catch (error) {
  if (error instanceof NetworkError) {
    console.log('Network error - check your connection');
  } else if (error instanceof TimeoutError) {
    console.log('Request timed out - try again');
  }
}
```

### QuoteExpiredError

Thrown when attempting to use an expired quote:

```typescript
async function createOrderWithRetry(quoteId: string) {
  try {
    return await client.maker.createSwapOrder({ rfq_id: quoteId, ... });
  } catch (error) {
    if (error instanceof QuoteExpiredError) {
      // Get new quote and retry
      const newQuote = await client.maker.getQuote({ ... });
      return await client.maker.createSwapOrder({ rfq_id: newQuote.rfq_id, ... });
    }
    throw error;
  }
}
```

### NodeNotConfiguredError

Thrown when trying to use RLN features without configuring nodeUrl:

```typescript
const client = KaleidoClient.create({ 
  baseUrl: 'https://api.kaleidoswap.com'
  // nodeUrl not set
});

try {
  await client.rln.getNodeInfo();
} catch (error) {
  if (error instanceof NodeNotConfiguredError) {
    console.log('Node URL not configured. Set nodeUrl in client config.');
  }
}
```

## Error Handling Patterns

### Pattern 1: Type-Safe Error Handler

```typescript
function handleError(error: unknown): { 
  type: string; 
  message: string; 
  retryable: boolean 
} {
  if (error instanceof QuoteExpiredError) {
    return { type: 'QUOTE_EXPIRED', message: 'Get a new quote', retryable: true };
  }
  if (error instanceof ValidationError) {
    return { type: 'VALIDATION', message: error.message, retryable: false };
  }
  if (error instanceof NetworkError) {
    return { type: 'NETWORK', message: 'Check connection', retryable: true };
  }
  if (error instanceof TimeoutError) {
    return { type: 'TIMEOUT', message: 'Request timed out', retryable: true };
  }
  if (error instanceof APIError) {
    return { 
      type: 'API', 
      message: error.message, 
      retryable: error.isRetryable() 
    };
  }
  if (error instanceof KaleidoError) {
    return { type: 'SDK', message: error.message, retryable: false };
  }
  if (error instanceof Error) {
    return { type: 'UNKNOWN', message: error.message, retryable: false };
  }
  return { type: 'UNKNOWN', message: 'An error occurred', retryable: false };
}
```

### Pattern 2: Safe API Call Wrapper

```typescript
async function safeApiCall<T>(
  operation: () => Promise<T>,
  options: {
    fallback?: T;
    maxRetries?: number;
    onError?: (error: unknown) => void;
  } = {}
): Promise<T | undefined> {
  const { fallback, maxRetries = 3, onError } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      onError?.(error);
      
      if (error instanceof APIError && error.isRetryable() && attempt < maxRetries) {
        // Wait before retry (exponential backoff)
        await new Promise(r => setTimeout(r, 1000 * attempt));
        continue;
      }
      
      if (fallback !== undefined) {
        return fallback;
      }
      
      throw error;
    }
  }
  
  return fallback;
}

// Usage
const assets = await safeApiCall(
  () => client.maker.listAssets(),
  { 
    fallback: { assets: [], timestamp: 0 },
    maxRetries: 3,
    onError: (e) => console.warn('API call failed:', e)
  }
);
```

### Pattern 3: Quote Workflow with Proper Error Handling

```typescript
async function executeSwap(fromTicker: string, toTicker: string, amount: number) {
  const pairs = await client.maker.listPairs();
  const mapper = createAssetPairMapper(pairs);
  const precision = createPrecisionHandler(mapper.getAllAssets());
  
  // Validate assets exist
  const fromAsset = mapper.findByTicker(fromTicker);
  const toAsset = mapper.findByTicker(toTicker);
  
  if (!fromAsset || !toAsset) {
    throw new NotFoundError(`Asset not found: ${!fromAsset ? fromTicker : toTicker}`);
  }
  
  // Validate tradability
  if (!mapper.canTrade(fromAsset.asset_id, toAsset.asset_id)) {
    throw new ValidationError(`Cannot trade ${fromTicker}/${toTicker}`);
  }
  
  // Validate amount
  const validation = precision.validateOrderSize(amount, fromAsset);
  if (!validation.valid) {
    throw new ValidationError(validation.error!);
  }
  
  // Get quote with retry on expiration
  let quote;
  let attempts = 0;
  const maxAttempts = 3;
  
  while (attempts < maxAttempts) {
    try {
      quote = await client.maker.getQuote({ ... });
      
      // Create order
      const order = await client.maker.createSwapOrder({ 
        rfq_id: quote.rfq_id,
        ...
      });
      
      return order;
    } catch (error) {
      if (error instanceof QuoteExpiredError) {
        attempts++;
        console.log(`Quote expired, attempt ${attempts}/${maxAttempts}`);
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('Failed to create order after multiple attempts');
}
```

## Best Practices

1. **Always use instanceof checks** - Don't rely on error messages
2. **Handle specific errors first** - Put more specific catches before generic ones
3. **Use isRetryable()** - Check if API errors can be retried
4. **Provide user-friendly messages** - Convert technical errors to user messages
5. **Log errors for debugging** - Keep detailed logs for troubleshooting
6. **Implement retry logic** - For retryable errors, implement exponential backoff
