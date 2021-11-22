# Contract security measures

## SWC-103 (Floating pragma)

Specific compiler pragma `0.8.0` used in contracts to avoid accidental bug inclusion through outdated compiler versions.

## SWC-105 (Unprotected Ether Withdrawal)

The `withdraw` function is protected with OpenZeppelin's `onlyOwner` modifier in the `Ownable`.

## SWC-104 (Unchecked Call Return Value)

The `markGoalAsComplete` function and `withdraw` function both require the return value to be true when transferring ETH.

## SWC-111 (Use of Deprecated Solidity Functions)

No use of deprecated Solidity Functions in this project


## Modifiers used only for validation

All modifiers in the ETHGoals contract only validate data using `require`.

## Pull over push

All functions that modify state are based on receiving calls instead of making contract calls.