//! Independently recompute the maker's lockup and **refuse** on mismatch
//! — the trust anchor that makes a swap atomic instead of custodial.
//!
//! When the maker returns a swap (lockup address + swap tree), the taker
//! must NOT trust it: rebuild the two-leaf taproot tree from the public
//! inputs (preimage hash, both pubkeys, timeout) and the cooperative key,
//! derive the lockup address, and compare. A mismatch means the maker
//! tried to lock to an address it alone controls → abort before funding.
//!
//! This mirrors `maker-swap/src/create.rs` exactly, reusing `maker-musig`
//! (`submarine_swap_tree` / `reverse_swap_tree`, `CooperativeKey`,
//! `lockup_address` / `liquid_lockup_address`) so the taker's recompute
//! and the maker's derivation can never diverge. The role splits are:
//!
//! - **submarine** — maker = claim, taker = refund.
//! - **reverse** — taker = claim, maker = refund.
//! - **chain** — from-leg: maker = claim, taker = refund; to-leg (server
//!   lockup): taker = claim, maker = refund. Both legs use the submarine
//!   tree shape.
//!
//! The **address** comparison is the binding security check — funds flow
//! to that address, and `spend`/`sign` rebuild the same tree from the same
//! inputs, so the taker never relies on the maker's published `swapTree`.
//! The published tree is cross-checked too (leaf scripts + versions) to
//! surface a maker whose address and tree disagree.

use maker_musig::{
    liquid_lockup_address, lockup_address, reverse_swap_tree, submarine_swap_tree, CooperativeKey,
    LeafVersion, SwapTree,
};

use crate::error::{Error, Result};
use crate::types::{ChainResponse, ReverseResponse, SubmarineResponse, SwapTreeJson, Venue};

/// Which claim-leaf script shape the tree uses.
#[derive(Clone, Copy)]
enum TreeKind {
    Submarine,
    Reverse,
}

/// Verify a **submarine** lockup (on-chain → LN) before funding it.
///
/// `taker_refund_pubkey` is the taker's own 33-byte compressed key (the
/// refund half it contributed); `preimage_hash` is the taker's BOLT11
/// payment hash. Returns `Ok(())` only if the maker's `address` and
/// `swapTree` match what the taker recomputes.
pub fn verify_submarine_lockup(
    resp: &SubmarineResponse,
    taker_refund_pubkey: &[u8; 33],
    preimage_hash: &[u8; 32],
    venue: Venue,
) -> Result<()> {
    // Submarine: maker = claim, taker = refund.
    let maker_claim = decode_pubkey(&resp.claim_public_key, "claimPublicKey")?;
    check_lockup(
        TreeKind::Submarine,
        venue,
        preimage_hash,
        &maker_claim,
        taker_refund_pubkey,
        resp.timeout_block_height,
        &resp.address,
        &resp.swap_tree,
    )
}

/// Verify a **reverse** lockup (LN → on-chain) before paying the hold
/// invoice.
///
/// `taker_claim_pubkey` is the taker's own 33-byte compressed key (the
/// claim half it contributed); `preimage_hash` is `SHA256(preimage)` for
/// the preimage the taker generated. Returns `Ok(())` only if the maker's
/// `lockupAddress` and `swapTree` match the recompute.
pub fn verify_reverse_lockup(
    resp: &ReverseResponse,
    taker_claim_pubkey: &[u8; 33],
    preimage_hash: &[u8; 32],
    venue: Venue,
) -> Result<()> {
    // Reverse: taker = claim, maker = refund.
    let maker_refund = decode_pubkey(&resp.refund_public_key, "refundPublicKey")?;
    check_lockup(
        TreeKind::Reverse,
        venue,
        preimage_hash,
        taker_claim_pubkey,
        &maker_refund,
        resp.timeout_block_height,
        &resp.lockup_address,
        &resp.swap_tree,
    )
}

