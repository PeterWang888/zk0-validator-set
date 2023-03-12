import { ethers } from "hardhat";
import Web3 from "web3";
import config from "../hardhat.config"
import fs from "fs"
import { OnEvent } from '../typechain-types/common';

const url = config.networks.localhost.url
const abi = JSON.parse(fs.readFileSync("./abi/contracts/ValidatorSet.sol/ValidatorSet.json").toString())
const contrAddr = '0xfB45f8B9705FFA9d05D42b72E73afE7E2ceEa860';

async function main() {
  var web3 = new Web3(new Web3.providers.WebsocketProvider(url));
  var myContr = new web3.eth.Contract(abi, contrAddr);

  myContr.events.InitiateChange({ fromBlock: "latest" },
    function (err, res) {
      if (err)
        console.log(err);
      else
        console.log(res);
    })

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
