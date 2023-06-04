import { ethers } from "hardhat";

const initValidator: string[] = [
  // "0xbD9E1Eb20FF75653eF480179a4D231253BAd9938",
  // "0xb549a50a5Dbf7F8957646B770413F2750790E119",
  // "0x255Af8ac8E9743B85De49604d2dEC4674CD72f93",
  // "0x2f4Cfb3669EB8F13697Bb6Bd4044d7dC2cA3390A",
  // "0x48205115d36c89502D17C9772829053a9C223912",
];

async function main() {
  try {
    const ValidatorSet = await ethers.getContractFactory("ValidatorSet");
    const validatorSet = await ValidatorSet.deploy(initValidator);
    await validatorSet.deployed();

    console.log("ValidatorSet with deployed to ", validatorSet.address);
  } catch (err) {
    console.log("error: ", err);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
