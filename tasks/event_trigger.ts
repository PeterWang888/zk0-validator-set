import Web3 from "web3";
import fs from "fs";
import sleep from "sleep-promise";
import { task, types } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import { AbiItem } from "web3-utils";

task("evtr", "event trigger")
  .addOptionalParam("os", "validator set method", "add", types.string)
  .addOptionalParam("contr", "contract address", "0x3c122a1904F27DD3A2EB9A6C0D1A03C9560527b9", types.string)
  .addOptionalParam("val", "validator address", undefined, types.string)
  .setAction(event_trigger);

const abipath = "./abi/contracts/ValidatorSet.sol/ValidatorSet.json";
let url: string;
let prikey: string;
let abi: AbiItem;
if (fs.existsSync(abipath)) {
  abi = JSON.parse(fs.readFileSync(abipath).toString());
}
let web3: Web3;

async function event_trigger(
  args: { os: string; contr: string; val: string },
  hre: HardhatRuntimeEnvironment
) {
  url = hre.userConfig.networks![hre.network.name].url!;
  prikey = hre.userConfig.networks![hre.network.name].accounts![0];
  console.log("HTTP URL: ", url);

  web3 = new Web3(new Web3.providers.HttpProvider(url));

  const myContr = new web3.eth.Contract(abi, args.contr);
  const account = web3.eth.accounts.privateKeyToAccount(prikey);
  const address = account.address;
  let data;
  const valWei = web3.utils.toWei("2", "ether");
  if (args.os == "add") {
    data = myContr.methods.addValidator2(args.val).encodeABI();
  } else if (args.os == "del") {
    data = myContr.methods.removeValidator2(args.val).encodeABI();
  } else {
    throw "validator method specify error";
  }

  try {
    const nonce = await web3.eth.getTransactionCount(address);
    const gasPrice = await web3.eth.getGasPrice();

    const tx = {
      from: address,
      data: data,
      to: args.contr,
      nonce: nonce,
      value: valWei,
      gasLimit: web3.utils.toNumber(web3.utils.toHex(gasPrice)),
    };
    let signedTx = await web3.eth.accounts.signTransaction(tx, prikey);
    const gasLimit = await web3.eth.estimateGas(tx);
    tx.gasLimit = gasLimit;

    signedTx = await web3.eth.accounts.signTransaction(tx, prikey);
    const blockTx = await web3.eth.sendSignedTransaction(
      signedTx.rawTransaction!
    );
    console.log("transaction block: ", blockTx);
    await createAndFinalizeBlock();
    const receiptTx = await web3.eth.getTransactionReceipt(
      blockTx.transactionHash
    );
    console.log("transaction receipt: ", receiptTx);
  } catch (err) {
    console.log("error: ", err);
  }
}

async function createAndFinalizeBlock() {
  let isRunning = true;
  const initialBlockNumber = await web3.eth.getBlockNumber();
  while (isRunning) {
    const currentBlockNumber = await web3.eth.getBlockNumber();
    if (currentBlockNumber > initialBlockNumber) {
      isRunning = false;
      break;
    }

    await sleep(500);
  }
}
