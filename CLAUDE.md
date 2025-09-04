# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Ondo Global Markets trades monitoring bot that tracks trades on Ethereum and posts notifications to Discord and Twitter. It monitors the GM contract for `TradeExecuted` events and reports trade activity in real-time.

## Key Commands

### Running the Bot
```bash
npm start  # Starts the monitoring bot (requires .env configuration)
```

### Testing
```bash
npm test  # Runs all tests with Mocha
```

## Architecture

### Core Flow
1. **Event Monitoring**: `watchForTrades()` in `utils/watcher.js` listens for `TradeExecuted` events on:
   - GM Contract: `0x2c158BC456e027b2AfFCCadF1BDBD9f5fC4c5C8c`

2. **Trade Processing**: When a trade is detected, `handleGMTrade()`:
   - Parses the event data (executionId, side, asset, price, quantity, etc.)
   - Fetches asset symbol from the token contract
   - Calculates total USD value
   - Gets ETH/USD price from Uniswap LP
   - Identifies the trader from transaction data
   - Returns structured trade object

3. **Notification Dispatch**: `tradeHandler` in `server.js`:
   - Formats Discord embed via `formatDiscordMessage()`
   - Creates Twitter post via `formatTwitterMessage()`
   - Posts to both platforms asynchronously

### Key Design Patterns

- **Event-Driven Architecture**: Listens to blockchain events rather than polling
- **Price Calculation**: Handles 18 decimal precision for prices and quantities
- **Side Enum**: 0 = BUY, 1 = SELL in smart contract
- **Error Resilience**: Continues monitoring even if individual trade processing fails
- **Address Formatting**: Shortens addresses to `0x1234...5678` format for display

### Environment Configuration

Required in `.env`:
- `RPC_URL`: Ethereum RPC endpoint (falls back to llamarpc if not set)
- `DISCORD_ID` & `DISCORD_TOKEN`: From Discord webhook URL
- `TWITTER_API_KEY`, `TWITTER_API_KEY_SECRET`, `TWITTER_ACCESS_TOKEN_KEY`, `TWITTER_ACCESS_TOKEN_SECRET`: Twitter API v2 credentials

### Testing Approach

Tests use real blockchain data from specific blocks:
- `testWatcher.js`: Tests trade parsing with known GM trade transactions
- `testFormatter.js`: Tests message formatting with mock trade data

When testing modifications:
- Use `getGMEventsFromBlock()` with known block numbers containing trades
- Mock Twitter client to avoid API calls
- Test data includes BUY/SELL trades with different assets and values

## Important Implementation Details

- **Trade Data Structure**: Each trade contains executionId, attestationId, chainId, userId, side, asset, price, quantity, expiration, additionalData
- **USD Pricing**: All prices are in USD with 18 decimal precision
- **Color Coding**: Green (0x00ff00) for BUY, Red (0xff0000) for SELL in Discord
- **ETH Price Reference**: Shows current ETH price from Uniswap for context
- **Transaction Links**: All notifications include Etherscan transaction URL