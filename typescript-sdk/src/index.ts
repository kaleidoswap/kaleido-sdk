/**
 * Kaleidoswap SDK - TypeScript/JavaScript
 *
 * Pure TypeScript SDK for interacting with the Kaleidoswap protocol.
 * Trade RGB assets on Lightning Network with ease.
 *
 * @example
 * ```typescript
 * import { KaleidoClient } from 'kaleido-sdk';
 * import type { PairQuoteResponse, AssetResponseModel } from 'kaleido-sdk';
 *
 * const client = await KaleidoClient.create({
 *   baseUrl: 'https://api.regtest.kaleidoswap.com',
 * });
 *
 * const assets = await client.maker.listAssets();
 * const quote = await client.maker.getQuote({ ... });
 * ```
 */

export { KaleidoClient } from './client.js';
export { MakerClient } from './maker-client.js';
export { HttpClient } from './http-client.js';
export { WSClient } from './ws-client.js';
export { getVersion, getSdkName } from './client.js';
export { generateInstallId, generateSessionId, loadOrCreateInstallId } from './identity.js';
export type { InstallIdStore } from './identity.js';

export {
    LogLevel,
    applyLogLevel,
    setComponentLogLevel,
    setLogger,
    logLevelName,
    StreamLogger,
} from './logging.js';

export type {
    LogLevel as LogLevelValue,
    LogLevelName,
    SdkLogger,
    StreamLogFormatter,
    WritableStream,
    LogState,
} from './logging.js';
export {
    parseRawAmount,
    toDisplayAmount,
    PrecisionHandler,
    createPrecisionHandler,
    AssetPairMapper,
    createAssetPairMapper,
} from './utils/index.js';
export type {
    MappedAsset,
    ValidationResult,
    OrderSizeLimits,
    AssetPairMappedAsset,
} from './utils/index.js';

export {
    KaleidoError,
    APIError,
    NetworkError,
    ValidationError,
    TimeoutError,
    WebSocketError,
    NotFoundError,
    ConfigError,
    SwapError,
    NodeNotConfiguredError,
    QuoteExpiredError,
    InsufficientBalanceError,
    RateLimitError,
    mapHttpError,
    assertResponse,
} from './errors.js';

export type { KaleidoConfig } from './types/config.js';
export * from './api-types-ext.js';
export type { paths } from './generated/api-types.js';
export type { paths as ApiPaths } from './generated/api-types.js';
export type * from './types/ws.js';
export type { SwapCompletionOptions } from './maker-client.js';
