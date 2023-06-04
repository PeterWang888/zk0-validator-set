import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const initValidator = [
  "0xbD9E1Eb20FF75653eF480179a4D231253BAd9938",
  "0xb549a50a5Dbf7F8957646B770413F2750790E119",
  "0x255Af8ac8E9743B85De49604d2dEC4674CD72f93",
  "0x2f4Cfb3669EB8F13697Bb6Bd4044d7dC2cA3390A",
  "0x48205115d36c89502D17C9772829053a9C223912",
];

describe("Set Validator", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployValidatorSetFixture() {
    const ValidatorSet = await ethers.getContractFactory("ValidatorSet");
    const validatorSet = await ValidatorSet.deploy(initValidator);

    console.log("ValidatorSet with deployed to ", validatorSet.address);

    return { validatorSet };
  }

  describe("Listen Events", function () {
    it("Should add the Validator right", function (done) {
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
          setTimeout(async () => {
            try {
              expect(res).to.equal(true);
              const validators = await validatorSet.getValidators();
              expect(validators).to.eql(
                initValidator.concat([
                  "0xA405BA2b64DC04466E0f23487FD1c4A084787326",
                ])
              );
              await validatorSet.removeValidator(
                "0xA405BA2b64DC04466E0f23487FD1c4A084787326"
              );
              done();
            } catch (err) {
              console.log("err: ", err);
            }
          }, 7000);

          await validatorSet.addValidator(
            "0xA405BA2b64DC04466E0f23487FD1c4A084787326"
          );
        } catch (err) {
          console.log("err: ", err);
        }
      };

      test();

      console.log("1 block height", ethers.provider.blockNumber);
    }).timeout(8000);

    it("Should del the Validator right", function (done) {
      console.log("2 block height", ethers.provider.blockNumber);

      const test = async function () {
        try {
          const { validatorSet } = await loadFixture(deployValidatorSetFixture);

          console.log(validatorSet.address);
          const validators = await validatorSet.getValidators();
          console.log(validators);

          await validatorSet.addValidator(
            "0xA405BA2b64DC04466E0f23487FD1c4A084787326"
          );

          let res = false;
          validatorSet.once("InitiateChange", (_parentHash, _newSet) => {
            console.log("event InitiateChange: ", _parentHash, " ", _newSet);
            res = true;
          });
          setTimeout(async () => {
            try {
              expect(res).to.equal(true);
              const validators = await validatorSet.getValidators();
              expect(validators).to.eql(initValidator);
              done();
            } catch (err) {
              console.log("err: ", err);
            }
          }, 7000);

          await validatorSet.removeValidator(
            "0xA405BA2b64DC04466E0f23487FD1c4A084787326"
          );
        } catch (err) {
          console.log("err: ", err);
        }
      };

      test();
      console.log("2 block height", ethers.provider.blockNumber);
    }).timeout(8000);

    it("Should get the Validators right", function (done) {
      console.log("3 block height", ethers.provider.blockNumber);

      const test = async function () {
        try {
          const { validatorSet } = await loadFixture(deployValidatorSetFixture);

          let validators = await validatorSet.getValidators();
          console.log(validators);
          expect(validators).to.eql(initValidator);

          await validatorSet.addValidator(
            "0xA405BA2b64DC04466E0f23487FD1c4A084787326"
          );
          validators = await validatorSet.getValidators();
          expect(validators).to.eql(
            initValidator.concat(["0xA405BA2b64DC04466E0f23487FD1c4A084787326"])
          );

          await validatorSet.removeValidator(
            "0xA405BA2b64DC04466E0f23487FD1c4A084787326"
          );
          validators = await validatorSet.getValidators();
          expect(validators).to.eql(initValidator);
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
