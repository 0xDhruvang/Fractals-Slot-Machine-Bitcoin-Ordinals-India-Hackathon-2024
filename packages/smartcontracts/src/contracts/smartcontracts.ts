import { 
    assert, 
    method, 
    prop, 
    SmartContract, 
    PubKey, 
    Sig, 
    ByteString, 
    hash256, 
    Utils,
    pubKey2Addr
} from 'scrypt-ts'

export class Puzzle extends SmartContract {
    // Liquidity pool parameters
    @prop(true)
    liquidityPool: bigint

    // Owner/operator of the gambling contract
    @prop()
    readonly owner: PubKey

    // Minimum liquidity required to start gambling
    @prop()
    readonly minLiquidity: bigint

    // Maximum reward percentage
    @prop()
    readonly maxRewardPercentage: bigint

    constructor(owner: PubKey, minLiquidity: bigint, maxRewardPercentage: bigint) {
        super(...arguments)
        this.owner = owner
        this.liquidityPool = 0n
        this.minLiquidity = minLiquidity
        this.maxRewardPercentage = maxRewardPercentage
    }

    // Method to add liquidity to the pool
    @method()
    public addLiquidity(contributor: PubKey, amount: bigint, sig: Sig) {
        // Verify the contributor's signature
        assert(this.checkSig(sig, contributor), 'Signature verification failed')

        // Update liquidity pool
        this.liquidityPool += amount

        // Build output to maintain contract state
        const outputs = this.buildStateOutput(this.ctx.utxo.value + amount) + 
                        this.buildChangeOutput()

        // Verify output integrity
        assert(hash256(outputs) == this.ctx.hashOutputs, 'Output verification failed')
    }

    // Method to remove liquidity from the pool
    @method()
    public removeLiquidity(contributor: PubKey, amount: bigint, sig: Sig) {
        // Verify the contributor's signature
        assert(this.checkSig(sig, contributor), 'Signature verification failed')

        // Ensure sufficient liquidity
        assert(this.liquidityPool >= amount, 'Insufficient liquidity')

        // Update liquidity pool
        this.liquidityPool -= amount

        // Build refund output for contributor
        const refundOutput = Utils.buildPublicKeyHashOutput(
            pubKey2Addr(contributor), 
            amount
        )

        // Build contract state output
        const stateOutput = this.buildStateOutput(this.ctx.utxo.value - amount)

        // Combine outputs
        const outputs = stateOutput + refundOutput + this.buildChangeOutput()

        // Verify output integrity
        assert(hash256(outputs) == this.ctx.hashOutputs, 'Output verification failed')
    }

    // Method to distribute rewards to a player
    @method()
    public distributeReward(player: PubKey, rewardAmount: bigint, sig: Sig) {
        // Only owner can distribute rewards
        assert(this.checkSig(sig, this.owner), 'Only owner can distribute rewards')

        // Ensure minimum liquidity is maintained
        assert(this.liquidityPool >= this.minLiquidity, 'Insufficient liquidity in pool')

        // Ensure reward doesn't exceed maximum percentage
        const maxPossibleReward = (this.liquidityPool * this.maxRewardPercentage) / 100n
        assert(rewardAmount <= maxPossibleReward, 'Reward exceeds maximum allowed')

        // Reduce liquidity pool
        this.liquidityPool -= rewardAmount

        // Build reward output for player
        const rewardOutput = Utils.buildPublicKeyHashOutput(
            pubKey2Addr(player), 
            rewardAmount
        )

        // Build contract state output
        const stateOutput = this.buildStateOutput(this.ctx.utxo.value - rewardAmount)

        // Combine outputs
        const outputs = stateOutput + rewardOutput + this.buildChangeOutput()

        // Verify output integrity
        assert(hash256(outputs) == this.ctx.hashOutputs, 'Output verification failed')
    }
}