import chalk from "chalk"
import { current } from "./current"

export const currentCommand = async (argv: any) => {
  const wallet = await current()
  console.log(chalk.green(`Address: ${wallet.address}`))
}
