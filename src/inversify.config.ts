import 'reflect-metadata';
import { Container } from 'inversify';
import { TYPES } from './types';
import { Client } from 'discord.js';
import { DiscordBot, DISCORD_INTENTS } from './bots/discord/bot';
import { SonarrService } from './services/sonarr/sonarr.service';
import { RadarrService } from './services/radarr/radarr.service';
import superagent, { SuperAgentStatic } from 'superagent';
import { MessagingService } from './services/messaging/messaging.service';

const container = new Container();

// Bots
container.bind<DiscordBot>(TYPES.DiscordBot).to(DiscordBot).inSingletonScope();

// TOKENs
container.bind<string>(TYPES.DiscordToken).toConstantValue(process.env.DISCORD_TOKEN);
container.bind<string>(TYPES.SonarrApiKey).toConstantValue(process.env.SONARR_API_KEY);
container.bind<string>(TYPES.RadarrApiKey).toConstantValue(process.env.RADARR_API_KEY);

// PATHS
container.bind<string>(TYPES.SonarrUrl).toConstantValue(process.env.SONARR_URL);
container.bind<string>(TYPES.RadarrUrl).toConstantValue(process.env.SONARR_URL);

// Services
container.bind<SonarrService>(TYPES.SonarrService).to(SonarrService).inSingletonScope();
container.bind<RadarrService>(TYPES.RadarrService).to(RadarrService).inSingletonScope();
container.bind<MessagingService>(TYPES.MessagingService).to(MessagingService).inSingletonScope();

// Libraries
container
	.bind<Client>(TYPES.Client)
	.toConstantValue(new Client({ intents: DISCORD_INTENTS }));
container.bind<SuperAgentStatic>(TYPES.Requests).toConstantValue(superagent);

export default container;
