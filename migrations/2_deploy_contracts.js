const ETHGoals = artifacts.require("ETHGoals");

module.exports = function (deployer) {
  deployer.deploy(ETHGoals);
};
