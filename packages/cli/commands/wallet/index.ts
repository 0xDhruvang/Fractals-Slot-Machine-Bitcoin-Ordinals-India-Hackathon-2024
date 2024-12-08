import { type Argv } from 'yargs'
import { generateCommand } from './generate.command'
import { currentCommand } from './current.command'

export const walletCommands = (yargs: Argv) => {
  return yargs
    .command('generate', 'generate a new wallet', () => { }, generateCommand)
    .command('current', 'show current wallet', () => { }, currentCommand)
    .demandCommand(1)
}
