# Changelog

All notable changes to the Kaleidoswap SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- No unreleased changes.

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
