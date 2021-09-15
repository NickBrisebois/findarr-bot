import { Client, Intents, Message } from 'discord.js';
import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';

export const DISCORD_INTENTS = [
	Intents.FLAGS.GUILD_MESSAGE_TYPING,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
];

@injectable()
export class DiscordBot {

	private client: Client;
	private readonly token: string;

	constructor(
		@inject(TYPES.Client) client: Client,
		@inject(TYPES.DiscordToken) token: string,
	) {
		this.client = client;
		this.token = token;
	}

	public listen(): Promise<string> {
		this.client.on('message', (message: Message) => {
			console.log(`Message received. ${message.content}`);
		});
		return this.client.login(this.token);
	}
}