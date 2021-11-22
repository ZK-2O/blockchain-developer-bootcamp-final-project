const { catchRevert } = require("./exceptionsHelpers.js");
const ETHGoals = artifacts.require("ETHGoals");


contract("ETHGoals", function (accounts) {
  const [contractOwner, alice, bob, carol, denver] = accounts;

  beforeEach(async () => {
    instance = await ETHGoals.new();
  });


  it("contract is deployed", async function () {
    await ETHGoals.deployed();
    return assert.isTrue(true);
  });


  it("is owned by owner", async () => {
    assert.equal(
      await instance.owner.call(),
      contractOwner,
      "owner is not correct",
    );
  });


  it("should be able to add new goals", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 120; //2 minutes in the future
    const goalDeposit = web3.utils.toWei("0.5");
    
    await instance.addNewGoal("Alice's first goal", currentEpochTime, { from: alice, value: goalDeposit });

    const aliceGoals = await instance.getMyGoals({ from: alice });
    const firstGoal = await instance.getMyGoalById(aliceGoals[0], { from: alice });

    assert.isTrue(
      firstGoal.description === "Alice's first goal",
      true,
      "First goal is incorrect"
    );
  });


  it("should be able to mark goals as completed", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 120; //2 minutes in the future
    const goalDeposit = web3.utils.toWei("0.5");

    //Add a new goal
    await instance.addNewGoal("Alice's first goal", currentEpochTime, { from: alice, value: goalDeposit });   

    //Get all goals for Alice (should only be one goal at this point)
    const aliceGoal = await instance.getMyGoals({ from: alice });

    //Mark the goal completed using the goal ID (which is the value of aliceGoal)
    await instance.markGoalAsComplete(aliceGoal[0], { from: alice });

    //Get the goal details using the goal ID
    const goalDetails = await instance.getMyGoalById(aliceGoal[0], { from: alice });

    //Check to make sure the "completed" property for the goal is set to true
    assert.equal(
      goalDetails.completed,
      true,
      "unable to mark goal as completed"
    );
  });


  it("should not be able to mark goals as completed more than once", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 120; //2 minutes in the future
    const goalDeposit = web3.utils.toWei("0.5");

    //Add a new goal
    await instance.addNewGoal("Alice's first goal", currentEpochTime, { from: alice, value: goalDeposit });   

    //Get all goals for Alice (should only be one goal at this point)
    const aliceGoal = await instance.getMyGoals({ from: alice });

    //Mark the goal completed using the goal ID (which is the value of aliceGoal)
    await instance.markGoalAsComplete(aliceGoal[0], { from: alice });

    //Try marking the goal as complete again, this should fail
    await catchRevert(instance.markGoalAsComplete(aliceGoal[0], { from: alice }));
  });


  it("should not be able to create a goal with a deadline in the past", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) - 120; //2 minutes in the past
    const goalDeposit = web3.utils.toWei("0.5");
    
    await catchRevert(instance.addNewGoal("Alice's first goal", currentEpochTime, { from: alice, value: goalDeposit }));
  });


  it("should return full ETH amount when goal is marked as complete before the deadline ", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 120; //2 minutes in the future
    const goalDeposit = web3.utils.toWei("0.5");
    const expectedReturnAmount = web3.utils.toWei("0.5");

    //Add a new goal for Bob
    await instance.addNewGoal("Bob's first goal", currentEpochTime, { from: bob, value: goalDeposit });   

    //Get Bob's goals
    const bobGoal = await instance.getMyGoals({ from: bob });
    
    //Mark Bob's goal as completed and stored the tx receipt
    const tx = await instance.markGoalAsComplete(bobGoal[0], { from: bob });

    const goalOwner = tx.logs[1].args.goalOwner;
    const amountReturned = tx.logs[1].args.amount.toString();;

    const expectedEventResult = {
      accountAddress: bob,
      amountReturned: expectedReturnAmount
    };

    assert.equal(
      expectedEventResult.accountAddress,
      goalOwner,
      "markGoalAsComplete - incorrect goal owner returned",
    );

    assert.equal(
      expectedEventResult.amountReturned,
      amountReturned,
      "markGoalAsComplete - incorrect goal amount returned",
    );
  });


  it("should return 50% of ETH amount when goal is marked as complete after the deadline ", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 5; //5 seconds in the future
    const goalDeposit = web3.utils.toWei("0.5");
    const expectedReturnAmount = web3.utils.toWei("0.25");

    //Add a new goal for Carol
    await instance.addNewGoal("Carol's first goal", currentEpochTime, { from: carol, value: goalDeposit });   

    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(6000); //Wait for 6 seconds

    //Get Carol's goals
    const carolGoal = await instance.getMyGoals({ from: carol });
    
    //Mark Carol's goal as completed and stored the tx receipt
    const tx = await instance.markGoalAsComplete(carolGoal[0], { from: carol });

    const goalOwner = tx.logs[1].args.goalOwner;
    const amountReturned = tx.logs[1].args.amount.toString();;

    const expectedEventResult = {
      accountAddress: carol,
      amountReturned: expectedReturnAmount
    };

    assert.equal(
      expectedEventResult.accountAddress,
      goalOwner,
      "markGoalAsComplete - incorrect goal owner returned",
    );

    assert.equal(
      expectedEventResult.amountReturned,
      amountReturned,
      "markGoalAsComplete - incorrect goal amount returned",
    );
  });


  it("should allow owner to withdraw ETH in the contract", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 5; //5 seconds in the future
    const goalDeposit = web3.utils.toWei("0.5");
    const expectedWithdrawAmount = web3.utils.toWei("0.25");

    //Add a new goal for Carol
    await instance.addNewGoal("Carol's first goal", currentEpochTime, { from: carol, value: goalDeposit });
    await instance.addNewGoal("Carol's second goal", currentEpochTime, { from: carol, value: goalDeposit });

    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(6000); //Wait for 6 seconds

    //Get Carol's goals
    const carolGoal = await instance.getMyGoals({ from: carol });
    
    //Mark Carol's goal as completed and stored the tx receipt - will only return 0.25 to Carol
    await instance.markGoalAsComplete(carolGoal[0], { from: carol });

    //At this point, the contract will have 0.75 ETH remaining. 0.5 of which is locked in goal 2 still so the owner
    //should only be able to withdraw 0.25 ETH
    const availableWithdrawAmount = await instance.getAvailableWithdrawAmount({ from: contractOwner });

    assert.equal(
      availableWithdrawAmount.toString(),
      expectedWithdrawAmount,
      "getAvailableWithdrawAmount did not return expected withdraw amount"
    );

    //Call the withdraw function using the contractOwner account
    const tx = await instance.withdraw({ from: contractOwner });

    const cOwner = tx.logs[0].args.owner;
    const amountWithdrawn = tx.logs[0].args.amount.toString();;

    const expectedEventResult = {
      accountAddress: contractOwner,
      amountWithdrawn: expectedWithdrawAmount
    };

    assert.equal(
      expectedEventResult.accountAddress,
      cOwner,
      "withdraw - incorrect contract owner returned",
    );

    assert.equal(
      expectedEventResult.amountWithdrawn,
      amountWithdrawn,
      "withdraw - incorrect amount withdrawn",
    );
  });


  it("should not allow anyone other than the contract owner to call withdraw function", async () => {
    await catchRevert(instance.withdraw({ from: alice }));
  });


  it("should not be allowed to retrieve another user's goals", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 120; //2 minutes in the future
    const goalDeposit = web3.utils.toWei("0.5");

    //Add a new goal for Alice
    await instance.addNewGoal("Alice's first goal", currentEpochTime, { from: alice, value: goalDeposit });   
    await instance.addNewGoal("Bob's first goal", currentEpochTime, { from: bob, value: goalDeposit });   

    //Get all goals for Alice (should only be one goal at this point)
    const aliceGoal = await instance.getMyGoals({ from: alice });

    //Get all goals for Alice (should only be one goal at this point)
    const bobGoal = await instance.getMyGoals({ from: bob });

    //Attempt to get the info on Bob's goals from Alice
    await catchRevert(instance.getMyGoalById(bobGoal[0], { from: alice }));
  });


  it("should not be allowed to mark another user's goal as completed", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 120; //2 minutes in the future
    const goalDeposit = web3.utils.toWei("0.5");

    //Add a new goal for Alice
    await instance.addNewGoal("Alice's first goal", currentEpochTime, { from: alice, value: goalDeposit });   
    
    //Get all goals for Alice (should only be one goal at this point)
    const aliceGoal = await instance.getMyGoals({ from: alice });

    //Attempt to mark Alice's goal as completed using Bob's account
    await catchRevert(instance.getMyGoalById(aliceGoal[0], { from: bob }));
  });


  it("should not be allowed to create a goal with a goal amount of less than 0.01 ETH", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 120; //2 minutes in the future
    const goalDeposit = web3.utils.toWei("0.005");

    //Add a new goal for Alice
    await catchRevert(instance.addNewGoal("Alice's first goal", currentEpochTime, { from: alice, value: goalDeposit }));
  });
});