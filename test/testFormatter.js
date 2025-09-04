const { formatDiscordMessage, formatTwitterMessage } = require('../utils/format');

const mockTwitterClient = {
	v1: {
		uploadMedia: async function (cardPath) {
			console.log("mocked uploadMedia(): " + cardPath)
			return "unit-test";
		}
	}
}

const assert = require("assert");

const buyTrade = {
	executionId: '1',
	attestationId: '100',
	chainId: '1',
	userId: '0x' + '0'.repeat(64),
	side: 'BUY',
	asset: '0x1234567890123456789012345678901234567890',
	assetSymbol: 'AAPL',
	price: 150.25,
	quantity: 10,
	totalValue: 1502.50,
	expiration: new Date('2024-12-31T23:59:59Z'),
	additionalData: '0x' + '0'.repeat(64),
	trader: '0x2757476cd6a9efeb748e2f0c747d7b3c7002219b',
	timestamp: new Date('2024-01-15T10:30:00Z'),
	ethPrice: 2500.00,
	txHash: '0xabc123def456789'
};

const sellTrade = {
	executionId: '2',
	attestationId: '101',
	chainId: '1',
	userId: '0x' + '1'.repeat(64),
	side: 'SELL',
	asset: '0x9876543210987654321098765432109876543210',
	assetSymbol: 'TSLA',
	price: 250.75,
	quantity: 5.5,
	totalValue: 1379.125,
	expiration: new Date('2024-12-31T23:59:59Z'),
	additionalData: '0x' + '1'.repeat(64),
	trader: '0xf481db34ed8844ce98ce339c5fd01ef8d4261955',
	timestamp: new Date('2024-01-15T11:45:00Z'),
	ethPrice: 2450.00,
	txHash: '0xdef789abc123456'
};

describe("Formatter", function () {
	this.timeout(10_000);

	describe("formatDiscordMessage()", function () {
		it("should format BUY trades correctly", async function () {
			const discordMsg = await formatDiscordMessage(buyTrade);

			assert.equal(discordMsg.username, 'GM Trades Bot');
			assert.equal(discordMsg.embeds[0].author.name, 'Ondo Global Market');
			assert.equal(discordMsg.embeds[0].title, 'AAPL BUY');
			assert.ok(discordMsg.embeds[0].description.includes('bought'));
			assert.ok(discordMsg.embeds[0].description.includes('10.00 AAPL'));
			assert.ok(discordMsg.embeds[0].description.includes('$150.2500'));
			assert.equal(discordMsg.embeds[0].color, 0x00ff00); // Green for BUY
			assert.equal(discordMsg.embeds[0].url, 'https://etherscan.io/tx/0xabc123def456789');
			
			// Check fields
			const fields = discordMsg.embeds[0].fields;
			assert.equal(fields[0].name, 'Asset');
			assert.equal(fields[0].value, 'AAPL');
			assert.equal(fields[1].name, 'Quantity');
			assert.equal(fields[1].value, '10.00');
			assert.equal(fields[2].name, 'Price (USD)');
			assert.equal(fields[2].value, '$150.2500');
			assert.equal(fields[3].name, 'Total Value');
			assert.equal(fields[3].value, '$1,502.50');
		});

		it("should format SELL trades correctly", async function () {
			const discordMsg = await formatDiscordMessage(sellTrade);

			assert.equal(discordMsg.username, 'GM Trades Bot');
			assert.equal(discordMsg.embeds[0].title, 'TSLA SELL');
			assert.ok(discordMsg.embeds[0].description.includes('sold'));
			assert.ok(discordMsg.embeds[0].description.includes('5.50 TSLA'));
			assert.equal(discordMsg.embeds[0].color, 0xff0000); // Red for SELL
		});
	});

	describe("formatTwitterMessage()", function () {
		it("should format BUY trades correctly", async function () {
			const [twitterMessage, mediaIds] = await formatTwitterMessage(buyTrade);
			
			assert.ok(twitterMessage.includes('📈'));
			assert.ok(twitterMessage.includes('🟢 bought'));
			assert.ok(twitterMessage.includes('10.00 AAPL'));
			assert.ok(twitterMessage.includes('$150.2500 per token'));
			assert.ok(twitterMessage.includes('Total: $1,502.50'));
			assert.ok(twitterMessage.includes('0.601 ETH')); // 1502.50 / 2500
			assert.ok(twitterMessage.includes('https://etherscan.io/tx/0xabc123def456789'));
			assert.equal(mediaIds.length, 0); // No images for GM trades
		});

		it("should format SELL trades correctly", async function () {
			const [twitterMessage, mediaIds] = await formatTwitterMessage(sellTrade);
			
			assert.ok(twitterMessage.includes('📉'));
			assert.ok(twitterMessage.includes('🔴 sold'));
			assert.ok(twitterMessage.includes('5.50 TSLA'));
			assert.ok(twitterMessage.includes('$250.7500 per token'));
			assert.ok(twitterMessage.includes('Total: $1,379.13'));
			assert.ok(twitterMessage.includes('0.563 ETH')); // 1379.125 / 2450
			assert.ok(twitterMessage.includes('https://etherscan.io/tx/0xdef789abc123456'));
			assert.equal(mediaIds.length, 0);
		});
	});
});