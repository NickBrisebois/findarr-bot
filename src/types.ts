import { Message } from 'discord.js';

export const TYPES = {
	// Bots
	DiscordBot: Symbol('DiscordBot'),
	Client: Symbol('Client'),

	// API Keys
	DiscordToken: Symbol('DiscordToken'),
	SonarrApiKey: Symbol('SonarrApiKey'),
	RadarrApiKey: Symbol('RadarrApiKey'),

	// Paths
	SonarrUrl: Symbol('SonarrUrl'),
	RadarrUrl: Symbol('RadarrUrl'),

	// Services
	SonarrService: Symbol('SonarrService'),
	RadarrService: Symbol('RadarrService'),
	MessagingService: Symbol('MessagingService'),

	// Libraries
	Requests: Symbol('Requests'),
};

export interface IncomingMessageParsed {
	content: string;
	command: string;
	user: string;
	id: string;
}

export interface ReturnedMessage {
	responseData: object;
}

export interface SonarrShowInfo {
	title: string;
	sortTitle: string;
	seasonCount: number;
	status: string;
	overview: string;
	network: string;
	airTime: string;
	images?: string[] | null;
	remotePoster: string;
	seasons?: string[] | null;
	year: number;
	profileId: number;
	languageProfileId: number;
	seasonFolder: boolean;
	monitored: boolean;
	useSceneNumbering: boolean;
	runtime: number;
	tvdbId: number;
	tvRageId: number;
	tvMazeId: number;
	firstAired: string;
	seriesType: string;
	cleanTitle: string;
	imdbId: string;
	titleSlug: string;
	genres?: string[] | null;
	tags?: null[] | null;
	added: string;
	ratings?: string[] | null;
	qualityProfileId: number;
}

// todo
export interface RadarrMovieInfo {
	[key: string]: string;
}

export interface MessageResponse {
	message: Message;
	callbackFunc: Function;
}
