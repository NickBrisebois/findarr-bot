import {
    ButtonInteraction,
    Client,
    Intents,
    Interaction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
    MessagePayload,
} from 'discord.js';
import { inject, injectable } from 'inversify';
import {
    MessagingService,
    SONARR_POSTER_IMAGE_INDEX,
    states,
} from '../../services/messaging/messaging.service';
import {
    IncomingMessageParsed,
    MessageResponse,
    RadarrMovieInfo,
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

const BUTTONS_PER_MSG_ROW = 5;

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
        [states.SHOW_CHOSEN]: this.craftSelectedShowMessage.bind(this),
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
        // Watch for bot state changes
        this.messagingService.getStateWatcher().subscribe({
            next: (newState: states) => {
                this.currentState = newState;
            },
        });

        this.client.on(
            'messageCreate',
            this.handleMessageOrInteraction.bind(this)
        );
        this.client.on('interactionCreate', (interaction: Interaction) => {
            if (interaction.isButton()) {
                this.handleMessageOrInteraction(interaction);
            }
        });

        return this.client.login(this.token);
    }

    private handleMessageOrInteraction(message: Message | Interaction): void {
        let parsedMessage: IncomingMessageParsed;
        if (message instanceof Message) {
            if (message.author.bot) return;
            parsedMessage = this.parseIncomingMessage(message as Message);
        } else {
            if (!message.isButton()) return;
            parsedMessage = this.parseIncomingInteraction(
                message as ButtonInteraction
            );
        }

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
                            .then(
                                responseMsg.callbackFunc
                                    ? responseMsg.callbackFunc
                                    : () => {}
                            );
                    }
                }
            },
            error: (error: any) => {
                message.reply(error.message);
            },
        });
    }

    private craftShowResultsMessage(shows: ReturnedMessage): MessageResponse {
        const showData: SonarrShowInfo[] =
            shows.responseData as SonarrShowInfo[];

        const showResultsEmbed = new MessageEmbed();
        showResultsEmbed.setTitle('Show Search Results');

        let index = 1;
        const showListing = showData
            .map(
                (show: SonarrShowInfo | RadarrMovieInfo) =>
                    `${index++}) ${
                        show.title
                    } [TVDb Link](https://www.thetvdb.com/?id=${
                        show.tvdbId
                    }&tab=series)`
            )
            .join('\n');

        showResultsEmbed.setDescription(showListing);

        // Attach a thumbnail of the most likely requested show
        if (shows.responseData[0]?.images[SONARR_POSTER_IMAGE_INDEX]) {
            showResultsEmbed.setThumbnail(
                shows.responseData[0].images[SONARR_POSTER_IMAGE_INDEX]['url']
            );
        }

        // Create required number of button rows
        let buttonRows: MessageActionRow[] = [];
        for (let i = 0; i <= shows.numChoices / BUTTONS_PER_MSG_ROW; i++) {
            buttonRows.push(new MessageActionRow());
        }

        // Add buttons to button rows
        for (let i = 1; i <= shows.numChoices; i++) {
            const buttonRowIndex = Math.floor(i / BUTTONS_PER_MSG_ROW);
            buttonRows[buttonRowIndex].addComponents(
                new MessageButton()
                    .setCustomId(i.toString())
                    .setLabel(i.toString())
                    .setStyle('SECONDARY')
            );
        }

        const message = {
            embeds: [showResultsEmbed],
            components: buttonRows,
        } as Message;

        return {
            message,
        };
    }

    private craftSelectedShowMessage(selectedShow: ReturnedMessage) {
        const showData: SonarrShowInfo =
            selectedShow.responseData as SonarrShowInfo;

        const showEmbed = new MessageEmbed();
        showEmbed.setTitle('Chosen Show');

        const msgEmbedData = `${showData.title}`;
        showEmbed.setDescription(msgEmbedData);

        const message = {
            embeds: [showEmbed],
        };

        return {
            message,
        };
    }

    // Takes an incoming Discord message and converts it to a generic one
    // that our messaging service can handle
    private parseIncomingMessage(message: Message): IncomingMessageParsed {
        const split = message.content.split(' ');
        const command = split[0];
        const content = split.splice(1, split.length).join(' ');

        return {
            user: message.author.id,
            command,
            content,
            id: message.id,
        } as IncomingMessageParsed;
    }

    private parseIncomingInteraction(
        interaction: ButtonInteraction
    ): IncomingMessageParsed {
        return {
            user: interaction.user.id,
            content: interaction.customId,
            command: '',
            id: interaction.id,
        };
    }
}
