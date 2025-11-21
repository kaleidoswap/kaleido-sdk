/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { BaseHttpRequest } from './core/BaseHttpRequest';
import type { OpenAPIConfig } from './core/OpenAPI';
import { FetchHttpRequest } from './core/FetchHttpRequest';
import { ChannelsService } from './services/ChannelsService';
import { InvoicesService } from './services/InvoicesService';
import { OnChainService } from './services/OnChainService';
import { OtherService } from './services/OtherService';
import { PaymentsService } from './services/PaymentsService';
import { PeersService } from './services/PeersService';
import { RgbService } from './services/RgbService';
import { SwapsService } from './services/SwapsService';
type HttpRequestConstructor = new (config: OpenAPIConfig) => BaseHttpRequest;
export class RgbNodeClient {
  public readonly channels: ChannelsService;
  public readonly invoices: InvoicesService;
  public readonly onChain: OnChainService;
  public readonly other: OtherService;
  public readonly payments: PaymentsService;
  public readonly peers: PeersService;
  public readonly rgb: RgbService;
  public readonly swaps: SwapsService;
  public readonly request: BaseHttpRequest;
  constructor(
    config?: Partial<OpenAPIConfig>,
    HttpRequest: HttpRequestConstructor = FetchHttpRequest
  ) {
    this.request = new HttpRequest({
      BASE: config?.BASE ?? 'http://localhost:3001',
      VERSION: config?.VERSION ?? '0.1.0',
      WITH_CREDENTIALS: config?.WITH_CREDENTIALS ?? false,
      CREDENTIALS: config?.CREDENTIALS ?? 'include',
      TOKEN: config?.TOKEN,
      USERNAME: config?.USERNAME,
      PASSWORD: config?.PASSWORD,
      HEADERS: config?.HEADERS,
      ENCODE_PATH: config?.ENCODE_PATH,
    });
    this.channels = new ChannelsService(this.request);
    this.invoices = new InvoicesService(this.request);
    this.onChain = new OnChainService(this.request);
    this.other = new OtherService(this.request);
    this.payments = new PaymentsService(this.request);
    this.peers = new PeersService(this.request);
    this.rgb = new RgbService(this.request);
    this.swaps = new SwapsService(this.request);
  }
}
