import express, { Express, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { FindarrConfig, TYPES } from '../../types';
import { ConfigDatabaseService } from '../config_database/config-database.service';

@injectable()
export class ApiService {
    findarrApi: Express | null = null;
    port = 9000;

    constructor(
        @inject(TYPES.ConfigDatabaseService)
        protected configDatabaseService: ConfigDatabaseService
    ) {}

    public async start(): Promise<void> {
        // Initialize DB
        this.configDatabaseService.init().then(() => {
            this.findarrApi = express();
            this.findarrApi.listen(this.port, () => {
                console.log(`Findarr API started on port ${this.port}`);
                this.initEndpoints();
            });
        });
    }

    private initEndpoints(): void {
        this.findarrApi.get('/api/v1/config/', this.getConfig.bind(this));
        this.findarrApi.post('api/v1/config/', this.updateConfig.bind(this));
    }

    private getConfig(req: Request, res: Response) {
        this.configDatabaseService.getConfig().then((config: FindarrConfig) => {
            res.send(config);
        });
    }

    private updateConfig(req: Request, res: Response) {
        console.log(req);
    }
}
