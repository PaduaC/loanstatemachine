const LoanStateMachine = artifacts.require("LoanStateMachine");

module.exports = function (deployer, _network, accounts) {
  deployer.deploy(LoanStateMachine, 1000, 100, 100, accounts[1], accounts[2]);
};
