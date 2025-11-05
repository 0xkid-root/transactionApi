import fetch from "node-fetch";

const apiKey = "JU687BY2EWV5AYD95IJBC3FNMGYCUZRAFE";
const address = "0x496a824C5F766b00a6eeBe4328eB8526Adfb7c5f".toLowerCase();

async function getAllXDCActivity() {
  try {
    // 🔹 Fetch native transactions
    const xdcUrl = `https://api.etherscan.io/v2/api?apikey=${apiKey}&chainid=51&module=account&action=txlist&address=${address}`;
    const nativeRes = await fetch(xdcUrl);
    const nativeData = await nativeRes.json();

    const nativeTxs =
      nativeData.result?.map((tx) => ({
        hash: tx.hash,
        from: tx.from.toLowerCase(),
        to: tx.to?.toLowerCase() || "Contract Creation",
        value: Number(tx.value) / 1e18,
        tokenSymbol: "XDC",
        timeStamp: Number(tx.timeStamp),
        type: "native",
        // ✅ Improved category logic
        type_data:
          tx.input && tx.input !== "0x"
            ? "Contract Interaction"
            : Number(tx.value) === 0
            ? "Approve or Contract Call"
            : tx.from.toLowerCase() === address
            ? "Send"
            : tx.to?.toLowerCase() === address
            ? "Receive"
            : "Other",
      })) || [];

    // 🔹 Fetch token transactions
    const tokenUrl = `https://api.etherscan.io/v2/api?apikey=${apiKey}&chainid=51&module=account&action=tokentx&address=${address}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    const tokenTxs =
      tokenData.result?.map((tx) => ({
        hash: tx.hash,
        from: tx.from.toLowerCase(),
        to: tx.to?.toLowerCase() || "Contract Creation",
        value: Number(tx.value) / 10 ** (tx.tokenDecimal || 18),
        tokenSymbol: tx.tokenSymbol || "Unknown",
        timeStamp: Number(tx.timeStamp),
        type: "token",
        type_data:
          tx.from.toLowerCase() === address
            ? "Send"
            : tx.to?.toLowerCase() === address
            ? "Receive"
            : "Other",
      })) || [];

    // 🔹 Merge native + token transactions (token takes priority)
    const txMap = new Map();
    [...nativeTxs, ...tokenTxs].forEach((tx) => {
      if (!txMap.has(tx.hash) || tx.type === "token") {
        txMap.set(tx.hash, tx);
      }
    });

    const unique = Array.from(txMap.values());

    // 🔹 Sort newest first
    const sorted = unique.sort((a, b) => b.timeStamp - a.timeStamp);

    // 🔹 Display clean output
    console.log("✅ All categorized XDC activity (deduplicated & corrected):");
    console.table(
      sorted.map((tx) => ({
        Hash: tx.hash,
        From: tx.from,
        To: tx.to,
        Type: tx.type,
        Category: tx.type_data,
        Symbol: tx.tokenSymbol,
        Value: tx.value,
        Timestamp: new Date(tx.timeStamp * 1000).toLocaleString(),
      }))
    );
  } catch (error) {
    console.error("❌ Error fetching XDC activity:", error);
  }
}

getAllXDCActivity();
