const { ethers } = require("ethers");

// connect to XDC Apothem testnet RPC
const provider = new ethers.providers.JsonRpcProvider("https://rpc.apothem.network");

// replace with your actual transaction hash
const txHash = "0x9b66f0f8e5cf0e22e7c4c31a36f9f49d9e70d37df1b3f7a2f4181b7ac4e1d3e";

async function getTransactionDetails() {
  try {
    const tx = await provider.getTransaction(txHash);
    const receipt = await provider.getTransactionReceipt(txHash);

    console.log("Transaction:", tx);
    console.log("Receipt:", receipt);
  } catch (error) {
    console.error("Error fetching transaction:", error);
  }
}

getTransactionDetails();
