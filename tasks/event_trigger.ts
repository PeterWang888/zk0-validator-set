import { ethers } from "hardhat";
import Web3 from "web3";
import config from "../hardhat.config"
import fs from "fs"
import { OnEvent } from "../typechain-types/common"
import sleep from "sleep-promise"
import { task, types } from 'hardhat/config';
import type { HardhatRuntimeEnvironment, Libraries } from 'hardhat/types';

task('evEmit', 'event trigger')
  .addOptionalParam('os', 'validator set method', "add", types.string)
  .addOptionalParam('addr', 'contract address', undefined, types.string)
  .setAction(event_trigger)

var url: string
var prikey: string
const abi = JSON.parse(fs.readFileSync("./abi/contracts/ValidatorSet.sol/ValidatorSet.json").toString())
var web3: Web3

async function event_trigger(
  args: { os: string; addr: string},
  hre: HardhatRuntimeEnvironment
) {   
  if (hre.network.name === 'localhost') {
    url = hre.userConfig.networks!.localhost!.url
    prikey = hre.userConfig.networks!.localhost!.accounts[0]
  } else if (hre.network.name === 'testnet1') {
    url = hre.userConfig.networks!.testnet1!.url
    prikey = hre.userConfig.networks!.testnet1!.accounts[0]
  } else { 
    throw "network specify error"
  }
  web3 = new Web3(new Web3.providers.HttpProvider(url))

  var myContr = new web3.eth.Contract(abi, args.addr)
  var account = web3.eth.accounts.privateKeyToAccount(prikey);
  var address = account.address
  var data
  if (args.os == "add") {
    data = myContr.methods.addValidator("0xA405BA2b64DC04466E0f23487FD1c4A084787326").encodeABI()
  } else if (args.os == "del") {
    data = myContr.methods.removeValidator("0xA405BA2b64DC04466E0f23487FD1c4A084787326").encodeABI()
  } else {
    throw "validator method specify error"
  }

  try {
    var nonce = await web3.eth.getTransactionCount(address)
    var gasPrice = await web3.eth.getGasPrice()

    var tx = {
      from: address,
      data: data,
      to: args.addr,
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

