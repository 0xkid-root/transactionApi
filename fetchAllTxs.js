// ------------------------------------------------------------
//  fetchAllTxs.js
//  ------------------------------------------------------------
const { ethers } = require("ethers");

// ----- 1. CONFIG ------------------------------------------------
const ADDRESS = "0x496a824C5F766b00a6eeBe4328eB8526Adfb7c5f".toLowerCase();
const RPC_URL = "https://rpc.apothem.network";          // XDC testnet
const ERC20_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

// ----- 2. PROVIDER & HELPER ------------------------------------
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Helper to turn a block timestamp into "X days ago"
function formatAge(timestamp) {
  const now = Math.floor(Date.now() / 1000);
  const secs = now - timestamp;
  const days = Math.floor(secs / 86400);
  if (days > 0) return `${days} days ago`;
  const hrs = Math.floor(secs / 3600);
  if (hrs > 0) return `${hrs} hours ago`;
  const mins = Math.floor(secs / 60);
  return `${mins} minutes ago`;
}

// ----- 3. FETCH ALL TXs (normal + internal) --------------------
async function getAllTxHashes() {
  const latest = await provider.getBlockNumber();
  const batchSize = 100_000;               // safe for testnet
  const hashes = new Set();

  console.log(`Scanning from block 0 to ${latest} …`);

  for (let from = 0; from <= latest; from += batchSize) {
    const to = Math.min(from + batchSize - 1, latest);
    const filter = {
      fromBlock: from,
      toBlock: to,
      address: null,                       // all txs
    };

    const logs = await provider.getLogs(filter);
    for (const log of logs) {
      // normal tx
      if (log.transactionHash) hashes.add(log.transactionHash);

      // internal txs (call traces) – we pull the receipt later
    }

    // also pull receipts for internal calls
    const block = await provider.getBlock(to, true);
    for (const tx of block.transactions) {
      hashes.add(tx.hash);
    }

    if (to === latest) break;
  }

  return Array.from(hashes);
}

// ----- 4. ENRICH EACH TX (method, value, fee, events) ----------
async function enrichTx(hash) {
  const tx = await provider.getTransaction(hash);
  const receipt = await provider.getTransactionReceipt(hash);
  const block = await provider.getBlock(tx.blockNumber);

  // ---- basic fields
  const isIn = tx.to?.toLowerCase() === ADDRESS;
  const isOut = tx.from?.toLowerCase() === ADDRESS;

  // ---- ERC-20 Transfer events (if any)
  const transfers = [];
  if (receipt.logs) {
    for (const log of receipt.logs) {
      try {
        const iface = new ethers.Interface(ERC20_ABI);
        const parsed = iface.parseLog(log);
        if (parsed.name === "Transfer") {
          const [from, to, value] = parsed.args;
          const amount = ethers.formatUnits(value, 18); // XDC uses 18 decimals
          transfers.push({
            from: from.toLowerCase(),
            to: to.toLowerCase(),
            amount,
            token: log.address,
          });
        }
      } catch (_) {
        // not an ERC-20 Transfer
      }
    }
  }

  // ---- fee
  const fee = ethers.formatUnits(
    BigInt(tx.gasPrice || receipt.effectiveGasPrice) * BigInt(receipt.gasUsed),
    18
  );

  return {
    hash: tx.hash,
    block: tx.blockNumber,
    timestamp: block.timestamp,
    age: formatAge(block.timestamp),
    method: tx.data === "0x" ? "Transfer" : (tx.data.slice(0, 10) || "unknown"),
    from: tx.from,
    to: tx.to ?? "(contract creation)",
    value: ethers.formatUnits(tx.value, 18) + " XDC",
    fee: fee + " XDC",
    direction: isIn ? "IN" : isOut ? "OUT" : "INTERNAL",
    transfers, // ERC-20 moves inside this tx
  };
}

// ----- 5. MAIN -------------------------------------------------
(async () => {
  try {
    const hashes = await getAllTxHashes();
    console.log(`Found ${hashes.length} unique transaction hashes`);

    const enriched = [];
    for (let i = 0; i < hashes.length; i++) {
      const h = hashes[i];
      process.stdout.write(`\rProcessing ${i + 1}/${hashes.length} …`);
      enriched.push(await enrichTx(h));
    }
    console.log("\nDone!");

    // ---- pretty table (last 10, newest first)
    enriched.sort((a, b) => b.block - a.block);
    console.log("\nLatest 10 transactions:");
    console.log(
      "Hash                                                             Method      Block   Age          From…                To…                  Amount       Fee"
    );
    console.log("-".repeat(180));

    enriched.slice(0, 10).forEach(t => {
      const shortFrom = t.from.slice(0, 10) + "...";
      const shortTo = t.to.slice(0, 10) + "...";
      console.log(
        `${t.hash} ${t.method.padEnd(11)} ${t.block.toString().padEnd(7)} ${t.age.padEnd(12)} ${shortFrom.padEnd(20)} ${shortTo.padEnd(20)} ${t.value.padEnd(12)} ${t.fee}`
      );

      // show ERC-20 moves inside the tx
      t.transfers.forEach(ev => {
        const dir = ev.to === ADDRESS ? "IN" : "OUT";
        console.log(
          `   └─ ${dir} ERC-20 ${ev.amount} from ${ev.from.slice(0,10)}... to ${ev.to.slice(0,10)}...`
        );
      });
    });

    // Export full array if you need it elsewhere
    // require("fs").writeFileSync("txs.json", JSON.stringify(enriched, null, 2));
  } catch (err) {
    console.error("\nError:", err);
  }
})();