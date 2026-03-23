/**
 * deploy task
 *
 * 用法：
 *   pnpm hardhat deploy --network poa
 *
 * 使用纯 ethers.Wallet 直连 RPC，绕开 HardhatEthersSigner 的 EIP-1559
 * populateTransaction 逻辑，强制发送 legacy 交易（type 0）。
 */

import { task } from "hardhat/config";
import { ethers } from "ethers";
import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import type { TaskArguments } from "hardhat/types/tasks";

const WETH9_ADDRESS = "0xB0FB3Db5E5CE86D4cd98BA694E0E42aa0De2D03b";
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";
const GAS_PRICE = 110_000_000_000n; // 110 gwei

export default task("deploy", "使用 legacy 交易部署 UniswapV2Factory + UniswapV2Router").setInlineAction(
  async (_taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY;
    const rpcUrl = process.env.POA_RPC_URL ?? "http://localhost:8545";

    if (!privateKey) throw new Error("DEPLOYER_PRIVATE_KEY 未设置");

    // 直接使用纯 ethers.Wallet，完全绕开 HardhatEthersSigner 的 fee population 逻辑
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("部署者地址:", wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log("余额:", ethers.formatEther(balance), "ETH");

    // Nethermind RPC 对单笔交易 gasLimit 有硬性上限 16,777,216 (0x1000000)
    const factoryOverrides = { type: 0, gasPrice: GAS_PRICE, gasLimit: 16_000_000n } as const;
    const routerOverrides  = { type: 0, gasPrice: GAS_PRICE, gasLimit: 16_000_000n } as const;

    // 1. 部署 UniswapV2Factory
    console.log("\n[1/2] 部署 UniswapV2Factory...");
    const factoryArtifact = await hre.artifacts.readArtifact("UniswapV2Factory");
    const FactoryFactory = new ethers.ContractFactory(factoryArtifact.abi, factoryArtifact.bytecode, wallet);
    const factory = await FactoryFactory.deploy(DEAD_ADDRESS, factoryOverrides);
    await factory.waitForDeployment();
    const factoryAddress = await factory.getAddress();
    console.log("✓ UniswapV2Factory:", factoryAddress);

    // 2. 部署 UniswapV2Router
    console.log("\n[2/2] 部署 UniswapV2Router...");
    const routerArtifact = await hre.artifacts.readArtifact("UniswapV2Router");
    const RouterFactory = new ethers.ContractFactory(routerArtifact.abi, routerArtifact.bytecode, wallet);
    const router = await RouterFactory.deploy(factoryAddress, WETH9_ADDRESS, routerOverrides);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log("✓ UniswapV2Router:", routerAddress);

    console.log("\n========== 部署完成 ==========");
    console.log("WETH9  (已有):", WETH9_ADDRESS);
    console.log("Factory:     ", factoryAddress);
    console.log("Router:      ", routerAddress);
    console.log("==============================");
  },
).build();
