import { ethers } from "hardhat";
import Web3 from "web3";
import config from "../hardhat.config"
import fs from "fs"
import { OnEvent } from '../typechain-types/common';
import { task, types } from 'hardhat/config';
import type { HardhatRuntimeEnvironment, Libraries } from 'hardhat/types';

task('evls', 'event listen')
  .addOptionalParam('contr', 'contract address', undefined, types.string)
  .setAction(event_listen)

const abipath = "./abi/contracts/ValidatorSet.sol/ValidatorSet.json"
var url: string
var abi: string
if (fs.existsSync(abipath)) {
  abi = JSON.parse(fs.readFileSync(abipath).toString())
}

async function event_listen(
  args: { contr: string},
  hre: HardhatRuntimeEnvironment
) {
  url = hre.userConfig.networks![hre.network.name].ws!
  console.log("WS URL: ", url)

  var web3 = new Web3(new Web3.providers.WebsocketProvider(url));
  var myContr = new web3.eth.Contract(abi, args.contr);

  try {
    while (true) {
      var res = await new Promise((resolve, reject) => {
        myContr.once("InitiateChange", { fromBlock: "latest" },
          function (err, res) {
            if (!err)
              resolve(res)
            else
              reject(err)
          })
      })
      console.log(res)
    }
  } catch (err) { 
    console.log("error: ", err)
  }
}
