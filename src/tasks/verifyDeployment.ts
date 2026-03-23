/**
 * verify-deployment task
 *
 * 用法：
 *   pnpm hardhat verify-deployment --network poa
 *
 * 对已部署合约做只读检查，无需 gas：
 *   1. Router.factory()  → 是否指向正确的 Factory
 *   2. Router.WETH()     → 是否指向已有 WETH9
 *   3. Factory.feeToSetter() → 是否为 dead 地址
 *   4. Factory.PAIR_HASH → 是否与 UniswapV2Library 中 init code hash 一致
 */

import { task } from "hardhat/config";
import { ethers } from "ethers";
import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import type { TaskArguments } from "hardhat/types/tasks";

const WETH9_ADDRESS   = "0xB0FB3Db5E5CE86D4cd98BA694E0E42aa0De2D03b";
const FACTORY_ADDRESS = "0x4fdFDBDB98Ddcf9705BBD4f9EDf59728318f52fE";
const ROUTER_ADDRESS  = "0x9b9afbe2a70F8EE507f8faBE41114Ad5d9C8A0A4";
const DEAD_ADDRESS    = "0x000000000000000000000000000000000000dEaD";

function check(label: string, got: string, expected: string) {
  const ok = got.toLowerCase() === expected.toLowerCase();
  console.log(`${ok ? "✓" : "✗"} ${label}`);
  if (!ok) {
    console.log(`    期望: ${expected}`);
    console.log(`    实际: ${got}`);
  }
  return ok;
}

export default task("verify-deployment", "验证已部署的 UniswapV2 合约连接是否正确").setInlineAction(
  async (_taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
    const rpcUrl = process.env.POA_RPC_URL ?? "http://localhost:8545";
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const factoryArtifact = await hre.artifacts.readArtifact("UniswapV2Factory");
    const routerArtifact  = await hre.artifacts.readArtifact("UniswapV2Router");

    const factory = new ethers.Contract(FACTORY_ADDRESS, factoryArtifact.abi, provider);
    const router  = new ethers.Contract(ROUTER_ADDRESS,  routerArtifact.abi,  provider);

    console.log("\n========== 验证部署 ==========");

    let allOk = true;

    // 1. Router → Factory
    const routerFactory: string = await router.factory();
    allOk = check("Router.factory() → Factory 地址", routerFactory, FACTORY_ADDRESS) && allOk;

    // 2. Router → WETH
    const routerWeth: string = await router.WETH();
    allOk = check("Router.WETH()    → WETH9 地址", routerWeth, WETH9_ADDRESS) && allOk;

    // 3. Factory.feeToSetter → dead
    const feeToSetter: string = await factory.feeToSetter();
    allOk = check("Factory.feeToSetter() → dead 地址", feeToSetter, DEAD_ADDRESS) && allOk;

    // 4. Factory.PAIR_HASH → 与 artifact 计算的 init code hash 一致
    const pairArtifact = await hre.artifacts.readArtifact("UniswapV2Pair");
    const expectedHash: string = ethers.keccak256(pairArtifact.bytecode);
    const onchainHash: string  = await factory.PAIR_HASH();
    allOk = check("Factory.PAIR_HASH → Pair init code hash", onchainHash, expectedHash) && allOk;

    console.log("==============================");
    if (allOk) {
      console.log("✓ 所有检查通过，合约部署正确！");
    } else {
      console.log("✗ 存在不一致，请检查上方输出。");
      process.exitCode = 1;
    }
  },
).build();
