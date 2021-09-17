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
const LIST_NUMBER_SHOWS = 9;

const NEW_STATE_EVENT = 'newState';

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
        [states.SHOW_REQUESTED]: this.requestedShowResults.bind(this),
        [states.SHOW_CHOSEN]: this.lookupChosenShow.bind(this),
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
        } else if (this.currentState != states.READY) {
            return this.stateMapper[message.command](message.command);
        } else {
            this.currentState = states.UNKNOWN_STATE;
            return of({} as ReturnedMessage);
        }
    }

    private requestedShowResults() {}

    @command({ command: '!tv' })
    private addShow(requestedShow: string): Observable<ReturnedMessage> {
        return this.sonarrService.seriesLookupByTerm(requestedShow).pipe(
            map(
                (showsResult: { body: Array<SonarrShowInfo> }) =>
                    ({
                        responseData: showsResult.body.splice(
                            0,
                            LIST_NUMBER_SHOWS
                        ) as SonarrShowInfo[],
                        choices: LIST_NUMBER_SHOWS,
                    } as ReturnedMessage)
            ),
            tap((showsResult: any) => {
                this.setState(states.SHOW_REQUESTED);
                this.queuedSearchResults = showsResult;
            })
        );
    }

    @command({ command: '!movie' })
    private addMovie(requestedMovie: string) {
        this.setState(states.MOVIE_REQUESTED);
    }

    private setState(newState: states) {
        this.currentState = newState;
        this.stateChange.next(this.currentState);
    }

    public getStateWatcher(): Observable<states> {
        return this.stateChange.asObservable();
    }

    private lookupChosenShow() {}
}
