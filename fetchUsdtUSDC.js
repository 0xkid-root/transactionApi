import fetch from "node-fetch";

const apiKey = "JU687BY2EWV5AYD95IJBC3FNMGYCUZRAFE";
const address = "0x496a824C5F766b00a6eeBe4328eB8526Adfb7c5f";

async function getTokenTransactions() {
  const url = `https://api.etherscan.io/v2/api?apikey=${apiKey}&chainid=51&module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.status === "1" && data.result.length > 0) {
      // Filter only USDC and USDT transactions
      const usdcAddress = "0x06F61AaaDd4cA4ba71154b323170dc5A07D6F403";
      const usdtAddress = "0x6174129A416bCbb78c68ce933d2D41069B6f0f80";

      const filtered = data.result.filter(
        (tx) =>
          tx.contractAddress?.toLowerCase() === usdcAddress.toLowerCase() ||
          tx.contractAddress?.toLowerCase() === usdtAddress.toLowerCase()
      );
      

      console.log("✅ USDC & USDT Token Transactions:");
      console.log("njdksjhsjh",filtered);
      console.table(
        filtered.map((tx) => ({
          hash: tx.hash,
          tokenSymbol: tx.tokenSymbol,
          from: tx.from,
          to: tx.to,
          value: tx.value / 10 ** tx.tokenDecimal,
          time: new Date(tx.timeStamp * 1000).toLocaleString(),
        }))
      );
    } else {
      console.log("⚠️ No token transactions found:", data.message);
    }
  } catch (err) {
    console.error("❌ Error fetching token transactions:", err);
  }
}

getTokenTransactions();
