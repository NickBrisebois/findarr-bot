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
    responses,
    responsesI18N,
    SONARR_POSTER_IMAGE_INDEX,
    states,
} from '../../services/messaging/messaging.service';
import {
    IncomingMessageParsed,
    MessageResponse,
    MediaRequest,
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
        this.client.on(
            'messageCreate',
            this.handleMessageOrInteraction.bind(this)
        );
        this.client.on('interactionCreate', (interaction: Interaction) => {
            if (interaction.isButton()) {
                this.handleMessageOrInteraction(interaction);
            }
        });

        // Watch for bot state changes
        this.messagingService.getStateWatcher().subscribe({
            next: (newState: states) => {
                this.currentState = newState;
            },
        });

        return this.client.login(this.token);
    }

    private handleMessageOrInteraction(message: Message | Interaction): void {
        let parsedMessage: IncomingMessageParsed;
        if (message instanceof Message) {
            if (message.author.bot) return;
            parsedMessage = this.parseIncomingMessage(message as Message);
        } else if (message.isButton()) {
            parsedMessage = this.parseIncomingInteraction(
                message as ButtonInteraction
            );
        } else {
            return;
        }

        this.messagingService.getResponse(parsedMessage).subscribe({
            next: (mediaReq: MediaRequest) => {
                if (mediaReq) {
                    const responseParser =
                        this.resultsParserMapper[this.currentState];

                    let responseMsg: any;
                    if (responseParser) {
                        responseMsg = responseParser(mediaReq);
                    } else {
                        message.reply('No parsers available');
                        return;
                    }

                    if (responseMsg) {
                        if (!responseMsg.editAsResponse) {
                            message
                                .reply(responseMsg.message)
                                .then(
                                    responseMsg.callbackFunc
                                        ? responseMsg.callbackFunc
                                        : () => {}
                                );
                        } else {
                            (message as ButtonInteraction)
                                .update(responseMsg.message)
                                .then((postedMsg: Message) => {
                                    if (responseMsg.callbackFunc) {
                                        responseMsg.callbackFunc(postedMsg);
                                    }
                                });
                        }
                    }
                }
            },
            error: (error: any) => {
                message.reply(error.message);
            },
        });
    }

    private craftShowResultsMessage(request: MediaRequest): MessageResponse {
        const showData = request.resultsOfSearch as SonarrShowInfo[];
        const numResults = showData.length;

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
        if (showData[0]?.images[SONARR_POSTER_IMAGE_INDEX]) {
            showResultsEmbed.setThumbnail(
                showData[0].images[SONARR_POSTER_IMAGE_INDEX]['url']
            );
        }

        // Create required number of button rows
        let buttonRows: MessageActionRow[] = [];
        for (let i = 0; i <= numResults / BUTTONS_PER_MSG_ROW; i++) {
            buttonRows.push(new MessageActionRow());
        }

        // Add buttons to button rows
        for (let i = 1; i <= numResults; i++) {
            const buttonRowIndex = Math.floor(i / BUTTONS_PER_MSG_ROW);
            buttonRows[buttonRowIndex].addComponents(
                new MessageButton()
                    .setCustomId(`${request.id}:${(i - 1).toString()}`) // i - 1 to get true index
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
            editAsResponse: false,
            callbackFunc: (postedMsg: Message) => {
                this.messagingService.setMediaRequestInitialResponseMsgId(
                    request.id,
                    postedMsg.id
                );
            },
        };
    }

    private craftSelectedShowMessage(mediaReq: MediaRequest): MessageResponse {
        const showData = mediaReq.chosenMedia as SonarrShowInfo;

        const showEmbed = new MessageEmbed();
        showEmbed.setTitle(`Request ${showData.title}?`);

        const msgEmbedData = `${showData.overview}`;
        showEmbed.setDescription(msgEmbedData);

        // Attach a thumbnail of the most likely requested show
        if (showData.images[SONARR_POSTER_IMAGE_INDEX]) {
            showEmbed.setImage(
                showData.images[SONARR_POSTER_IMAGE_INDEX]['url']
            );
        }

        const buttonContent = [responses.REQUEST, responses.CANCEL];
        let buttons: MessageButton[] = [];
        buttonContent.forEach((button: responses) => {
            buttons.push(
                new MessageButton()
                    .setCustomId(`${mediaReq.id}:${button}`)
                    .setLabel(responsesI18N[button])
                    .setStyle('SECONDARY')
            );
        });

        const messageContent = `Would you like to add this show (${showData.title}?)`;

        const message = {
            embeds: [showEmbed],
            components: [new MessageActionRow().addComponents(buttons)],
            content: messageContent,
        } as Message;

        return {
            message,
            editAsResponse: true,
            callbackFunc: null,
        };
    }

    // Takes an incoming Discord message and converts it to a generic one
    // that our messaging service can handle
    private parseIncomingMessage(message: Message): IncomingMessageParsed {
        const split = message.content.split(' ');

        // get the command ('ie !tv or !movie')
        const command = split[0];
        // get command content ('ie everything after !tv or !movie')
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
