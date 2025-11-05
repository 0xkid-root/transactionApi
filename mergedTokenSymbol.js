// Note: to remove the "Reparsing as ES module" warning add this to package.json:
// { "type": "module" }

import fetch from "node-fetch";

const apiKey = "JU687BY2EWV5AYD95IJBC3FNMGYCUZRAFE";
const address = "0x496a824C5F766b00a6eeBe4328eB8526Adfb7c5f".toLowerCase();

// helper: classify native txs (robust input handling)
function classifyTransaction(tx, addressLower) {
  const input = (tx.input || "0x").toLowerCase();
  const from = (tx.from || "").toLowerCase();
  const to = tx.to ? tx.to.toLowerCase() : null;
  const value = Number(tx.value || "0");

  // explicit approve detection (approve(address,uint256))
  if (input.startsWith("0x095ea7b3")) return "Approve";

  // contract deployment (no to)
  if (!to) return "Contract Deployment";

  // other contract calls (has non-empty input)
  if (input !== "0x") return "Contract Interaction";

  // 0-value native txs to/from address (but no input) — label appropriately
  if (value === 0 && from === addressLower) return "Send (0 value)";
  if (value === 0 && to === addressLower) return "Receive (0 value)";

  if (from === addressLower) return "Send";
  if (to === addressLower) return "Receive";

  return "Other";
}

async function getAllXDCActivity() {
  try {
    const baseUrl = `https://api.etherscan.io/v2/api?apikey=${apiKey}&chainid=51`;

    // fetch both lists in parallel
    const [nativeRes, tokenRes] = await Promise.all([
      fetch(`${baseUrl}&module=account&action=txlist&address=${address}`),
      fetch(`${baseUrl}&module=account&action=tokentx&address=${address}`),
    ]);

    const nativeData = await nativeRes.json();
    const tokenData = await tokenRes.json();

    // map native txs (keep important raw fields)
    const nativeTxs = (nativeData.result || []).map((tx) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      tokenSymbol: "XDC",
      timeStamp: Number(tx.timeStamp || 0),
      type: "native",
      category: classifyTransaction(tx, address),
      rawInput: tx.input || "0x",
    }));

    // map token txs
    const tokenTxs = (tokenData.result || []).map((tx) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      tokenSymbol: tx.tokenSymbol || "UNKNOWN",
      timeStamp: Number(tx.timeStamp || 0),
      type: "token",
      category:
        (tx.from || "").toLowerCase() === address
          ? "Send"
          : (tx.to || "").toLowerCase() === address
          ? "Receive"
          : "Other",
      rawInput: tx.input || "0x",
    }));

    // Merge but prefer token entries when same hash exists
    const txMap = new Map();
    [...nativeTxs, ...tokenTxs].forEach((tx) => {
      if (!txMap.has(tx.hash) || tx.type === "token") {
        txMap.set(tx.hash, tx);
      }
    });

    const unique = Array.from(txMap.values());

    // Sort newest first
    unique.sort((a, b) => b.timeStamp - a.timeStamp);

    // Format output for console
    const table = unique.map((tx) => ({
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      tokenSymbol: tx.tokenSymbol,
      type: tx.type,
      category: tx.category,
      timestamp: new Date(tx.timeStamp * 1000).toLocaleString(),
    }));

    console.log("All categorized XDC activity (deduplicated & improved):");
    console.table(table);

    return unique;
  } catch (err) {
    console.error("Error fetching activity:", err);
    throw err;
  }
}

getAllXDCActivity();
