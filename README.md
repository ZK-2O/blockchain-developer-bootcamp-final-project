# Final Project - Goal Setting dApp

## Deployed App URL
https://zk-2o.github.io/blockchain-developer-bootcamp-final-project/

## Screencast


## Compiling and Running Tests Locally

### Prerequisites

- Node.js v. 14 or higher
- Truffle v.5.4.12 or higher

#### Libraries and Dependencies

- Openzeppelin Contracts: `npm install @openzeppelin/contracts`
- Truffle HDWallet Provider: `npm install @truffle/hdwallet-provider`
- Dotenv: `npm install dotenv`


#### Optional - only for running and interacting with local instance
- Ganache v2.5.4 or higher
- Ganache server running on port `7545`
- .env file in the project root directory containing the following (with the values populated)
    + `INFURA_API_KEY=""`
    + `ROPSTEN_MNEMONIC=""`



## About the Project
The purpose of this project is to allow users to set goals with monetary value attached to them, which the users risk losing if they do not achieve their goal in time. Losing an amount of money has a much greater impact than gaining the same amount of money - this is known as Loss Aversion (https://thedecisionlab.com/biases/loss-aversion/). That is to say, the potential loss of money can be a good motivator to achieve one's own goals.

If the user does not complete the goal in time, they only get 50% of their deposit back. The remaining 50% is kept in the contract. Whatever amount of ETH is in the contract (and not currently tied to any goals) can be withdrawn by the contract owner.

### Workflow

1. User adds a goal with an ETH deposit associated with it and assigns a deadline to the goal
2. User works on achieving that goal
3. User marks the goal as completed
  + If the user completed the goal before the deadline, they receive the full deposit amount back
  + If the user completed the goal after the deadline, they receive only 50% of the amount back

### Considerations

* A user should not be able to see the goals of other users on the front-end
* A user should not be able to update the status of another user's goals
	+ Of course, since all goals are stored on chain, technically anyone can see anyone else's goals. But this should not be the case on the front-end
* A user must supply a minimum of 0.01 eth with their goal

### Stretch Goals

* A user can add an "accountability buddy" that would have to sign a tx verifying that the user did in fact complete their goal - then and only then would the user get their original deposit back
* Allow other users to contribute amounts to your goal. For example, parents sending ETH to their kid's goal so when the kid completes the goal, the kid gets the total goal amount added to their wallet.
* Contract owner should be able to update the minimum goal amount value. Ex. each user must deposit at least 0.02 ETH per goal
* Contract owner should be able to update the amount users get back if they fail to achieve their goal in time - this needs to be limited to a maximum of 50%
* Ability to stake funds somehow to generate some APR on the goals, thereby increasing the reward from the initial deposit on the goal? If we wait for Eth 2.0, this could be a possibility.
* Ability to allow users to deposit any ERC-20 token for their goals
* Adding a governance token to this so that all the things a contract owner would perform would have to be performed through governance votes, thus introducing decentralization in the way the app functions


-------------
-------------
-------------


# Previous Ideas - Please ignore
## Idea 1 - File Integrity Monitor

### The Problem

Organizations depend on their software and data to function. Often times, if files related to these software get corrupted, or are maliciously tampered with, it may cause massive problems for the organization. Problems can range from their services being unavailable (Denial of Service) to execution of malicious code in their environment. Thus, ensuring the integrity of important files in the organization is of significant importance.

File Integrity Monitoring (FIM) is a process that organizations can use to test and ensure that files such as Operating System files, Database files, and application files have not been corrupted or tampered with. With FIM, a baseline can be established that allows an organization to verify whether an file has changed (been corrupted or tampered with). This is done by hashing the file and storing the hash in a secure database. The organization can then check the hashes of files at a given interval against the baseline of hashes stored in the FIM database to verify whether the files have changed or not.

However, the FIM database itself must be secured such that it is not corrupted or a malicious actor cannot alter its contents. For example, if a hacker wants to swap a critical software dependency for an application in the organization's environment with their own malicious one, and they are able to change the value of the hash of this dependency file in the FIM database, it would defeat the purpose of using a FIM solution.

### Purpose

Blockchains are a great database solution when data integrity and immutability is of utmost importance. A blockchain-based File Integrity Monitoring solution would solve the problem of malicious actors tampering with the database to hide their actions relating to file changes.

The Blockchain FIM solution would ensure that once a baseline has been created, it cannot be altered. Furthermore, the blockchain solution would also allow the organization to verify who created the baseline and who updated any records because each transaction would be signed with the private key of the user.

### User Flow

1. User interacts with a smart contract to create a baseline by providing files that they want to monitor for changes
2. Smart contract is provided with the files' properties and their respective hashes, which are written to the blockchain
3. A FIM client runs in the user's environment, monitoring the files by checking against the data stored on the blockchain to ensure the monitored files are not tampered with


### To Consider

* It is quite normal to update certain files. For this reason, the user must be able to update the hash of a file in the baseline. In order to do this, a user can use their private key to send another transaction to the smart contract to update the file in question with the new hash. The old hash would still be on the blockchain but it will be superceded with the new hash. This also allows one to audit changes made to files through time.


## Idea 2 - Social Media NFT

### The Idea

The user can log into a website using the "Log in with Twitter" or "Log in with Facebook" button. This verifies that the user indeed has access to the given social media profile. Once logged in, the user can mint an NFT that for their social media account. This NFT would represent ownership of their social media account. Only one NFT can exist for any given account.


### Purpose

The purpose of this project is to allow owners of social media accounts to prove their ownership using NFTs. Additionally, if a user wanted to transfer the ownership to a different user, they could transfer the related NFT to that user as well. This would allow one to look at the history of the social media account ownership. Or in the case of an account hijack, the NFT would still be owned by the original user and the user could prove that they own the account, not whoever hijacked it.

### Stretch Goals

Some stretch goals for this project idea include:

* Allow user to mint NFTs for their Instagram profile
* Allow user to mint NFTs for their Facebook profile
* Allow user to mint NFTs for individual Tweets they have created on their Twitter account
* Allow user to mint NFTs for individual posts they have made on their Instagram account
* Allow user to mint NFTs for individual status updates/posts they have created on their Facebook account
* Figure out a way to validate that the social media account the NFT is for still exists after the NFT is minted
  + One way might be to have expiry dates for the NFTs (such as on a Driver's License). User must, for example, log in with their social media account and reverify the existence and access to that account every year

### Benefits

* User can prove ownership of a given social media account
* User can, if they so choose, sell ownership of their social media account - this is especially handy for social media websites such as Twitter and Instagram for people with "OG" accounts
* User can mint and sell NFTs of status updates/tweets (ex. Jack Dorsey's first tweet ever being sold as an NFT)

### User Flow

1. User visits the project's website and logs in with their social media account (using the "Log in with Twitter" button)
2. User connects their wallet to the website via an extension such as Metamask
3. User click a "Mint" button to mint a unique NFT for their social media account that they just logged in with
4. Website makes a call to a smart contract, passing relevant account information to it, to mint an NFT for the user
5. A unique NFT is generated, showcasing the user's ownership of the given social media account

### To Consider

* How can a user ensure that when selling an NFT for their social media account, the buyer is able to actually get access to the related account?
  + Perhaps there might be a way to store credentials in the NFT itself (encrypted such that only the owner can decrypt them). This would need to be very secure
* Only one NFT can exist for a given social media account
  + A user should not be able to create multiple NFTs for the same account, either with the same wallet or with different wallets
