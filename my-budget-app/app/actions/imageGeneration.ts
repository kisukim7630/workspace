'use server';

import { GoogleGenAI } from '@google/genai';

export async function generateImage(prompt: string) {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.error('Gemini API Key is missing');
        return {
            success: false,
            message: 'API Key가 설정되지 않았습니다. .env 파일을 확인해주세요.',
        };
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
                numberOfImages: 1,
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            const imageBytes = response.generatedImages[0]?.image?.imageBytes;
            if (!imageBytes) {
                return {
                    success: false,
                    message: '이미지 데이터를 가져올 수 없습니다.',
                };
            }
            const base64Image = `data:image/png;base64,${imageBytes}`;

            return {
                success: true,
                imageUrl: base64Image,
            };
        } else {
            return {
                success: false,
                message: '이미지 생성에 실패했습니다.',
            };
        }
    } catch (error: any) {
        console.error('Imagen API Error:', error);
        console.error('Error details:', {
            message: error?.message,
            status: error?.status,
            statusText: error?.statusText,
        });
        return {
            success: false,
            message: `이미지 생성 중 오류가 발생했습니다: ${error?.message || '알 수 없는 오류'}`,
        };
    }
}
