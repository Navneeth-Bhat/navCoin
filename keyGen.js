const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

const key = ec.genKeyPair();
const private = key.getPrivate('hex');
const public = key.getPublic('hex');

console.log(private);
console.log(public);