# Fractal Puzzle

Fractal Puzzle is a simple example project designed to demonstrate the combination of sCrypt and Taproot's script-path technology on the Fractal Bitcoin chain. This project aims to provide a quick understanding of these technologies and serves as a foundation for developing more complex functionalities based on this code.

## Project Structure

- packages
  - smartcontracts: The smart contract code.
  - cli: The command-line interface for deploying and solving the puzzle.
  - frontend: The frontend interface for the puzzle (TBD).

## Getting Started

### Prerequisites

#### 0. Operating System

This project is designed to run on macOS and Linux.

On macOS with Apple Silicon(M1, M2, etc.), make sure [Rosetta](https://support.apple.com/en-us/HT211861) is installed.

```bash
softwareupdate --install-rosetta --agree-to-license
```

#### 1. Runtime (Bun)

We use Bun as the package manager and TypeScript runtime. You can visit [here](https://bun.sh/docs/installation) to choose an installation method, or simply run the following command to install it:

```bash
curl -fsSL https://bun.sh/install | bash
```

#### 2. Unisat API Key

Additionally, the project uses the Unisat API for functions such as finding UTXOs and broadcasting transactions, so you will need to obtain an API key at the [Unisat Developer Center](https://developer.unisat.io/account/login).

#### 3. Bitcoin Wallet

To deploy and interact with the contract, you will need a Bitcoin wallet. The project assumes that you put the private key in the `.env` file.

**We encourage you to create a new wallet (private key) instead of using an existing wallet with assets to try out this project.**

By the way, if you only need to solve an existing puzzle on the chain, your wallet doesn't even need to have transaction fees. You can directly use the funds from the puzzle's UTXO(Of course, your secret must be correct).

If you want to deploy to the testnet, you can use [Fractal Testnet Faucet](https://fractal-testnet.unisat.io/explorer/faucet) to get some testnet BTC.

### Clone the repository

```bash
git clone https://github.com/blockspaceforce/fractal-puzzle.git
cd fractal-puzzle
```

### Smart Contract

```bash
packages
├── cli
├── smartcontracts   # <--- here
```

Go to the [smartcontracts](./packages/smartcontracts) directory and run the following command to compile the contract:

```bash
# go to smartcontracts directory from project root
cd packages/smartcontracts
bun install
npx scrypt-cli@latest compile
```

### Command Line Interface

```bash
packages
├── cli                # <--- here
├── smartcontracts
```

Go to the [cli](./packages/cli) directory and run the following steps to deploy and solve the puzzle.

#### Install dependencies

```bash
# go to cli directory from project root
cd packages/cli
bun install
```

#### Set the environment variables

Copy the `env.example` file to `.env` and set the environment variables.

```bash
cp env.example .env

# edit .env file
vim .env
```

The `.env` file should look like this:

```env
PRIVATE_KEY=<your private key in WIF format>
# UNISAT_BASE_URL=https://open-api-fractal.unisat.io # mainnet
UNISAT_BASE_URL=https://open-api-fractal-testnet.unisat.io # testnet
UNISAT_API_KEY=<your unisat api key>
```

#### Deploy the contract

You can deploy the contract by running the following command (in the `cli` directory):

```console
$ bun cli puzzle deploy
> Enter your secret(4 characters minimum): [hello]
> Enter amount(> 546 satoshis): [1000]
> Broadcast now? (y/N): [y]
> Broadcasted: <txid>
```

#### Solve the puzzle and get the reward

You can solve the puzzle and get the reward by running the following command (in the `cli` directory):

```console
$ bun cli puzzle solve
> Enter your secret(4 characters minimum): [hello]
> Enter your utxo address: [utxo address]
> Broadcast now? (y/N): [y]
> Broadcasted: <txid>
```

#### Wallet Management

You can manage your wallet by running the following command:

```bash
# show current wallet
bun cli wallet current

# generate a new wallet
bun cli wallet generate
```

## FAQ

### How to get puzzle UTXO?

After deploying the puzzle contract, you can view the transaction in a blockchain explorer. There will be 2 outputs, and the new address that does not belong to your wallet address is the puzzle's UTXO.

- [Unisat Explorer(Mainnet)](https://fractal.unisat.io/explorer)
- [Unisat Explorer(Testnet)](https://fractal-testnet.unisat.io/explorer)

### How to change the fee rate?

The current version does not support the fee rate feature yet and only allows setting a fixed fee. If you want to change the default value, you can modify the `FEE` field in `packages/cli/libs/constants.ts`.

## Todo

- [ ] support fee rate
- [ ] wallet management
- [ ] add frontend interface and integrate wallet

## References

- [Fractal Bitcoin](https://www.fractalbitcoin.io/)
- [Unisat Docs](https://docs.unisat.io/)
- [sCrypt](https://docs.scrypt.io/)
- [cat-token-box](https://github.com/CATProtocol/cat-token-box)
