const { getAddressLabel } = require("./address");

// style = currency to include dollar sign
const formatValue = (value, decimals = 2, style = "decimal") =>
  new Intl.NumberFormat("en-US", {
    style,
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);

const formatDiscordMessage = async (trade) => {
  console.log("Formatting Discord message for GM trade");

  const traderLabel = await getAddressLabel(trade.trader);

  // Create color based on buy/sell (green for buy, red for sell)
  const color = trade.side === "BUY" ? 0x00ff00 : 0xff0000;

  // Format the trade direction
  const action = trade.side === "BUY" ? "Bought" : "Sold";

  // Get contract shorthand (first 6 chars)
  const contractShort = await getAddressLabel(trade.contract);

  const fields = [
    {
      name: "Quantity",
      value: formatValue(trade.quantity, 2),
      inline: true,
    },
    {
      name: "Price (USD)",
      value: formatValue(trade.price, 4, "currency"),
      inline: true,
    },
    {
      name: "Total Value",
      value: formatValue(trade.totalValue, 2, "currency"),
      inline: true,
    },
    {
      name: "Asset",
      value: trade.assetSymbol,
      inline: true,
    },
    {
      name: "Contract",
      value: contractShort,
      inline: true,
    },
    {
      name: "Sender",
      value: traderLabel,
      inline: true,
    },
  ];

  const title = `${trade.assetSymbol} ${trade.side}`;
  const description = `${action} **${formatValue(trade.quantity, 2)} ${
    trade.assetSymbol
  }** at **${formatValue(trade.price, 4, "currency")}** per token`;

  // Transaction URL on Etherscan
  const url = `https://etherscan.io/tx/${trade.txHash}`;

  return {
    username: "GM Trades Bot",
    embeds: [
      {
        author: {
          name: "Ondo Global Markets",
          icon_url:
            "https://assets-global.website-files.com/62c6c96bb93c560764c906e5/62c6c96bb93c56d6a2c907fc_ondo-logotype-dark.svg",
        },
        title: title,
        description: description,
        url,
        color: color,
        fields,
        footer: {
          text: `Execution ID: ${trade.executionId}`,
        },
        timestamp: trade.timestamp,
      },
    ],
  };
};

const formatTwitterMessage = async (trade) => {
  const traderLabel = await getAddressLabel(trade.trader);

  // Format the trade direction
  const action = trade.side === "BUY" ? "🟢 bought" : "🔴 sold";
  const emoji = trade.side === "BUY" ? "📈" : "📉";

  let twitterMessage = `${emoji} GM Trade Alert\n\n`;
  twitterMessage += `${traderLabel} ${action} ${formatValue(
    trade.quantity,
    2
  )} ${trade.assetSymbol} `;
  twitterMessage += `at ${formatValue(
    trade.price,
    4,
    "currency"
  )} per token\n\n`;
  twitterMessage += `Total: ${formatValue(trade.totalValue, 2, "currency")}\n`;
  twitterMessage += `\nhttps://etherscan.io/tx/${trade.txHash}`;

  return [twitterMessage, []]; // No media IDs for now since we're not using images
};

module.exports = exports = {
  formatDiscordMessage,
  formatTwitterMessage,
};
