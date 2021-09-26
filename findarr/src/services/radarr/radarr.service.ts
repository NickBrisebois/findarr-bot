import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import { SuperAgentStatic } from 'superagent';

@injectable()
export class RadarrService {

	private readonly apiKey: string;
	private readonly radarrBaseUrl: string;

	constructor(
		@inject(TYPES.RadarrApiKey) apiKey: string,
		@inject(TYPES.RadarrUrl) radarrBaseUrl: string,
	) {
		this.apiKey = apiKey;
		this.radarrBaseUrl = radarrBaseUrl;
	}

}
