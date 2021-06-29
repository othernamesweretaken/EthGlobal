require("@nomiclabs/hardhat-waffle");
require('dotenv').config({path: __dirname + '/.env'})

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");

module.exports = {
  networks: {
    hardhat: {
    },
    goerli: {
      url: process.env.INFURA_API_KEY,
      accounts: {
        mnemonic: process.env.MNEMONIC
      }
    }
  },
  solidity: "0.7.3"
};
