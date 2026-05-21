# Changelog

All notable changes to the Kaleidoswap SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Added persistent install IDs and per-client session IDs in both the Python and TypeScript SDKs.
- Added automatic Maker API attribution headers: `X-Kaleido-Install-Id`, `X-Kaleido-Session-Id`, and `X-Kaleido-SDK`.
- Added optional `install_id` / `installId` overrides for integrators that manage their own identity storage.
- Added `allow_insecure` / `allowInsecure` opt-outs for explicitly allowing attribution headers over non-HTTPS Maker URLs. HTTP localhost remains allowed for local development.
- Added browser `persistInstallId` opt-in for TypeScript. Browser install IDs now default to in-memory storage unless persistence is explicitly requested.
- Added SDK test coverage for identity generation, install ID overrides, and Maker attribution headers.

### Changed

- Hardened Python install ID file creation to use atomic `0600` creation.
- Removed TypeScript's silent `Math.random()` fallback for install/session IDs; secure `crypto.getRandomValues` is now required.
- Aligned route request and response names with the OpenAPI spec: pair routes use `PairRoutesRequest` / `PairRoutesResponse`, and market route discovery uses `RoutesRequest` / `RoutesResponse`.
- Normalized TypeScript `SwapCompletionOptions` and `WSClientConfig` time configs to seconds to match Python. Deprecated TypeScript `...Ms` aliases keep an explicit millisecond migration path for one transition window.
- Aligned RLN unspent filters by allowing TypeScript `listUnspents()` callers to pass the generated request body.
- Added public TypeScript `sessionId` config support, `bigint` display amounts for TypeScript precision parsing, and explicit Python deprecation warnings for pair-route compatibility shims.
- Defaulted Python SDK logging to effectively silent to match TypeScript's opt-in logging behavior.
- Updated Python and TypeScript examples and README snippets to use async client creation.

### Breaking Changes

- Changed `KaleidoClient.create()` from synchronous to asynchronous in both SDKs.
  - Python: use `client = await KaleidoClient.create(...)`.
  - TypeScript: use `const client = await KaleidoClient.create(...)`.
- Changed TypeScript `SwapCompletionOptions.timeout` / `pollInterval` and `WSClientConfig.reconnectDelay` / `pingInterval` from milliseconds to seconds. Use the deprecated `timeoutMs`, `pollIntervalMs`, `reconnectDelayMs`, and `pingIntervalMs` aliases during the transition if a TypeScript caller still provides milliseconds.
- Changed Python `MakerClient.get_pair_routes()` to accept the spec-aligned `PairRoutesRequest` body and return `PairRoutesResponse`. Pair ticker strings remain accepted as a temporary shorthand, and `get_pair_routes_by_ticker()` preserves the old list-returning convenience shape.
- Changed TypeScript `RoutesRequest` / `RoutesResponse` to represent market route discovery per the OpenAPI spec. Use `PairRoutesRequest` / `PairRoutesResponse` with `getPairRoutes()`; deprecated `DiscoverRoutesRequest` / `DiscoverRoutesResponse` aliases remain for market route discovery.
- Removed Python's unused `cache_ttl` config field and `KaleidoClient.create(cache_ttl=...)` argument.

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
