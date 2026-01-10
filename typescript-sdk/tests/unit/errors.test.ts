/**
 * Unit Tests - Error Handling
 * 
 * Tests error mapping and custom error classes
 */

import { describe, it, expect } from 'vitest';
import {
    KaleidoError,
    ValidationError,
    NotFoundError,
    APIError,
    NetworkError,
    TimeoutError,
    RateLimitError,
    mapHttpError,
} from '../../src/errors.js';

describe('Error Classes', () => {
    it('KaleidoError should extend Error', () => {
        const error = new KaleidoError('TEST_ERROR', 'Test message');
        expect(error).toBeInstanceOf(Error);
        expect(error.name).toBe('KaleidoError');
        expect(error.code).toBe('TEST_ERROR');
        expect(error.message).toBe('Test message');
    });

    it('should identify retryable errors', () => {
        const networkError = new NetworkError('Connection failed');
        expect(networkError.isRetryable()).toBe(true);

        const serverError = new APIError('Server error', 500);
        expect(serverError.isRetryable()).toBe(true);

        const validationError = new ValidationError('Invalid input');
        expect(validationError.isRetryable()).toBe(false);
    });

    describe('mapHttpError', () => {
        it('should map 400 to ValidationError', () => {
            const error = mapHttpError({
                status: 400,
                statusText: 'Bad Request',
                data: { message: 'Invalid parameters' },
            });

            expect(error).toBeInstanceOf(ValidationError);
            expect(error.message).toBe('Invalid parameters');
        });

        it('should map 404 to NotFoundError', () => {
            const error = mapHttpError({
                status: 404,
                statusText: 'Not Found',
            });

            expect(error).toBeInstanceOf(NotFoundError);
        });

        it('should map 429 to RateLimitError', () => {
            const error = mapHttpError({
                status: 429,
                statusText: 'Too Many Requests',
            });

            expect(error).toBeInstanceOf(RateLimitError);
        });

        it('should map 408/504 to TimeoutError', () => {
            const timeout408 = mapHttpError({ status: 408, statusText: 'Timeout' });
            const timeout504 = mapHttpError({ status: 504, statusText: 'Gateway Timeout' });

            expect(timeout408).toBeInstanceOf(TimeoutError);
            expect(timeout504).toBeInstanceOf(TimeoutError);
        });

        it('should map 500-503 to APIError', () => {
            const error = mapHttpError({
                status: 500,
                statusText: 'Internal Server Error',
            });

            expect(error).toBeInstanceOf(APIError);
            expect(error.isRetryable()).toBe(true);
        });

        it('should use error message from data', () => {
            const error = mapHttpError({
                status: 400,
                statusText: 'Bad Request',
                data: { message: 'Custom error message' },
            });

            expect(error.message).toBe('Custom error message');
        });

        it('should fallback to statusText if no data', () => {
            const error = mapHttpError({
                status: 400,
                statusText: 'Bad Request',
            });

            expect(error.message).toBe('Bad Request');
        });
    });
});
