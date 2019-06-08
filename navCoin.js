const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
class Transaction{
    constructor(from,to,amount){
        this.from = from;
        this.to = to;
        this.amount = amount;
    }
    calculateHash(){
        return SHA256((this.from + this.to + this.amount)).toString();
    }
    signTransaction(signingKey){
        if(signingKey.getPublic('hex') !== this.from){
            throw new Error('You cannot sign transactions for others');
        }
        const hashTx = this.calculateHash();
        const sig = signingKey.sign(hashTx,'base64');
        this.signature = sig.toDER('hex');
    }
    isValid(){
        if(this.from === null) return true;
        if(!this.signature || this.signature.length === 0){
            throw new Error('No signature in this');
        }
        const publicKey = ec.keyFromPublic(this.from,'hex');
        return publicKey.verify(this.calculateHash(),this.signature);
    }
}
class Block{
    constructor(timestamp,transactions,previousHash = ''){
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }
    calculateHash(){
            return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();     
    }
    mineBlock(difficulty){
        while(this.hash.substring(0,difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log('Block Mined:' + this.hash);
    }
    hasValidTransactions(){
        for(const tx of this.transactions){
            if(!tx.isValid()){
                return false;
            }
        }
        return true;
    }
}

class Blockchain{
    constructor(){
        this.chain = [this.createGenesis()];
        this.difficulty = 2;
        this.pendingTransactions = [];
        this.miningReward = 100;
    }
    createGenesis(){
        return new Block("08/06/2019","Genesis Block","69");
    }
    getLatest(){
        return this.chain[this.chain.length - 1];
    }
    minePendingTransactions(miningRewardAddress){
        let block = new Block(Date.now(), this.pendingTransactions);
        block.mineBlock(this.difficulty);
        console.log('Block successfully mined!');
        this.chain.push(block);
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress,this.miningReward)
        ];
    }
    addTransaction(transaction){
        if(!transaction.from || !transaction.to){
            throw new Error('You need to have from and to address')
        }
        if(!transaction.isValid()){
            throw new Error('Transaction is Invalid!');
        }
        if(transaction.amount <=0){
            throw new Error('Amount must be greater than 0');
        }
        this.pendingTransactions.push(transaction);
    }
    getBalanceOfAddress(address){
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.from === address){
                    balance -= trans.amount;
                }
                if(trans.to === address){
                    balance += trans.amount;
                }
            }
        }
        return balance;
    }
    isChainValid(){
        for(let i = 1;i<this.chain.length - 1;i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i-1];
            if(!currentBlock.hasValidTransactions()){
                return false;
            }
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false
            }
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }
        }
        return true;
    }
}

module.exports.Blockchain = Blockchain;
module.exports.Transaction = Transaction;
module.exports.Block = Block;