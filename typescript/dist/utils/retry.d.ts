export interface RetryConfig {
    maxRetries: number;
    initialDelay: number;
    maxDelay: number;
    exponentialBase: number;
    jitter: boolean;
    retryOnExceptions: Array<new (...args: any[]) => Error>;
}
export declare const defaultRetryConfig: RetryConfig;
export declare function retry<T>(fn: () => Promise<T>, config?: Partial<RetryConfig>): Promise<T>;
export declare function withRetry<T extends (...args: any[]) => Promise<any>>(fn: T, config?: Partial<RetryConfig>): T;
