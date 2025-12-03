/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { AssignmentFungible } from './AssignmentFungible';
import type { TransferKind } from './TransferKind';
import type { TransferStatus } from './TransferStatus';
import type { TransferTransportEndpoint } from './TransferTransportEndpoint';
export type Transfer = {
  idx?: number;
  created_at?: number;
  updated_at?: number;
  status?: TransferStatus;
  requested_assignment?: AssignmentFungible;
  assignments?: Array<AssignmentFungible>;
  kind?: TransferKind;
  txid?: string;
  recipient_id?: string;
  receive_utxo?: string;
  change_utxo?: string;
  expiration?: number;
  transport_endpoints?: Array<TransferTransportEndpoint>;
};
