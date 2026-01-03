"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterApi = void 0;
class OpenRouterApi {
    constructor() {
        this.name = 'OpenRouterApi';
        this.icon = 'file:openrouter.svg';
        this.displayName = 'Параметры доступа к OpenRouter API';
        this.documentationUrl = 'https://docs.example.com/api';
        this.properties = [
            {
                displayName: 'API URL',
                name: 'apiUrl',
                type: 'string',
                default: 'https://openrouter.ai/api/v1/chat/completions',
                required: true,
            },
            {
                displayName: 'OpenRouter API Key',
                name: 'apiKey',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                required: true,
            },
        ];
        /*
          test: ICredentialTestRequest = {
            request: {
              method: 'GET',
              url: '={{$credentials.apiUrl}}/health',
              headers: {
                'X-API-Key': '={{$credentials.apiKey}}',
                'X-API-Secret': '={{$credentials.apiSecret}}',
              },
            },
          };*/
    }
}
exports.OpenRouterApi = OpenRouterApi;
//# sourceMappingURL=OpenRouterApi.credentials.js.map