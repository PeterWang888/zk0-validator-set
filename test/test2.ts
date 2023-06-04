import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { BigNumber } from "ethers";

const initValidator = [
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

    return { validatorSet };
  }

  describe("Listen Events2", function () {
    it("Should add the Validator right2", function (done) {
      console.log("1 block height", ethers.provider.blockNumber);

      const test = async function () {
        try {
          const { validatorSet } = await loadFixture(deployValidatorSetFixture);

          console.log(validatorSet.address);
          const validators = await validatorSet.getValidators();
          console.log(validators);

          let res = false;
          validatorSet.once("InitiateChange", (_parentHash, _newSet) => {
            console.log("event InitiateChange: ", _parentHash, " ", _newSet);
            res = true;
          });
          const valWei = ethers.utils.parseEther("2");

          setTimeout(async () => {
            try {
              expect(res).to.equal(true);
              let validators = await validatorSet.getValidators();
              expect(validators).to.eql(
                initValidator.concat([
                  "0x088CDb5BA14cE686626D8C4d97F18805D5a2091D",
                ])
              );

              let amounts: BigNumber[] = [];
              [validators, amounts] = await validatorSet.getValidatorAmounts();
              expect(amounts.slice(5, amounts.length)).to.eql([valWei]);
              expect(validators).to.eql(
                initValidator.concat([
                  "0x088CDb5BA14cE686626D8C4d97F18805D5a2091D",
                ])
              );

              let staker: string[] = [];
              [staker, amounts] = await validatorSet.getStakerAmounts();
              expect(amounts.slice(5, amounts.length)).to.eql([valWei]);
              expect(staker.slice(5, staker.length)).to.eql([
                "0xA405BA2b64DC04466E0f23487FD1c4A084787326",
              ]);

              await validatorSet.removeValidator2(
                "0x088CDb5BA14cE686626D8C4d97F18805D5a2091D"
              );
              done();
            } catch (err) {
              console.log("err: ", err);
            }
          }, 7000);

          await validatorSet.addValidator2(
            "0x088CDb5BA14cE686626D8C4d97F18805D5a2091D",
            { value: valWei }
          );
        } catch (err) {
          console.log("err: ", err);
        }
      };

      test();

      console.log("1 block height", ethers.provider.blockNumber);
    }).timeout(8000);

    it("Should del the Validator right2", function (done) {
      console.log("2 block height", ethers.provider.blockNumber);

      const test = async function () {
        try {
          const { validatorSet } = await loadFixture(deployValidatorSetFixture);

          console.log(validatorSet.address);
          const validators = await validatorSet.getValidators();
          console.log(validators);

          const valWei = ethers.utils.parseEther("2");
          await validatorSet.addValidator2(
            "0x088CDb5BA14cE686626D8C4d97F18805D5a2091D",
            { value: valWei }
          );

          let res = false;
          validatorSet.once("InitiateChange", (_parentHash, _newSet) => {
            console.log("event InitiateChange: ", _parentHash, " ", _newSet);
            res = true;
          });
          setTimeout(async () => {
            try {
              expect(res).to.equal(true);
              let validators: string[] = await validatorSet.getValidators();
              expect(validators).to.eql(initValidator);

              let amounts: BigNumber[] = [];
              [validators, amounts] = await validatorSet.getValidatorAmounts();
              expect(amounts.slice(5, amounts.length)).to.eql([]);
              expect(validators).to.eql(initValidator);

              let staker: string[] = [];
              [staker, amounts] = await validatorSet.getStakerAmounts();
              expect(amounts.slice(5, amounts.length)).to.eql([]);
              expect(staker.slice(5, staker.length)).to.eql([]);

              done();
            } catch (err) {
              console.log("err: ", err);
            }
          }, 7000);

          await validatorSet.removeValidator2(
            "0x088CDb5BA14cE686626D8C4d97F18805D5a2091D"
          );
        } catch (err) {
          console.log("err: ", err);
        }
      };

      test();
      console.log("2 block height", ethers.provider.blockNumber);
    }).timeout(8000);

    it("Should get the Validators right2", function (done) {
      console.log("3 block height", ethers.provider.blockNumber);

      const test = async function () {
        try {
          const { validatorSet } = await loadFixture(deployValidatorSetFixture);

          let validators: string[] = await validatorSet.getValidators();
          console.log(validators);
          expect(validators).to.eql(initValidator);

          let amounts: BigNumber[] = [];
          [validators, amounts] = await validatorSet.getValidatorAmounts();
          expect(validators).to.eql(initValidator);

          [validators, amounts] = await validatorSet.getValidatorAmounts();
          expect(amounts.slice(5, amounts.length)).to.eql([]);
          expect(validators).to.eql(initValidator);

          let staker: string[] = [];
          [staker, amounts] = await validatorSet.getStakerAmounts();
          expect(amounts.slice(5, amounts.length)).to.eql([]);
          expect(staker.slice(5, staker.length)).to.eql([]);

          const valWei = ethers.utils.parseEther("2");
          await validatorSet.addValidator2(
            "0x088CDb5BA14cE686626D8C4d97F18805D5a2091D",
            { value: valWei }
          );
          validators = await validatorSet.getValidators();
          expect(validators).to.eql(
            initValidator.concat(["0x088CDb5BA14cE686626D8C4d97F18805D5a2091D"])
          );

          [validators, amounts] = await validatorSet.getValidatorAmounts();
          expect(amounts.slice(5, amounts.length)).to.eql([valWei]);
          expect(validators).to.eql(
            initValidator.concat(["0x088CDb5BA14cE686626D8C4d97F18805D5a2091D"])
          );

          [staker, amounts] = await validatorSet.getStakerAmounts();
          expect(amounts.slice(5, amounts.length)).to.eql([valWei]);
          expect(staker.slice(5, staker.length)).to.eql([
            "0xA405BA2b64DC04466E0f23487FD1c4A084787326",
          ]);

          await validatorSet.removeValidator2(
            "0x088CDb5BA14cE686626D8C4d97F18805D5a2091D"
          );
          validators = await validatorSet.getValidators();
          expect(validators).to.eql(initValidator);

          [validators, amounts] = await validatorSet.getValidatorAmounts();
          expect(amounts.slice(5, amounts.length)).to.eql([]);
          expect(validators).to.eql(initValidator);

          [staker, amounts] = await validatorSet.getStakerAmounts();
          expect(amounts.slice(5, amounts.length)).to.eql([]);
          expect(staker.slice(5, staker.length)).to.eql([]);

          done();
        } catch (err) {
          console.log("err: ", err);
        }
      };

      test();
      console.log("3 block height", ethers.provider.blockNumber);
    }).timeout(8000);
  });
});
