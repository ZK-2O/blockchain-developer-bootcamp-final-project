const { catchRevert } = require("./exceptionsHelpers.js");
const ETHGoals = artifacts.require("ETHGoals");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
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


  it("should not be able to create a goal with a deadline in the past", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) - 120; //2 minutes in the past
    const goalDeposit = web3.utils.toWei("0.5");
    
    await catchRevert(instance.addNewGoal("Alice's first goal", currentEpochTime, { from: alice, value: goalDeposit }));
  });


  it("should return full ETH amount when goal is marked as complete before the deadline ", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 120; //2 minutes in the future
    const goalDeposit = web3.utils.toWei("0.5");

    //Add a new goal for Bob
    await instance.addNewGoal("Bob's first goal", currentEpochTime, { from: bob, value: goalDeposit });   

    //Get the balance after the goal is created - this will be used to calculate whether we get the full deposit back
    const balanceAfterGoalCreation = await web3.eth.getBalance(bob);

    //Get Bob's goals
    const bobGoal = await instance.getMyGoals({ from: bob });
    
    //Mark Bob's goal as completed and stored the tx receipt
    const tx = await instance.markGoalAsComplete(bobGoal[0], { from: bob });
    const txInfo = await web3.eth.getTransaction(tx.tx);

    //Calculate the total gas used in wei
    const totalGasUsed = tx.receipt.gasUsed * parseFloat(txInfo.gasPrice);

    //Get Bob's balance after the goal is marked completed
    const balanceAfterGoalCompletion = await web3.eth.getBalance(bob);

    //Calculate the total ETH returned (balanceAfterGoalCompletion + gasUsed in the second tx) - balanceAfterGoalCreation
    const ETHReturned = (parseFloat(web3.utils.fromWei(balanceAfterGoalCompletion.toString(), "ether")) + parseFloat(web3.utils.fromWei(totalGasUsed.toString(), "ether"))) - parseFloat(web3.utils.fromWei(balanceAfterGoalCreation.toString(), "ether"));

    //Check to make sure the full 0.5 ETH is returned
    assert.equal(
      ETHReturned,
      0.5,
      "did not receive the full goal amount back"
    );

  });


  it("should return 50% of ETH amount when goal is marked as complete after the deadline ", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 5; //2 minutes in the future
    const goalDeposit = web3.utils.toWei("0.5");

    //Add a new goal for Carol
    await instance.addNewGoal("Carol's first goal", currentEpochTime, { from: carol, value: goalDeposit });   

    const delay = ms => new Promise(res => setTimeout(res, ms));
    await delay(6000); //Wait for 6 seconds

    //Get the balance after the goal is created - this will be used to calculate whether we get the full deposit back
    const balanceAfterGoalCreation = await web3.eth.getBalance(carol);

    //Get Carol's goals
    const carolGoal = await instance.getMyGoals({ from: carol });
    
    //Mark Carol's goal as completed and stored the tx receipt
    const tx = await instance.markGoalAsComplete(carolGoal[0], { from: carol });
    const txInfo = await web3.eth.getTransaction(tx.tx);

    //Calculate the total gas used in wei
    const totalGasUsed = tx.receipt.gasUsed * parseFloat(txInfo.gasPrice);

    //Get Carol's balance after the goal is marked completed
    const balanceAfterGoalCompletion = await web3.eth.getBalance(carol);

    //Calculate the total ETH returned (balanceAfterGoalCompletion + gasUsed in the second tx) - balanceAfterGoalCreation
    const ETHReturned = (parseFloat(web3.utils.fromWei(balanceAfterGoalCompletion.toString(), "ether")) + parseFloat(web3.utils.fromWei(totalGasUsed.toString(), "ether"))) - parseFloat(web3.utils.fromWei(balanceAfterGoalCreation.toString(), "ether"));

    //Check to make sure that only 0.25 ETH (50% of the original deposited amount) is returned
    assert.equal(
      ETHReturned,
      0.25,
      "did not receive 50% of the goal amount back"
    );
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
