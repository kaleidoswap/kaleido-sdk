# Changelog

All notable changes to the Kaleidoswap SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

### Changed

### Fixed

### Breaking Changes

## [0.1.10] - 2026-06-17

### Fixed

- **TypeScript** `listUnspents()` now sends `settled_only: false` by default, matching the Python client and RLN 0.7.1's required `ListUnspentsRequest` shape. In 0.1.9 the TS convenience method still sent the `{skip_sync}`-only body and was rejected by RLN 0.7.1 with `HTTP 400 "Failed to deserialize the JSON body into the target type"`.

## [0.1.9] - 2026-06-17

### Added

- Added the **NWC (Nostr Wallet Connect, NIP-47) client** as the `kaleido-sdk/nwc` subpath: `NWCClient` with `rln_*` RLN extension methods, an `RlnTransport` seam to run `RlnClient` over an NWC connection, NIP-44 encryption (with NIP-04 fallback), and LN-invoice decode / send-BTC / list-payments mapped over the NWC transport.
- Added generated RLN models and client methods for `POST /sendrgb`, `POST /inflate`, and `POST /issueassetifa`, plus Inflatable Fungible Asset (IFA) types (e.g. `AssetIFA`).

### Changed

- Updated the bundled RGB Lightning Node OpenAPI spec and regenerated the Python/TypeScript node models to match `kaleidoswap/rgb-lightning-node` `v0.7.1`.
- `list_unspents()` now sends `settled_only=False` by default.

### Breaking Changes

- `ListUnspentsRequest` now requires a `settled_only` field (RLN 0.7.1). Callers that construct the request directly must pass `settled_only`; RLN 0.7.1 rejects the previous `{skip_sync}`-only body with `HTTP 400 "Failed to deserialize the JSON body into the target type"`.
- `POST /sendasset` (`SendAssetRequest` / `SendAssetResponse`) was renamed to `POST /sendrgb` (`SendRgbRequest` / `SendRgbResponse`).

## [0.1.8] - 2026-06-09

### Added

- Added Python and TypeScript RLN client methods and public request/response types for decoding swapstrings through `POST /decodeswapstring`.
- Added unit coverage for swapstring request serialization and decoded response handling in both SDKs.

### Changed

- Bumped `pytest` from 9.0.2 to 9.0.3 in `/python-sdk`.
- Bumped `postcss` from 8.5.9 to 8.5.14 in `/typescript-sdk`.
- Bumped `fast-uri` from 3.1.0 to 3.1.2 in `/typescript-sdk`.
- Bumped `idna` from 3.11 to 3.15 in `/python-sdk`.
- Updated the bundled RGB Lightning Node OpenAPI spec and generated Python/TypeScript node models to match `kaleidoswap/rgb-lightning-node` version `v0.7.0`.
- Preserved the Kaleidoswap RLN repository link when refreshing the upstream OpenAPI specification.

## [0.1.7] - 2026-05-15

### Added

- Added generated RLN sync request models and enums for the new structured `/sync` request body: `SyncRequest`, `SyncOptions`, `SyncKeychain`, and `SyncStrategy`.

### Changed

- Updated the bundled RGB Lightning Node OpenAPI spec and generated Python/TypeScript node models to match `kaleidoswap/rgb-lightning-node` version `v0.6.5`.
- Updated the Python and TypeScript RLN clients to send the new default `/sync` request body while still allowing callers to provide explicit sync options.
- Refreshed generated RLN transfer and transaction enums: `TransactionType` now exposes `SendBtc` and `Incoming`, `TransferKind` now exposes `Burn`, and `TransferStatus` now exposes `WaitingSafeHeight`.
- Updated the generated maker API `BitcoinNetwork` enum to remove `SignetCustom`.

### Fixed

- Updated integration tests to use the Vitest 4 timeout signature.

### Breaking Changes

- Removed `skip_sync` from generated `SendRgbRequest` models to match the updated RLN API.
- Removed generated `TransactionType.User` in favor of the updated RLN `SendBtc` and `Incoming` transaction types.
- Removed generated maker API `BitcoinNetwork.SignetCustom`.

## [0.1.6] - 2026-04-10

### Added

- Added IFA asset support when normalizing `list_assets` responses.
- Added Python and TypeScript test coverage for IFA asset handling.

### Changed

- Refreshed the root README with clearer package, setup, and safety guidance.
- Synced package versions and lockfiles for the `0.1.6` release.

## [0.1.5] - 2026-04-08

### Fixed

- Upgraded `vite` to v8 and `vitest` to v4 in the TypeScript SDK to address the Vite security issue tracked by Dependabot.

### Changed

- Synced package versions for the `0.1.5` release.

## [0.1.4] - 2026-04-08

### Added

- Added `SignetCustom` to the generated `BitcoinNetwork` enums in both SDKs.

### Fixed

- Fixed validation failures when the RLN node reports the `SignetCustom` network type.

## [0.1.3] - 2026-04-07

### Added

- Added `EstimateFeesRequest` and `EstimateFeesResponse` models for maker fee estimation.
- Added regression coverage for asset-pair mapping and updated API type expectations.

### Changed

- Updated maker API models in both SDKs to match the latest trading-pair and asset response shapes.
- Adjusted TypeScript asset-pair mapping to work with explicit asset IDs returned by the API.
- Pinned transitive TypeScript dependencies to pick up security updates.

### Breaking Changes

- Updated generated maker models and trading-pair response shapes. Consumers depending on the older type names or payload structure may need code changes.

## [0.1.2] - 2026-04-01

### Added

- Added RLN `Inflate` and `IssueAssetIFA` endpoints to the Python and TypeScript SDKs.
- Added request and response models for the new RLN asset issuance flow.

### Changed

- Extended generated node types and RLN clients to expose the new endpoints.
- Synced shared version metadata and release files for `0.1.2`.

## [0.1.1] - 2026-04-01

### Added

- Added timeout handling for unlock wallet requests in both SDKs.
- Added tests covering unlock timeout behavior, public exports, and precision helpers.

### Changed

- Replaced `to_smallest_units` with `parse_raw_amount`.
- Replaced `to_display_units` with `to_display_amount`.
- Updated generated Python model headers and tooling to align with `pyright`-based type checking.

### Fixed

- Improved precision parsing and validation for amount conversions.
- Aligned unlock integration test payloads with current API behavior.
- Pulled in Python dependency updates for the release branch.

### Breaking Changes

- Renamed the public precision helpers used by both SDKs. Update imports and call sites from `to_smallest_units`/`to_display_units` to `parse_raw_amount`/`to_display_amount`.

## [0.1.0] - 2026-03-21

### Added

- Initial multi-language SDK release for Kaleidoswap.
- Python and TypeScript SDKs with generated models derived from the Kaleidoswap and RGB Lightning Node OpenAPI specs.
- `KaleidoClient` support for maker and RLN workflows.
- HTTP and WebSocket clients, shared error handling, logging helpers, precision utilities, and asset-pair mapping helpers.
- Example applications and automated test suites for maker, RLN, and WebSocket flows.
