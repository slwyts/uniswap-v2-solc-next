import { HardhatUserConfig } from "hardhat/config";

import "@nomicfoundation/hardhat-toolbox";

import * as dotenv from "dotenv";
dotenv.config();

// tasks
import "./src/tasks/accounts";

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      blockGasLimit: 30000000,
    },
  },
  solidity: {
    version: "0.8.34",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100000,
      },
      metadata: {
        bytecodeHash: "none",
      },
      evmVersion: "osaka",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  typechain: {
    outDir: "typechain-types",
    target: "ethers-v6",
  },
  paths: {
    tests: "./src/test",
  },
};

export default config;
