import { inject, injectable } from "inversify";
import { catchError, map, Observable, of, tap } from "rxjs";
import { SuperAgentRequest } from "superagent";
import {
	IncomingMessageParsed,
	ReturnedMessage,
	SonarrShowInfo,
	TYPES,
} from "../../types";
import { RadarrService } from "../radarr/radarr.service";
import { SonarrService } from "../sonarr/sonarr.service";

const enum states {
	READY,
	SHOW_REQUESTED,
	SHOW_CHOSEN,
	MOVIE_REQUESTED,
	MOVIE_CHOSEN,
	UNKNOWN_STATE,
}

@injectable()
export class MessagingService {
	private radarrService: RadarrService;
	private sonarrService: SonarrService;
	private currentState = states.READY;

	commandMapping = {
		"!tv": this.addShow.bind(this),
		"!movie": this.addMovie.bind(this),
	};

	stateMapper = {
		[states.SHOW_REQUESTED]: this.requestedShowResults.bind(this),
		[states.SHOW_CHOSEN]: this.lookupChosenShow.bind(this),
	};

	constructor(
		@inject(TYPES.RadarrService) radarrService: RadarrService,
		@inject(TYPES.SonarrService) sonarrService: SonarrService
	) {
		this.radarrService = radarrService;
		this.sonarrService = sonarrService;
	}

	public getResponse(
		message: IncomingMessageParsed
	): Observable<ReturnedMessage> {
		if (
			this.currentState == states.READY &&
			Object.keys(this.commandMapping).indexOf(message.command) > -1
		) {
			return this.commandMapping[message.command](message.content);
		} else if (this.currentState != states.READY) {
			return this.stateMapper[message.command](message.command);
		} else {
			this.currentState = states.UNKNOWN_STATE;
			return of({ currentState: this.currentState } as ReturnedMessage);
		}
	}

	private requestedShowResults() {}

	private addShow(requestedShow: string): Observable<ReturnedMessage> {
		return this.sonarrService.seriesLookupByTerm(requestedShow).pipe(
			map(
				(shows: object) =>
					({
						currentState: this.currentState,
						responseData: shows["body"].map(
							(show: SonarrShowInfo) => {
								return show.title;
							}
						),
					} as ReturnedMessage)
			),
			tap(() => {
				this.currentState = states.SHOW_REQUESTED;
			})
		);
	}

	private lookupChosenShow() {}

	private addMovie(requestedMovie: string) {
		this.currentState = states.MOVIE_REQUESTED;
	}
}
