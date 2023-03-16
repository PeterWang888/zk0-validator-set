import { ethers } from "hardhat";
import Web3 from "web3";
import config from "../hardhat.config"
import fs from "fs"
import { OnEvent } from '../typechain-types/common';
import { task, types } from 'hardhat/config';
import type { HardhatRuntimeEnvironment, Libraries } from 'hardhat/types';

task('evLs', 'event listen')
  .addOptionalParam('addr', 'contract address', undefined, types.string)
  .setAction(event_listen)


var url: string
const abi = JSON.parse(fs.readFileSync("./abi/contracts/ValidatorSet.sol/ValidatorSet.json").toString())

async function event_listen(
  args: { addr: string},
  hre: HardhatRuntimeEnvironment
) {
  if (hre.network.name === 'localhost') {
    url = hre.userConfig.networks!.localhost!.url
  } else if (hre.network.name === 'testnet1') {
    url = hre.userConfig.networks!.testnet1!.url
  } else { 
    throw "network specify error"
  }

  var web3 = new Web3(new Web3.providers.WebsocketProvider(url));
  var myContr = new web3.eth.Contract(abi, args.addr);

  myContr.getPastEvents
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
