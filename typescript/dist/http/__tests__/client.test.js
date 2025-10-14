"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("../client");
const exceptions_1 = require("../../types/exceptions");
describe('HttpClient', () => {
    let client;
    const mockBaseUrl = 'https://api.test.com';
    const mockApiKey = 'test-api-key';
    beforeEach(() => {
        client = new client_1.HttpClient({
            baseUrl: mockBaseUrl,
            apiKey: mockApiKey
        });
    });
    describe('constructor', () => {
        it('should initialize with correct base URL', () => {
            expect(client).toBeInstanceOf(client_1.HttpClient);
        });
        it('should handle base URL with trailing slash', () => {
            const clientWithSlash = new client_1.HttpClient({
                baseUrl: `${mockBaseUrl}/`,
                apiKey: mockApiKey
            });
            expect(clientWithSlash).toBeInstanceOf(client_1.HttpClient);
        });
    });
    describe('request', () => {
        const mockEndpoint = 'test/endpoint';
        const mockData = { test: 'data' };
        const mockResponse = { result: 'success' };
        beforeEach(() => {
            global.fetch = jest.fn();
        });
        afterEach(() => {
            jest.resetAllMocks();
        });
        it('should make successful GET request', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });
            const result = await client.get(mockEndpoint);
            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/${mockEndpoint}`, expect.objectContaining({
                method: 'GET',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${mockApiKey}`
                })
            }));
        });
        it('should make successful POST request', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: () => Promise.resolve(mockResponse)
            });
            const result = await client.post(mockEndpoint, mockData);
            expect(result).toEqual(mockResponse);
            expect(global.fetch).toHaveBeenCalledWith(`${mockBaseUrl}/${mockEndpoint}`, expect.objectContaining({
                method: 'POST',
                headers: expect.objectContaining({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${mockApiKey}`
                }),
                body: JSON.stringify(mockData)
            }));
        });
        it('should throw AuthenticationError on 401', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 401
            });
            await expect(client.get(mockEndpoint)).rejects.toThrow(exceptions_1.AuthenticationError);
        });
        it('should throw RateLimitError on 429', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 429
            });
            await expect(client.get(mockEndpoint)).rejects.toThrow(exceptions_1.RateLimitError);
        });
        it('should throw ValidationError on 400', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 400
            });
            await expect(client.get(mockEndpoint)).rejects.toThrow(exceptions_1.ValidationError);
        });
        it('should throw NetworkError on 500', async () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });
            await expect(client.get(mockEndpoint)).rejects.toThrow(exceptions_1.NetworkError);
        });
        it('should throw NetworkError on fetch failure', async () => {
            global.fetch.mockRejectedValueOnce(new Error('Network error'));
            await expect(client.get(mockEndpoint)).rejects.toThrow(exceptions_1.NetworkError);
        });
    });
});
//# sourceMappingURL=client.test.js.map