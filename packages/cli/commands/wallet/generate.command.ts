import chalk from "chalk"
import { generate } from "./generate"

export const generateCommand = async (argv: any) => {

  console.warn(chalk.yellow("Warning: The private key is the most important part of your wallet. If you lose it, you will lose all your assets. Please keep it safe."))
  const input = prompt("I understand the risks and want to proceed (yes/NO):")

  if (input !== 'yes') {
    console.log("Aborted")
    return
  }

  const wallet = await generate()
  console.log(chalk.red(`Private Key(WIF): ${wallet.keyPair.toWIF()}`))
  console.log(chalk.red(`Private Key(Hex): ${Buffer.from(wallet.keyPair.privateKey!).toString('hex')}`))
  console.log(chalk.green(`Address: ${wallet.address}`))
}