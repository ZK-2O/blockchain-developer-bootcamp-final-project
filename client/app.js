//console.log("I'm here");

const contractAddress = "0xb69278ae3c2fa3a7a9c7879f2a58d0d73129b8b7";
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_deadline",
				"type": "uint256"
			}
		],
		"name": "addNewGoal",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "goalID",
				"type": "uint256"
			}
		],
		"name": "GoalAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "goalOwner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "GoalAmountReturnedToSender",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "goalID",
				"type": "uint256"
			}
		],
		"name": "GoalCompleted",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_goalId",
				"type": "uint256"
			}
		],
		"name": "markGoalAsComplete",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "owner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "amountWithdrawn",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getAvailableWithdrawAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "withdrawAmount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_goalId",
				"type": "uint256"
			}
		],
		"name": "getMyGoalById",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "completedTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "bool",
				"name": "completed",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getMyGoals",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "myGoals",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let alertPlaceholder = document.getElementById('notification-bar')
let walletConnected = false;


//#region Functions

//#region Check Functions

function isWalletConnected() {
    if (ethereum.selectedAddress == null)
        return false;
    else
        return true;
}

function walletConnectionState() {
    if(walletConnected)
        return true;
    else
        return false;
}

function isMetamaskAvailable() {
    if (typeof window.ethereum !== 'undefined')
        return true;
    else
        return false;
}

function isCorrectChain() {
    if (ethereum.chainId == "0x3")
    {
        return true;
    }

    return false;
}

//#endregion

//#region Perform Actions

async function connectWallet() {
    if (isWalletConnected())
    {
        if (!isCorrectChain())
        {
            updateAlert("Please connect to Ropsten", "danger");
            return false;
        }

        updateConnectionStatus(true);

        //Show the forms
        toggleAddGoalForm(true);
        toggleGoalListForm(true);
        toggleAdminForm(true);

        return true;
    }
    else
    {
        await ethereum.request({method: "eth_requestAccounts"});

        if (!isCorrectChain())
        {
            updateAlert("Please connect to Ropsten", "danger");
            return false;
        }

        updateConnectionStatus(true);
        
        //Show the forms
        toggleAddGoalForm(true);
        toggleGoalListForm(true);
        toggleAdminForm(true);

        return true;
    }
}

async function disconnectWallet() {
    updateConnectionStatus(false);

    //Hide the forms
    toggleAddGoalForm(false);
    toggleGoalListForm(false);
    toggleAdminForm(false);
}

async function toggleWalletConnection() {
    if (isMetamaskAvailable())
    {
        if (walletConnectionState())
        {
            disconnectWallet();
        }
        else
        {
            connectWallet();
        }
    }
    else
    {
        updateAlert("Metamask not found. Please install it to use this dApp!", "danger");
    }
}

function toggleAddGoalForm(show) {
    let addGoalForm = this.document.getElementById("addGoalForm");

    if (show)
    {
        addGoalForm.classList.remove("collapse");
        let epochTime = parseInt(new Date().getTime() / 1000);

        let deadline = this.document.getElementById("deadline");
        deadline.placeholder = epochTime;

    }
    else
        addGoalForm.classList.add("collapse");
}

async function toggleGoalListForm(show) {

    let goalListForm = this.document.getElementById("GoalListForm");
    
    if (show)
    {
        removeGoalList();
        goalListForm.classList.remove("collapse");
        getMyGoals();
        
    }
    else
    {
        goalListForm.classList.add("collapse");
    }
}

async function toggleAdminForm(show) {
    let contractOwnerOnlyDiv = this.document.getElementById("contractOwnerOnlyDiv");
    let withdrawEthLabel = this.document.getElementById("withdrawEthLabel");
    
    if (show)
    {
        var web3 = new Web3(window.ethereum);
        const ethGoals = new web3.eth.Contract(contractABI, contractAddress);
        ethGoals.setProvider(window.ethereum);

        const ownerAddress = await ethGoals.methods.owner().call();
        console.log(ownerAddress);

        if (ethereum.selectedAddress.toLowerCase() == ownerAddress.toLowerCase())
        {
            const withdrawableAmount = await ethGoals.methods.getAvailableWithdrawAmount().call({from: ethereum.selectedAddress});
            console.log(withdrawableAmount);

            withdrawEthLabel.innerHTML = `Available ETH to withdraw: ${parseFloat(web3.utils.fromWei(withdrawableAmount.toString())).toFixed(2)} ETH`;
            contractOwnerOnlyDiv.classList.remove("collapse");
        }
        else
        {
            withdrawEthLabel.innerHTML = "";
            contractOwnerOnlyDiv.classList.add("collapse");
        }
    }
    else
    {
        contractOwnerOnlyDiv.classList.add("collapse");
    }
}

