"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenRouterImage = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const OpenRouterImageDescription_1 = require("./OpenRouterImageDescription");
class OpenRouterImage {
    constructor() {
        this.description = {
            displayName: 'OpenRouter Image',
            name: 'openRouterImage',
            icon: 'file:icon.svg',
            group: ['transform'],
            version: 1,
            subtitle: 'OpenRouter Image',
            description: 'OpenRouter Image for n8n',
            defaults: {
                name: 'OpenRouter Image',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    displayName: 'OpenRouter API',
                    name: 'OpenRouterApi',
                    required: true,
                },
            ],
            properties: OpenRouterImageDescription_1.nodeProperties,
        };
    }
    /*
    methods = {
        loadOptions: {
            async getItemsFromApi(this: ILoadOptionsFunctions, filter?: string): Promise<INodePropertyOptions[]> {
                try {
                    const credentials = await this.getCredentials('myApiCustomNode');
                    const { apiKey } = credentials as { apiKey: string };

                    const response = await this.helpers.httpRequest({
                        method: 'GET',
                        url: 'https://openrouter.ai/api/v1/models/user',
                        headers: {
                            'Authorization': `Bearer ${apiKey}`,
                            'Content-Type': 'application/json',
                        },
                    });

                    const data = (response.data || []).filter((e: any) =>
                         e
                        //e.architecture?.output_modalities?.some((modality: string) => modality === 'image')
                    );

                    return data.map((item: any) => ({
                        name: item.id,
                        value: item.id,
                        description: `${item.name?.substring(0, 50)}${item.name?.length > 50 ? '...' : ''}`,
                    }));

                } catch (error) {
                    console.error('API request failed:', error);
                    // Fallback данные
                    return [
                        { name: 'Google Gemini 2.5 Flash Image', value: 'google/gemini-2.5-flash-image-preview', description: 'Latest Google image model' },
                        { name: 'DALL-E 3', value: 'openai/dall-e-3', description: 'OpenAI image generation' },
                        { name: 'Stable Diffusion XL', value: 'stabilityai/stable-diffusion-xl', description: 'Open source image model' },
                    ];
                }
            },
        },
    };*/
    async execute() {
        const returnData = [];
        const items = this.getInputData();
        const itemIndex = 0;
        try {
            // Получаем credentials
            const credentials = await this.getCredentials('OpenRouterApi');
            const { apiKey, apiUrl = 'https://openrouter.ai/api/v1/chat/completions' } = credentials;
            // Проверяем API key
            if (!apiKey) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'API Key не указан');
            }
            // Получаем параметры
            const model = this.getNodeParameter('ai_model', itemIndex, 'google/gemini-2.5-flash-image-preview');
            const user_message = this.getNodeParameter('user_message', itemIndex, '');
            const aspect_ratio = this.getNodeParameter('options.aspect_ratio', itemIndex, '1:1');
            const inputPhotos = this.getNodeParameter('options.inputPhotos', itemIndex, []);
            console.log('inputPhotos', inputPhotos);
            // Формируем messages
            const messages = [];
            const user_contents = [];
            if (user_message.trim().length > 0) {
                user_contents.push({
                    type: 'text',
                    text: user_message.trim()
                });
            }
            if (inputPhotos.length > 0) {
                inputPhotos.map(url => {
                    user_contents.push({
                        type: 'image_url',
                        image_url: { url: url.trim() }
                    });
                });
            }
            if (user_contents.length > 0) {
                messages.push({ role: 'user', content: user_contents });
            }
            // Проверяем что есть хотя бы одно сообщение
            if (messages.length === 0) {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Either user_message or system_message is required');
            }
            // Формируем тело запроса
            const requestBody = {
                model,
                messages,
                output_modalities: ['image'],
                modalities: ['image', 'text'],
                image_config: {
                    aspect_ratio,
                },
            };
            console.log('requestBody:', JSON.stringify(requestBody, null, 2));
            // Отправляем запрос
            const response = await this.helpers.httpRequest({
                method: 'POST',
                url: apiUrl,
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: requestBody,
                json: true,
                timeout: 300000,
            });
            if (response.choices && response.choices.length > 0) {
                const message = response.choices[0].message;
                let images = [];
                // Вариант 1: изображения в message.images
                if (message.images && Array.isArray(message.images)) {
                    images = message.images;
                }
                // Вариант 2: изображения в message.content (массив)
                else if (message.content && Array.isArray(message.content)) {
                    images = message.content.filter((item) => item.type === 'image' && item.image_url).map((item) => ({ image_url: item.image_url }));
                }
                // Вариант 3: изображение в виде base64 в тексте
                else if (message.content && typeof message.content === 'string' && message.content.includes('data:image')) {
                    const base64Match = message.content.match(/data:image\/[^;]+;base64,[^"]+/);
                    if (base64Match) {
                        images = [{ image_url: base64Match[0] }];
                    }
                }
                // Обрабатываем каждое изображение
                for (let imgIndex = 0; imgIndex < images.length; imgIndex++) {
                    const image = images[imgIndex];
                    try {
                        let imageBuffer;
                        let mimeType = 'image/png';
                        // Получаем URL изображения (может быть строка или объект)
                        let imageUrl;
                        if (typeof image === 'string') {
                            // Если image это просто строка URL
                            imageUrl = image;
                        }
                        else if (image && typeof image === 'object') {
                            // Если image это объект
                            if (typeof image.image_url === 'string') {
                                imageUrl = image.image_url;
                            }
                            else if (image.url) {
                                imageUrl = image.url;
                            }
                            else if (image.image_url?.url) {
                                imageUrl = image.image_url.url;
                            }
                        }
                        // Проверяем что у нас есть URL
                        if (!imageUrl) {
                            console.warn(`Image ${imgIndex + 1} has no valid URL:`, image);
                            continue;
                        }
                        console.log(`Processing image ${imgIndex + 1}: ${imageUrl.substring(0, 100)}...`);
                        // Проверяем формат изображения
                        if (imageUrl.startsWith('data:image/')) {
                            // Base64 изображение
                            const base64Data = imageUrl.split(',')[1];
                            mimeType = imageUrl.match(/data:(image\/[^;]+);base64/)?.[1] || 'image/png';
                            imageBuffer = Buffer.from(base64Data, 'base64');
                            console.log(`Processing base64 image ${imgIndex + 1}, type: ${mimeType}, size: ${imageBuffer.length} bytes`);
                        }
                        else {
                            // URL изображение - скачиваем
                            console.log(`Downloading image ${imgIndex + 1} from URL`);
                            try {
                                const imageResponse = await this.helpers.httpRequest({
                                    method: 'GET',
                                    url: imageUrl,
                                    encoding: 'arraybuffer',
                                    headers: {
                                        'Accept': 'image/*',
                                        'User-Agent': 'n8n/1.0',
                                    },
                                    timeout: 60000,
                                });
                                imageBuffer = Buffer.from(imageResponse);
                                // Пытаемся определить MIME type
                                if (imageResponse.headers?.['content-type']?.startsWith('image/')) {
                                    mimeType = imageResponse.headers['content-type'];
                                }
                                else if (imageUrl.toLowerCase().endsWith('.jpg') || imageUrl.toLowerCase().endsWith('.jpeg')) {
                                    mimeType = 'image/jpeg';
                                }
                                else if (imageUrl.toLowerCase().endsWith('.webp')) {
                                    mimeType = 'image/webp';
                                }
                                console.log(`Downloaded ${imageBuffer.length} bytes, MIME type: ${mimeType}`);
                            }
                            catch (downloadError) {
                                console.error(`Failed to download image from ${imageUrl}:`, downloadError.message);
                                throw new Error(`Download failed: ${downloadError.message}`);
                            }
                        }
                        // Создаем binary данные
                        const binaryData = await this.helpers.prepareBinaryData(imageBuffer, `generated-${Date.now()}-${imgIndex + 1}.${getExtension(mimeType)}`, mimeType);
                        // Добавляем результат
                        returnData.push({
                            json: {
                                success: true,
                                prompt: user_message,
                                model: model,
                                imageIndex: imgIndex + 1,
                                totalImages: images.length,
                                imageSize: imageBuffer.length,
                                mimeType: mimeType,
                                timestamp: new Date().toISOString(),
                                imageUrl: imageUrl, // Сохраняем URL для отладки
                            },
                            binary: {
                                image: binaryData,
                            },
                            pairedItem: items.length > 0 ? { item: itemIndex } : undefined,
                        });
                    }
                    catch (imageError) {
                        console.error(`❌ Ошибка обработки изображения ${imgIndex + 1}:`, imageError.message);
                        // Добавляем информацию об ошибке
                        returnData.push({
                            json: {
                                error: `Failed to process image ${imgIndex + 1}: ${imageError.message}`,
                                imageIndex: imgIndex + 1,
                                imageData: image, // Логируем что пришло
                                success: false,
                            },
                            pairedItem: items.length > 0 ? { item: itemIndex } : undefined,
                        });
                    }
                }
                // Если не нашли изображений, но есть текстовый ответ
                if (images.length === 0 && message.content) {
                    const textContent = typeof message.content === 'string'
                        ? message.content
                        : JSON.stringify(message.content);
                    returnData.push({
                        json: {
                            textResponse: textContent,
                            note: 'Фото не были созданы моделью',
                            success: true,
                        },
                        pairedItem: items.length > 0 ? { item: itemIndex } : undefined,
                    });
                }
            }
            else {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Нет ответа от модели или он пустой', { itemIndex });
            }
        }
        catch (error) {
            console.error('Main execution error:', error);
            if (this.continueOnFail()) {
                returnData.push({
                    json: {
                        error: error.message || String(error),
                        success: false,
                        timestamp: new Date().toISOString(),
                    },
                    pairedItem: items.length > 0 ? { item: itemIndex } : undefined,
                });
            }
            else {
                throw new n8n_workflow_1.NodeOperationError(this.getNode(), error.message || String(error), { itemIndex });
            }
        }
        // Если ничего не вернули, возвращаем пустой результат
        if (returnData.length === 0) {
            returnData.push({
                json: {
                    message: 'Ничего не вернули',
                    success: false,
                },
            });
        }
        return [returnData];
    }
}
exports.OpenRouterImage = OpenRouterImage;
function getExtension(mimeType) {
    const extensions = {
        'image/png': 'png',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/webp': 'webp',
        'image/gif': 'gif',
    };
    return extensions[mimeType] || 'png';
}
//# sourceMappingURL=OpenRouterImage.node.js.map