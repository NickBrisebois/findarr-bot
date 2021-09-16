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
	currentState: any;
	responseData: object;	
}