/// Verify a **chain** swap's lockups before funding the from-leg.
///
/// Always verifies the taker-funded from-leg (`resp.address`). For an
/// atomic pair, also verifies the maker-funded to-leg (`server_lockup`)
/// when `taker_claim_pubkey` is supplied — pass `None` only for the
/// plain-send pair (no server HTLC to claim). The from-leg check is the
/// critical one: it guards the funds the taker is about to lock.
pub fn verify_chain_lockup(
    resp: &ChainResponse,
    taker_refund_pubkey: &[u8; 33],
    taker_claim_pubkey: Option<&[u8; 33]>,
    preimage_hash: &[u8; 32],
    deposit_venue: Venue,
    server_venue: Venue,
) -> Result<()> {
    // From-leg (taker locks): maker = claim, taker = refund. Submarine
    // tree shape, exactly like a standalone submarine deposit.
    let maker_claim = decode_pubkey(&resp.claim_public_key, "claimPublicKey")?;
    check_lockup(
        TreeKind::Submarine,
        deposit_venue,
        preimage_hash,
        &maker_claim,
        taker_refund_pubkey,
        resp.timeout_block_height,
        &resp.address,
        &resp.swap_tree,
    )?;

    // To-leg (maker locks, taker claims): taker = claim, maker = refund.
    // Present only on atomic pairs; the maker also uses the submarine tree
    // shape for the server lockup.
    if let Some(server) = resp.server_lockup.as_ref() {
        let taker_claim = taker_claim_pubkey.ok_or_else(|| {
            Error::InvalidInput(
                "chain response has a server lockup but no taker claim pubkey was supplied"
                    .to_owned(),
            )
        })?;
        let maker_refund =
            decode_pubkey(&server.refund_public_key, "serverLockup.refundPublicKey")?;
        match server.swap_tree.as_ref() {
            Some(tree) => check_lockup(
                TreeKind::Submarine,
                server_venue,
                preimage_hash,
                taker_claim,
                &maker_refund,
                server.timeout_block_height,
                &server.address,
                tree,
            )?,
            // An Arkade server leg has no published taproot tree; offline
            // recompute of a VHTLC needs the Ark server params, which land
            // with the ark-client wiring (build order #3).
            None => {
                if matches!(server_venue, Venue::Arkade) {
                    return Err(Error::InvalidInput(
                        "arkade server-leg verification is not implemented yet (build order #3)"
                            .to_owned(),
                    ));
                }
                return Err(Error::Verification(
                    "chain server lockup is missing its swapTree".to_owned(),
                ));
            }
        }
    }

    Ok(())
}

/// Recompute the lockup address (and tree) from public inputs and compare
/// to what the maker returned. The address comparison is authoritative;
/// the tree-leaf comparison flags a maker whose address and published tree
/// disagree.
#[allow(clippy::too_many_arguments)]
fn check_lockup(
    kind: TreeKind,
    venue: Venue,
    preimage_hash: &[u8; 32],
    claim_pubkey: &[u8; 33],
    refund_pubkey: &[u8; 33],
    timeout_block_height: u32,
    maker_address: &str,
    maker_tree: &SwapTreeJson,
) -> Result<()> {
    let leaf_version = leaf_version_for(venue)?;

    // (claim, refund) ordering matches `maker-swap/src/create.rs`.
    let tree = match kind {
        TreeKind::Submarine => submarine_swap_tree(
            leaf_version,
            preimage_hash,
            claim_pubkey,
            refund_pubkey,
            timeout_block_height,
        ),
        TreeKind::Reverse => reverse_swap_tree(
            leaf_version,
            preimage_hash,
            claim_pubkey,
            refund_pubkey,
            timeout_block_height,
        ),
    }
    .map_err(|e| Error::Verification(format!("could not rebuild swap tree: {e}")))?;

    let coop = CooperativeKey::from_bytes(claim_pubkey, refund_pubkey)
        .map_err(|e| Error::Verification(format!("could not build cooperative key: {e}")))?;

    // `Venue` carries the `maker-musig` network types directly (they're
    // re-exported), so no mapping is needed.
    let derived = match venue {
        Venue::BitcoinL1(net) => lockup_address(&coop, &tree, net),
        Venue::Liquid(net) => liquid_lockup_address(&coop, &tree, net),
        // Unreachable: `leaf_version_for` already rejected Arkade.
        Venue::Arkade => {
            return Err(Error::InvalidInput(
                "arkade lockup verification is not implemented yet (build order #3)".to_owned(),
            ))
        }
    }
    .map_err(|e| Error::Verification(format!("could not derive lockup address: {e}")))?;

    if derived != maker_address {
        return Err(Error::Verification(format!(
            "lockup address mismatch: maker returned {maker_address}, taker recomputed {derived} — \
             refusing to fund an address the maker may solely control"
        )));
    }

    // Defense in depth: the published tree must match the one the address
    // commits to. (A matching address already implies this, barring a hash
    // collision, but an explicit check gives a precise error if the maker's
    // address and swapTree are internally inconsistent.)
    check_tree_matches(&tree, maker_tree)?;

    Ok(())
}

