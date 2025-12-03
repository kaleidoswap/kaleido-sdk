/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AssetBalanceRequest } from '../models/AssetBalanceRequest';
import type { AssetBalanceResponse } from '../models/AssetBalanceResponse';
import type { AssetMetadataRequest } from '../models/AssetMetadataRequest';
import type { AssetMetadataResponse } from '../models/AssetMetadataResponse';
import type { CreateUtxosRequest } from '../models/CreateUtxosRequest';
import type { DecodeRGBInvoiceRequest } from '../models/DecodeRGBInvoiceRequest';
import type { DecodeRGBInvoiceResponse } from '../models/DecodeRGBInvoiceResponse';
import type { EmptyResponse } from '../models/EmptyResponse';
import type { FailTransfersRequest } from '../models/FailTransfersRequest';
import type { FailTransfersResponse } from '../models/FailTransfersResponse';
import type { GetAssetMediaRequest } from '../models/GetAssetMediaRequest';
import type { GetAssetMediaResponse } from '../models/GetAssetMediaResponse';
import type { IssueAssetCFARequest } from '../models/IssueAssetCFARequest';
import type { IssueAssetCFAResponse } from '../models/IssueAssetCFAResponse';
import type { IssueAssetNIARequest } from '../models/IssueAssetNIARequest';
import type { IssueAssetNIAResponse } from '../models/IssueAssetNIAResponse';
import type { IssueAssetUDARequest } from '../models/IssueAssetUDARequest';
import type { IssueAssetUDAResponse } from '../models/IssueAssetUDAResponse';
import type { ListAssetsRequest } from '../models/ListAssetsRequest';
import type { ListAssetsResponse } from '../models/ListAssetsResponse';
import type { ListTransfersRequest } from '../models/ListTransfersRequest';
import type { ListTransfersResponse } from '../models/ListTransfersResponse';
import type { PostAssetMediaRequest } from '../models/PostAssetMediaRequest';
import type { PostAssetMediaResponse } from '../models/PostAssetMediaResponse';
import type { RefreshRequest } from '../models/RefreshRequest';
import type { RgbInvoiceRequest } from '../models/RgbInvoiceRequest';
import type { RgbInvoiceResponse } from '../models/RgbInvoiceResponse';
import type { SendAssetRequest } from '../models/SendAssetRequest';
import type { SendAssetResponse } from '../models/SendAssetResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import type { BaseHttpRequest } from '../core/BaseHttpRequest';
export class RgbService {
  constructor(public readonly httpRequest: BaseHttpRequest) {}
  /**
   * Get the balance of an asset
   * Get the balance for the provided RGB asset
   * @param requestBody
   * @returns AssetBalanceResponse Successful operation
   * @throws ApiError
   */
  public postAssetbalance(
    requestBody?: AssetBalanceRequest
  ): CancelablePromise<AssetBalanceResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/assetbalance',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get the metadata of an asset
   * Get the metadata for the provided RGB asset
   * @param requestBody
   * @returns AssetMetadataResponse Successful operation
   * @throws ApiError
   */
  public postAssetmetadata(
    requestBody?: AssetMetadataRequest
  ): CancelablePromise<AssetMetadataResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/assetmetadata',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Create UTXOs
   * Create UTXOs to be used for RGB operations
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postCreateutxos(requestBody?: CreateUtxosRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/createutxos',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Decode an RGB invoice
   * Decode the provided RGB invoice string
   * @param requestBody
   * @returns DecodeRGBInvoiceResponse Successful operation
   * @throws ApiError
   */
  public postDecodergbinvoice(
    requestBody?: DecodeRGBInvoiceRequest
  ): CancelablePromise<DecodeRGBInvoiceResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/decodergbinvoice',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Fail RGB transfers
   * Set the status for eligible RGB transfers to `TransferStatus::Failed`.
   * @param requestBody
   * @returns FailTransfersResponse Successful operation
   * @throws ApiError
   */
  public postFailtransfers(
    requestBody?: FailTransfersRequest
  ): CancelablePromise<FailTransfersResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/failtransfers',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get an asset media
   * Get the hex string of the media bytes of the provided media digest
   * @param requestBody
   * @returns GetAssetMediaResponse Successful operation
   * @throws ApiError
   */
  public postGetassetmedia(
    requestBody?: GetAssetMediaRequest
  ): CancelablePromise<GetAssetMediaResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/getassetmedia',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Issue an RGB CFA asset
   * Issue an RGB CFA asset. To provide a media first call the /postassetmedia API.
   * @param requestBody
   * @returns IssueAssetCFAResponse Successful operation
   * @throws ApiError
   */
  public postIssueassetcfa(
    requestBody?: IssueAssetCFARequest
  ): CancelablePromise<IssueAssetCFAResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/issueassetcfa',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Issue an RGB NIA asset
   * Issue an RGB NIA asset
   * @param requestBody
   * @returns IssueAssetNIAResponse Successful operation
   * @throws ApiError
   */
  public postIssueassetnia(
    requestBody?: IssueAssetNIARequest
  ): CancelablePromise<IssueAssetNIAResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/issueassetnia',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Issue an RGB UDA asset
   * Issue an RGB UDA asset. To provide a media first call the /postassetmedia API.
   * @param requestBody
   * @returns IssueAssetUDAResponse Successful operation
   * @throws ApiError
   */
  public postIssueassetuda(
    requestBody?: IssueAssetUDARequest
  ): CancelablePromise<IssueAssetUDAResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/issueassetuda',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * List assets
   * List the node's RGB assets
   * @param requestBody
   * @returns ListAssetsResponse Successful operation
   * @throws ApiError
   */
  public postListassets(requestBody?: ListAssetsRequest): CancelablePromise<ListAssetsResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/listassets',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * List transfers
   * List the node's on-chain RGB transfers
   * @param requestBody
   * @returns ListTransfersResponse Successful operation
   * @throws ApiError
   */
  public postListtransfers(
    requestBody?: ListTransfersRequest
  ): CancelablePromise<ListTransfersResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/listtransfers',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Post an asset media
   * Save the provided media
   * @param formData
   * @returns PostAssetMediaResponse Successful operation
   * @throws ApiError
   */
  public postPostassetmedia(
    formData?: PostAssetMediaRequest
  ): CancelablePromise<PostAssetMediaResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/postassetmedia',
      formData: formData,
      mediaType: 'multipart/form-data',
    });
  }
  /**
   * Refresh transfers
   * Refresh RGB pending transfers
   * @param requestBody
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postRefreshtransfers(requestBody?: RefreshRequest): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/refreshtransfers',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Get an RGB invoice
   * Get an RGB invoice to receive assets on-chain
   * @param requestBody
   * @returns RgbInvoiceResponse Successful operation
   * @throws ApiError
   */
  public postRgbinvoice(requestBody?: RgbInvoiceRequest): CancelablePromise<RgbInvoiceResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/rgbinvoice',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Send assets
   * Send RGB assets on-chain
   * @param requestBody
   * @returns SendAssetResponse Successful operation
   * @throws ApiError
   */
  public postSendasset(requestBody?: SendAssetRequest): CancelablePromise<SendAssetResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/sendasset',
      body: requestBody,
      mediaType: 'application/json',
    });
  }
  /**
   * Sync the RGB wallet
   * Sync the RGB wallet
   * @returns EmptyResponse Successful operation
   * @throws ApiError
   */
  public postSync(): CancelablePromise<EmptyResponse> {
    return this.httpRequest.request({
      method: 'POST',
      url: '/sync',
    });
  }
}