//#endregion

//#region Update Elements Functions

function updateAlert(message, type) {
    var wrapper = document.createElement('div')
    wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert"><strong>' + message + '</strong><button type="button" data-bs-dismiss="alert" class="btn-close" aria-label="Close"></button></div>'

    alertPlaceholder.append(wrapper)
}

async function updateConnectionStatus(connect) {
    let mmBtn = this.document.getElementById("mm-connect");

    if (connect)
    {
        let web3 = new Web3(window.ethereum);
        let bal = parseFloat(web3.utils.fromWei(await web3.eth.getBalance(ethereum.selectedAddress))).toFixed(2);

        console.log(`Selected address ${ethereum.selectedAddress}`);
        mmBtn.textContent = "Disconnect"
        mmBtn.classList.remove("btn-outline-dark");
        mmBtn.classList.add("btn-dark");
        
        //Show wallet address
        let walletText = this.document.getElementById("wallet-address");
        walletText.innerHTML = ethereum.selectedAddress.slice(0,6) + "..." + ethereum.selectedAddress.slice(38,42);

        //Show wallet balance
        let walletBalance = this.document.getElementById("wallet-balance");
        walletBalance.innerHTML = `${bal} ETH`;

        let walletBalanceDiv = this.document.getElementById("wallet-balance-div");
        walletBalanceDiv.classList.remove("collapse");

        walletConnected = true;
    }
    else
    {
        console.log(`Disconnected`);
        mmBtn.textContent = "Connect Wallet"
        mmBtn.classList.add("btn-outline-dark");
        mmBtn.classList.remove("btn-dark");
        
        //Hide wallet address
        let walletText = this.document.getElementById("wallet-address");
        walletText.innerHTML = "";

        //Hide wallet balance
        let walletBalance = this.document.getElementById("wallet-balance");
        walletBalance.innerHTML = "";

        let walletBalanceDiv = this.document.getElementById("wallet-balance-div");
        walletBalanceDiv.classList.add("collapse");
        
        walletConnected = false;
    }
}

function buttonSpinner(enable, buttonId, spinnerId) {
    let btn = document.getElementById(buttonId);
    let spinner = document.getElementById(spinnerId);
    
    if (enable)
    {
        btn.setAttribute('disabled','');
        spinner.classList.remove("collapse");
    }
    else
    {
        btn.removeAttribute('disabled');
        spinner.classList.add("collapse");
    }
}

//#endregion

//#region Helper Functions

function getEpochTime(num) {
    let epochTime = parseInt(new Date().getTime() / 1000) + num;

    let deadline = this.document.getElementById("deadline");
    deadline.value = epochTime;
}

function resetAllFields()
{
    //This function should reset all fields on the page
    document.getElementById("addGoalFormElement").reset();
    document.getElementById("GoalListForm").reset();
    //removeGoalList();
}

async function removeGoalList() {
    var options = document.querySelectorAll('#userGoalsDropDown option');
    options.forEach(o => o.remove());
}

function enableToolTips() {
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));

    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });
}

//#endregion

//#region Contract Interaction Functions

