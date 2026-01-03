import { INodeProperties } from 'n8n-workflow';

export const nodeProperties: INodeProperties[] = [
  /*{
    displayName: 'Модель ИИ',
    name: 'ai_model',
    type: 'options',
    required: true,
    default: '',
    typeOptions: {
      loadOptionsMethod: 'getItemsFromApi', // Имя метода для загрузки
      searchFilterRequired: true,           // Показывать поле поиска
      searchable: true,                     // Поиск в выпадающем списке
    },
  },*/
  {
    displayName: 'Модель ИИ',
    name: 'ai_model',
    type: 'string',
    default: ''
  },
  {
    displayName: 'Промт пользователя',
    name: 'user_message',
    type: 'string',
    typeOptions: {
      rows: 4,  // ← Это создает textarea высотой в 4 строки
    },
    default: ''
  },
  {
    displayName: 'Дополнительные опции',
    name: 'options',
    type: 'collection',
    placeholder: 'Добавить опцию',
    default: {},
    options: [
      {
        displayName: 'Соотношение сторон',
        name: 'aspect_ratio',
        type: 'options',
        options: [
          {
            name: '1:1 → 1024×1024 (по умолчанию)',
            value: '1:1',
          },
          {
            name: '2:3 → 832×1248',
            value: '2:3',
          },
          {
            name: '3:2 → 1248×832',
            value: '3:2',
          },
          {
            name: '3:4 → 864×1184',
            value: '3:4',
          },
          {
            name: '4:3 → 1184×864',
            value: '4:3',
          },
          {
            name: '4:5 → 896×1152',
            value: '4:5',
          },
          {
            name: '5:4 → 1152×896',
            value: '5:4',
          },
          {
            name: '9:16 → 768×1344',
            value: '9:16',
          },
          {
            name: '16:9 → 1344×768',
            value: '16:9',
          },
          {
            name: '21:9 → 1536×672',
            value: '21:9',
          },
        ],
        default: '1:1',
      },
      {
        displayName: 'Входящие фото',
        name: 'inputPhotos',
        type: 'json',  // ← Поле для JSON с подсветкой
        default: '[]',
      }
    ],
  },
];