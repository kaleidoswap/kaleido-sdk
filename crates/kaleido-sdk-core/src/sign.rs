//! MuSig2 cooperative claim/refund — the taker's half of the two-party
//! key-path spend (the fast, cheap, private settlement path).
//!
//! **Bitcoin L1 only.** The maker's cooperative endpoints
//! (`maker-api/src/coop.rs`) do a MuSig2 BIP-341 *key-path* spend over the
//! 2-of-2 of (claim key, refund key), tweaked by the swap tree's merkle
//! root. Liquid and Arkade settle differently (Liquid script-path,
//! Arkade VHTLC) — those live in [`crate::spend`].
//!
//! Protocol (one round-trip, see `coop.rs`):
//! 1. taker samples a fresh nonce, builds the unsigned spend tx, computes
//!    the key-path sighash, and POSTs `{ pubNonce, transaction|signatureHash }`
//!    (reverse claim also sends the `preimage` so the maker settles its
//!    hold invoice);
//! 2. maker replies `{ pubNonce, partialSignature }`;
//! 3. taker computes its own partial over the same sighash and aggregates
//!    both into the final 64-byte Schnorr signature for the key-path
//!    witness.
//!
//! All crypto is `maker-musig`'s ([`MakerSession`] is a generic MuSig2
//! party — the taker uses it identically to the maker). Nonces are sampled
//! fresh from the OS RNG per session and the session is consumed on
//! [`TakerCoopSession::finish`], so a nonce can never be reused (the
//! catastrophic MuSig2 failure mode).

use maker_musig::session::{aggregate_from_bytes, sk_from_bytes};
use maker_musig::{
    key_path_sighash, reverse_swap_tree, submarine_swap_tree, AggregatedKey, CooperativeKey,
    LeafVersion, MakerSession, PUB_NONCE_SIZE,
};
use rand::rngs::OsRng;

use crate::error::{Error, Result};
use crate::types::BitcoinNetwork;

/// Which leg the cooperative key-path spend is over. Selects the tree
/// shape and which swap role the taker plays.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CoopKind {
    /// Reverse claim — **taker = claim, maker = refund**. The taker sweeps
    /// the maker's on-chain lockup; `taker_secret_key` is the claim key.
    ReverseClaim,
    /// Submarine refund — **maker = claim, taker = refund**. The taker
    /// reclaims its own lockup after the timeout if the maker never
    /// claimed; `taker_secret_key` is the refund key.
    SubmarineRefund,
}

/// The taker's in-flight MuSig2 session for one cooperative spend.
///
/// Built before the request, consumed by [`Self::finish`] once the maker
/// replies — the single-use lifetime that keeps the nonce from being
/// reused.
pub struct TakerCoopSession {
    // `AggregatedKey` isn't `Clone` and `MakerSession::new` consumes it, so
    // the inputs are kept and the tweaked key is rebuilt in `finish`. Both
    // are `Copy` and deterministic, so the rebuild yields the identical key.
    coop: CooperativeKey,
    merkle_root: [u8; 32],
    inner: MakerSession,
    our_pub_nonce: [u8; PUB_NONCE_SIZE],
}

impl TakerCoopSession {
    /// Build the taker's session for a Bitcoin cooperative key-path spend.
    ///
    /// `preimage_hash` / `claim_pubkey` / `refund_pubkey` / `timeout` are
    /// the same public inputs [`crate::verify`] already checked, so the
    /// taker's aggregated key matches the lockup it funded.
    /// `taker_secret_key` is the 32-byte secret for the taker's half (the
    /// claim key for [`CoopKind::ReverseClaim`], the refund key for
    /// [`CoopKind::SubmarineRefund`]). Mirrors `build_maker_session`.
    pub fn new(
        kind: CoopKind,
        preimage_hash: &[u8; 32],
        claim_pubkey: &[u8; 33],
        refund_pubkey: &[u8; 33],
        timeout_block_height: u32,
        taker_secret_key: &[u8; 32],
    ) -> Result<Self> {
        // (claim, refund) ordering matches `maker-swap` / `coop.rs`.
        let tree = match kind {
            CoopKind::ReverseClaim => reverse_swap_tree(
                LeafVersion::Bitcoin,
                preimage_hash,
                claim_pubkey,
                refund_pubkey,
                timeout_block_height,
            ),
            CoopKind::SubmarineRefund => submarine_swap_tree(
                LeafVersion::Bitcoin,
                preimage_hash,
                claim_pubkey,
                refund_pubkey,
                timeout_block_height,
            ),
        }
        .map_err(crypto)?;

        let coop = CooperativeKey::from_bytes(claim_pubkey, refund_pubkey).map_err(crypto)?;
        let merkle_root = tree.merkle_root().map_err(crypto)?;
        let agg = tweaked_key(&coop, &merkle_root)?;
        let sk = sk_from_bytes(taker_secret_key).map_err(crypto)?;
        let inner = MakerSession::new(agg, sk, &mut OsRng).map_err(crypto)?;
        let our_pub_nonce = inner.pubnonce_bytes();

        Ok(Self {
            coop,
            merkle_root,
            inner,
            our_pub_nonce,
        })
    }

