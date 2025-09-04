# gm-bot

Ondo Global Markets trades monitoring bot for Discord and Twitter notifications.

## Overview

This bot monitors the Ondo Global Markets smart contract (`0x2c158BC456e027b2AfFCCadF1BDBD9f5fC4c5C8c`) for `TradeExecuted` events and posts real-time notifications to Discord and Twitter when trades occur.

```solidity
  /**
   * @notice Event emitted when a trade is executed with an attestation
   * @param  executionId    The monotonically increasing ID of the trade
   * @param  attestationId  The ID of the quote
   * @param  chainId        The chain ID the quote is intended to be used
   * @param  userId         The user ID the quote is intended for
   * @param  side           The direction of the quote (BUY or SELL)
   * @param  asset          The address of the GM token being bought or sold
   * @param  price          The price of the GM token in USD with 18 decimals
   * @param  quantity       The quantity of GM tokens being bought or sold
   * @param  expiration     The expiration of the quote in seconds since the epoch
   * @param  additionalData Any additional data that is needed for the quote
   */
  event TradeExecuted(
    uint256 executionId,
    uint256 attestationId,
    uint256 chainId,
    bytes32 userId,
    QuoteSide side,
    address asset,
    uint256 price,
    uint256 quantity,
    uint256 expiration,
    bytes32 additionalData
  );
```

## Features

- Real-time monitoring of GM trades (BUY/SELL)
- Discord webhook notifications with embedded trade details
- Twitter notifications with trade summaries
- Tracks USD price, quantity, and total value
- Shows current ETH price for reference
- Displays trader addresses (shortened format)

## Setup

### Prerequisites

Make sure you have Node.js installed (check `.nvmrc` for version if available).

### Configuration

1. Copy `.env.sample` to `.env`
2. Configure the following environment variables:

#### Ethereum RPC
- `RPC_URL`: Your Ethereum RPC endpoint (e.g., from Infura, Alchemy, or any provider)
  - If not provided, falls back to a public endpoint

#### Discord Webhook
1. In your Discord server, go to Settings → Integrations
2. Create a webhook
3. Extract the ID and token from the webhook URL:
   - URL format: `https://discord.com/api/webhooks/{DISCORD_ID}/{DISCORD_TOKEN}`
   - Set `DISCORD_ID` and `DISCORD_TOKEN` in `.env`

#### Twitter API
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Apply for API access if needed (may take a few days)
3. Create an app (not a standalone app)
4. Create a Production environment (the name appears in tweets)
5. In settings, enable OAuth 1.0a and OAuth 2.0 with READ/WRITE permissions
6. Generate Access Token and Secret from Keys and Tokens
7. Add to `.env`:
   - `TWITTER_API_KEY`
   - `TWITTER_API_KEY_SECRET`
   - `TWITTER_ACCESS_TOKEN_KEY`
   - `TWITTER_ACCESS_TOKEN_SECRET`

## Running the Bot

```bash
npm install
npm start
```

The bot will start monitoring the GM contract and post notifications for every trade.

## Testing

```bash
npm test
```

Tests require RPC access to query blockchain data.

## Trade Event Details

The bot monitors `TradeExecuted` events with the following information:
- **Execution ID**: Unique trade identifier
- **Side**: BUY or SELL
- **Asset**: Token address being traded
- **Price**: USD price per token (18 decimals)
- **Quantity**: Amount of tokens traded
- **Total Value**: Price × Quantity in USD
- **Trader**: Address executing the trade
- **Timestamp**: When the trade occurred

## Discord Notification Format

- Color-coded embeds (green for BUY, red for SELL)
- Shows asset symbol, quantity, price, and total value
- Includes current ETH price for reference
- Links to Etherscan transaction

## Twitter Notification Format

- Trade direction with emoji indicators
- Formatted USD values
- ETH equivalent for context
- Transaction link

## Architecture

- `server.js`: Main entry point, sets up Discord and Twitter clients
- `utils/watcher.js`: Monitors blockchain events
- `utils/format.js`: Formats messages for Discord and Twitter
- `utils/address.js`: Address formatting utilities
- `abis/GlobalMarket.json`: Contract ABI for event decoding