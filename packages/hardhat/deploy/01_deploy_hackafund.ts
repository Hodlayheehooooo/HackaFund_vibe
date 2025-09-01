import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployHackaFund: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("HackaFund", {
    from: deployer,
    args: [300], // 3% protocol fee
    log: true,
    autoMine: true,
  });
};

export default deployHackaFund;
deployHackaFund.tags = ["HackaFund"];
