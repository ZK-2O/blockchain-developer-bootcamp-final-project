// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/// @title Contract for Goals dApp
/// @author Keith
/// @notice Allows a user to set goals with monetary value (ETH) attached to them, which they get back when they complete the goal in time
/// @dev All implemented functions should have no side effects. Functions related to future functionality are commented out
contract ETHGoals is Ownable {
    
    //Variables and structs

    /// @dev Used to assign an incrementing numeric ID to each goal added by a user
    uint private goalIdCounter = 0;

    /// @dev Minimum Goal amount that must be attached to a goal
    uint private minGoalAmount = 0.01 ether;

    /// @dev Used to track how much of the balance in the contract belongs to active (incomplete) goals
    ///      The difference between the balance and this amount is what the contract owner should be allowed to withdraw   
    uint private lockedGoalAmount = 0;
    
    struct Goal {
        uint id;
        string description;
        //address payable accountabilityBuddy; //For future functionality
        uint amount;
        uint deadline;
        uint completedTimestamp;
        bool completed;
    }
    
    /// @dev Lists the goal owner for a given Goal ID
    mapping(uint => address) private goalOwners;

    /// @dev Goal is the struct created with attributes related to a goal
    mapping(uint => Goal) private goals;

    /// @dev Lists all the goals for a given address
    mapping(address => uint[]) private userGoals;
    
    //Events

    /// @notice Emitted when a new goal is created
    /// @param goalID Goal ID
    event GoalAdded(uint indexed goalID);

    /// @notice Emitted when an existing goal is marked as completed by the goal owner
    /// @param goalID Goal ID
    event GoalCompleted(uint indexed goalID);

    /// @notice Emitted when the owner of a goal is returned the amount of ETH deposited for a goal
    /// @param goalOwner Goal Owner address
    /// @param amount Amount of ETH returned to the owner
    event GoalAmountReturnedToSender(address indexed goalOwner, uint amount);

    /// @notice Emitted when the contract owner withdraws the withdrawable ETH from the contract
    /// @param owner Contract Owner address
    /// @param amount Amount of ETH transferred to the contract owner
    event amountWithdrawn(address indexed owner, uint amount);
    

    //Modifiers

    /// @notice Ensures only the owner of the given Goal ID is able to retrieve the details or make changes to their goals
    /// @param _goalId Goal ID
    modifier onlyGoalOwner(uint _goalId) {
        require(goalOwners[_goalId] == msg.sender, "Only the goal owner can retrieve or make changes to their goals");
        _;
    }
    
    /// @notice Ensures the specified minimum goal amount is sent with a goal creation request
    /// @param _minGoalAmount Minimum Goal amount
    modifier minimumGoalAmount(uint _minGoalAmount) {
        //require(msg.value >= _minGoalAmount, string(abi.encodePacked("Must supply a minimum of ", Strings.toString(_minGoalAmount), " wei with your goal")));
        require(msg.value >= _minGoalAmount, "Please supply a minimum of 0.01 ETH with your goal");
        _;
    }

    /// @notice Ensures the description for the goal is not an empty string
    /// @param _description Goal description
    modifier notEmptyDescription(string memory _description) {
        require(bytes(_description).length > 0, "Goal description cannot be empty");
        _;
    }
    
    /// @notice Ensures that the deadline date supplied for the goal is in the future
    /// @param _suppliedDeadline Supplied deadline in Unix epoch time
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
        ) public payable minimumGoalAmount(minGoalAmount) futureDeadlineOnly(_deadline) notEmptyDescription(_description) {
            
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
        
        lockedGoalAmount += msg.value;

        goalOwners[goalIdCounter] = msg.sender;
        goals[goalIdCounter] = newGoal;
        userGoals[msg.sender].push(goalIdCounter);
        
        emit GoalAdded(goalIdCounter);
    }
    
    /// @notice Marks an existing goal of the sender as completed
    /// @param _goalId Goal ID for the goal that the user wants to mark as completed
    /// @dev I could allow the user to specify exactly when they completed the goal instead of
    ///      relying on the tx timestamp for it. However, this means a user could always say they completed the goal
    ///      in time and always claim back the full amount.
    ///      In the future, when the "accountability buddy" functionality is added, I could add the ability
    ///      to specify the completion date manually so the accountability buddy can verify it before the amount is returned to the user.
    ///      This would remove the dependency on the block.timestamp
    function markGoalAsComplete(
        uint _goalId
    ) public onlyGoalOwner(_goalId) {
        
        
        
        //Goal has to be incomplete to be marked as completed
        require(goals[_goalId].completed == false, "Goal is already marked as complete");

        uint goalAmount = goals[_goalId].amount;
        goals[_goalId].amount = 0;

        goals[_goalId].completed = true; //Mark goal as completed
        goals[_goalId].completedTimestamp = block.timestamp;   

        emit GoalCompleted(_goalId);  
        
        if (goals[_goalId].deadline >= block.timestamp)
        {
            lockedGoalAmount -= goalAmount;

            (bool success, ) = msg.sender.call{ value: (goalAmount) }(""); //Return the amount deposited for the goal back to the owner
            require(success, "Transfer failed.");
            emit GoalAmountReturnedToSender(msg.sender, goalAmount);
        }
        else
        {
            lockedGoalAmount -= goalAmount;                     //We subtract the whole amount instead of half because we want to allow the contract owner to withdraw the unlocked amount in the contract

            (bool success, ) = msg.sender.call{value: (goalAmount / 2)}(""); //Return half the amount deposited for the goal back to the owner because they completed the goal AFTER the deadline
            require(success, "Transfer failed.");
            emit GoalAmountReturnedToSender(msg.sender, (goalAmount / 2));
        }
    }
    
    /// @notice Retrieve the details for a goal based on the goal ID
    /// @param _goalId Goal ID for which the user wants to retrieve the details
    /// @return id Goal ID
    /// @return description - Goal description
    ///         amount - Goal amount
    ///         deadline - Goal deadline
    ///         completedTimestamp - Goal completion timestamp
    ///         completed - Goal completion status
    function getMyGoalById(uint _goalId) public view onlyGoalOwner(_goalId) returns ( uint id, string memory description, /* address accountabilityBuddy //For future functionality, */ uint amount, uint deadline, uint completedTimestamp, bool completed) {
        Goal memory tempGoal = goals[_goalId];
        return (tempGoal.id, tempGoal.description, /* tempGoal.accountabilityBuddy //For future functionality, */ tempGoal.amount, tempGoal.deadline, tempGoal.completedTimestamp, tempGoal.completed);
    }
    
    /// @notice Retrieve all the goal IDs for the user calling the function
    /// @return myGoals - Goal IDs for the user calling the function
    function getMyGoals() public view returns (uint[] memory myGoals) {
        myGoals = userGoals[msg.sender];
    }

    /// @notice Retrieve the avalable amount of ETH that the contract owner can withdraw from the contract
    /// @return withdrawAmount - amount of ETH that the contract owner can withdraw from the contract
    function getAvailableWithdrawAmount() public view onlyOwner returns (uint withdrawAmount) {
        withdrawAmount = address(this).balance - lockedGoalAmount;
    }

    /// @notice Allows the contract owner to withdraw the ETH stored in the contract (when users don't complete their goals in time and only 50% of their goal deposit is returned to them)
    function withdraw() external onlyOwner {
        //To ensure owner can only withdraw the amount of ETH in the contract that is not locked up in goals.
        uint withdrawAmount = address(this).balance - lockedGoalAmount;

        require(withdrawAmount > 0, "Amount being withdrawn must be greater than zero");
        require((address(this).balance - lockedGoalAmount) >= withdrawAmount, "Amount being withdrawn must be <= the balance in contract minus locked goal amount");

        address owner = owner();
        (bool success, ) = owner.call{ value: withdrawAmount }("");
        require(success, "Withdraw failed");

        emit amountWithdrawn(owner, withdrawAmount);
    }

    /*
    
    function addAccountabilityBuddyToGoal(uint _goalId, address accountabilityBuddy) public onlyGoalOwner(_goalId) {
        //Stretch goal functionality
    }
    
    function contributeAmountToGoal(uint _goalId) public payable minimumGoalAmount(minGoalAmount) {
        //Stretch goal functionality
    }
    
    */
}
