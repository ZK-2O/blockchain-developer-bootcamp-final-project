console.log("I'm here");
let metamaskAvailable = false;
let alertPlaceholder = document.getElementById('notification-bar')
let walletConnected = false;


//#region Functions
//await ethereum.request({method: "eth_requestAccounts"});

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

async function connectWallet() {
    if (isWalletConnected())
    {
        if (!isCorrectChain())
        {
            updateAlert("Please connect to Ropsten", "danger");
            return false;
        }

        updateConnectionStatus(true);
        showAddGoalForm();
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
        showAddGoalForm();
        return true;
    }
}

function updateAlert(message, type) {
    var wrapper = document.createElement('div')
    wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert"><strong>' + message + '</strong><button type="button" data-bs-dismiss="alert" class="btn-close" aria-label="Close"></button></div>'
  
    alertPlaceholder.append(wrapper)
  }

function updateStatusOnChainChange() {
    if (!isCorrectChain()) {
        updateAlert("Please connect to Ropsten", "danger");
    }
    else
    {
        updateAlert("Connected to Ropsten", "success");
    }
}

async function updateConnectionStatus(connect) {
    let mmBtn = this.document.getElementById("mm-connect");

    if (connect)
    {
        console.log(`Selected address ${ethereum.selectedAddress}`);
        mmBtn.textContent = "Disconnect"
        mmBtn.classList.remove("btn-outline-dark");
        mmBtn.classList.add("btn-success");
        
        let walletText = this.document.getElementById("wallet-address");
        walletText.innerHTML = ethereum.selectedAddress.slice(0,6) + "..." + ethereum.selectedAddress.slice(38,42);
        walletConnected = true;
    }
    else
    {
        console.log(`Disconnected`);
        mmBtn.textContent = "Connect Wallet"
        mmBtn.classList.add("btn-outline-dark");
        mmBtn.classList.remove("btn-success");
        
        let walletText = this.document.getElementById("wallet-address");
        walletText.innerHTML = "";
        walletConnected = false;
    }
}

async function disconnectWallet() {
    updateConnectionStatus(false);
    hideAddGoalForm();
}

function showAddGoalForm() {
    let addGoalForm = this.document.getElementById("addGoalForm");
    addGoalForm.classList.remove("collapse");
}

function hideAddGoalForm() {
    let addGoalForm = this.document.getElementById("addGoalForm");
    addGoalForm.classList.add("collapse");
}


//#endregion
window.addEventListener('load', async () => { 
    if (!isMetamaskAvailable()) {
        console.log("Metamask is NOT present");
        updateAlert("Metamask not found. Please install it to use this dApp!", "danger");
        return;
    }
});

let mmBtn = this.document.getElementById("mm-connect");
mmBtn.onclick = async () => {
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
