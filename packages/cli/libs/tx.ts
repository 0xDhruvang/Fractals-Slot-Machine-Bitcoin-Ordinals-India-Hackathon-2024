import { type ContractTransaction, int2ByteString } from 'scrypt-ts'
import { toXOnly } from 'bitcoinjs-lib/src/psbt/bip371';

const ISSUE_PUBKEY =
  '0250929b74c1a04954b78b4b6035e97a5e078a5a0f28ec96d547bfee9ace803ac0';

export const issue_xonly_pubkey = toXOnly(Uint8Array.from(Buffer.from(ISSUE_PUBKEY, 'hex')))

export function callToBufferList(ct: ContractTransaction) {
  const callArgs = ct.tx.inputs[ct.atInputIndex].script.chunks.map((value) => {
    if (!value.buf) {
      if (value.opcodenum >= 81 && value.opcodenum <= 96) {
        const hex = int2ByteString(BigInt(value.opcodenum - 80))
        return Uint8Array.from(Buffer.from(hex, 'hex'))
      } else {
        return new Uint8Array(0)
      }
    }
    return Uint8Array.from(value.buf)
  })
  return callArgs
}
