import * as bitcoin from "bitcoinjs-lib"
import { loadWalletFromWIF } from "../../libs/wallet"
import { getUtxos } from "../../libs/unisat"
import { Puzzle } from "../../../smartcontracts/src"
import { toByteString, sha256, type MethodCallOptions } from 'scrypt-ts'
import { LEAF_VERSION_TAPSCRIPT } from "bitcoinjs-lib/src/payments/bip341"
import { getDummySigner, getDummyUTXO } from "../../libs/dummy"
import { callToBufferList, issue_xonly_pubkey } from "../../libs/tx"
import type { TapLeafScript } from "bip174"
import { pickUtxos } from "../../libs/utxo"
import { buildPuzzleFinalizer } from "../../libs/finalizer"

async function getPuzzleContract(secret: string) {
  const contract = new Puzzle(sha256(toByteString(secret, true)))
  await contract.connect(getDummySigner())
  return contract
}

export async function solve(props: { utxoAddress: string, secret: string }) {

  const fee = 200

  const { utxoAddress, secret } = props
  const utxos = await getUtxos(utxoAddress)
  const utxo = pickUtxos(utxos, fee)

  const wallet = loadWalletFromWIF(process.env.PRIVATE_KEY!, bitcoin.networks.bitcoin)

  const puzzleContract = await getPuzzleContract(secret)
  const leafScript = puzzleContract.lockingScript.toBuffer()

  // get unlocking script
  const message = toByteString(secret, true)
  const unlockingCall = await puzzleContract.methods.unlock(message, {
    fromUTXO: getDummyUTXO(),
    verify: false,
    exec: false,
  } as MethodCallOptions<Puzzle>,
  )

  const redeem = {
    redeemVersion: LEAF_VERSION_TAPSCRIPT,
    output: leafScript,
  }

  const { output, witness, address, hash } = bitcoin.payments.p2tr({
    internalPubkey: issue_xonly_pubkey,
    scriptTree: {
      output: leafScript,
    },
    redeem,
    network: bitcoin.networks.bitcoin,
  })

  if (address !== utxoAddress) {
    throw new Error('Address mismatch')
  }

  const psbt = new bitcoin.Psbt()
  psbt.addInput({
    hash: utxo.txid,
    index: utxo.vout,
    witnessUtxo: {
      script: output!,
      value: BigInt(utxo.satoshi),
    },
    tapInternalKey: wallet.xOnlyPubKey,
    tapMerkleRoot: hash!,
  })

  const tapLeafScript: TapLeafScript = {
    leafVersion: redeem.redeemVersion,
    script: redeem.output,
    controlBlock: witness![witness!.length - 1],
  }

  psbt.updateInput(0, {
    tapLeafScript: [tapLeafScript],
  })

  const change = utxo.satoshi - fee
  psbt.addOutput({
    value: BigInt(change),
    script: wallet.output!,
  })

  const finalizer = buildPuzzleFinalizer(tapLeafScript, callToBufferList(unlockingCall))
  psbt.finalizeInput(0, finalizer)

  const tx = psbt.extractTransaction()
  return {
    txid: tx.getId(),
    txHex: tx.toHex(),
  }
}
