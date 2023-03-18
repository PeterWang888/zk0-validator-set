import { ethers } from "hardhat";
import Web3 from "web3";
import config from "../hardhat.config"
import fs from "fs"
import { OnEvent } from "../typechain-types/common"
import sleep from "sleep-promise"
import { task, types } from 'hardhat/config';
import type { HardhatRuntimeEnvironment, Libraries } from 'hardhat/types';

task('evet', 'event emit')
  .addOptionalParam('contr', 'contract address', undefined, types.string)
  .setAction(event_emit)


const abipath = "./abi/contracts/ValidatorSet.sol/ValidatorSet.json"
var url: string
var prikey: string
var abi: string
if (fs.existsSync(abipath)) {
  abi = JSON.parse(fs.readFileSync(abipath).toString())
}
var web3: Web3

async function event_emit(
  args: { contr: string },
  hre: HardhatRuntimeEnvironment
) {   
  url = hre.userConfig.networks![hre.network.name].url!
  prikey = hre.userConfig.networks![hre.network.name].accounts![0]
  console.log("HTTP URL: ", url)

  web3 = new Web3(new Web3.providers.HttpProvider(url))

  var myContr = new web3.eth.Contract(abi, args.contr)
  var account = web3.eth.accounts.privateKeyToAccount(prikey);
  var address = account.address
  var data

  data = myContr.methods.triggerChange().encodeABI()

  try {
    var nonce = await web3.eth.getTransactionCount(address)
    var gasPrice = await web3.eth.getGasPrice()

    var tx = {
      from: address,
      data: data,
      to: args.contr,
      nonce: nonce,
      gasLimit: web3.utils.toNumber(web3.utils.toHex(gasPrice)),
    }
    var signedTx = await web3.eth.accounts.signTransaction(tx, prikey)
    var gasLimit = await web3.eth.estimateGas(tx)
    tx.gasLimit = gasLimit

    signedTx = await web3.eth.accounts.signTransaction(tx, prikey)
    var blockTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction!)
    console.log("transaction block: ", blockTx)
    await createAndFinalizeBlock()
    var receiptTx = await web3.eth.getTransactionReceipt(blockTx.transactionHash)
    console.log("transaction receipt: ", receiptTx)
  } catch (err) {
    console.log("error: ", err)
  }
}

async function createAndFinalizeBlock() {
  var isRunning = true
  var initialBlockNumber = await web3.eth.getBlockNumber()
  while (isRunning) {
      var currentBlockNumber = await web3.eth.getBlockNumber()
      if (currentBlockNumber > initialBlockNumber) {
          isRunning = false
          break
      }

      await sleep(500)
  }
}

