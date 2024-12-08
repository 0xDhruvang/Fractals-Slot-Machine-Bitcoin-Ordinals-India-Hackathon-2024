import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';
import { type ECPairInterface } from 'ecpair';
import type { UTXO } from "../types";

bitcoin.initEccLib(ecc);
const network = bitcoin.networks.bitcoin;

function createTimeLockScript(pubkey: Buffer, locktime: number) {
  return bitcoin.script.compile([
    bitcoin.script.number.encode(locktime),
    bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
    bitcoin.opcodes.OP_DROP,
    pubkey,
    bitcoin.opcodes.OP_CHECKSIG,
  ]);
}

export async function createSpend(
  keyData: { keyPair: ECPairInterface, xOnlyPubKey: Uint8Array, address: string, output: Uint8Array },
  utxoData: UTXO,
  destinationAddress: string,
  value: number,
  fee: number,
  locktime?: number, // CLTV
) {
  try {
    const psbt = new bitcoin.Psbt({ network });

    psbt.addInput({
      hash: utxoData.txid,
      index: utxoData.vout,
      witnessUtxo: {
        script: keyData.output,
        value: BigInt(utxoData.satoshi),
      },
      tapInternalKey: keyData.xOnlyPubKey,
    });

    const changeAmount = utxoData.satoshi - value - fee;

    if (changeAmount < 0) {
      throw new Error('Insufficient funds for transaction');
    }

    if (locktime) {
      // If locktime is specified, create a P2TR output with CLTV
      const pubkey = Buffer.from(keyData.xOnlyPubKey);
      const redeemScript = createTimeLockScript(pubkey, locktime);
      const scriptPubKey = bitcoin.payments.p2tr({
        internalPubkey: keyData.xOnlyPubKey,
        scriptTree: {
          output: redeemScript,
        },
        network,
      });

      psbt.addOutput({
        script: scriptPubKey.output!,
        value: BigInt(value),
      });
    } else {
      // If locktime is not specified, use a normal address output
      psbt.addOutput({
        address: destinationAddress,
        value: BigInt(value),
      });
    }

    // Add change output if there's remaining amount
    if (changeAmount > 0) {
      psbt.addOutput({
        address: keyData.address, // Send change back to the sender's address
        value: BigInt(changeAmount),
      });
    }

    // Need to sign the input with the tweaked key
    const tweaked = keyData.keyPair.tweak(bitcoin.crypto.taggedHash('TapTweak', keyData.xOnlyPubKey));
    psbt.signInput(0, tweaked);
    psbt.finalizeAllInputs();

    const tx = psbt.extractTransaction();
    return {
      txHex: tx.toHex(),
      txId: tx.getId(),
      fee: fee,
      outputAmount: value,
      changeAmount: changeAmount,
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
