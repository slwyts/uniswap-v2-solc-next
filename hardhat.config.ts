import hardhatEthersPlugin from "@nomicfoundation/hardhat-ethers";
import hardhatEthersChaiMatchersPlugin from "@nomicfoundation/hardhat-ethers-chai-matchers";
import hardhatMochaPlugin from "@nomicfoundation/hardhat-mocha";
import hardhatNetworkHelpersPlugin from "@nomicfoundation/hardhat-network-helpers";
import hardhatTypechainPlugin from "@nomicfoundation/hardhat-typechain";
import hardhatVerifyPlugin from "@nomicfoundation/hardhat-verify";
import { defineConfig } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config();

// tasks
import "./src/tasks/accounts";

const config = defineConfig({
  plugins: [
    hardhatEthersPlugin,
    hardhatEthersChaiMatchersPlugin,
    hardhatMochaPlugin,
    hardhatNetworkHelpersPlugin,
    hardhatTypechainPlugin,
    hardhatVerifyPlugin,
  ],
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
      blockGasLimit: 30000000,
    },
  },
  solidity: {
    profiles: {
      default: {
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
    },
  },
  paths: {
    tests: "./src/test",
  },
});

export default config;
