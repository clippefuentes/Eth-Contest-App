const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const { interfact, bytecode } = require('./compile');

const mnemonic = 'neck pitch recycle shallow entry steel fatigue aim business property empty magic';
const link = 'https://rinkeby.infura.io/v3/559285613abd4d2dac598ba388a26a70';
const provider = new HDWalletProvider(mnemonic, link);

const web3 = new Web3(provider);
