import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
import { string } from "hardhat/internal/core/params/argumentTypes";
import { step } from "mocha-steps";

var initValidator = [
  "0xbD9E1Eb20FF75653eF480179a4D231253BAd9938",
  "0xb549a50a5Dbf7F8957646B770413F2750790E119",
  "0x255Af8ac8E9743B85De49604d2dEC4674CD72f93",
  "0x2f4Cfb3669EB8F13697Bb6Bd4044d7dC2cA3390A",
  "0x48205115d36c89502D17C9772829053a9C223912",
];

describe("Set Validator2", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployValidatorSetFixture() {
    const ValidatorSet = await ethers.getContractFactory("ValidatorSet");
    const validatorSet = await ValidatorSet.deploy(initValidator);
    
    console.log("ValidatorSet with deployed to ", validatorSet.address);

    return {validatorSet }
  }

  describe("Listen Events2", function () {
    it("Should add the Validator right2", function (done) {
      console.log("1 block height", ethers.provider.blockNumber)

      var test = async function () {
        try {
          const { validatorSet } = await loadFixture(deployValidatorSetFixture)
  
          console.log(validatorSet.address)
          var validators = await validatorSet.getValidators()
          console.log(validators)

          let res = false
          validatorSet.once("InitiateChange", (_parentHash, _newSet) => {
            console.log("event InitiateChange: ", _parentHash, " ", _newSet)
            res = true
          })
          setTimeout(async () => {
            try {
              expect(res).to.equal(true)
              var validators = await validatorSet.getValidators()
              expect(validators).to.eql(initValidator.concat(["0x088CDb5BA14cE686626D8C4d97F18805D5a2091D"]))
              await validatorSet.removeValidator("0x088CDb5BA14cE686626D8C4d97F18805D5a2091D")
              done()
            } catch (err) {
              console.log("err: ", err)
            }
          }, 7000)

          var valWei = ethers.utils.parseEther('2')
          await validatorSet.addValidator2("0x088CDb5BA14cE686626D8C4d97F18805D5a2091D", { value: valWei })
        } catch (err) {
          console.log("err: ", err)
        }
      }  

      test()

      console.log("1 block height", ethers.provider.blockNumber)
    }).timeout(8000)

    it("Should del the Validator right2", function (done) {
      console.log("2 block height", ethers.provider.blockNumber)

      var test = async function () {
        try{
          const { validatorSet } = await loadFixture(deployValidatorSetFixture)
    
          console.log(validatorSet.address)
          var validators = await validatorSet.getValidators()
          console.log(validators)

          var valWei = ethers.utils.parseEther('2')
          await validatorSet.addValidator2("0x088CDb5BA14cE686626D8C4d97F18805D5a2091D", { value: valWei })

          let res = false
          validatorSet.once("InitiateChange", (_parentHash, _newSet) => {
            console.log("event InitiateChange: ", _parentHash, " ", _newSet)
            res = true
          })
          setTimeout(async () => {
            try{
              expect(res).to.equal(true)
              var validators = await validatorSet.getValidators()
              expect(validators).to.eql(initValidator)
              done()
            } catch (err) {
              console.log("err: ", err)
            }
          }, 7000)

          await validatorSet.removeValidator("0x088CDb5BA14cE686626D8C4d97F18805D5a2091D")
        } catch (err) {
          console.log("err: ", err)
        }
      }  

      test()
      console.log("2 block height", ethers.provider.blockNumber)
    }).timeout(8000)

    it("Should get the Validators right2", function (done) {
     
      console.log("3 block height", ethers.provider.blockNumber)

      var test = async function () {
        try{
          const { validatorSet } = await loadFixture(deployValidatorSetFixture)

          var validators = await validatorSet.getValidators()
          console.log(validators)
          expect(validators).to.eql(initValidator)

          var valWei = ethers.utils.parseEther('2')
          await validatorSet.addValidator2("0x088CDb5BA14cE686626D8C4d97F18805D5a2091D", { value: valWei })
          validators = await validatorSet.getValidators()
          expect(validators).to.eql(initValidator.concat(["0x088CDb5BA14cE686626D8C4d97F18805D5a2091D"]))

          await validatorSet.removeValidator("0x088CDb5BA14cE686626D8C4d97F18805D5a2091D")
          validators = await validatorSet.getValidators()
          expect(validators).to.eql(initValidator)
          done()
        } catch (err) {
          console.log("err: ", err)
        }
      }

      test()
      console.log("3 block height", ethers.provider.blockNumber)
    }).timeout(8000)
  })
})