/// Compare a recomputed tree to the maker's published `swapTree` leaf for
/// leaf (script bytes + version).
fn check_tree_matches(rebuilt: &SwapTree, published: &SwapTreeJson) -> Result<()> {
    let mismatch = |leaf: &str| {
        Error::Verification(format!(
            "{leaf} leaf in the maker's swapTree does not match the recomputed tree"
        ))
    };
    if rebuilt.claim_leaf.output_hex() != published.claim_leaf.output
        || rebuilt.claim_leaf.version != published.claim_leaf.version
    {
        return Err(mismatch("claim"));
    }
    if rebuilt.refund_leaf.output_hex() != published.refund_leaf.output
        || rebuilt.refund_leaf.version != published.refund_leaf.version
    {
        return Err(mismatch("refund"));
    }
    Ok(())
}

/// The tapleaf version the tree is built with for a venue. Arkade has no
/// taproot tree (it's a VHTLC), so it has no leaf version here.
fn leaf_version_for(venue: Venue) -> Result<LeafVersion> {
    match venue {
        Venue::BitcoinL1(_) => Ok(LeafVersion::Bitcoin),
        Venue::Liquid(_) => Ok(LeafVersion::Liquid),
        Venue::Arkade => Err(Error::InvalidInput(
            "arkade lockup verification is not implemented yet (build order #3)".to_owned(),
        )),
    }
}

