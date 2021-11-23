console.log("I'm here");
let metamaskAvailable = false;
let alertPlaceholder = document.getElementById('notification-bar')
let walletConnected = false;


//#region Functions

function updateAlert(message, type) {
    var wrapper = document.createElement('div')
    wrapper.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert"><strong>' + message + '</strong><button type="button" data-bs-dismiss="alert" class="btn-close" aria-label="Close"></button></div>'
  
    alertPlaceholder.append(wrapper)
  }

function updateStatusOnChainChange(_chainId) {
    if (_chainId !== "0x3") {
        updateAlert("Please connect to Ropsten", "danger");
    }
    else
    {
        updateAlert("Connected to Ropsten", "success");
    }
}

//#endregion
window.addEventListener('load', function() { 
    
});



let mmBtn = this.document.getElementById("mm-connect");
mmBtn.onclick = async () => {
    if (typeof window.ethereum !== 'undefined') {
        metamaskAvailable = true;

        ethereum.on('chainChanged', (_chainId) => {
            //window.location.reload()
            updateStatusOnChainChange(_chainId)
        });
    }
    else {
        console.log("Metamask is NOT present");
        updateAlert("Metamask not found. Please install it to use this dApp!", "danger");
    }

    if (metamaskAvailable)
    {
        await ethereum.request({method: "eth_requestAccounts"});

        if (ethereum.isConnected())
        {
            if (ethereum.chainId !== "0x3") {
                updateAlert("Please connect to Ropsten", "danger");
            }
            else
            {
                let walletText = this.document.getElementById("wallet-address");
                walletText.innerHTML = ethereum.selectedAddress;
            }
        }
        else
        {
            updateAlert("Please connect to Metamask", "danger");
        }
    }
}
