import { Client, Intents, Message, MessagePayload } from "discord.js";
import { inject, injectable } from "inversify";
import { Observable } from "rxjs";
import { MessagingService } from "../../services/messaging/messaging.service";
import { IncomingMessageParsed, ReturnedMessage, TYPES } from "../../types";

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
		@inject(TYPES.MessagingService) messagingService: MessagingService
	) {
		this.client = client;
		this.token = token;
		this.messagingService = messagingService;
	}

	public listen(): Promise<string> {
		this.client.on("messageCreate", (message: Message) => {
			if (message.author.bot) return;
			this.handleMessage(message);
		});

		return this.client.login(this.token);
	}

	private handleMessage(message: Message) {
		const parsedMessage = this.parseIncomingMessage(message);
		this.messagingService.getResponse(parsedMessage).subscribe({
			next: (returnedMsg: ReturnedMessage) => {
				console.log(returnedMsg);
				if (returnedMsg) {
					const parsedResponse =
						this.parseReturnedMessage(returnedMsg);
					if (parsedResponse) {
						message.reply(parsedResponse as string);
					}
				}
			},
			error: (error: any) => {
				message.reply(error.message);
			},
		});
	}

	// Takes an incoming Discord message and converts it to a generic one
	// that our messaging service can handle
	private parseIncomingMessage(message: Message): IncomingMessageParsed {
		const split = message.content.split(" ");
		const command = split[0];
		const content = split.splice(1, split.length).join(" ");

		return {
			user: message.author.username,
			command,
			content,
			id: message.id,
		} as IncomingMessageParsed;
	}

	// Takes a returned message from our messaging service and converts it
	// to a discord one
	private parseReturnedMessage(message: ReturnedMessage): string {
		if (message === null) return;
		return message.responseData.toString();
	}
}
