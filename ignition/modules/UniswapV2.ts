import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// 链上已有的 Wrapped Native Token 地址
const WETH9_ADDRESS = "0xB0FB3Db5E5CE86D4cd98BA694E0E42aa0De2D03b";

// 协议手续费永久烧毁地址（setFeeTo 永远不会被调用，手续费实际不开启；
// 若未来想开启手续费也无人能控制，等效于关闭协议手续费）
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dEaD";

export default buildModule("UniswapV2", (m) => {
  const feeToSetter = DEAD_ADDRESS;

  // 使用链上已有的 Wrapped Native Token
  const weth9 = m.contractAt("WETH9", WETH9_ADDRESS);

  // 部署工厂合约
  const factory = m.contract("UniswapV2Factory", [feeToSetter]);

  // 部署路由合约
  const router = m.contract("UniswapV2Router", [factory, weth9]);

  return { weth9, factory, router };
});