    /// The taker's 66-byte public nonce to send to the maker.
    pub fn our_pub_nonce(&self) -> [u8; PUB_NONCE_SIZE] {
        self.our_pub_nonce
    }

    /// The 32-byte x-only taproot output key the lockup pays to. The
    /// aggregated key-path signature verifies under this.
    pub fn aggregated_xonly(&self) -> [u8; 32] {
        self.inner.aggregated_xonly()
    }

    /// Combine the maker's reply with the taker's own partial signature into
    /// the final 64-byte BIP-340 Schnorr signature for the key-path witness.
    ///
    /// `sighash` is the BIP-341 key-path sighash of the spend tx — both
    /// parties sign the *same* one (build it with [`bitcoin_key_path_sighash`]
    /// from the very tx whose hex was sent to the maker). Consumes the
    /// session: the nonce is now spent. Errors if the maker's partial
    /// doesn't aggregate (a misbehaving maker, or a sighash mismatch
    /// between the two sides).
    pub fn finish(
        self,
        maker_pub_nonce: &[u8; PUB_NONCE_SIZE],
        maker_partial: &[u8; 32],
        sighash: [u8; 32],
    ) -> Result<[u8; 64]> {
        let Self {
            coop,
            merkle_root,
            inner,
            our_pub_nonce,
        } = self;
        let our_partial = inner
            .partial_sign_bytes(maker_pub_nonce, sighash)
            .map_err(crypto)?;
        let agg = tweaked_key(&coop, &merkle_root)?;
        aggregate_from_bytes(
            &agg,
            [&our_pub_nonce, maker_pub_nonce],
            [&our_partial, maker_partial],
            sighash,
        )
        .map_err(crypto)
    }
}

/// Compute the BIP-341 key-path sighash for a Bitcoin cooperative spend.
///
/// Thin wrapper over `maker-musig` so the taker computes the *identical*
/// sighash the maker will (the maker recomputes it from the same tx hex).
/// `locked_amount_sat` is the value of the lockup output being spent;
/// `lockup_address` is that output's address.
pub fn bitcoin_key_path_sighash(
    tx_hex: &str,
    input_index: usize,
    locked_amount_sat: u64,
    lockup_address: &str,
    network: BitcoinNetwork,
) -> Result<[u8; 32]> {
    key_path_sighash(
        tx_hex,
        input_index,
        locked_amount_sat,
        lockup_address,
        network,
    )
    .map_err(crypto)
}

/// Build the merkle-root-tweaked aggregated key for the cooperative pair.
fn tweaked_key(coop: &CooperativeKey, merkle_root: &[u8; 32]) -> Result<AggregatedKey> {
    AggregatedKey::from_keys(coop)
        .map_err(crypto)?
        .with_taproot_tweak(merkle_root)
        .map_err(crypto)
}

