
// The user-provided proxy URL for the Cloudflare Worker
const PROXY_URL = "https://yisanai.lsx13099989960.workers.dev";

interface ImageData {
  data: string;
  mimeType: string;
}

// Define the structure of the Gemini API response for type safety
interface GeminiPart {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
}

interface GeminiContent {
    parts: GeminiPart[];
    role?: string;
}

interface GeminiCandidate {
    content: GeminiContent;
}

interface GeminiResponse {
    candidates: GeminiCandidate[];
}

export async function generateTryOnImage(modelImage: ImageData, garmentImage: ImageData): Promise<string | null> {
  const parts = [
    {
      inlineData: {
        mimeType: modelImage.mimeType,
        data: modelImage.data,
      },
    },
    {
      inlineData: {
        mimeType: garmentImage.mimeType,
        data: garmentImage.data,
      },
    },
    {
      text: "让图一中的人物换上图二中的服装，保持图一中人物的面部特征和动作不变。超级精细的处理。8K质量。",
    },
  ];

  // The Gemini API expects a `contents` array, where each item has a `parts` array.
  const requestBody = {
    contents: [{ parts: parts }],
  };

  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: { message: 'Unknown proxy error' } }));
        const errorMessage = errorBody?.error?.message || `代理服务器错误 (${response.status}): ${response.statusText}`;
        throw new Error(errorMessage);
    }

    const responseData: GeminiResponse = await response.json();
    
    // Extract the generated image from the response
    if (responseData.candidates?.[0]?.content?.parts) {
      for (const part of responseData.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data; // This is the base64 encoded image string
        }
      }
    }

    return null; // Return null if no image was found

  } catch (error) {
    console.error("Error calling proxy:", error);
    if (error instanceof Error) {
        throw new Error(error.message || "生成图片时发生网络错误或API调用失败。");
    }
    throw new Error("生成过程中发生未知错误。");
  }
}
