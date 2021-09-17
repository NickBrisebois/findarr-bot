import {
    Client,
    Intents,
    Message,
    MessageEmbed,
    MessagePayload,
} from 'discord.js';
import { inject, injectable } from 'inversify';
import { Observable } from 'rxjs';
import { numberToEmojiNumber } from '../../services/utils';
import {
    MessagingService,
    states,
} from '../../services/messaging/messaging.service';
import {
    IncomingMessageParsed,
    MessageResponse,
    ReturnedMessage,
    SonarrShowInfo,
    TYPES,
} from '../../types';

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

    // The current channel the bot is operating in
    // Updated automatically using messagingService.getStateWatcher
    private currentChannel: string;

    private currentState: states;

    resultsParserMapper = {
        [states.SHOW_REQUESTED]: this.craftShowResultsMessage.bind(this),
    };

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
        this.messagingService.getStateWatcher().subscribe({
            next: (newState: states) => {
                this.currentState = newState;
            },
        });

        this.client.on('messageCreate', (message: Message) => {
            if (message.author.bot) return;
            this.handleMessage(message);
        });

        return this.client.login(this.token);
    }

    private handleMessage(message: Message) {
        const parsedMessage = this.parseIncomingMessage(message);

        this.messagingService.getResponse(parsedMessage).subscribe({
            next: (returnedMsg: ReturnedMessage) => {
                if (returnedMsg) {
                    const responseMsg =
                        this.resultsParserMapper[this.currentState](
                            returnedMsg
                        );

                    if (responseMsg) {
                        message
                            .reply(responseMsg.message)
                            .then(responseMsg.callbackFunc);
                    }
                }
            },
            error: (error: any) => {
                message.reply(error.message);
            },
        });
    }

    private craftShowResultsMessage(shows: {
        responseData: SonarrShowInfo[];
        choices: number;
    }): MessageResponse {
        const showResultsEmbed = new MessageEmbed();
        showResultsEmbed.setTitle('Show Search Results');

        let index = 1;
        const showListing = shows.responseData
            .map(
                (show: SonarrShowInfo) =>
                    `${index++}) ${
                        show.title
                    } [TVDb Link](https://www.thetvdb.com/?id=${
                        show.tvdbId
                    }&tab=series)`
            )
            .join('\n');

        showResultsEmbed.setDescription(showListing);

        const message = { embeds: [showResultsEmbed] } as Message;

        return {
            message,
            callbackFunc: (sentMsg: Message) => {
                for (let i = 0; i < shows.choices; i++) {
                    sentMsg.react(numberToEmojiNumber(i + 1));
                }
            },
        };
    }

    // Takes an incoming Discord message and converts it to a generic one
    // that our messaging service can handle
    private parseIncomingMessage(message: Message): IncomingMessageParsed {
        const split = message.content.split(' ');
        const command = split[0];
        const content = split.splice(1, split.length).join(' ');

        return {
            user: message.author.username,
            command,
            content,
            id: message.id,
        } as IncomingMessageParsed;
    }
}
