import type { UTXO } from "../types";

export function pickUtxos(utxos: UTXO[], minSatoshi: number) {
  const sortedUtxos = utxos.sort((a, b) => a.satoshi - b.satoshi);
  const selectedUtxos = sortedUtxos
    .filter((utxo) => utxo.satoshi >= minSatoshi)
    .filter((utxo) => utxo.inscriptions.length === 0)

  if (selectedUtxos.length === 0) {
    throw new Error(`Cannot find a utxo with enough balance (>= ${minSatoshi} satoshis)`)
  }

  return selectedUtxos[0];
}
