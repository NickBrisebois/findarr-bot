import { injectable } from 'inversify';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import fs from 'fs';
import { FindarrConfig } from 'src/types';

const DIRS_REQUIRED = [`${process.env.HOME}/.local/share/findarr/`];

const CONFIG = {
    filename: `${process.env.HOME}/.local/share/findarr/database.db`,
    driver: sqlite3.Database,
};

const CONFIG_ID = 1;

@injectable()
export class ConfigDatabaseService {
    db: Database<sqlite3.Database, sqlite3.Statement>;

    constructor() {}

    public async init(): Promise<void> {
        // sanity
        this.verifyDirectories();

        // init
        sqlite3.verbose();
        this.db = await open(CONFIG);
        await this.initializeDatabase();
        await this.createDefaultConfig();
    }

    public getDb(): Database<sqlite3.Database, sqlite3.Statement> {
        return this.db;
    }

    private async initializeDatabase(): Promise<void> {
        return this.db.exec(
            `CREATE TABLE IF NOT EXISTS
                 findarr_config (
                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                     discord_token TEXT,
                     sonarr_api_key TEXT,
                     radarr_api_key TEXT,
                     sonarr_url TEXT,
                     radarr_url TEXT
                 );`
        );
    }

    // verify or create directories needed by findarr
    private verifyDirectories(): void {
        DIRS_REQUIRED.forEach((dir: string) => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });
    }

    public async getConfig(): Promise<FindarrConfig> {
        const currentConfig = await this.db.get(
            'SELECT id FROM findarr_config WHERE id = ?',
            CONFIG_ID
        );
        return currentConfig as FindarrConfig;
    }

    public async createDefaultConfig(): Promise<FindarrConfig> {
        const currentConfig = await this.getConfig();

        // skip creating config if it already exists
        if (currentConfig) return;

        const defaultConfig = {
            discord_token: '',
            sonarr_api_key: '',
            radarr_api_key: '',
            sonarr_url: '',
            radarr_url: '',
        };

        await this.db.run(
            `INSERT INTO findarr_config 
                (discord_token, sonarr_api_key, radarr_api_key, sonarr_url, radarr_url)
                VALUES (?, ?, ?, ?, ?)
            `,
            Object.values(defaultConfig)
        );

        return await this.getConfig();
    }

    public async updateConfiguration(
        newConfig: FindarrConfig
    ): Promise<FindarrConfig> {
        // Create default config if it doesn't exist
        this.createDefaultConfig();

        const result = await this.db.run(
            `UPDATE findarr_config 
                SET discord_token = discord_token,
                sonarr_api_key = sonarr_api_key,
                radarr_api_key = radarr_api_key,
                sonarr_url = sonarr_url,
                radarr_url = radarr_url
             WHERE id = id
            `,
            ...Object.values(newConfig)
        );

        return await this.getConfig();
    }
}
