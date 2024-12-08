import { z } from 'zod'
import chalk from 'chalk'
import { broadcastTx } from '../../libs/unisat'
import { solve } from './solve'

export const solveCommand = async (argv: any) => {
  const secretSchema = z.string().min(4)
  const secretInput = prompt("Enter your secret(4 characters minimum):")
  const { success: secretSuccess, data: secret } = secretSchema.safeParse(secretInput)
  if (!secretSuccess) {
    console.error("Secret is invalid")
    return
  }

  const utxoAddressSchema = z.string().regex(/^[bB]c1[pPqQ][a-zA-Z0-9]{58}$/, "Invalid address format")
  const utxoAddressInput = prompt("Enter your utxo address(taproot):")
  const { success: utxoAddressSuccess, data: utxoAddress } = utxoAddressSchema.safeParse(utxoAddressInput)
  if (!utxoAddressSuccess) {
    console.error("Utxo address is invalid")
    return
  }

  try {
    const { txid, txHex } = await solve({ utxoAddress, secret })
    console.log(chalk.green(`Transaction ID: ${txid}`))
    console.log(chalk.blue(`Transaction Hex: ${txHex}`))

    const broadcastNow = prompt("Broadcast now? (y/N):")
    if (broadcastNow === 'y') {
      const result = await broadcastTx(txHex)
      if (result.code === 0) {
        console.log(chalk.green(`Broadcasted: ${result.data}`))
      } else {
        console.error(chalk.red(`Broadcast failed, message: ${result.msg}`))
      }
    } else {
      console.log('Bye!')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(message)
  }
}
