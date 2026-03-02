/**
 * Unit Tests - HTTP Client
 *
 * Tests the core HTTP client functionality with openapi-fetch
 */

import { describe, it, expect } from 'vitest';
import { HttpClient } from '../../src/http-client.js';

describe('HttpClient', () => {
    describe('Constructor', () => {
        it('should create client with maker API', () => {
            const client = new HttpClient({
                baseUrl: 'https://api.example.com',
            });

            expect(client).toBeDefined();
            expect(client.maker).toBeDefined();
        });

        it('should create client with node API when nodeUrl provided', () => {
            const client = new HttpClient({
                baseUrl: 'https://api.example.com',
                nodeUrl: 'https://node.example.com',
            });

            expect(client).toBeDefined();
            expect(client.hasNodeClient()).toBe(true);
        });

        it('should not have node client without nodeUrl', () => {
            const client = new HttpClient({
                baseUrl: 'https://api.example.com',
            });

            expect(client.hasNodeClient()).toBe(false);
        });
    });

    describe('Node Client', () => {
        it('should throw error when accessing node without configuration', () => {
            const client = new HttpClient({
                baseUrl: 'https://api.example.com',
            });

            expect(() => client.node).toThrow(
                'Node API not configured. Provide "nodeUrl" when creating the client.',
            );
        });

        it('should allow enabling node client later', () => {
            const client = new HttpClient({
                baseUrl: 'https://api.example.com',
            });

            expect(client.hasNodeClient()).toBe(false);

            client.enableNodeClient('https://node.example.com');

            expect(client.hasNodeClient()).toBe(true);
            expect(client.node).toBeDefined();
        });
    });
});