/// Decode a 33-byte compressed public key from hex.
fn decode_pubkey(s: &str, field: &str) -> Result<[u8; 33]> {
    let bytes = hex::decode(s.trim())
        .map_err(|e| Error::Verification(format!("{field} is not valid hex: {e}")))?;
    bytes
        .try_into()
        .map_err(|_| Error::Verification(format!("{field} must be 33 bytes")))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::types::{BitcoinNetwork, LiquidNetwork, SwapLeafJson};
    use maker_musig::MakerKeyring;

    const PREIMAGE_HASH: [u8; 32] = [0x5c; 32];
    const TIMEOUT: u32 = 880_100;

    fn pubkey(seed: u8) -> [u8; 33] {
        MakerKeyring::from_seed(&[seed; 32])
            .unwrap()
            .derive(0)
            .unwrap()
            .public_key()
    }

    fn tree_json(tree: &SwapTree) -> SwapTreeJson {
        SwapTreeJson {
            claim_leaf: SwapLeafJson {
                version: tree.claim_leaf.version,
                output: tree.claim_leaf.output_hex(),
            },
            refund_leaf: SwapLeafJson {
                version: tree.refund_leaf.version,
                output: tree.refund_leaf.output_hex(),
            },
        }
    }

    /// Build a known-good submarine response the way `maker-swap` would.
    fn good_submarine(venue: Venue) -> (SubmarineResponse, [u8; 33]) {
        let maker_claim = pubkey(0x42);
        let taker_refund = pubkey(0x99);
        let lv = leaf_version_for(venue).unwrap();
        let tree =
            submarine_swap_tree(lv, &PREIMAGE_HASH, &maker_claim, &taker_refund, TIMEOUT).unwrap();
        let coop = CooperativeKey::from_bytes(&maker_claim, &taker_refund).unwrap();
        let address = match venue {
            Venue::BitcoinL1(n) => lockup_address(&coop, &tree, n).unwrap(),
            Venue::Liquid(n) => liquid_lockup_address(&coop, &tree, n).unwrap(),
            Venue::Arkade => unreachable!(),
        };
        let resp = SubmarineResponse {
            id: "swap-test".to_owned(),
            claim_public_key: hex::encode(maker_claim),
            address,
            swap_tree: tree_json(&tree),
            timeout_block_height: TIMEOUT,
            expected_amount: 100_000,
        };
        (resp, taker_refund)
    }

    #[test]
    fn submarine_btc_roundtrips() {
        let venue = Venue::BitcoinL1(BitcoinNetwork::Regtest);
        let (resp, taker_refund) = good_submarine(venue);
        verify_submarine_lockup(&resp, &taker_refund, &PREIMAGE_HASH, venue)
            .expect("a faithfully-built lockup must verify");
    }

    #[test]
    fn submarine_liquid_roundtrips() {
        let venue = Venue::Liquid(LiquidNetwork::LiquidTestnet);
        let (resp, taker_refund) = good_submarine(venue);
        verify_submarine_lockup(&resp, &taker_refund, &PREIMAGE_HASH, venue)
            .expect("a faithfully-built Liquid lockup must verify");
    }

    #[test]
    fn rejects_tampered_address() {
        let venue = Venue::BitcoinL1(BitcoinNetwork::Regtest);
        let (mut resp, taker_refund) = good_submarine(venue);
        // Swap in an address derived from a maker-only key the taker never
        // agreed to — the classic "lock to an address I control" attack.
        let attacker = pubkey(0x07);
        let lv = leaf_version_for(venue).unwrap();
        let tree = submarine_swap_tree(lv, &PREIMAGE_HASH, &attacker, &attacker, TIMEOUT).unwrap();
        let coop = CooperativeKey::from_bytes(&attacker, &attacker).unwrap();
        resp.address = lockup_address(&coop, &tree, BitcoinNetwork::Regtest).unwrap();
        let err = verify_submarine_lockup(&resp, &taker_refund, &PREIMAGE_HASH, venue).unwrap_err();
        assert!(matches!(err, Error::Verification(_)), "got {err:?}");
    }

    #[test]
    fn rejects_wrong_preimage_hash() {
        let venue = Venue::BitcoinL1(BitcoinNetwork::Regtest);
        let (resp, taker_refund) = good_submarine(venue);
        let other_hash = [0xAB; 32];
        let err = verify_submarine_lockup(&resp, &taker_refund, &other_hash, venue).unwrap_err();
        assert!(matches!(err, Error::Verification(_)), "got {err:?}");
    }

    #[test]
    fn rejects_inconsistent_published_tree() {
        let venue = Venue::BitcoinL1(BitcoinNetwork::Regtest);
        let (mut resp, taker_refund) = good_submarine(venue);
        // Address still correct, but the published claim leaf is garbage.
        resp.swap_tree.claim_leaf.output = "deadbeef".to_owned();
        let err = verify_submarine_lockup(&resp, &taker_refund, &PREIMAGE_HASH, venue).unwrap_err();
        assert!(matches!(err, Error::Verification(_)), "got {err:?}");
    }

    #[test]
    fn arkade_is_not_yet_supported() {
        let (resp, taker_refund) = good_submarine(Venue::BitcoinL1(BitcoinNetwork::Regtest));
        let err = verify_submarine_lockup(&resp, &taker_refund, &PREIMAGE_HASH, Venue::Arkade)
            .unwrap_err();
        assert!(matches!(err, Error::InvalidInput(_)), "got {err:?}");
    }
}
