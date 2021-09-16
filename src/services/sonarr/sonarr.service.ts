import { inject, injectable } from "inversify";
import { TYPES } from "../../types";
import { getSeriesLookup } from "./endpoints";
import { SuperAgentStatic } from "superagent";
import { Observable } from "rxjs";
import { observify } from "../utils";

@injectable()
export class SonarrService {
	private readonly apiKey: string;
	private readonly sonarrBaseUrl: string;
	private readonly req: SuperAgentStatic;

	constructor(
		@inject(TYPES.SonarrApiKey) apiKey: string,
		@inject(TYPES.SonarrUrl) sonarrBaseUrl: string,
		@inject(TYPES.Requests) req: SuperAgentStatic
	) {
		this.apiKey = apiKey;
		this.sonarrBaseUrl = sonarrBaseUrl;
		this.req = req;
	}

	public seriesLookupById(tvdbId: string): Observable<any> {
		const endpoint = getSeriesLookup(this.sonarrBaseUrl);

		return observify(
			this.req.get(endpoint).query({
				apiKey: this.apiKey,
				tvdbId,
			})
		);
	}

	public seriesLookupByTerm(term: string): Observable<Object> {
		const endpoint = getSeriesLookup(this.sonarrBaseUrl);
		return observify(
			this.req.get(endpoint).query({
				apiKey: this.apiKey,
				term,
			})
		);
	}
}
