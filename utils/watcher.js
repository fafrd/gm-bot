const Ethers = require("ethers");
require("dotenv").config();
let rpc_url = process.env.RPC_URL;
if (!rpc_url) {
  console.warn("No RPC_URL provided, falling back to default");
  rpc_url = "https://eth.llamarpc.com";
}
const provider = new Ethers.JsonRpcProvider(rpc_url);

// Ondo Global Markets contract
const GM_CONTRACT = "0x2c158BC456e027b2AfFCCadF1BDBD9f5fC4c5C8c";
const gmAbi = require("../abis/GlobalMarket.json");
const gmContract = new Ethers.Contract(GM_CONTRACT, gmAbi, provider);

// ERC20 token ABI for getting token details
const erc20TokenAbi = require("../abis/ERC20Token.json");

// Helper for unit tests
async function getGMEventsFromBlock(blockNum) {
  return await gmContract.queryFilter(
    gmContract.filters.TradeExecuted(),
    (fromBlock = blockNum),
    (toBlock = blockNum)
  );
}

// QuoteSide enum: 0 = BUY, 1 = SELL
const QUOTE_SIDE = {
  BUY: 0,
  SELL: 1,
};

async function getTokenSymbol(tokenAddress) {
  try {
    const tokenContract = new Ethers.Contract(
      tokenAddress,
      erc20TokenAbi,
      provider
    );
    return await tokenContract.symbol();
  } catch (e) {
    console.error(`Failed to get symbol for token ${tokenAddress}:`, e);
    return tokenAddress.slice(0, 6) + "...";
  }
}

async function handleGMTrade(eventLog) {
  console.log(`Found GM trade in tx ${eventLog.transactionHash}`);

  try {
    const parsed = gmContract.interface.parseLog(eventLog);
    const args = parsed.args;

    // Extract trade details
    const executionId = args.executionId.toString();
    const attestationId = args.attestationId.toString();
    const chainId = args.chainId.toString();
    const userId = args.userId;
    const side = Number(args.side); // 0 = BUY, 1 = SELL
    const asset = args.asset;
    const price = Number(Ethers.formatUnits(args.price, 18)); // Price in USD with 18 decimals
    const quantity = Number(Ethers.formatUnits(args.quantity, 18)); // Assuming 18 decimals for GM tokens
    const expiration = new Date(Number(args.expiration) * 1000);
    const additionalData = args.additionalData;

    // Get asset symbol
    const assetSymbol = await getTokenSymbol(asset);

    // Calculate total value in USD
    const totalValue = price * quantity;

    // Get block timestamp for the trade
    const block = await provider.getBlock(eventLog.blockNumber);
    const timestamp = new Date(block.timestamp * 1000);

    // Get transaction details to identify the trader and contract
    const tx = await provider.getTransaction(eventLog.transactionHash);
    const trader = tx.from.toLowerCase();
    const contract = tx.to.toLowerCase();

    console.log(
      `GM Trade: ${side === QUOTE_SIDE.BUY ? "BUY" : "SELL"} ${quantity.toFixed(
        2
      )} ${assetSymbol} @ $${price.toFixed(4)} = $${totalValue.toFixed(2)}`
    );

    return {
      executionId,
      attestationId,
      chainId,
      userId,
      side: side === QUOTE_SIDE.BUY ? "BUY" : "SELL",
      asset,
      assetSymbol,
      price,
      quantity,
      totalValue,
      expiration,
      additionalData,
      trader,
      contract,
      timestamp,
      txHash: eventLog.transactionHash,
    };
  } catch (e) {
    console.error("Error processing GM trade:", e);
    return null;
  }
}

function watchForTrades(tradeHandler) {
  gmContract.on(gmContract.filters.TradeExecuted(), async (event) => {
    try {
      const trade = await handleGMTrade(event.log);
      if (trade) {
        tradeHandler(trade);
      }
    } catch (e) {
      console.error("Error in trade watcher:", e);
    }
  });

  console.log(`Watching for trades on GM contract ${GM_CONTRACT}`);
}

module.exports = { watchForTrades, handleGMTrade, getGMEventsFromBlock };
