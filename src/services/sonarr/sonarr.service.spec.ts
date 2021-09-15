import { Container, ContainerModule } from "inversify";
import { TYPES } from "../../types";
import { SuperAgentStatic } from "superagent";
import { mockSuperagent } from "../../tests/mocks/superagent";
import { SonarrService } from "./sonarr.service";
import { verify } from "ts-mockito";

describe('Sonarr Service', () => {

	let sonarrService: SonarrService;
	let container: Container;
	const MOCK_API_KEY = 'ABCDEFG123';
	const MOCK_BASE_URL = 'localhost:8989';

	beforeEach(() => {
		container = new Container();
		container.bind<string>(TYPES.SonarrUrl).toConstantValue(MOCK_BASE_URL);
		container.bind<string>(TYPES.SonarrApiKey).toConstantValue(MOCK_API_KEY);
		container.bind<SuperAgentStatic>(TYPES.Requests).toConstantValue(mockSuperagent as any);
		container.bind<SonarrService>(TYPES.SonarrService).to(SonarrService).inSingletonScope();
		sonarrService = container.get<SonarrService>(TYPES.SonarrService);
	});
	
	afterEach(() => {
		container = null;
	});

	describe('series lookup', () => {
		it('should call proper endpoint', async () => {
			const results = await sonarrService.seriesLookupByTerm('test').toPromise();
			verify(mockSuperagent.get()).once();
		})
	});
});