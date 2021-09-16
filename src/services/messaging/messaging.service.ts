import { inject, injectable } from "inversify";
import { map, Observable } from "rxjs";
import { IncomingMessageParsed, ReturnedMessage, TYPES } from "../../types";
import { RadarrService } from "../radarr/radarr.service";
import { SonarrService } from "../sonarr/sonarr.service";

const enum states {
	READY,
	SHOW_REQUESTED,
	SHOW_CHOSEN,
	MOVIE_REQUESTED,
	MOVIE_CHOSEN,	
}

@injectable()
export class MessagingService {
	private radarrService: RadarrService;
	private sonarrService: SonarrService;
	private currentState = states.READY;

	commandMapping = {
		'!tv': this.addShow.bind(this),
		'!movie': this.addMovie.bind(this),
	}

	stateMapper = {
		[states.SHOW_REQUESTED]: this.requestedShowResults,
		[states.SHOW_CHOSEN]: this.lookupChosenShow,
	};

	constructor(
		@inject(TYPES.RadarrService) radarrService: RadarrService,
		@inject(TYPES.SonarrService) sonarrService: SonarrService,
	) {
		this.radarrService = radarrService;
		this.sonarrService = sonarrService;
	}

	public getResponse(message: IncomingMessageParsed): Observable<ReturnedMessage> {
		if (this.currentState == states.READY && Object.keys(this.commandMapping).indexOf(message.command) > -1) {
			return this.commandMapping[message.command]();
		} else if (this.currentState != states.READY) {
			return this.stateMapper[message.command]();
		} else {
			return null;
		}
	}

	private requestedShowResults() {

	}

	private addShow(requestedShow: string): Observable<ReturnedMessage> {
		this.currentState = states.SHOW_REQUESTED;
		return this.sonarrService.seriesLookupByTerm(requestedShow).pipe(map((shows) => ({
			currentState: this.currentState,
			responseData: shows,
		} as ReturnedMessage)));
	}

	private lookupChosenShow() {

	}

	private addMovie(requestedMovie: string) {
		this.currentState = states.MOVIE_REQUESTED;

	}
}