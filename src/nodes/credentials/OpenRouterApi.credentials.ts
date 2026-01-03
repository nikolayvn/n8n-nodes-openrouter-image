import {
  ICredentialType,
  INodeProperties,
  // Themed,
  ///ICredentialTestRequest,
} from 'n8n-workflow';

export class OpenRouterApi implements ICredentialType {
  name = 'OpenRouterApi';
  icon = 'file:openrouter.svg';
  displayName = 'Параметры доступа к OpenRouter API';
  documentationUrl = 'https://docs.example.com/api';
  properties: INodeProperties[] = [
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