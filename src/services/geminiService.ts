// Fix: Replaced placeholder content with the full implementation for the geminiService to handle virtual try-on using the Gemini API.
import { GoogleGenAI, Modality, Part } from "@google/genai";

/**
 * The result from the image generation service.
 */
export interface GeneratedImageResult {
  imageUrl: string | null;
  text: string | null;
}

/**
 * Converts a File object to a GoogleGenAI.Part object.
 * @param file The file to convert.
 * @returns A promise that resolves to a Part object.
 */
const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });

  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
};

/**
 * Generates a "try-on" image using a person's photo and a clothing item's photo.
 * @param personFile The image file of the person.
 * @param clothingFile The image file of the clothing item.
 * @returns A promise that resolves to a GeneratedImageResult.
 */
export const generateTryOnImage = async (personFile: File, clothingFile: File): Promise<GeneratedImageResult> => {
  // This implementation uses a proxy worker to securely call the Gemini API.
  // The API key is stored in the worker's environment variables, not in the client-side code.
  const PROXY_URL = 'https://yisanai.lsx13099989960.workers.dev';

  if (!PROXY_URL) {
    throw new Error("代理URL尚未配置。");
  }

  try {
    const personImagePart = await fileToGenerativePart(personFile);
    const clothingImagePart = await fileToGenerativePart(clothingFile);
    
    const prompt = "保持图一中人物的面部细节和肢体动作，并且让图一中的人物换上图二中的服装。保持图一中人物的面部细节、身体特征、肢体动作不变。生成的图片要协调。超高质量，8K细节";

    const requestBody = {
      contents: [
        {
          parts: [
            personImagePart,
            clothingImagePart,
            { text: prompt },
          ],
        },
      ],
      // CORRECTED: The field name is "generationConfig", not "config".
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: "OBJECT",
            properties: {
                generatedImage: {
                    type: "OBJECT",
                    properties: {
                        imageBytes: { type: "STRING", description: "The base64 encoded image data." },
                        mimeType: { type: "STRING", description: "The MIME type of the image." }
                    }
                },
                commentary: { type: "STRING", description: "Any commentary from the AI about the result." }
            }
        }
      },
    };

    const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        // Attempt to parse the error for a more user-friendly message
        try {
            const errorJson = JSON.parse(errorBody);
            const message = errorJson?.error?.message || errorBody;
            throw new Error(`代理服务器错误 (${response.status}): ${message}`);
        } catch {
             throw new Error(`代理服务器错误 (${response.status}): ${errorBody}`);
        }
    }

    const responseData = await response.json();
    
    const result: GeneratedImageResult = {
      imageUrl: null,
      text: null,
    };
    
    // The Gemini API returns a JSON string in the 'text' part when responseMimeType is application/json
    const candidate = responseData?.candidates?.[0];
    const contentPart = candidate?.content?.parts?.[0];

    if (contentPart && contentPart.text) {
        const parsedJson = JSON.parse(contentPart.text);
        if (parsedJson.generatedImage && parsedJson.generatedImage.imageBytes) {
            const { imageBytes, mimeType } = parsedJson.generatedImage;
            result.imageUrl = `data:${mimeType};base64,${imageBytes}`;
        }
        if(parsedJson.commentary) {
            result.text = parsedJson.commentary;
        }
    }

    if (!result.imageUrl) {
        throw new Error("AI未能返回有效的图片。请尝试不同的图片或稍后再试。");
    }

    return result;

  } catch (error) {
    console.error("调用代理时出错:", error);
    if (error instanceof Error) {
        throw new Error(error.message); // Re-throw the specific error from the try block
    }
    throw new Error("通过代理生成图片失败。");
  }
};
