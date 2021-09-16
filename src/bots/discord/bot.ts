import { Client, Intents, Message, MessagePayload } from 'discord.js';
import { inject, injectable } from 'inversify';
import { MessagingService } from '../../services/messaging/messaging.service';
import { IncomingMessageParsed, ReturnedMessage, TYPES } from '../../types';

export const DISCORD_INTENTS = [
	Intents.FLAGS.GUILD_MESSAGE_TYPING,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
];

@injectable()
export class DiscordBot {

	private client: Client;
	private readonly token: string;
	private messagingService: MessagingService;

	constructor(
		@inject(TYPES.Client) client: Client,
		@inject(TYPES.DiscordToken) token: string,
		@inject(TYPES.MessagingService) messagingService: MessagingService,
	) {
		this.client = client;
		this.token = token;
		this.messagingService = messagingService;
	}

	public listen(): Promise<string> {
		this.client.on('messageCreate', (message: Message) => {
			return this.handleMessage(message);
		});

		return this.client.login(this.token);
	}

	private handleMessage(message: Message) {
		const parsedMessage = this.parseIncomingMessage(message);
		const response = this.messagingService.getResponse(parsedMessage);
		const parsedResponse = this.parseReturnedMessage(response);

		message.channel.send('ayylmao');
		message.reply(parsedResponse as string);	
	}

	// Takes an incoming Discord message and converts it to a generic one
	// that our messaging service can handle
	private parseIncomingMessage(message: Message): IncomingMessageParsed {
		return {
			user: message.author.username,
			content: message.content,
			id: message.id,
		} as IncomingMessageParsed;
	}

	// Takes a returned message from our messaging service and converts it
	// to a discord one
	private parseReturnedMessage(message: ReturnedMessage | ReturnedMessage[]): string | string[] {
		return 'Ayylmao';
	}
}