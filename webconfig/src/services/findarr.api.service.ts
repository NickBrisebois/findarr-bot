import { FindarrConfig } from '../types';
import superagent, { SuperAgentRequest, SuperAgentStatic } from 'superagent';

const getConfigPath = () => `http://localhost:9000/api/v1/config`;

export class FindarrApiService {
    request: SuperAgentStatic = superagent;

    public setConfig(newConfig: FindarrConfig): void {
        this.request.post(getConfigPath()).send(newConfig);
    }

    public getConfig(): Promise<any> {
        return this.request
            .get(getConfigPath())
            .withCredentials()
            .set('Access-Control-Allow-Origin', '*')
            .set('Accept', 'application/json')
            .set('Access-Control-Allow-Credentials', 'true')
            .set('Access-Control-Allow-Methods', 'GET');
    }
}
