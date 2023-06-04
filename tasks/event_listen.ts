import Web3 from "web3";
import fs from "fs";
import { task, types } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { AbiItem } from "web3-utils";

task("evls", "event listen")
  .addOptionalParam("contr", "contract address", undefined, types.string)
  .setAction(event_listen);

const abipath = "./abi/contracts/ValidatorSet.sol/ValidatorSet.json";
let url: string;
let abi: AbiItem;
if (fs.existsSync(abipath)) {
  abi = JSON.parse(fs.readFileSync(abipath).toString());
}

async function event_listen(
  args: { contr: string },
  hre: HardhatRuntimeEnvironment
) {
  url = hre.userConfig.networks![hre.network.name].ws!;
  console.log("WS URL: ", url);

  const web3 = new Web3(new Web3.providers.WebsocketProvider(url));
  const myContr = new web3.eth.Contract(abi, args.contr);

  try {
    const condi = true;
    while (condi) {
      const res = await new Promise((resolve, reject) => {
        myContr.once(
          "InitiateChange",
          { fromBlock: "latest" },
          function (err, res) {
            if (!err) resolve(res);
            else reject(err);
          }
        );
      });
      console.log(res);
    }
  } catch (err) {
    console.log("error: ", err);
  }
}
