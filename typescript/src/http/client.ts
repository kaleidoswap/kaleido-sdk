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
    this.timeoutMs = config.timeoutMs ?? 30000;
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
   * Makes an HTTP request
   * @param method - HTTP method (GET, POST, etc.)
   * @param endpoint - API endpoint
   * @param data - Optional request data
   * @returns Promise resolving to the response data
   */
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = this.getHeaders();

    const options: RequestInit = {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      
      const responseText = await response.text();

      if (!response.ok) {
        // Try to parse error message from response
        let errorMessage = response.statusText;
        if (responseText) {
          try {
            const errorData = JSON.parse(responseText);
            // Extract the actual error message from FastAPI
            errorMessage = errorData.detail || errorData.message || errorData.error || errorMessage;
          } catch {
            // If not JSON, use the text directly
            errorMessage = responseText || errorMessage;
          }
        }
        
        const error = new Error(`HTTP ${response.status}: ${errorMessage}`) as any;
        error.statusCode = response.status;
        error.response = responseText;
        throw error;
      }

      if (!responseText) {
        return {} as T;
      }

      try {
        return JSON.parse(responseText) as T;
      } catch (parseError) {
        throw new Error(`Invalid JSON response: ${responseText}`);
      }
    } catch (error) {
      // Re-throw as-is if it's already our error format
      if (error instanceof Error && 'statusCode' in error) {
        throw error;
      }

      // Handle AbortError (timeout)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${this.timeoutMs / 1000} seconds`);
      }

      // Handle other network errors
      throw error;
    }
  }
} 