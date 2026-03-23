import hardhatEthersPlugin from "@nomicfoundation/hardhat-ethers";
import hardhatEthersChaiMatchersPlugin from "@nomicfoundation/hardhat-ethers-chai-matchers";
import hardhatIgnitionEthersPlugin from "@nomicfoundation/hardhat-ignition-ethers";
import hardhatMochaPlugin from "@nomicfoundation/hardhat-mocha";
import hardhatNetworkHelpersPlugin from "@nomicfoundation/hardhat-network-helpers";
import hardhatTypechainPlugin from "@nomicfoundation/hardhat-typechain";
import hardhatVerifyPlugin from "@nomicfoundation/hardhat-verify";
import { defineConfig } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config();

// tasks
import accountsTask from "./src/tasks/accounts";
import updateInitHashTask from "./src/tasks/updateInitHash";
import deployTask from "./src/tasks/deploy";
import verifyDeploymentTask from "./src/tasks/verifyDeployment";

const config = defineConfig({
  tasks: [accountsTask, updateInitHashTask, deployTask, verifyDeploymentTask],
  plugins: [
    hardhatEthersPlugin,
    hardhatEthersChaiMatchersPlugin,
    hardhatIgnitionEthersPlugin,
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
    // PoA 私链 - 配置见 .env 文件
    poa: {
      type: "http",
      url: process.env.POA_RPC_URL ?? "http://localhost:8545",
      chainId: 2679,
      gasPrice: 110_000_000_000, // 110 gwei，供 ethers 直接发送用
      accounts: process.env.DEPLOYER_PRIVATE_KEY
        ? [process.env.DEPLOYER_PRIVATE_KEY]
        : [],
      // 强制 Ignition 使用 legacy 交易（type 0），不走 EIP-1559 fee estimation
      ignition: {
        gasPrice: 110_000_000_000n, // 110 gwei
        disableFeeBumping: false,
      },
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
      production: {
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
