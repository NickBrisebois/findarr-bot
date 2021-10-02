export const configSchema = {
    type: 'object',
    required: [
        'discord_token',
        'sonarr_api_key',
        'radarr_api_key',
        'sonarr_url',
        'radarr_url',
    ],
    properties: {
        discord_token: {
            type: 'string',
        },
        sonarr_api_key: {
            type: 'string',
        },
        radarr_api_key: {
            type: 'string',
        },
        sonarr_url: {
            type: 'string',
        },
        radarr_url: {
            type: 'string',
        },
    },
} as const;
