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

        var web3 = new Web3(window.ethereum);
        const ethGoals = new web3.eth.Contract(contractABI, contractAddress);
        ethGoals.setProvider(window.ethereum);

        const ownerAddress = await ethGoals.methods.owner().call();

        if (ethereum.selectedAddress == ownerAddress)
            toggleAdminForm(true);
        else
            toggleAdminForm(false);

        //Show the forms
        toggleAddGoalForm(true);
        toggleGoalListForm(true);

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

function toggleGoalListForm(show) {

    let goalListForm = this.document.getElementById("GoalListForm");
    
    if (show)
        goalListForm.classList.remove("collapse");
    else
        goalListForm.classList.add("collapse");
}

function toggleAdminForm(show) {
    let contractOwnerOnlyDiv = this.document.getElementById("contractOwnerOnlyDiv");

    if (show)
    {
        contractOwnerOnlyDiv.classList.remove("collapse");
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
        mmBtn.classList.add("btn-danger");
        
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
        mmBtn.classList.remove("btn-danger");
        
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

function submitButtonSpinner(enable) {
    let submitGoalBtn = document.getElementById('submitGoal');
    let submitGoalSpinner = document.getElementById('submitGoalSpinner');
    
    if (enable)
    {
        submitGoalBtn.setAttribute('disabled','');
        submitGoalSpinner.classList.remove("collapse");
    }
    else
    {
        submitGoalBtn.removeAttribute('disabled');
        submitGoalSpinner.classList.add("collapse");
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

    var myGoals = await ethGoals.methods.owner().call();
    console.log(`Contract Owner: ${myGoals}`);
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
        submitButtonSpinner(true);

        ethGoals.methods.addNewGoal(goalDescription, deadline).send({from: ethereum.selectedAddress, value: web3.utils.toWei(ethAmount)}).then(tx => {
            console.log(tx);

            updateAlert(`Goal Submitted! <a href="https://ropsten.etherscan.io/tx/${tx.transactionHash}" target="_blank">View Tx</a>`, "success")
            console.log(`Tx: ${JSON.stringify(tx)}`);
            
            resetAllFields();
            submitButtonSpinner(false);

        }).catch(e => {
            if (e.code === 4001){
                submitButtonSpinner(false);
            }
            else
            {
                console.log(e);

                //Parse out just the JSON string from the error message (this is the tx object)
                let err = JSON.parse(e.message.slice(e.message.indexOf('{')))
                console.log(err);

                updateAlert(`Goal Submission failed! <a href="https://ropsten.etherscan.io/tx/${err.transactionHash}" target="_blank">View Tx</a>`, "danger")

                submitButtonSpinner(false);
            }
       });;

    }
    else
    {
        console.log("Validate New Goal input!");
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

        getMyGoals();
    }
});