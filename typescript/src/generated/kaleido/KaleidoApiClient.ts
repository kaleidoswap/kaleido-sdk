/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { Lsps1Service } from './services/Lsps1Service';
import { MarketService } from './services/MarketService';
import { SwapOrdersService } from './services/SwapOrdersService';
import { SwapsService } from './services/SwapsService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class KaleidoApiClient {
  public readonly lsps1: Lsps1Service;
  public readonly market: MarketService;
  public readonly swapOrders: SwapOrdersService;
  public readonly swaps: SwapsService;
  public readonly request: BaseHttpRequest;
  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = FetchHttpRequest
  ) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? '',
      VERSION: config?.VERSION ?? '0.1.0',
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? 'include',
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
    });
    this.lsps1 = new Lsps1Service(this.request);
    this.market = new MarketService(this.request);
    this.swapOrders = new SwapOrdersService(this.request);
    this.swaps = new SwapsService(this.request);
  }
}
