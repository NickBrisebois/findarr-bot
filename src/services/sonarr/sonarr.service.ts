import { inject, injectable } from 'inversify';
import { TYPES } from '../../types';
import superagent from 'superagent';

@injectable()
export class SonarrService {

	private readonly apiKey: string;
	private readonly sonarrBaseUrl: string;

	constructor(
		@inject(TYPES.SonarrApiKey) apiKey: string,
		@inject(TYPES.SonarrUrl) sonarrBaseUrl: string,
	) {
		this.apiKey = apiKey;
		this.sonarrBaseUrl = sonarrBaseUrl;
	}

	seriesLookup(tvdbId: string) {
	}

}