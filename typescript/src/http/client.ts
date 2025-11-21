import { ErrorFactory } from '../types/errorFactory';
import { KaleidoSDKError } from '../types/errors';

/**
 * Configuration for the HTTP client
 */
export interface HttpClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeoutMs?: number;
}

/**
 * HTTP client for making requests to the KaleidoSwap API
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeoutMs: number;

  /**
   * Makes a GET request
   * @param endpoint - API endpoint
   * @returns Promise resolving to the response data
   */
  public async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  /**
   * Makes a POST request
   * @param endpoint - API endpoint
   * @param data - Request data
   * @returns Promise resolving to the response data
   */
  public async post<T, D = unknown>(endpoint: string, data: D): Promise<T> {
    return this.request<T>('POST', endpoint, data);
  }

  /**
   * Creates a new HTTP client instance
   * @param config - Configuration for the client
   */
  constructor(config: HttpClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeoutMs = config.timeoutMs ?? 30000;
  }

  /**
   * Gets the headers for API requests
   * @returns Object containing request headers
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Accept: 'application/json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  /**
   * Makes an HTTP request
   * @param method - HTTP method (GET, POST, etc.)
   * @param endpoint - API endpoint
   * @param data - Optional request data
   * @returns Promise resolving to the response data
   */
  private async request<T>(method: string, endpoint: string, data?: unknown): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = this.getHeaders();

    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();

      if (!response.ok) {
        // Use ErrorFactory to create proper SDK error
        throw ErrorFactory.fromHttpResponse(
          response,
          responseText,
          data,
          undefined // requestId could be added if needed
        );
      }

      if (!responseText) {
        return {} as T;
      }

      try {
        return JSON.parse(responseText) as T;
      } catch (parseError) {
        throw ErrorFactory.fromUnknownError(
          parseError,
          'JSON parsing failed',
          `${method} ${endpoint}`
        );
      }
    } catch (error) {
      clearTimeout(timeoutId);

      // Re-throw as-is if it's already a KaleidoSDKError
      if (error instanceof KaleidoSDKError) {
        throw error;
      }

      // Handle AbortError (timeout) - can be DOMException or Error with name 'AbortError'
      // In Node.js, fetch may throw different error types when aborted
      const isAbortError =
        (error instanceof Error && error.name === 'AbortError') ||
        (typeof DOMException !== 'undefined' &&
          error instanceof DOMException &&
          error.name === 'AbortError') ||
        (error instanceof Error &&
          (error.message.includes('aborted') || error.message.includes('AbortError')));

      if (isAbortError) {
        throw ErrorFactory.createTimeoutError(`${method} ${endpoint}`, this.timeoutMs, { url });
      }

      // Handle other network errors
      if (error instanceof Error) {
        throw ErrorFactory.fromNetworkError(
          error,
          data,
          undefined // requestId could be added if needed
        );
      }

      // Fallback for unknown error types
      throw ErrorFactory.fromUnknownError(error, 'HTTP request failed', `${method} ${endpoint}`);
    }
  }
}
