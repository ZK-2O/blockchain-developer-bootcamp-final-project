// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ETHGoals is Ownable {
    
    //Variables and structs
    uint private goalIdCounter = 0;
    uint private minGoalAmount = 0.01 ether;
    
    struct Goal {
        uint id;
        string description;
        //address payable accountabilityBuddy; //For future functionality
        uint amount;
        uint deadline;
        uint completedTimestamp;
        bool completed;
    }
    
    mapping(uint => address) private goalOwners;
    mapping(uint => Goal) private goals;
    mapping(address => uint[]) private userGoals;
    
    //Events
    event GoalAdded(uint indexed goadID);
    
    event GoalCompleted(uint indexed goalID);
    
    event GoalAmountReturnedToSender(uint indexed amount);
    
    
    
    //Modifiers
    modifier onlyGoalOwner(uint _goalId) {
        require(goalOwners[_goalId] == msg.sender, "Only the goal owner can make changes to the goal");
        _;
    }
    
    modifier minimumGoalAmount(uint _minGoalAmount) {
        //require(msg.value >= _minGoalAmount, string(abi.encodePacked("Must supply a minimum of ", Strings.toString(_minGoalAmount), " wei with your goal")));
        require(msg.value >= _minGoalAmount, "Please supply a minimum of 0.01 ETH with your goal");
        _;
    }
    
    modifier futureDeadlineOnly(uint _suppliedDeadline) {
        //Ideally, deadline should be more like 30-60 minutes in the future but keeping at greater than current timestamp for the purpose of quick testing of the project
        //require (_suppliedDeadline >= (block.timestamp + 1 hours), "Supplied deadline must be at least 1 hour in the future");
        require (_suppliedDeadline >= (block.timestamp), "Supplied deadline must be in the future");
        _;
    }
    
    //Functions
    
    constructor() {}
    
    /// @notice Adds a new goal with the specified description and deadline
    /// @param _description Description for the goal being created
    /// @param _deadline Deadline (epoch time) for the goal being created
    function addNewGoal (
            string memory _description,
            //address _accountabilityBuddy, //For future functionality
            uint _deadline
        ) public payable minimumGoalAmount(minGoalAmount) futureDeadlineOnly(_deadline) {
            
        //Increase the goalID counter
        goalIdCounter = goalIdCounter + 1;
        
        //create the new goal variable
        Goal memory newGoal = Goal({
            id: goalIdCounter,
            description: _description,
            //accountabilityBuddy: payable(_accountabilityBuddy), //For future functionality
            amount: msg.value,
            deadline: _deadline,
            completedTimestamp: 0,
            completed: false
        });
        
        goalOwners[goalIdCounter] = msg.sender;
        goals[goalIdCounter] = newGoal;
        userGoals[msg.sender].push(goalIdCounter);
        
        emit GoalAdded(goalIdCounter);
    }
    
    /// @notice Marks an existing goal of the sender as completed
    /// @param _goalId Goal ID for the goal that the user wants to mark as completed
    function markGoalAsComplete(
        uint _goalId
    ) public onlyGoalOwner(_goalId) {
        
        //NOTE: I could allow the user to specify exactly when they completed the goal instead of
        //      relying on the tx timestamp for it. However, this means a user could always say they completed the goal
        //      in time and always claim back the full amount.
        //      In the future, when the "accountability buddy" functionality is added, I could add the ability
        //      to specify the completion date manually so the accountability buddy can verify it before the amount is returned to the user.
        
        goals[_goalId].completed = true; //Mark goal as completed
        goals[_goalId].completedTimestamp = block.timestamp;
        emit GoalCompleted(_goalId);
        
        if (goals[_goalId].deadline >= block.timestamp)
        {
            payable(msg.sender).transfer(goals[_goalId].amount); //Return the amount deposited for the goal back to the owner
        }
        else
        {
            payable(msg.sender).transfer((goals[_goalId].amount / 2)); //Return half the amount deposited for the goal back to the owner because they completed the goal AFTER the deadline
        }
        
        emit GoalAmountReturnedToSender(goals[_goalId].amount);
    }
    
    /// @notice Retrieve the details for a goal based on the goal ID
    /// @param _goalId Goal ID for which the user wants to retrieve the details
    /// @return id Goal ID
    /// @return description Goal description
    /// return amount Goal amount
    /// return deadline Goal deadline
    /// return completedTimestamp Goal completion timestamp
    /// return completed Goal completion status
    function getMyGoalById(uint _goalId) public view onlyGoalOwner(_goalId) returns ( uint id, string memory description, /* address accountabilityBuddy //For future functionality, */ uint amount, uint deadline, uint completedTimestamp, bool completed) {
        Goal memory tempGoal = goals[_goalId];
        return (tempGoal.id, tempGoal.description, /* tempGoal.accountabilityBuddy //For future functionality, */ tempGoal.amount, tempGoal.deadline, tempGoal.completedTimestamp, tempGoal.completed);
    }
    
    /// @notice Retrieve all the goal IDs for the user calling the function
    /// @return myGoals Goal IDs for the user calling the function
    function getMyGoals() public view returns (uint[] memory myGoals) {
        myGoals = userGoals[msg.sender];
    }
    
    /*
    function addAccountabilityBuddyToGoal(uint _goalId, address accountabilityBuddy) public onlyGoalOwner(_goalId) {
        //Stretch goal functionality
    }
    
    function contributeAmountToGoal(uint _goalId) public payable minimumGoalAmount(minGoalAmount) {
        //Stretch goal functionality
    }
    
    function withdraw() public onlyOwner {
        //Stretch goal functionality - allow contract owner to claim the leftover ETH in the contract from whenever a user fails to meet their goal deadline and 
        //only gets half their goal amount back and the other half is kept in the contract
    }
    */
}
