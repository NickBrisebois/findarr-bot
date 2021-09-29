const dotenv = require('dotenv').config();
import { DiscordBot } from './bots/discord/bot';
import container from './inversify.config';
import { ApiService } from './services/api/api.service';
import { ConfigDatabaseService } from './services/config_database/config-database.service';
import { TYPES } from './types';

function main(): void {
	// inject some dependencies
	const bot = container.get<DiscordBot>(TYPES.DiscordBot);
	const webConfigApi = container.get<ApiService>(TYPES.ApiService);
	const configDbService = container.get<ConfigDatabaseService>(
		TYPES.ConfigDatabaseService
	);

	if (dotenv.error) {
		console.error('Error loading environment');
		return;
	}

	// Start API for WebConfig
	webConfigApi.start();

	// Start Bot
	bot.listen()
		.then(() => {
			console.log('Discord Bot Started');
		})
		.catch((error) => {
			console.log(`Issue logging in: ${error}`);
		});
}

main();
