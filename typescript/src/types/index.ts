import { components } from "./schema";

export { components };

export type PairResponse = components['schemas']['PairResponse'];
export type SwapRequest = components['schemas']['SwapRequest']
export type ConfirmSwapRequest = components['schemas']['ConfirmSwapRequest']
export type AssetResponse = components['schemas']['AssetsResponse']
export type PairQuoteResponse = components['schemas']['PairQuoteResponse']
export type PairQuoteRequest = components['schemas']['PairQuoteRequest']
export type SwapResponse = components['schemas']['SwapResponse']
export type ConfirmSwapResponse = components['schemas']['ConfirmSwapResponse']
export type ClientAsset = components['schemas']['ClientAsset']
export type Pair = components['schemas']['Pair']
export type Quote = components['schemas']['PairQuoteRequest']
export type Swap = components['schemas']['Swap']
export type SwapStatus = components['schemas']['SwapStatus']
export type CreateOrderRequest = components['schemas']['CreateOrderRequest']
export type PaymentState = components['schemas']['PaymentState']