import {
  AuthenticationError,
  NetworkError,
  RateLimitError,
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
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    return retry<T>(
      async (): Promise<T> => {
        const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
        const headers = this.getHeaders();

        try {
          const response = await fetch(url, {
            method,
            headers,
            body: data ? JSON.stringify(data) : undefined
          });

          if (response.status === 401) {
            throw new AuthenticationError(
              'Authentication failed',
              response.status
            );
          }

          if (response.status === 429) {
            throw new RateLimitError(
              'Rate limit exceeded',
              response.status
            );
          }

          if (response.status === 400) {
            throw new ValidationError(
              'Invalid request',
              response.status
            );
          }

          if (response.status >= 500) {
            throw new NetworkError(
              'Server error',
              response.status
            );
          }

          if (!response.ok) {
            throw new NetworkError(
              `Request failed: ${response.statusText}`,
              response.status
            );
          }

          return (await response.json()) as T;
        } catch (error) {
          if (error instanceof AuthenticationError ||
              error instanceof RateLimitError ||
              error instanceof ValidationError ||
              error instanceof NetworkError) {
            throw error;
          }

          throw new NetworkError(
            `Network error: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      },
      this.retryConfig
    );
  }

  /**
   * Makes a GET request
   * @param endpoint - API endpoint
   * @returns Promise resolving to the response data
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  /**
   * Makes a POST request
   * @param endpoint - API endpoint
   * @param data - Request data
   * @returns Promise resolving to the response data
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }
} 