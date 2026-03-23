import { task } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types/hre";
import type { TaskArguments } from "hardhat/types/tasks";

export default task("accounts", "Prints the list of accounts").setInlineAction(
  async (_taskArgs: TaskArguments, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = await hre.network.connect();
    const accounts = await ethers.getSigners();

    for (const account of accounts) {
      console.log(account.address);
    }
  },
).build();
