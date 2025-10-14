"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultRetryConfig = void 0;
exports.retry = retry;
exports.withRetry = withRetry;
const exceptions_1 = require("../types/exceptions");
exports.defaultRetryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    exponentialBase: 2,
    jitter: true,
    retryOnExceptions: [exceptions_1.NetworkError, exceptions_1.RateLimitError]
};
async function retry(fn, config = {}) {
    const finalConfig = { ...exports.defaultRetryConfig, ...config };
    let lastError;
    for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            // Check if we should retry this exception
            const shouldRetry = finalConfig.retryOnExceptions.some((ExceptionClass) => error instanceof ExceptionClass);
            if (!shouldRetry || attempt === finalConfig.maxRetries) {
                throw error;
            }
            // Calculate delay with exponential backoff
            const delay = Math.min(finalConfig.initialDelay * Math.pow(finalConfig.exponentialBase, attempt), finalConfig.maxDelay);
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
function withRetry(fn, config = {}) {
    return (async (...args) => {
        return retry(() => fn(...args), config);
    });
}
