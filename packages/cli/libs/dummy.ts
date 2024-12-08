import {
  bsv,
  DummyProvider,
  TestWallet,
  type UTXO,
} from 'scrypt-ts';
import { randomBytes } from 'crypto';

declare global {
  var dummySigner: TestWallet | undefined
}

export function getDummySigner(
  privateKey?: bsv.PrivateKey | bsv.PrivateKey[],
): TestWallet {
  if (global.dummySigner === undefined) {
    global.dummySigner = new TestWallet(
      bsv.PrivateKey.fromWIF(
        'cRn63kHoi3EWnYeT4e8Fz6rmGbZuWkDtDG5qHnEZbmE5mGvENhrv',
      ),
      new DummyProvider(),
    );
  }
  if (privateKey !== undefined) {
    global.dummySigner.addPrivateKey(privateKey);
  }
  return global.dummySigner;
}

export const dummyUTXO = {
  txId: randomBytes(32).toString('hex'),
  outputIndex: 0,
  script: '', // placeholder
  satoshis: 10000,
};

export function getDummyUTXO(satoshis: number = 10000, unique = false): UTXO {
  if (unique) {
    return Object.assign({}, dummyUTXO, {
      satoshis,
      txId: randomBytes(32).toString('hex'),
    });
  }
  return Object.assign({}, dummyUTXO, { satoshis });
}