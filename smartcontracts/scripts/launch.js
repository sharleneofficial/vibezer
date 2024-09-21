const fs = require("fs");
const { ethers, run, network } = require("hardhat");

const scripts = `scripts/launch.json`;
const data = fs.readFileSync(scripts, "utf8");
const jsonContent = JSON.parse(data);

let contractAddress;
let blockNumber;
let Verified = false;

async function fanTokenDeploy() {
  const constructorParam = jsonContent.constructorParams;
  const FanToken = await hre.ethers.getContractFactory("FanToken");
  const fanToken = await FanToken.deploy(
    constructorParam.param1,
    constructorParam.param2,
    constructorParam.param3
  );
  await fanToken.deployed();
  console.log("FanToken Deployed to:", fanToken.address);
  contractAddress = fanToken.address;
  blockNumber = fanToken.provider._maxInternalBlockNumber;
  /// VERIFY
  if (hre.network.name != "hardhat") {
    await fanToken.deployTransaction.wait(6);
    await verify(fanToken.address, [
      constructorParam.param1,
      constructorParam.param2,
      constructorParam.param3,
    ]);
  }
}

async function questDeploy() {
  const constructorParam = jsonContent.constructorParams;
  const Quest = await hre.ethers.getContractFactory("Quest");
  const quest = await Quest.deploy(
    constructorParam.param1,
    constructorParam.param2,
    constructorParam.param3,
    constructorParam.param4,
    constructorParam.param5
  );
  await quest.deployed();
  console.log("Quest Deployed to:", quest.address);
  contractAddress = quest.address;
  blockNumber = quest.provider._maxInternalBlockNumber;
  /// VERIFY
  if (hre.network.name != "hardhat") {
    await quest.deployTransaction.wait(6);
    await verify(quest.address, [
      constructorParam.param1,
      constructorParam.param2,
      constructorParam.param3,
      constructorParam.param4,
      constructorParam.param5,
    ]);
  }
}

async function vtaDeploy() {
  const constructorParam = jsonContent.constructorParams;
  const VTA = await hre.ethers.getContractFactory("VTA");
  const vta = await VTA.deploy(
    constructorParam.param1,
    constructorParam.param2,
    constructorParam.param3,
    constructorParam.param4,
    constructorParam.param5,
    constructorParam.param6,
    constructorParam.param7
  );
  await vta.deployed();
  console.log("VTA Deployed to:", vta.address);
  contractAddress = vta.address;
  blockNumber = vta.provider._maxInternalBlockNumber;
  /// VERIFY
  if (hre.network.name != "hardhat") {
    await vta.deployTransaction.wait(6);
    await verify(vta.address, [
      constructorParam.param1,
      constructorParam.param2,
      constructorParam.param3,
      constructorParam.param4,
      constructorParam.param5,
      constructorParam.param6,
      constructorParam.param7,
    ]);
  }
}

async function main() {
  console.log(1);
  console.log(jsonContent.contractName);
  if (jsonContent.contractName == "FanToken") {
    await fanTokenDeploy();
  }
  if (jsonContent.contractName == "VTA") {
    await vtaDeploy();
  }
  if (jsonContent.contractName == "Quest") {
    await questDeploy();
  }

  let chainId;

  if (network.config.chainId != undefined) {
    chainId = network.config.chainId;
  } else {
    chainId = network.config.networkId;
  }

  console.log(`The chainId is ${chainId}`);
  const data = { chainId, contractAddress, Verified, blockNumber };
  const jsonString = JSON.stringify(data);
  // Log the JSON string
  console.log(jsonString);
}

// async function verify(contractAddress, args) {
const verify = async (contractAddress, args) => {
  console.log("Verifying contract...");
  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    });
    Verified = true;
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!");
    } else {
      console.log(e);
    }
  }
};

// main
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
