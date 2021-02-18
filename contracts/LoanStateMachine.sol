pragma solidity ^0.5.4;

contract LoanStateMachine {
    enum State {PENDING, ACTIVE, CLOSED}

    State public state = State.PENDING;
    uint256 public amount;
    uint256 public interest;
    uint256 public end;
    uint256 public duration;
    address payable public borrower;
    address payable public lender;

    constructor(
        uint256 _amount,
        uint256 _interest,
        uint256 _duration,
        address payable _borrower,
        address payable _lender
    ) public {
        amount = _amount;
        interest = _interest;
        duration = _duration;
        borrower = _borrower;
        lender = _lender;
    }

    function fund() external payable {
        require(msg.sender == lender, "Only lender can lend");
        require(
            address(this).balance == amount,
            "Can only lend the required amount"
        );
        _transitionTo(State.ACTIVE);
        borrower.transfer(amount);
    }

    function reimburse() external payable {
        require(msg.sender == borrower, "Only borrower can reimburse");
        require(
            msg.value == amount + interest,
            "Borrower must reimburse exact amount w/ interest"
        );
        _transitionTo(State.CLOSED);
        lender.transfer(amount + interest);
    }

    function _transitionTo(State to) internal {
        require(to != State.PENDING, "Cannot go back to PENDING state");
        require(to != state, "Cannot transition to current state");
        if (to == State.ACTIVE) {
            require(
                state == State.PENDING,
                "Can only transition to ACTIVE from PENDING state"
            );
            state = State.ACTIVE;
            end = now + duration;
        }
        if (to == State.CLOSED) {
            require(
                state == State.ACTIVE,
                "Can only transition to CLOSED from ACTIVE state"
            );
            require(now >= end, "Loan has not matured yet");
            state = State.CLOSED;
        }
    }
}
