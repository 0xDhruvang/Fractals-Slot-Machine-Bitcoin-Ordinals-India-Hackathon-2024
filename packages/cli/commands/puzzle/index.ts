import { type Argv } from 'yargs'
import { deployCommand } from './deploy.command'
import { solveCommand } from './solve.command'

export const puzzleCommands = (yargs: Argv) => {
  return yargs
    .command('deploy', 'deploy a contract', () => { }, deployCommand)
    .command('solve', 'solve the puzzle and get the reward', () => { }, solveCommand)
    .demandCommand(1)
}