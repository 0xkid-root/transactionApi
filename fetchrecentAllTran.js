import fetch from "node-fetch";

const apiKey = "JU687BY2EWV5AYD95IJBC3FNMGYCUZRAFE";
const address = "0x496a824C5F766b00a6eeBe4328eB8526Adfb7c5f";

async function getXDCTransactions() {
  const url = `https://api.etherscan.io/v2/api?apikey=${apiKey}&chainid=51&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=20&sort=desc`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error("Error fetching transactions:", err);
  }
}

getXDCTransactions();
