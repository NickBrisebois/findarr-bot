import express, { Express } from 'express';
import { injectable } from 'inversify';

@injectable()
export class ApiService {
    findarrApi: Express | null;
    port: number = 9000;

    constructor() {}

    public async start(): Promise<void> {
        this.findarrApi = express();
        this.findarrApi.listen(this.port, () => {
            console.log(`Findarr API started on port ${this.port}`);
        });
    }

    public initEndpoints(): void {
        this.findarrApi.get('/api/v1/config/', (req, res) => {
            console.log(res);
        });
    }
}
