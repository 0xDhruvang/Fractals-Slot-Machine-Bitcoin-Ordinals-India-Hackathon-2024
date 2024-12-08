import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { ECPairFactory, type ECPairInterface } from 'ecpair';
import { toXOnly } from "bitcoinjs-lib/src/psbt/bip371";
import * as bip39 from 'bip39';
import BIP32Factory from 'bip32';

bitcoin.initEccLib(ecc);
const ecpair = ECPairFactory(ecc);
const bip32 = BIP32Factory(ecc);

export type Wallet = ReturnType<typeof createWallet>;

function createWallet(keyPair: ECPairInterface, network: bitcoin.Network) {
  if (!keyPair.privateKey) {
    throw new Error('Private key is not valid');
  }

  const xOnlyPubKey = toXOnly(keyPair.publicKey);

  const tweaked = keyPair.tweak(bitcoin.crypto.taggedHash('TapTweak', xOnlyPubKey));

  const { address, output } = bitcoin.payments.p2tr({
    internalPubkey: xOnlyPubKey,
    network,
  });

  if (!address) {
    throw new Error('Address is not valid');
  }

  return {
    keyPair,
    xOnlyPubKey,
    address,
    tweaked,
    output,
  }
}

export function loadWalletFromPrivateKey(privateKey: string, network: bitcoin.Network) {
  const keyPair = ecpair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
  return createWallet(keyPair, network);
}

export function loadWalletFromWIF(wif: string, network: bitcoin.Network) {
  const keyPair = ecpair.fromWIF(wif);
  return createWallet(keyPair, network);
}

export function loadWalletFromMnemonic(mnemonic: string, path: string, network: bitcoin.Network) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const root = bip32.fromSeed(seed, network);
  const child = root.derivePath(path);
  return loadWalletFromWIF(child.toWIF(), network);
}
