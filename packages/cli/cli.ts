import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { walletCommands } from './commands/wallet'
import { puzzleCommands } from './commands/puzzle'

yargs(hideBin(process.argv))
  .command('puzzle', 'puzzle related commands', puzzleCommands)
  .command('wallet', 'wallet related commands', walletCommands)
  .demandCommand(1)
  .help()
  .parse()
