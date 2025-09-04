const { WebhookClient } = require('discord.js');
const { TwitterApi } = require('twitter-api-v2');
const { watchForTrades } = require('./utils/watcher');
const { formatDiscordMessage, formatTwitterMessage } = require('./utils/format');

require('dotenv').config();
const {
	DISCORD_ID, DISCORD_TOKEN,
	TWITTER_API_KEY, TWITTER_API_KEY_SECRET, TWITTER_ACCESS_TOKEN_KEY, TWITTER_ACCESS_TOKEN_SECRET
} = process.env;

const webhookClient = new WebhookClient({ id: DISCORD_ID, token: DISCORD_TOKEN });

// Only create Twitter client if credentials are provided
let twitterClient = null;
if (TWITTER_API_KEY && TWITTER_API_KEY_SECRET && TWITTER_ACCESS_TOKEN_KEY && TWITTER_ACCESS_TOKEN_SECRET) {
	const _twitterClient = new TwitterApi({
		appKey: TWITTER_API_KEY,
		appSecret: TWITTER_API_KEY_SECRET,
		accessToken: TWITTER_ACCESS_TOKEN_KEY,
		accessSecret: TWITTER_ACCESS_TOKEN_SECRET
	});
	twitterClient = _twitterClient.readWrite;
	console.log("Twitter client initialized");
} else {
	console.log("Twitter credentials not found - Twitter notifications disabled");
}

const tradeHandler = async (trade) => {
	// post to discord
	const discordMsg = await formatDiscordMessage(trade);
	webhookClient.send(discordMsg).catch(console.error);

	// tweet only if Twitter client is configured
	if (twitterClient) {
		const [twitterMessage, mediaIds] = await formatTwitterMessage(trade);
		twitterClient.v2.tweet(twitterMessage, { media: mediaIds.length > 0 ? { media_ids: mediaIds } : undefined }).catch(console.error);
	}
};

console.log("Starting GM trades bot");
watchForTrades(tradeHandler);