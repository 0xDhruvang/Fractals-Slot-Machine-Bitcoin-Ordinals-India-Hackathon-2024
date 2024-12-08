import { z } from 'zod'
import { DUST_LIMIT, FEE } from '../../libs/constants'
import chalk from 'chalk'
import { broadcastTx } from '../../libs/unisat'
import { deploy } from './deploy'


export const deployCommand = async (argv: any) => {
  // const secretSchema = z.string().min(4)
  // const secretInput = prompt("Enter your secret(4 characters minimum):")
  // const { success: secretSuccess, data: secret } = secretSchema.safeParse(secretInput)
  // if (!secretSuccess) {
  //   console.error("Secret is invalid")
  //   return
  // }
  // const minAmount = DUST_LIMIT + FEE
  // const amountSchema = z.coerce.number().min(minAmount)
  // const amountInput = prompt(`Enter amount(> ${minAmount} satoshis):`)
  // const { success: amountSuccess, data: amount, error: amountError } = amountSchema.safeParse(amountInput)
  // if (!amountSuccess) {
  //   console.error(amountError)
  //   return
  // }
  const ownerPublicKey = "KzLsJ12JxMsZNfUfy5yLydzpQQRgYCFyWZsGvd4iNWoPMB2SFVHU"
    const minLiquidity = 10000n // 10,000 satoshis minimum liquidity
    const maxRewardPercentage = 50n // 50% of pool can be rewarded
  try {
    const { txid, txHex } = await deploy({ ownerPublicKey,minLiquidity,maxRewardPercentage })
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
      console.log(chalk.yellow('Bye!'))
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(chalk.red(message))
    return
  }
}