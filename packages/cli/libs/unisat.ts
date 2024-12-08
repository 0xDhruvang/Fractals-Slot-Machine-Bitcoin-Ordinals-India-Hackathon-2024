import axios from "axios";
import type { UTXO } from "../types";

const api = axios.create({
  baseURL: process.env.UNISAT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.UNISAT_API_KEY}`,
  },
});

export async function getUtxos(address: string) {
  try {
    const response = await api.get(`/v1/indexer/address/${address}/utxo-data`, { params: { cursor: 0, size: 100 } });
    return response.data.data.utxo as UTXO[];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) {
        throw new Error('Invalid API key, please check your .env file');
      }
    }
    console.error(`Failed to get UTXOs for address ${address}:`, error);
    throw error;
  }
}

export async function broadcastTx(txHex: string) {
  const response = await api.post<{ code: number, msg: string, data: string }>('/v1/indexer/local_pushtx', { txHex });
  return response.data;
}
