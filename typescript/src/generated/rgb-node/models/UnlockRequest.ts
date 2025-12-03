/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */

export type UnlockRequest = {
  password?: string;
  bitcoind_rpc_username?: string;
  bitcoind_rpc_password?: string;
  bitcoind_rpc_host?: string;
  bitcoind_rpc_port?: number;
  indexer_url?: string;
  proxy_endpoint?: string;
  announce_addresses?: Array<string>;
  announce_alias?: string;
};
