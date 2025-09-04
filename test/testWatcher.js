const { handleGMTrade, getGMEventsFromBlock } = require("../utils/watcher.js");
const { getAddressLabel } = require("../utils/address");

const assert = require("assert");

describe("Watcher", function () {
	this.timeout(10_000);

	describe("handleGMTrade()", function () {
		it("should correctly parse a GM trade event", async function () {
			// This is a mock test - you'll need to find actual block numbers with GM trades
			// For now, we'll test the structure
			
			const mockEventLog = {
				transactionHash: '0x123456789abcdef',
				blockNumber: 12345678,
				args: {
					executionId: BigInt(1),
					attestationId: BigInt(100),
					chainId: BigInt(1),
					userId: '0x' + '0'.repeat(64),
					side: 0, // BUY
					asset: '0x1234567890123456789012345678901234567890',
					price: BigInt('1000000000000000000000'), // 1000 USD
					quantity: BigInt('10000000000000000000'), // 10 tokens
					expiration: BigInt(Math.floor(Date.now() / 1000) + 3600),
					additionalData: '0x' + '0'.repeat(64)
				}
			};

			// Mock the contract interface parseLog
			const gmContract = require("../utils/watcher").gmContract;
			if (gmContract && gmContract.interface) {
				// This would need actual testing with real events
				console.log("GM contract loaded successfully");
			}
		});

		// You would add more tests here with actual block numbers containing GM trades
		// For example:
		// it("should correctly find a BUY trade in block XXXXXX", async function () {
		//     const events = await getGMEventsFromBlock(XXXXXX);
		//     assert.equal(events.length, 1);
		//     const trade = await handleGMTrade(events[0])
		//     assert.equal(trade.side, 'BUY');
		//     // ... more assertions
		// });
	});

	describe("getAddressLabel()", function () {
		it("should correctly format an ETH address", async function () {
			const label = await getAddressLabel("0x49468f702436d1e590895ffa7155bcd393ce52ae");
			assert.equal(label, "0x4946...52ae");
		});

		it("should handle lowercase addresses", async function () {
			const label = await getAddressLabel("0xbebf173c83ad4c877c04592de0c38567abf66526");
			assert.equal(label, "0xbebf...6526");
		});
	});
});