fn crypto(e: maker_musig::Error) -> Error {
    Error::Crypto(e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;
    use bitcoin::secp256k1::{schnorr, Message, Secp256k1, XOnlyPublicKey};
    use maker_musig::MakerKeyring;

    fn keypair(seed: u8) -> ([u8; 33], [u8; 32]) {
        let d = MakerKeyring::from_seed(&[seed; 32])
            .unwrap()
            .derive(0)
            .unwrap();
        (d.public_key(), d.secret_bytes())
    }

    /// Simulate the maker side with `maker-musig` directly and return its
    /// `(pub_nonce, partial)` over `sighash`, given the swap inputs.
    #[allow(clippy::too_many_arguments)]
    fn maker_reply(
        kind: CoopKind,
        preimage_hash: &[u8; 32],
        claim_pk: &[u8; 33],
        refund_pk: &[u8; 33],
        timeout: u32,
        maker_sk: &[u8; 32],
        taker_pub_nonce: &[u8; PUB_NONCE_SIZE],
        sighash: [u8; 32],
    ) -> ([u8; PUB_NONCE_SIZE], [u8; 32]) {
        let tree = match kind {
            CoopKind::ReverseClaim => reverse_swap_tree(
                LeafVersion::Bitcoin,
                preimage_hash,
                claim_pk,
                refund_pk,
                timeout,
            ),
            CoopKind::SubmarineRefund => submarine_swap_tree(
                LeafVersion::Bitcoin,
                preimage_hash,
                claim_pk,
                refund_pk,
                timeout,
            ),
        }
        .unwrap();
        let coop = CooperativeKey::from_bytes(claim_pk, refund_pk).unwrap();
        let agg = tweaked_key(&coop, &tree.merkle_root().unwrap()).unwrap();
        let session = MakerSession::new(agg, sk_from_bytes(maker_sk).unwrap(), &mut OsRng).unwrap();
        let nonce = session.pubnonce_bytes();
        let partial = session
            .partial_sign_bytes(taker_pub_nonce, sighash)
            .unwrap();
        (nonce, partial)
    }

    fn verifies(xonly: &[u8; 32], sig: &[u8; 64], sighash: &[u8; 32]) -> bool {
        let secp = Secp256k1::verification_only();
        let pk = XOnlyPublicKey::from_slice(xonly).unwrap();
        let msg = Message::from_digest(*sighash);
        let sig = schnorr::Signature::from_slice(sig).unwrap();
        secp.verify_schnorr(&sig, &msg, &pk).is_ok()
    }

    #[test]
    fn reverse_claim_roundtrip_yields_valid_keypath_sig() {
        let preimage_hash = [0x5c; 32];
        let timeout = 880_100u32;
        let sighash = [0x33; 32];
        // Reverse: taker = claim, maker = refund.
        let (claim_pk, taker_sk) = keypair(0x11);
        let (refund_pk, maker_sk) = keypair(0x22);

        let taker = TakerCoopSession::new(
            CoopKind::ReverseClaim,
            &preimage_hash,
            &claim_pk,
            &refund_pk,
            timeout,
            &taker_sk,
        )
        .unwrap();
        let xonly = taker.aggregated_xonly();
        let (maker_nonce, maker_partial) = maker_reply(
            CoopKind::ReverseClaim,
            &preimage_hash,
            &claim_pk,
            &refund_pk,
            timeout,
            &maker_sk,
            &taker.our_pub_nonce(),
            sighash,
        );

        let sig = taker.finish(&maker_nonce, &maker_partial, sighash).unwrap();
        assert!(
            verifies(&xonly, &sig, &sighash),
            "aggregated MuSig2 sig must verify under the tweaked output key"
        );
    }

    #[test]
    fn submarine_refund_roundtrip_yields_valid_keypath_sig() {
        let preimage_hash = [0xA1; 32];
        let timeout = 901_234u32;
        let sighash = [0x44; 32];
        // Submarine: maker = claim, taker = refund.
        let (claim_pk, maker_sk) = keypair(0x33);
        let (refund_pk, taker_sk) = keypair(0x44);

        let taker = TakerCoopSession::new(
            CoopKind::SubmarineRefund,
            &preimage_hash,
            &claim_pk,
            &refund_pk,
            timeout,
            &taker_sk,
        )
        .unwrap();
        let xonly = taker.aggregated_xonly();
        let (maker_nonce, maker_partial) = maker_reply(
            CoopKind::SubmarineRefund,
            &preimage_hash,
            &claim_pk,
            &refund_pk,
            timeout,
            &maker_sk,
            &taker.our_pub_nonce(),
            sighash,
        );

        let sig = taker.finish(&maker_nonce, &maker_partial, sighash).unwrap();
        assert!(verifies(&xonly, &sig, &sighash));
    }

    #[test]
    fn rejects_partial_over_a_different_sighash() {
        let preimage_hash = [0x5c; 32];
        let timeout = 880_100u32;
        let (claim_pk, taker_sk) = keypair(0x11);
        let (refund_pk, maker_sk) = keypair(0x22);

        let taker = TakerCoopSession::new(
            CoopKind::ReverseClaim,
            &preimage_hash,
            &claim_pk,
            &refund_pk,
            timeout,
            &taker_sk,
        )
        .unwrap();
        // Maker signs sighash A; the taker tries to finish over sighash B.
        let (maker_nonce, maker_partial) = maker_reply(
            CoopKind::ReverseClaim,
            &preimage_hash,
            &claim_pk,
            &refund_pk,
            timeout,
            &maker_sk,
            &taker.our_pub_nonce(),
            [0xAA; 32],
        );
        let err = taker
            .finish(&maker_nonce, &maker_partial, [0xBB; 32])
            .unwrap_err();
        assert!(matches!(err, Error::Crypto(_)), "got {err:?}");
    }
}
