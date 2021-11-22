# Design patterns used

## Inter-Contract Execution

- `owner()` function from the OpenZeppelin `Ownable` contract is called to retrieve the contract owner address in the `withdraw()` function.

## Inheritance and Interfaces

- `ETHGoals` contract inherits the OpenZeppelin `Ownable` contract to enable ownership of the contract.

## Access Control Design Patterns

- `Ownable` design pattern used in the `withdraw()` and `getAvailableWithdrawAmount()` functions to ensure only the owner can withdraw the avaialable (unlocked) amount in the contract.