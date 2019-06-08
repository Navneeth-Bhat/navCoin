const {Blockchain,Transaction} = require('./navCoin');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const mykey = ec.keyFromPrivate('ff68a80e37b4af2a8a222dfdac3b9c0432f0ac187239622a15d72fdc50cbe157');
const mywallet = mykey.getPublic('hex');

let navCoin = new Blockchain();
const tx1 = new Transaction(mywallet,'public key',10);
tx1.signTransaction(mykey);
navCoin.addTransaction(tx1);
console.log('\nStarting the miner....');
navCoin.minePendingTransactions(mywallet);
console.log('\n ur balance is', navCoin.getBalanceOfAddress(mywallet));
