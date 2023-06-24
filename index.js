//in nodejs
//require()

//in front-end javascript you can't use require
//import

import { Contract, ethers, providers } from "./ethers-5.1.esm.min.js"
import { ABI, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        try {
            await window.ethereum.request({
                method: "eth_requestAccounts",
            })
        } catch (error) {
            console.log(error)
        }
        document.getElementById("connectButton").innerHTML = "Connected!"
    } else {
        document.getElementById("connectButton").innerHTML =
            "Please Install Metamask!"
    }
}
//fund fuction
async function fund() {
    const ethAmmount = document.getElementById("ethAmmount").value
    console.log(`Funding with: ${ethAmmount}`)
    if (typeof window.ethereum !== "undefined") {
        try {
            // What are the things we 100% need for sending a transaction:
            // provider / connection to the blockchain
            // signer /waller / someone with some gas
            // contract that we are interacting with
            // ^ABI & Address
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const contract = new ethers.Contract(contractAddress, ABI, signer)
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmmount),
            })
            //listen fo the tx to be mined
            //listen for an event

            //wait for this tx to finish
            await listenForTransactionMine(transactionResponse, provider)
            // This will wait for the listenForTransactionMine, the listen function will kiffoff
            //but it will not wait until thw provider.once to find the transaction response so the
            //listen function will finish before provider.once finish

            console.log("Done!")
        } catch (error) {
            console.log(error)
        }
    }
}

// We need create a listener for the blockchain
//We want to listen for this event to happen but we want to tell Javascript to wait for it to finish looking
//We dont want it to be an async function bc this function will return a Promise
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    //listen for this transaction to finish
    //The provider.once sees that there is a transaction hash it's going to give as an
    //input paramatter to our listener function the transaction Receipt
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with: ${transactionReceipt.confirmations} confirmations`
            )
            resolve()
        })
    })
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum)
            const balance = await provider.getBalance(contractAddress)
            console.log(ethers.utils.formatEther(balance))
        } catch (error) {
            console.log(error)
        }
    }
}

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        console.log("Withdrawing...")
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, ABI, signer)
        try {
            const transactionResponse = await contract.cheaperWithdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Withdrawed")
        } catch (error) {
            console.log(error)
        }
    }
}