async function getMyGoals() {
    var web3 = new Web3(window.ethereum);
    const ethGoals = new web3.eth.Contract(contractABI, contractAddress);
    ethGoals.setProvider(window.ethereum);

    var myGoals = await ethGoals.methods.getMyGoals().call({from: ethereum.selectedAddress});
    if (myGoals)
    {
        console.log(myGoals);
        var userGoalsDropDown = document.getElementById("userGoalsDropDown");

        for(var i = 0; i <= myGoals.length; i++) 
        {
            if (i == 0)
            {
                var option = document.createElement('option');

                option.text = "Select a goal"
                option.value = 0;
                userGoalsDropDown.add(option);
                continue;
            }
            
            var goalDetails = await ethGoals.methods.getMyGoalById(myGoals[i - 1]).call({from: ethereum.selectedAddress});

            if (!goalDetails.completed)
            {
                var tempDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
                tempDate.setUTCSeconds(goalDetails.deadline);

                var option = document.createElement('option');

                if (i == 0)
                {
                    option.text = "Select a goal"
                    option.value = 0;
                    userGoalsDropDown.add(option);
                }
                else
                {
                    option.text = `${goalDetails.description} (${parseFloat(web3.utils.fromWei(goalDetails.amount)).toFixed(3)} ETH)`;
                    option.value = parseInt(myGoals[i - 1]);
                    userGoalsDropDown.add(option);
                }
            }
        }
    }
}

async function submitNewGoal() {
    var web3 = new Web3(window.ethereum);
    const ethGoals = new web3.eth.Contract(contractABI, contractAddress);
    ethGoals.setProvider(window.ethereum);

    let goalDescription = document.getElementById('goalDescription').value.trim();
    let deadline = parseInt(document.getElementById('deadline').value.trim());
    let ethAmount = document.getElementById('ethAmount').value.trim();

    if (validateSubmitGoalParameters(goalDescription, deadline, ethAmount))
    {
        buttonSpinner(true, "submitGoal", "submitGoalSpinner");

        ethGoals.methods.addNewGoal(goalDescription, deadline).send({from: ethereum.selectedAddress, value: web3.utils.toWei(ethAmount)}).then(tx => {
            console.log(tx);

            updateAlert(`Goal Submitted! <a href="https://ropsten.etherscan.io/tx/${tx.transactionHash}" target="_blank">View Tx</a>`, "success")
            console.log(`Tx: ${JSON.stringify(tx)}`);
            
            resetAllFields();
            buttonSpinner(false, "submitGoal", "submitGoalSpinner");

        }).catch(e => {
            if (e.code === 4001){
                buttonSpinner(false, "submitGoal", "submitGoalSpinner");
            }
            else
            {
                console.log(e);

                //Parse out just the JSON string from the error message (this is the tx object)
                let err = JSON.parse(e.message.slice(e.message.indexOf('{')))
                console.log(err);

                updateAlert(`Goal Submission failed! <a href="https://ropsten.etherscan.io/tx/${err.transactionHash}" target="_blank">View Tx</a>`, "danger")

                buttonSpinner(false, "submitGoal", "submitGoalSpinner");
            }
       });;

    }
    else
    {
        console.log("Validate New Goal input!");
    }
}

async function markGoalComplete() {
    var web3 = new Web3(window.ethereum);
    const ethGoals = new web3.eth.Contract(contractABI, contractAddress);
    ethGoals.setProvider(window.ethereum);

    // document.getElementById("userGoalsDropDown").options.selectedIndex
    var userGoals = document.getElementById("userGoalsDropDown");

    var goalId = parseInt(userGoals.options[userGoals.options.selectedIndex].value);
    console.log(goalId);

    if (goalId > 0)
    {
        buttonSpinner(true, "submitGoalCompletion", "submitGoalCompletionSpinner");

        ethGoals.methods.markGoalAsComplete(goalId).send({from: ethereum.selectedAddress}).then(tx => {
            console.log(tx);

            updateAlert(`Goal completed! <a href="https://ropsten.etherscan.io/tx/${tx.transactionHash}" target="_blank">View Tx</a>`, "success")
            console.log(`Tx: ${JSON.stringify(tx)}`);

            buttonSpinner(false, "submitGoalCompletion", "submitGoalCompletionSpinner");
            toggleGoalListForm(true);

        }).catch(e => {
            if (e.code === 4001){
                buttonSpinner(false, "submitGoalCompletion", "submitGoalCompletionSpinner");
            }
            else
            {
                console.log(e);

                //Parse out just the JSON string from the error message (this is the tx object)
                let err = JSON.parse(e.message.slice(e.message.indexOf('{')))
                console.log(err);

                updateAlert(`Goal could not be marked as complete! <a href="https://ropsten.etherscan.io/tx/${err.transactionHash}" target="_blank">View Tx</a>`, "danger")

                buttonSpinner(false, "submitGoalCompletion", "submitGoalCompletionSpinner");
            }
        });
    }
}

