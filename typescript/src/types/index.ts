import { components } from "types";

export type AssetResponse = components['schemas']['AssetsResponse']
export type TradingPair = components['schemas']['Pair'];
export type PairResponse = components['schemas']['PairResponse'];
export type Quote = components['schemas']['PairQuoteRequest']
export type PairQuoteResponse = components['schemas']['PairQuoteResponse']
export type SwapRequest = components['schemas']['SwapRequest']
export type SwapResponse = components['schemas']['SwapResponse']
export type ConfirmSwapRequest = components['schemas']['ConfirmSwapRequest']
export type ConfirmSwapResponse = components['schemas']['ConfirmSwapResponse']
export type Swap = components['schemas']['Swap']
export type SwapStatus = components['schemas']['SwapStatus']

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  type: string;
}
