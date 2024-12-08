import { Puzzle } from './src/contracts/smartcontracts'
import { 
    bsv, 
    TestWallet, 
    DefaultProvider, 
    MethodCallOptions,
    PubKey
} from 'scrypt-ts'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

async function main() {
    // Load the contract artifact
    await Puzzle.loadArtifact()

    // Prepare the owner's private key (from environment variable)
    const ownerPrivateKey = bsv.PrivateKey.fromWIF(process.env.OWNER_PRIVATE_KEY || '')
    
    // Create a signer (wallet) for the owner
    const signer = new TestWallet(
        ownerPrivateKey, 
        new DefaultProvider({
            network: bsv.Networks.testnet
        })
    )

    // Contract parameters
    const ownerPublicKey = bsv.PublicKey.fromPrivateKey(ownerPrivateKey)
    const minLiquidity = 10000n // 10,000 satoshis minimum liquidity
    const maxRewardPercentage = 50n // 50% of pool can be rewarded

    // Create contract instance
    const puzzleContract = new Puzzle(
        ownerPublicKey.toByteString() as PubKey, 
        minLiquidity, 
        maxRewardPercentage
    )

    // Connect the contract to the signer
    await puzzleContract.connect(signer)

    // Deploy the contract
    const deployAmount = 50000 // 50,000 satoshis initial funding
    const deployTx = await puzzleContract.deploy(deployAmount)
    console.log('Puzzle Contract deployed!')
    console.log('Deployment Transaction ID:', deployTx.id)

    // Example of adding liquidity
    async function addLiquidity(contributorPrivateKey: bsv.PrivateKey, amount: bigint) {
        const contributorPublicKey = bsv.PublicKey.fromPrivateKey(contributorPrivateKey)
        const contributorSigner = new TestWallet(
            contributorPrivateKey,
            new DefaultProvider({
                network: bsv.Networks.testnet
            })
        )

        // Convert default address to bsv.Address
        const changeAddress = new bsv.Address(contributorSigner.getDefaultAddress().toString())

        // Prepare method call options with correct types
        const methodOptions: MethodCallOptions<Puzzle> = {
            pubKeyOrAddrToSign: [contributorPublicKey],
            changeAddress: changeAddress
        }

        // Prepare signature 
        const sig = await contributorSigner.signMessage(
            contributorPublicKey.toByteString()
        )

        // Call add liquidity method
        const addLiquidityTx = await puzzleContract.methods.addLiquidity(
            contributorPublicKey.toByteString() as PubKey, 
            amount, 
            sig,
            methodOptions
        )

        console.log('Liquidity added! Tx ID:', addLiquidityTx.tx.id)
    }

    // Example of distributing reward
    async function distributeReward(playerPrivateKey: bsv.PrivateKey, rewardAmount: bigint) {
        const playerPublicKey = bsv.PublicKey.fromPrivateKey(playerPrivateKey)

        // Convert default address to bsv.Address
        const changeAddress = new bsv.Address(signer.getDefaultAddress().toString())

        // Prepare method call options with correct types
        const methodOptions: MethodCallOptions<Puzzle> = {
            pubKeyOrAddrToSign: [ownerPublicKey],
            changeAddress: changeAddress
        }

        // Prepare owner's signature
        const sig = await signer.signMessage(
            ownerPublicKey.toByteString()
        )

        // Call distribute reward method
        const distributeTx = await puzzleContract.methods.distributeReward(
            playerPublicKey.toByteString() as PubKey, 
            rewardAmount, 
            sig,
            methodOptions
        )

        console.log('Reward distributed! Tx ID:', distributeTx.tx.id)
    }

    // Demonstration of usage (commented out - replace with actual keys)
    // const contributorPrivateKey = bsv.PrivateKey.fromWIF('contributor private key')
    // const playerPrivateKey = bsv.PrivateKey.fromWIF('player private key')
    
    // await addLiquidity(contributorPrivateKey, 20000n)
    // await distributeReward(playerPrivateKey, 5000n)
}

// Run the deployment
main().catch(console.error)