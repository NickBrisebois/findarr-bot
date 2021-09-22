import { inject, injectable } from 'inversify';
import { SonarrShowInfo, TYPES } from '../../types';
import { getSeriesLookup, getSeriesRequestByTvdbId } from './endpoints';
import { SuperAgentStatic } from 'superagent';
import { Observable } from 'rxjs';
import { observify } from '../utils';

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

    public requestSeriesByTvdbId(show: SonarrShowInfo): Observable<Object> {
        const endpoint = getSeriesRequestByTvdbId(this.sonarrBaseUrl);

        const payload = {
            tvdbId: show.tvdbId,
            title: show.title,
            profileId: show.profileId,
            titleSlug: show.titleSlug,
            images: show.images,
            seasons: show.seasons,
        };

        return observify(this.req.post(endpoint).send(payload));
    }
}
