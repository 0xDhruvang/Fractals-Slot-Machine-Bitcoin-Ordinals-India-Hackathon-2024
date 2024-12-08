import { Puzzle } from './contracts/smartcontracts'
import smartcontractsArtifact from '../artifacts/smartcontracts.json'

(() => {
  Puzzle.loadArtifact(smartcontractsArtifact)
})()

export * from './contracts/smartcontracts'
