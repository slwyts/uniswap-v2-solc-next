# Uniswap V2 — Solidity 0.8.34 / Osaka EVM

> Uniswap V2 Core & Periphery 合约的现代化移植，目标编译器为 **Solidity 0.8.34**，EVM 目标为 **Osaka**。

本仓库将 [Uniswap V2](https://github.com/Uniswap/v2-core) 的全部核心合约迁移至最新的 Solidity 工具链，利用 0.8.x 内置的溢出检查、更严格的类型系统以及 Osaka 硬分叉引入的新 EVM 操作码，同时保持与原始协议逻辑的一致性。

## 合约一览

| 合约 | 说明 |
| --- | --- |
| `UniswapV2Factory` | 工厂合约 — 创建并注册交易对 |
| `UniswapV2Pair` | 交易对合约 — AMM 核心逻辑（mint / burn / swap） |
| `UniswapV2ERC20` | LP Token 实现（EIP-2612 permit） |
| `UniswapV2Router` | 外围路由 — 面向用户的 swap / 流动性操作 |

**Libraries:** `Math` · `UQ112x112` · `UniswapV2Library` · `TransferHelper`

## 技术栈

- **Solidity** `0.8.34` — evmVersion `osaka`
- **Hardhat** `v3` — 编译、测试、部署
- **Ethers.js** `v6` + **TypeChain** — 类型安全的合约交互
- **Hardhat Ignition** — 声明式部署
- **pnpm** — 包管理

## 快速开始

```bash
# 安装依赖
pnpm install

# 编译合约
pnpm compile

# 运行测试
pnpm test
```

## 相较原版的主要变更

- **编译器升级 0.5.x → 0.8.34**：移除手动 SafeMath，使用原生溢出检查；需要时通过 `unchecked {}` 保留原始语义。
- **EVM 目标 Osaka**：启用最新 EVM 硬分叉特性。
- **Optimizer runs: 100,000** — 为高频调用场景优化 gas。
- **Hardhat v3 + ESM**：全面采用 ES Module 与 TypeScript 配置。
- **Router 合并**：将 periphery 路由整合进同一仓库，方便一体化开发与测试。

## 项目结构

```
contracts/
├── interfaces/       # 接口定义
├── libraries/        # 工具库
├── test/             # 测试辅助合约
├── UniswapV2ERC20.sol
├── UniswapV2Factory.sol
├── UniswapV2Pair.sol
└── UniswapV2Router.sol
src/
├── tasks/            # Hardhat 自定义 task
└── test/             # TypeScript 测试
```

## License

[GPL-3.0-or-later](./LICENSE)
