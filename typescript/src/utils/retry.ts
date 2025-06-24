import { NetworkError, RateLimitError } from '../types/exceptions';

export interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  exponentialBase: number;
  jitter: boolean;
  retryOnExceptions: Array<new (...args: any[]) => Error>;
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  exponentialBase: 2,
  jitter: true,
  retryOnExceptions: [NetworkError, RateLimitError]
};

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

      // Check if we should retry this exception
      const shouldRetry = finalConfig.retryOnExceptions.some(
        (ExceptionClass) => error instanceof ExceptionClass
      );

      if (!shouldRetry || attempt === finalConfig.maxRetries) {
        throw error;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        finalConfig.initialDelay * Math.pow(finalConfig.exponentialBase, attempt),
        finalConfig.maxDelay
      );

      // Add jitter if enabled
      const finalDelay = finalConfig.jitter
        ? delay * (0.5 + Math.random())
        : delay;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, finalDelay));
    }
  }

  // This should never be reached due to the throw in the loop
  throw lastError || new Error('Unexpected error in retry logic');
}

export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  config: Partial<RetryConfig> = {}
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return retry(() => fn(...args), config);
  }) as T;
} 