/**
 * update-init-hash task
 *
 * 用途：当你修改了编译器配置（evmVersion / optimizer runs）后，
 *       Pair 合约的 init code hash 会变化，此 task 自动重算并
 *       更新 contracts/libraries/UniswapV2Library.sol 中的硬编码值。
 *
 * 运行方式：
 *   pnpm hardhat update-init-hash [--network <name>]
 *
 * 完整流程：
 *   1. 修改 hardhat.config.ts 中的 evmVersion / optimizer
 *   2. pnpm run compile
 *   3. pnpm hardhat update-init-hash
 *   4. pnpm run compile  （重新编译使 Library 中嵌入新哈希）
 *   5. pnpm test         （验证测试通过）
 */

import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import type { TaskArguments } from "hardhat/types/tasks";
import { keccak256 } from "ethers";
import * as fs from "node:fs";
import * as path from "node:path";

export default task(
  "update-init-hash",
  "重新计算 UniswapV2Pair init code hash 并更新 UniswapV2Library.sol",
).setInlineAction(
  async (_taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
    const artifact = await hre.artifacts.readArtifact("UniswapV2Pair");
    const hash = keccak256(artifact.bytecode);
    const hashHex = hash.slice(2); // remove 0x

    console.log(`Pair init code hash: ${hashHex}`);

    const libPath = path.resolve(
      "contracts",
      "libraries",
      "UniswapV2Library.sol",
    );
    const original = fs.readFileSync(libPath, "utf8");
    const updated = original.replace(
      /hex"[0-9a-f]{64}"\s*\/\/ init code hash/,
      `hex"${hashHex}" // init code hash`,
    );

    if (original === updated) {
      console.log("UniswapV2Library.sol 中未找到匹配模式或 hash 无变化，无需更新。");
    } else {
      fs.writeFileSync(libPath, updated);
      console.log(
        "已更新 UniswapV2Library.sol。请再次执行 `pnpm run compile` 使更改生效。",
      );
    }
  },
).build();
