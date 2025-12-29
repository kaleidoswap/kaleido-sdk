/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

import type { BlockTime } from './BlockTime';
import type { TransactionType } from './TransactionType';
export type Transaction = {
  transaction_type?: TransactionType;
  txid?: string;
  received?: number;
  sent?: number;
  fee?: number;
  confirmation_time?: BlockTime;
};
