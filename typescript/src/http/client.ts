import { ErrorFactory } from '../types/errorFactory';
import { 
  AuthenticationError,
  NetworkError,
  RateLimitError,
  TimeoutError,
  ValidationError
} from '../types/exceptions';
import { retry, RetryConfig } from '../utils/retry';

/**
 * Configuration for the HTTP client
 */
export interface HttpClientConfig {
  baseUrl: string;
  apiKey?: string;
  retryConfig?: Partial<RetryConfig>;
}

/**
 * HTTP client for making requests to the KaleidoSwap API
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly retryConfig: Partial<RetryConfig>;

  /**
   * Makes a GET request
   * @param endpoint - API endpoint
   * @returns Promise resolving to the response data
   */
  public async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  /**
   * Makes a POST request
   * @param endpoint - API endpoint
   * @param data - Request data
   * @returns Promise resolving to the response data
   */
  public async post<T = any>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  /**
   * Creates a new HTTP client instance
   * @param config - Configuration for the client
   */
  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.retryConfig = config.retryConfig || {};
  }

  /**
   * Gets the headers for API requests
   * @returns Object containing request headers
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Makes an HTTP request with retry logic
   * @param method - HTTP method (GET, POST, etc.)
   * @param endpoint - API endpoint
   * @param data - Optional request data
   * @returns Promise resolving to the response data
   * @throws {AuthenticationError} If authentication fails
   * @throws {RateLimitError} If rate limit is exceeded
   * @throws {ValidationError} If request validation fails
   * @throws {NetworkError} If there's a network error
   * @throws {TimeoutError} If request times out
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    return retry<T>(
      async (): Promise<T> => {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = this.getHeaders();
        const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const options: RequestInit = {
          method,
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            'X-Request-ID': requestId,
          },
          body: data ? JSON.stringify(data) : undefined,
        };

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

          const response = await fetch(url, {
            ...options,
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          const responseText = await response.text();

          if (!response.ok) {
            throw ErrorFactory.fromHttpResponse(response, responseText, data, requestId);
          }

          if (!responseText) {
            return {} as T;
          }

          try {
            return JSON.parse(responseText) as T;
          } catch (parseError) {
            throw ErrorFactory.createValidationError(
              'response',
              responseText,
              'Invalid JSON format in server response',
              { endpoint, method }
            );
          }
        } catch (error) {
          // Re-throw SDK errors as-is
          if (error instanceof AuthenticationError ||
              error instanceof RateLimitError ||
              error instanceof ValidationError ||
              error instanceof NetworkError ||
              error instanceof TimeoutError) {
            throw error;
          }

          // Handle AbortError (timeout)
          if (error instanceof Error && error.name === 'AbortError') {
            throw ErrorFactory.createTimeoutError(
              `${method} ${endpoint}`,
              30000,
              { data, requestId }
            );
          }

          // Handle other network errors
          throw ErrorFactory.fromNetworkError(
            error instanceof Error ? error : new Error(String(error)),
            data,
            requestId
          );
        }
      },
      this.retryConfig
    );
  }
} 