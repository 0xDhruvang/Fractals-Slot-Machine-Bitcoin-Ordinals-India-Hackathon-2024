import * as bitcoin from "bitcoinjs-lib"
import { loadWalletFromWIF } from "../../libs/wallet"

export const current = async () => {
  const wallet = loadWalletFromWIF(process.env.PRIVATE_KEY!, bitcoin.networks.bitcoin)
  return wallet
}
