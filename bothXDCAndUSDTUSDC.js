import fetch from "node-fetch";

const apiKey = "JU687BY2EWV5AYD95IJBC3FNMGYCUZRAFE";
const address = "0x496a824C5F766b00a6eeBe4328eB8526Adfb7c5f".toLowerCase();

async function getAllXDCActivity() {
  try {
    const xdcUrl = `https://api.etherscan.io/v2/api?apikey=${apiKey}&chainid=51&module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc`;
    const tokenUrl = `https://api.etherscan.io/v2/api?apikey=${apiKey}&chainid=51&module=account&action=tokentx&address=${address}&startblock=0&endblock=99999999&page=1&offset=50&sort=desc`;

    // Fetch both endpoints in parallel
    const [xdcRes, tokenRes] = await Promise.all([fetch(xdcUrl), fetch(tokenUrl)]);
    const [xdcData, tokenData] = await Promise.all([xdcRes.json(), tokenRes.json()]);

    // ✅ 1. Clean native XDC transfers
    const xdcTxs =
      xdcData?.result?.map((tx) => {
        const from = tx.from?.toLowerCase();
        const to = tx.to?.toLowerCase();

        let transactionDirection = "Contract";
        if (from === address) transactionDirection = "Send";
        else if (to === address) transactionDirection = "Receive";

        return {
          hash: tx.hash,
          tokenSymbol: "XDC",
          from: tx.from,
          to: tx.to,
          value: Number(tx.value) / 1e18,
          timeStamp: Number(tx.timeStamp),
          time: new Date(tx.timeStamp * 1000).toLocaleString(),
          transactionDirection,
          
          
        };
      }) || [];

      console.log("hdfkhsjdhj",xdcTxs);

    // ✅ 2. Clean token transfers (USDC + USDT only)
    const usdcAddress = "0x06F61AaaDd4cA4ba71154b323170dc5A07D6F403".toLowerCase();
    const usdtAddress = "0x6174129A416bCbb78c68ce933d2D41069B6f0f80".toLowerCase();

    const tokenTxs =
      tokenData?.result
        ?.filter(
          (tx) =>
            tx.contractAddress?.toLowerCase() === usdcAddress ||
            tx.contractAddress?.toLowerCase() === usdtAddress
        )
        .map((tx) => {
          const from = tx.from?.toLowerCase();
          const to = tx.to?.toLowerCase();

          let transactionDirection = "Contract";
          if (from === address) transactionDirection = "Send";
          else if (to === address) transactionDirection = "Receive";

          return {
            hash: tx.hash,
            tokenSymbol: tx.tokenSymbol || "TOKEN",
            from: tx.from,
            to: tx.to,
            value: Number(tx.value) / 10 ** Number(tx.tokenDecimal || 18),
            timeStamp: Number(tx.timeStamp),
            time: new Date(tx.timeStamp * 1000).toLocaleString(),
            transactionDirection,
          };
        }) || [];

    // ✅ 3. Merge & deduplicate (by hash + tokenSymbol)
    const mergedTxs = [...xdcTxs, ...tokenTxs].reduce((acc, curr) => {
      const exists = acc.find((tx) => tx.hash === curr.hash && tx.tokenSymbol === curr.tokenSymbol);
      if (!exists) acc.push(curr);
      return acc;
    }, []);

    console.log("🔁 After merge (unique by hash + tokenSymbol):", mergedTxs.length);

    // ✅ 4. Sort by latest first
    const sortedTxs = mergedTxs
      .filter((tx) => tx.timeStamp && !isNaN(parseInt(tx.timeStamp)))
      .sort((a, b) => parseInt(b.timeStamp) - parseInt(a.timeStamp));

    // ✅ 5. Display final clean table
    console.table(
      sortedTxs.map((tx) => ({
        Hash: tx.hash,
        Token: tx.tokenSymbol,
        From: tx.from,
        To: tx.to,
        Value: tx.value.toFixed(4),
        Direction: tx.transactionDirection,
        Time: tx.time,
      }))
    );

  } catch (err) {
    console.error("❌ Error fetching transactions:", err);
  }
}

getAllXDCActivity();
