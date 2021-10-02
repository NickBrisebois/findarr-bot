import express, { Express, Request, Response } from 'express';
import { ValidationError, Validator } from 'express-json-validator-middleware';
import { inject, injectable } from 'inversify';
import { FindarrConfig, TYPES } from '../../types';
import { ConfigDatabaseService } from '../config_database/config-database.service';
import { configSchema } from '../config_database/config-schema';

@injectable()
export class ApiService {
    findarrApi: Express | null = null;
    port = 9000;
    validator: Validator = null;

    constructor(
        @inject(TYPES.ConfigDatabaseService)
        protected configDatabaseService: ConfigDatabaseService
    ) {}

    public async start(): Promise<void> {
        // Initialize DB
        this.configDatabaseService.init().then(() => {
            this.validator = new Validator({});
            this.findarrApi = express();

            this.findarrApi.use(express.json());
            this.findarrApi.use(express.urlencoded({ extended: true }));
            this.findarrApi.use((error, req: Request, res: Response, next) => {
                if (error instanceof ValidationError) {
                    res.status(400).send(error.validationErrors);
                    next();
                }
                next(error);
            });

            this.initEndpoints();

            this.findarrApi.listen(this.port, () => {
                console.log(`Findarr API started on port ${this.port}`);
            });
        });
    }

    private initEndpoints(): void {
        this.findarrApi.get('/api/v1/config/', this.getConfig.bind(this));
        this.findarrApi.post(
            '/api/v1/config/',
            this.validator.validate({ body: configSchema as any }),
            this.updateConfig.bind(this)
        );
        console.log('Initialization of endpoints complete');
    }

    private getConfig(req: Request, res: Response) {
        this.configDatabaseService.getConfig().then((config: FindarrConfig) => {
            res.send(config);
        });
    }

    private updateConfig(req, res, next) {
        this.configDatabaseService.updateConfiguration(req.body);
        this.getConfig(req, res);
    }
}