async function withdraw() {
    var web3 = new Web3(window.ethereum);
    const ethGoals = new web3.eth.Contract(contractABI, contractAddress);
    ethGoals.setProvider(window.ethereum);

    const ownerAddress = await ethGoals.methods.owner().call();
    const withdrawableAmount = await ethGoals.methods.getAvailableWithdrawAmount().call({from: ethereum.selectedAddress});

    console.log(ownerAddress);
    console.log(withdrawableAmount);

    if (ownerAddress.toLowerCase() == ethereum.selectedAddress.toLowerCase())
    {
        if (parseFloat(withdrawableAmount) > 0)
        {
            buttonSpinner(true, "withdrawEth", "withdrawEthSpinner");

            await ethGoals.methods.withdraw().send({from: ethereum.selectedAddress}).then(tx => {
                console.log(tx);

                updateAlert(`ETH Withdrawn by contract owner! <a href="https://ropsten.etherscan.io/tx/${tx.transactionHash}" target="_blank">View Tx</a>`, "success")
                console.log(`Tx: ${JSON.stringify(tx)}`);
                
                buttonSpinner(false, "withdrawEth", "withdrawEthSpinner");
                toggleGoalListForm(true);

            }).catch(e => {
                if (e.code === 4001){
                    buttonSpinner(false, "withdrawEth", "withdrawEthSpinner");
                }
                else if (e)
                {
                    console.log(e);

                    //Parse out just the JSON string from the error message (this is the tx object)
                    let err = JSON.parse(e.message.slice(e.message.indexOf('{')))
                    console.log(err);   

                    updateAlert(`ETH could not be withdrawn! <a href="https://ropsten.etherscan.io/tx/${err.transactionHash}" target="_blank">View Tx</a>`, "danger")

                    buttonSpinner(false, "withdrawEth", "withdrawEthSpinner");
                }
            });;
        }
        else
        {
            updateAlert("There needs to be unlocked ETH in the wallet to withdraw!", "danger");
        }
    }
    else
    {
        console.log("Only owner can withdraw!");
    }
}

//#endregion

//#region Validation Functions

function validateSubmitGoalParameters(_description, _deadline, _ethAmount) {
    let goalDescription = document.getElementById('goalDescription');
    let deadline = document.getElementById('deadline');
    let ethAmount = document.getElementById('ethAmount');

    let goalDescriptionFB = document.getElementById('goalDescriptionFeedback');
    let deadlineFB = document.getElementById('deadlineFeedback');
    let ethAmountFB = document.getElementById('ethAmountFeedback');

    let addGoalFormElement = document.getElementById('addGoalFormElement');

    let epochTime = parseInt(new Date().getTime() / 1000);
    let returnVal = true;

    if (goalDescription.value.trim() == "")
    {
        goalDescriptionFB.style.display = 'block';
        returnVal = false;
    }
    else
    {
        goalDescriptionFB.style.display = 'none';
    }

    if (parseFloat(deadline.value.trim()) >= (epochTime + 0))
    {
        deadlineFB.style.display = 'none';
    }
    else
    {
        deadlineFB.style.display = 'block';
        returnVal = false;
    }

    if (ethAmount.value.trim() == "" || parseFloat(ethAmount.value.trim()) < 0.01)
    {
        ethAmountFB.style.display = 'block';
        returnVal = false;
    }
    else
    {
        ethAmountFB.style.display = 'none';
    }


    //addGoalFormElement.classList.add('was-validated');

    return returnVal;
}

//#endregion

//#endregion


window.addEventListener('load', async () => { 

    //Enable tooltips
    enableToolTips();

    //Check for Metamask
    if (!isMetamaskAvailable()) {
        console.log("Metamask is NOT present");
        updateAlert("Metamask not found. Please install it to use this dApp!", "danger");
        return;
    }
    else
    {
        ethereum.on('chainChanged', (chainId) => {
            window.location.reload();
        });

        ethereum.on('accountsChanged', (accounts) => {
            connectWallet();
        });
    }
});