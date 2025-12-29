/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { CloseChannelRequest } from '../models/CloseChannelRequest';
import type { EmptyResponse } from '../models/EmptyResponse';
import type { GetChannelIdRequest } from '../models/GetChannelIdRequest';
import type { GetChannelIdResponse } from '../models/GetChannelIdResponse';
import type { ListChannelsResponse } from '../models/ListChannelsResponse';
import type { OpenChannelRequest } from '../models/OpenChannelRequest';
import type { OpenChannelResponse } from '../models/OpenChannelResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class ChannelsService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Close a channel
   * Close a LN channel cooperatively or forcibly
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postClosechannel(requestBody?: CloseChannelRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/closechannel',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get a channel's ID
   * Get a channel's ID from its former temporary channel ID
   * @param requestBody
   * @returns GetChannelIdResponse Successful operation
   * @throws ApiError
   */
  public postGetchannelid(
    requestBody?: GetChannelIdRequest
  ): CancelablePromise<GetChannelIdResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/getchannelid',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * List channels
   * List the node's LN channels
   * @returns ListChannelsResponse Successful operation
   * @throws ApiError
   */
  public getListchannels(): CancelablePromise<ListChannelsResponse> {
    return this.httpRequest.request({
      method: 'GET',
      url: '/listchannels',
    });
  }
  /**
   * Open a channel
   * Open a new LN channel (RGB-enabled when both asset_id and asset_amount are specified). You can optionally provide a 32 bytes temporary channel ID as a hex-encoded string.
   * @param requestBody
   * @returns OpenChannelResponse Successful operation
   * @throws ApiError
   */
  public postOpenchannel(requestBody?: OpenChannelRequest): CancelablePromise<OpenChannelResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/openchannel',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
}
