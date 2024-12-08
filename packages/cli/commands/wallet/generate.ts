import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import BIP32Factory from 'bip32';
import { randomBytes } from 'crypto';
import { loadWalletFromWIF } from '../../libs/wallet';

const bip32 = BIP32Factory(ecc);
const rng = (size: number) => randomBytes(size);

export const generate = async () => { // generate a new wallet private key
  const keyPair = bip32.fromSeed(rng(64), bitcoin.networks.bitcoin);
  const privateKey = keyPair.toWIF();
  const wallet = loadWalletFromWIF(privateKey, bitcoin.networks.bitcoin);
  return wallet
}
