const dotenv = require('dotenv').config();
import { DiscordBot } from './bots/discord/bot';
import container from './inversify.config';
import { TYPES } from './types';

function main(): void {
	if (dotenv.error) {
		console.error('Error loading environment');
		return;
	}

	const bot = container.get<DiscordBot>(TYPES.DiscordBot);
	bot.listen()
		.then(() => {
			console.log('Logged in!');
		})
		.catch((error) => {
			console.log(`Issue logging in: ${error}`);
		});
}

main();
