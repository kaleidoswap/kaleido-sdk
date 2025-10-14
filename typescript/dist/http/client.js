"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpClient = void 0;
const exceptions_1 = require("../types/exceptions");
const retry_1 = require("../utils/retry");
/**
 * HTTP client for making requests to the KaleidoSwap API
 */
class HttpClient {
    /**
     * Makes a GET request
     * @param endpoint - API endpoint
     * @returns Promise resolving to the response data
     */
    async get(endpoint) {
        return this.request('GET', endpoint);
    }
    /**
     * Makes a POST request
     * @param endpoint - API endpoint
     * @param data - Request data
     * @returns Promise resolving to the response data
     */
    async post(endpoint, data) {
        return this.request('POST', endpoint, data);
    }
    /**
     * Creates a new HTTP client instance
     * @param config - Configuration for the client
     */
    constructor(config) {
        this.baseUrl = config.baseUrl.replace(/\/$/, '');
        this.apiKey = config.apiKey;
        this.retryConfig = config.retryConfig || {};
    }
    /**
     * Gets the headers for API requests
     * @returns Object containing request headers
     */
    getHeaders() {
        const headers = {
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
    async request(method, endpoint, data) {
        return (0, retry_1.retry)(async () => {
            const url = `${this.baseUrl}${endpoint}`;
            const headers = this.getHeaders();
            console.log(`Making ${method} request to: ${url}`);
            console.log('Request headers:', headers);
            if (data) {
                console.log('Request body:', JSON.stringify(data, null, 2));
            }
            const options = {
                method,
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: data ? JSON.stringify(data) : undefined,
            };
            try {
                console.log('Sending request to:', url);
                const startTime = Date.now();
                const response = await fetch(url, {
                    ...options,
                    // Add a timeout to prevent hanging requests
                    signal: AbortSignal.timeout(10000) // 10 second timeout
                });
                const endTime = Date.now();
                console.log(`Request to ${url} completed in ${endTime - startTime}ms`);
                const responseText = await response.text();
                console.log('Response status:', response.status);
                // Convert headers to a plain object for logging
                const headersObj = {};
                response.headers.forEach((value, key) => {
                    headersObj[key] = value;
                });
                console.log('Response headers:', headersObj);
                console.log('Response body:', responseText);
                if (response.status === 401) {
                    throw new exceptions_1.AuthenticationError(`Authentication failed: ${response.statusText}`);
                }
                if (response.status === 429) {
                    throw new exceptions_1.RateLimitError(`Rate limit exceeded: ${response.statusText}`);
                }
                if (response.status >= 400) {
                    throw new Error(`HTTP error! status: ${response.status}, body: ${responseText}`);
                }
                if (!responseText) {
                    return {};
                }
                try {
                    return JSON.parse(responseText);
                }
                catch (e) {
                    console.error('Failed to parse JSON response:', e);
                    throw new Error(`Invalid JSON response: ${responseText}`);
                }
            }
            catch (error) {
                if (error instanceof exceptions_1.AuthenticationError ||
                    error instanceof exceptions_1.RateLimitError ||
                    error instanceof exceptions_1.ValidationError ||
                    error instanceof exceptions_1.NetworkError) {
                    throw error;
                }
                throw new exceptions_1.NetworkError(`Network error: ${error instanceof Error ? error.message : String(error)}`);
            }
        }, this.retryConfig);
    }
}
exports.HttpClient = HttpClient;
