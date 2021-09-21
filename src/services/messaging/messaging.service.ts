import { inject, injectable } from 'inversify';
import { map, Observable, of, Subject, tap } from 'rxjs';
import {
    IncomingMessageParsed,
    MediaType,
    MediaRequest,
    RadarrMovieInfo,
    ReturnedMessage,
    SonarrShowInfo,
    TYPES,
} from '../../types';
import { RadarrService } from '../radarr/radarr.service';
import { SonarrService } from '../sonarr/sonarr.service';
import { command, commands } from './command.decorator';

// show <num> shows when searching
// max is 9 unless you want to get ~complicated~ (because number emojis only go to 9)
const LIST_NUMBER_SHOWS = 9;
const NEW_STATE_EVENT = 'newState';

// Index of 'poster' image in show image array
export const SONARR_POSTER_IMAGE_INDEX = 1;

export const enum states {
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
    private currentState;
    private commandMapping: object;
    private stateChange: Subject<states>;
    private requestQueue: MediaRequest[] = [];

    stateMapper = {
        [states.SHOW_REQUESTED]: this.lookupChosenShow,
        [states.SHOW_CHOSEN]: this.lookupChosenShow,
    };

    constructor(
        @inject(TYPES.RadarrService) radarrService: RadarrService,
        @inject(TYPES.SonarrService) sonarrService: SonarrService
    ) {
        this.radarrService = radarrService;
        this.sonarrService = sonarrService;
        this.commandMapping = commands;
        this.stateChange = new Subject<states>();
        this.setState(states.READY);
    }

    public getResponse(
        message: IncomingMessageParsed
    ): Observable<MediaRequest> {
        if (
            this.currentState == states.READY &&
            Object.keys(this.commandMapping).indexOf(message.command) > -1
        ) {
            return this.commandMapping[message.command].bind(this)(
                message.id,
                message.content
            );
        } else if (this.currentState != states.READY && message.content) {
            const splitContent = message.content.split(':');
            const requestId = splitContent[0];
            const choice = splitContent[1];

            return this.stateMapper[this.currentState].bind(this)(
                requestId,
                choice
            );
        } else {
            return new Observable();
        }
    }

    private requestedShowResults() {}

    @command({ command: '!tv' })
    private addShow(
        id: string,
        requestedShow: string
    ): Observable<MediaRequest> {
        return this.sonarrService.seriesLookupByTerm(requestedShow).pipe(
            map((showsResult: { body: Array<SonarrShowInfo> }) => ({
                id: id,
                messageId: id,
                type: MediaType.SHOW,
                resultsOfSearch: showsResult.body.splice(0, LIST_NUMBER_SHOWS),
                chosenMedia: null,
            })),
            tap((request: any) => {
                this.setState(states.SHOW_REQUESTED);
                this.requestQueue.push(request);
            })
        );
    }

    @command({ command: '!movie' })
    private addMovie(requestedMovie: string) {
        this.setState(states.MOVIE_REQUESTED);
    }

    // Set the current state and alert any subscribers of the state change
    private setState(newState: states) {
        this.currentState = newState;
        this.stateChange.next(this.currentState);
    }

    public getStateWatcher(): Observable<states> {
        return this.stateChange.asObservable();
    }

    private lookupChosenShow(
        requestId: string,
        chosenShowIndex: string
    ): Observable<MediaRequest> {
        console.log('lookup chosen show');
        const queuedRequest = this.requestQueue.find(
            (request: MediaRequest) => request.id === requestId
        );
        if (!queuedRequest) return null;
        queuedRequest.chosenMedia =
            queuedRequest.resultsOfSearch[parseInt(chosenShowIndex)];

        this.setState(states.SHOW_CHOSEN);

        return new Observable<MediaRequest>((subscriber) => {
            subscriber.next(queuedRequest);
        });
    }
}
