const dotenv = require("dotenv");
const HDWalletProvider = require("@truffle/hdwallet-provider");


dotenv.config();
const mnemonic = process.env.ROPSTEN_MNEMONIC;

module.exports = {
  networks: {

    development: {
      host: "127.0.0.1",
      port: 7545, 
      network_id: "1337", 
    },

    ropsten: {
      provider: () =>
        new HDWalletProvider(
          mnemonic,
          `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`
        ),
      network_id: 3, // Ropsten's id
      gas: 5500000, // Ropsten has a lower block limit than mainnet
      confirmations: 0, // # of confs to wait between deployments. (default: 0)
      timeoutBlocks: 200, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: true, // Skip dry run before migrations? (default: false for public nets )
      from: "0x2bB50f9beBa1F0A69190F16Cc5b1a15b83FC5431",
    },
  },

  compilers: {
    solc: {
      version: "0.8.0",    // Fetch exact version from solc-bin
    }
  },
};