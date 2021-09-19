import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { map, Observable, of, Subject, tap } from 'rxjs';
import {
    IncomingMessageParsed,
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

    private queuedSearchResults: SonarrShowInfo[] | RadarrMovieInfo[];

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
    ): Observable<ReturnedMessage> {
        if (
            this.currentState == states.READY &&
            Object.keys(this.commandMapping).indexOf(message.command) > -1
        ) {
            return this.commandMapping[message.command].bind(this)(
                message.content
            );
        } else if (this.currentState != states.READY && message.content) {
            console.log('test');
            return this.stateMapper[this.currentState].bind(this)(
                message.content
            );
        } else {
            return new Observable();
        }
    }

    private requestedShowResults() {}

    @command({ command: '!tv' })
    private addShow(requestedShow: string): Observable<ReturnedMessage> {
        return this.sonarrService.seriesLookupByTerm(requestedShow).pipe(
            map((showsResult: { body: Array<SonarrShowInfo> }) => {
                const trimmedShowsResult = showsResult.body.splice(
                    0,
                    LIST_NUMBER_SHOWS
                );
                const response = {
                    responseData: trimmedShowsResult,
                    numChoices: trimmedShowsResult.length,
                } as ReturnedMessage;
                return response;
            }),
            tap((showsResult: any) => {
                this.setState(states.SHOW_REQUESTED);
                this.queuedSearchResults = showsResult.responseData;
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
        chosenShowIndex: string
    ): Observable<ReturnedMessage> {
        const chosenShow = this.queuedSearchResults[parseInt(chosenShowIndex)];

        this.setState(states.SHOW_CHOSEN);

        return new Observable<ReturnedMessage>((subscriber) => {
            subscriber.next({
                responseData: chosenShow,
                numChoices: 0,
            } as ReturnedMessage);
        });
    }
}
