const dotenv = require('dotenv').config();
import { DiscordBot } from './bots/discord/bot';
import container from './inversify.config';
import { SonarrService } from './services/sonarr/sonarr.service';
import { TYPES } from './types';

function main(): void {

	if (dotenv.error) {
		console.error('Error loading environment');
		return;
	}

	const bot = container.get<DiscordBot>(TYPES.DiscordBot);
	bot.listen().then(() => {
		console.log('Logged in!');
	}).catch((error) =>  {
		console.log(`Issue logging in: ${error}`);
	});

	const sonarrService = container.get<SonarrService>(TYPES.SonarrService);
	
	/*
	sonarrService.seriesLookupByTerm('Game of thrones').subscribe((data) => {
		console.log(data);
	});
*/
}

main();