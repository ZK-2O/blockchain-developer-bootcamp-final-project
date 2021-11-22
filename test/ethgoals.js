let BN = web3.utils.BN;
const ETHGoals = artifacts.require("ETHGoals");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("ETHGoals", function (accounts) {
  const [contractOwner, alice, bob] = accounts;

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

  it("user Alice can add new goals", async () => {
    const currentEpochTime = Math.floor(new Date().getTime() / 1000) + 120; //2 minutes in the future
    const goalDeposit = web3.utils.toWei("0.5");
    const goalDeposit2 = web3.utils.toWei("1.5");

    await instance.addNewGoal("Alice's first goal", currentEpochTime, { from: alice, value: goalDeposit });
    await instance.addNewGoal("Alice's second goal", currentEpochTime, { from: alice, value: goalDeposit2 });
    
    const aliceGoals = await instance.getMyGoals({ from: alice });

    assert.isTrue(
      aliceGoals.length == 2,
      true,
      "Two goals should have been added for Alice but they aren't"
    );

    const firstGoal = await instance.getMyGoalById(aliceGoals[0], { from: alice });
    const secondGoal = await instance.getMyGoalById(aliceGoals[1], { from: alice });

    console.log(`ID: ${firstGoal.id}, Description: ${firstGoal.description}, Amount: ${web3.utils.fromWei(firstGoal.amount)}`);
    console.log(`ID: ${secondGoal.id}, Description: ${secondGoal.description}, Amount: ${web3.utils.fromWei(secondGoal.amount)}`);

    assert.isTrue(
      firstGoal.description === "Alice's first goal",
      true,
      "First goal is incorrect"
    );

    assert.isTrue(
      secondGoal.description === "Alice's second goal",
      true,
      "Second goal is incorrect"
    );
  });


});
