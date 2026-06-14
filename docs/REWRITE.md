# kaleido-sdk rewrite (maker /v2 + swap protocol)

Branch: `feat/sdk-rewrite`. Status: scaffolding.

## Why

The current SDK (`python-sdk/`, `typescript-sdk/`, `rust-poc/`, the
`crates/kaleidoswap-core` stub) targets the **old** system: RLN-node
operations (RGB, channels, payments, invoices) plus the old maker's
`initMakerSwap`/`executeMakerSwap` atomic-swap API — see
`SDK_UNIFICATION_PROPOSAL.md`.

The **new** maker (`kaleidoswap-maker-rs`) exposes a different,
Boltz-shaped `/v2` surface — submarine / reverse / chain swaps across
BTC(LN/L1), Liquid, and Arkade, with client-side MuSig2 cooperative
claim/refund. This rewrite is the **taker SDK for that maker**.

## Decisions (locked)

| | Choice |
|---|---|
| Crypto | **Reuse `maker-musig`** (from kaleidoswap-maker-rs) — never reimplement consensus-critical tree/MuSig2/taproot code. Path dep for local dev; git dep for CI; extract a shared crate later. |
| First binding | **Python via UniFFI** (drive end-to-end test swaps from a script; Swift/Kotlin fall out of the same defs). |
| Second binding | TypeScript via wasm-bindgen. |
| v1 scope | **All venues** — BTC/LN submarine+reverse, BTC↔L-USDT chain (Liquid), Arkade. Full parity with the maker's 14 e2e flows. |
| Package names | Keep `kaleido-sdk` (pip + npm). Rust core: **`kaleido-sdk-core`**. |

## Architecture (one Rust core, thin language bindings)

```
crates/
  kaleido-sdk-core/      pure-Rust taker SDK
    client/   typed /v2 REST + WS (reqwest / tungstenite)
    verify/   independently recompute the maker's lockup tree/address;
              refuse the swap if it doesn't match  ← the trust anchor
    sign/     MuSig2 cooperative claim/refund (two-party, taker side)
    spend/    unilateral script-path claim/refund txs (BTC + Liquid + Arkade)
    swap/     taker state machines (submarine / reverse / chain)
  kaleido-sdk-ffi/       UniFFI  → Python (+ Swift/Kotlin)
  kaleido-sdk-wasm/      wasm-bindgen → TypeScript / browser
```

Two non-negotiables:
1. **The crypto lives once.** A reimplemented refund builder with a
   sighash bug loses user funds. The core depends on `maker-musig`.
2. **`verify/` is the trust anchor.** A taker that trusts the maker's
   returned lockup address isn't doing an atomic swap — it recomputes
   the swap tree + lockup script itself and rejects a mismatch.

The maker-rs `e2e/driver` is already a working taker (depends on
`maker-musig`); it is the reference to generalize, and the end goal is
to have it *consume* this SDK so the maker's 14 e2e flows exercise the
SDK on every nightly run.

## Build order

1. **Core foundation** — crate + typed `/v2` client + error/config/types. ✅ done
2. **verify/** — recompute lockup tree/address per venue (reuse `maker-musig`).
   ✅ done for **Bitcoin L1 + Liquid** (submarine/reverse/chain); mirrors
   `maker-swap/src/create.rs`, 6 unit tests incl. tampered-address /
   wrong-preimage rejection. **Arkade VHTLC verify deferred to #3** (needs
   live Ark server params via ark-client). ← here
3. **sign/ + spend/** — MuSig2 coop + unilateral script-path, per venue
   (incl. wiring ark-client for the Arkade VHTLC + completing Arkade verify).
   - **sign/** ✅ done — Bitcoin cooperative MuSig2 key-path claim/refund
     (`TakerCoopSession`), mirrors `maker-api/src/coop.rs`; reuses
     `maker-musig` sessions; 3 tests incl. a full two-party roundtrip whose
     aggregated sig verifies under the tweaked taproot key. (The maker's
     coop endpoints are BTC-only by design; Liquid/Arkade settle via
     `spend`.) ← here
   - **spend/** ⏳ next — build + sign the actual claim/refund txs
     (needs an Esplora client to find the lockup UTXO + broadcast), Liquid
     script-path, and the Arkade VHTLC via **ark-client** (+ Arkade verify).
4. **swap/** — submarine → reverse → chain state machines tying it together.
5. **UniFFI → Python**; a `complete_swap()` high-level call; example test script.
6. **wasm → TypeScript.**
7. **Consolidation** — once the new core proves out, retire the old
   `rust/`, `rust-poc/`, and the old-system methods in python-sdk/
   typescript-sdk (or split them into a separate `kaleido-node` SDK).
   **Not done here — needs explicit sign-off (deletes ~444 MB of code).**

## Open questions for the team

- Does the new SDK also need the taker's **wallet/node ops** (the old
  SDK's RGB/channel/payment methods), or does the host app bring its own
  wallet and the SDK stays swap-only? (Current assumption: swap-only;
  the host supplies keys + broadcasts.)
- Keep the old RLN-node SDK methods under `kaleido-sdk`, or split them
  into a separate package so `kaleido-sdk` means "the swap SDK"?
