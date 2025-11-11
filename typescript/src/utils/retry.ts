import { NetworkError, RateLimitError } from '../types/exceptions';
import { KaleidoSDKError, RetryStrategy } from '../types/errors';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  exponentialBase: number;
  jitter: boolean;
  retryOnExceptions: Array<new (...args: any[]) => Error>;
  // New fields for enhanced error handling
  respectErrorRetryConfig?: boolean; // Whether to respect error's own retry configuration
  customRetryStrategy?: RetryStrategy; // Override default retry strategy
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  exponentialBase: 2,
  jitter: true,
  retryOnExceptions: [NetworkError, RateLimitError],
  respectErrorRetryConfig: true,
};

/**
 * Enhanced retry function that works with the new error system
 */
export async function retry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Enhanced retry logic for KaleidoSDKError
      if (error instanceof KaleidoSDKError && finalConfig.respectErrorRetryConfig) {
        // Use error's own retry configuration if available
        if (!error.isRetryable()) {
          throw error; // Don't retry non-retryable errors
        }

        // Use error's own retry limits if configured
        const errorMaxRetries = error.metadata.maxRetries;
        if (errorMaxRetries !== undefined && attempt >= errorMaxRetries) {
          throw error;
        }
      } else {
        // Legacy retry logic for backward compatibility
        const shouldRetry = finalConfig.retryOnExceptions.some(
          exceptionClass => error instanceof exceptionClass
        );

        if (!shouldRetry) {
          throw error;
        }
      }

      // Don't retry if we've reached max attempts
      if (attempt === finalConfig.maxRetries) {
        throw error;
      }

      // Calculate delay based on error's retry strategy or config
      let delay = finalConfig.initialDelay;

      if (error instanceof KaleidoSDKError && finalConfig.respectErrorRetryConfig) {
        const errorDelay = error.metadata.retryDelay;
        const retryStrategy = error.getRetryStrategy();

        if (errorDelay) {
          delay = errorDelay;
        } else {
          delay = calculateDelayFromStrategy(
            retryStrategy,
            attempt,
            finalConfig.initialDelay,
            finalConfig.exponentialBase,
            finalConfig.maxDelay
          );
        }
      } else {
        // Standard exponential backoff
        delay = Math.min(
          finalConfig.initialDelay * Math.pow(finalConfig.exponentialBase, attempt),
          finalConfig.maxDelay
        );
      }

      // Add jitter if enabled
      const finalDelay = finalConfig.jitter ? delay + Math.random() * delay * 0.1 : delay;

      await new Promise(resolve => setTimeout(resolve, finalDelay));
    }
  }

  throw lastError;
}

/**
 * Calculate delay based on retry strategy
 */
function calculateDelayFromStrategy(
  strategy: RetryStrategy,
  attempt: number,
  initialDelay: number,
  exponentialBase: number,
  maxDelay: number
): number {
  switch (strategy) {
    case RetryStrategy.IMMEDIATE_RETRY:
      return 0;

    case RetryStrategy.LINEAR_BACKOFF:
      return Math.min(initialDelay * (attempt + 1), maxDelay);

    case RetryStrategy.EXPONENTIAL_BACKOFF:
      return Math.min(initialDelay * Math.pow(exponentialBase, attempt), maxDelay);

    case RetryStrategy.NO_RETRY:
    default:
      return 0; // This shouldn't be called for NO_RETRY, but just in case
  }
}

/**
 * Convenient wrapper for retry with predefined configuration
 */
export const withRetry = <T>(fn: () => Promise<T>, config?: Partial<RetryConfig>): Promise<T> =>
  retry(fn, config);

/**
 * Creates a retry wrapper for a function
 */
export const createRetryWrapper = <TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  config: Partial<RetryConfig> = {}
) => {
  return async (...args: TArgs): Promise<TReturn> => {
    return retry(() => fn(...args), config);
  };
};
