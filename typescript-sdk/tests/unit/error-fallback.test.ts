import { describe, it, expect, vi } from 'vitest';
import { MakerClient } from '../../src/maker-client.js';
import { HttpClient } from '../../src/http-client.js';
import { APIError, ValidationError } from '../../src/errors.js';

// Mock HttpClient
const mockPost = vi.fn();
const mockGet = vi.fn();

const mockHttpClient = {
    maker: {
        POST: mockPost,
        GET: mockGet,
    },
} as unknown as HttpClient;

describe('MakerClient Error Handling Reproduction', () => {
    const client = new MakerClient(mockHttpClient);

    it('should default to APIError (500) if response is missing', async () => {
        // Simulate openapi-fetch result where response is missing but error is present
        // This is an edge case - in practice, openapi-fetch should always provide response
        mockPost.mockResolvedValue({
            data: undefined,
            error: {
                detail: 'Asset misma tch in RGB invoice. Expected X but got Y.',
            },
            // response: undefined // Missing response
        });

        try {
            await client.createSwapOrder({} as any);
            expect(true).toBe(false); // Should not reach here
        } catch (error: any) {
            console.log('Caught error (fallback check):', error);
            // When response is missing, we default to 500 status
            expect(error).toBeInstanceOf(APIError);
            expect(error.statusCode).toBe(500);
        }
    });

    it('should throw 400 if response object is present with status 400', async () => {
        // Simulate openapi-fetch result where response IS present
        mockPost.mockResolvedValue({
            data: undefined,
            error: {
                detail: 'Asset mismatch in RGB invoice',
            },
            response: {
                status: 400,
                statusText: 'Bad Request',
            } as Response,
        });

        try {
            await client.createSwapOrder({} as any);
            expect(true).toBe(false); // Should not reach here
        } catch (error: any) {
            console.log('Caught error (with response):', error);
            expect(error).toBeInstanceOf(ValidationError);
        }
    });
});
