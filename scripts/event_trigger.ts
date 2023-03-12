import { ethers } from "hardhat";
import Web3 from "web3";
import config from "../hardhat.config"
import fs from "fs"
import { OnEvent } from "../typechain-types/common"
import sleep from "sleep-promise"
import config from "../hardhat.config"

const url = config.networks.localhost.url
const prikey = config.networks.localhost.accounts[0]
const abi = JSON.parse(fs.readFileSync("./abi/contracts/ValidatorSet.sol/ValidatorSet.json").toString())
const contrAddr = "0xfB45f8B9705FFA9d05D42b72E73afE7E2ceEa860"
const web3 = new Web3(new Web3.providers.HttpProvider(url))

async function main() {  
  var myContr = new web3.eth.Contract(abi, contrAddr)
  var account = web3.eth.accounts.privateKeyToAccount(prikey);
  var address = account.address
  var data = myContr.methods.removeValidator("0xA405BA2b64DC04466E0f23487FD1c4A084787326").encodeABI()
  
  try {
    var nonce = await web3.eth.getTransactionCount(address)
    var gasPrice = await web3.eth.getGasPrice()

    var tx = {
      from: address,
      data: data,
      to: contrAddr,
      nonce: nonce,
      gasLimit: web3.utils.toNumber(web3.utils.toHex(gasPrice)),
    }
    var signedTx = await web3.eth.accounts.signTransaction(tx, prikey)
    var gasLimit = await web3.eth.estimateGas(tx)
    tx.gasLimit = gasLimit

    signedTx = await web3.eth.accounts.signTransaction(tx, prikey)
    var blockTx = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
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


// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
