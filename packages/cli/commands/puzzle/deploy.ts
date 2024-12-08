import * as bitcoin from 'bitcoinjs-lib';
import { loadWalletFromWIF } from '../../libs/wallet';
import { getUtxos } from '../../libs/unisat';
import { pickUtxos } from '../../libs/utxo';
import { Puzzle } from '../../../smartcontracts/src'; // Ensure correct import path
import { toByteString, sha256, PubKey } from 'scrypt-ts';
import { issue_xonly_pubkey } from '../../libs/tx';
import { DUST_LIMIT, FEE } from '../../libs/constants';

export async function deploy(props: { ownerPublicKey: string, minLiquidity: bigint, maxRewardPercentage: bigint }) {
  const { ownerPublicKey, minLiquidity, maxRewardPercentage } = props;
  const fee = BigInt(FEE); // Convert FEE to bigint for consistency

  // Convert ownerPublicKey (string) to a ByteString and then create a PubKey from it
  const owner = PubKey(toByteString(ownerPublicKey, true)); // Call PubKey function directly

  // Create the Puzzle contract with the correct parameters
  const contract = new Puzzle(owner, minLiquidity, maxRewardPercentage);

  // Load wallet from private key (ensure PRIVATE_KEY is set in environment variables)
  const wallet = loadWalletFromWIF(process.env.PRIVATE_KEY!, bitcoin.networks.bitcoin);

  // Generate scriptPubKey for the contract
  const scriptPubKey = bitcoin.payments.p2tr({
    internalPubkey: issue_xonly_pubkey,
    scriptTree: {
      output: contract.lockingScript.toBuffer(),
    },
    network: bitcoin.networks.bitcoin,
  });

  // Get UTXOs associated with the wallet
  const utxos = await getUtxos(wallet.address);
  const utxo = pickUtxos(utxos, Number(minLiquidity + fee)); // Use minLiquidity + fee as the required amount

  // Create a new PSBT (Partially Signed Bitcoin Transaction)
  const psbt = new bitcoin.Psbt({ network: bitcoin.networks.bitcoin });

  // Add input to the PSBT (the UTXO we selected earlier)
  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    witnessUtxo: {
      script: wallet.output!, 
      value: BigInt(utxo.satoshi), // Convert to number here if required
    },
    tapInternalKey: wallet.xOnlyPubKey,
  });

  // Add output to the PSBT (sending the specified amount to the contract)
  psbt.addOutput({
    value: BigInt(minLiquidity.toString()), // Convert minLiquidity to bigint
    script: scriptPubKey.output!,
  });

  // Add change output if necessary
  const change = BigInt(utxo.satoshi) - BigInt(minLiquidity) - fee; // Calculate change as bigint

  if (change > DUST_LIMIT) {
    psbt.addOutput({
      value: change, // Ensure value is bigint or string
      script: wallet.output!,
    });
  }

  // Sign the input with the wallet's tweaked key
  psbt.signInput(0, wallet.tweaked);
  psbt.finalizeAllInputs();

  // Extract the transaction
  const tx = psbt.extractTransaction();
  return {
    txid: tx.getId(),
    txHex: tx.toHex(),
  };
}
