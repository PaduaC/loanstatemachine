const LoanStateMachine = artifacts.require("LoanStateMachine");

module.exports = function (deployer, _network, accounts) {
  deployer.deploy(
    LoanStateMachine,
    web3.utils.toWei("1"),
    web3.utils.toWei("1", "finney"),
    30,
    accounts[1],
    accounts[2]
  );
};
