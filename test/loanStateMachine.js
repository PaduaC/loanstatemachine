const { expectRevert, time } = require("@openzeppelin/test-helpers");
const LoanStateMachine = artifacts.require("LoanStateMachine");

contract("LoanStateMachine", (accounts) => {
  let loanStateMachine;
  const amount = 1000;
  const interest = 100;
  const duration = 100;

  const [borrower, lender] = [accounts[1], accounts[2]];
  before(async () => {
    loanStateMachine = await LoanStateMachine.deployed();
  });

  it("Should NOT accept fund if not lender", async () => {
    await expectRevert(
      loanStateMachine.fund({ from: accounts[3] }),
      "Only lender can lend"
    );
  });

  it("Should NOT accept fund if not exact amount", async () => {
    await expectRevert(
      loanStateMachine.fund({ from: lender, amount: 2000 }),
      "Can only lend the required amount"
    );
  });

  it("Should accept fund", async () => {
    await loanStateMachine.fund({ from: lender, value: amount });
    assert(amount === 1000);
  });

  it("Should NOT reimburse if not borrower", async () => {
    await expectRevert(
      loanStateMachine.reimburse({ from: accounts[3] }),
      "Only borrower can reimburse"
    );
  });

  it("Should NOT reimburse if not exact amount", async () => {
    await expectRevert(
      loanStateMachine.reimburse({ from: borrower, value: 600 }),
      "Borrower must reimburse exact amount w/ interest"
    );
  });

  it("Should NOT reimburse if loan hasn't matured yet", async () => {
    await expectRevert(
      loanStateMachine.reimburse({ from: borrower, value: amount + interest }),
      "Loan has not matured yet"
    );
  });

  it("Should reimburse", async () => {
    await time.increase(duration + 10);
    const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(lender));
    await loanStateMachine.reimburse({
      from: borrower,
      value: amount + interest,
    });
    const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(lender));
    const state = await loanStateMachine.state();
    assert(state.toNumber() === 2);
    assert(balanceAfter.sub(balanceBefore).toNumber() === amount + interest);
  });
});
