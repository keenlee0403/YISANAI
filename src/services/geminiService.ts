
const PROXY_URL = 'https://yisanai.lsx13099989960.workers.dev';

export interface GeneratedImageResult {
  imageUrl: string | null;
  text?: string | null;
}

const fileToBase64 = (file: File): Promise<{mimeType: string, data: string}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const [header, data] = result.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || file.type;
      resolve({ mimeType, data });
    };
    reader.onerror = (error) => reject(error);
  });
};

export const generateTryOnImage = async (
  personFile: File,
  clothingFile: File
): Promise<GeneratedImageResult> => {

  try {
    const [personImage, clothingImage] = await Promise.all([
      fileToBase64(personFile),
      fileToBase64(clothingFile),
    ]);

    const prompt = "保持图一中人物的面部细节和肢体动作，并且让图一中的人物换上图二中的服装。保持图一中人物的面部细节、身体特征、肢体动作不变。生成的图片要协调。超高质量，8K细节";

    const requestBody = {
      contents: [
        {
          parts: [
            { inlineData: { mimeType: personImage.mimeType, data: personImage.data } },
            { inlineData: { mimeType: clothingImage.mimeType, data: clothingImage.data } },
            { text: prompt },
          ],
        },
      ],
      config: {
         responseModalities: ["IMAGE", "TEXT"],
      }
    };

    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
       const errorText = await response.text();
       throw new Error(`代理服务器错误 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
    const textPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text);


    if (!imagePart || !imagePart.inlineData) {
      const errorDetail = textPart?.text || JSON.stringify(data);
      throw new Error(`AI未能返回图片。详情: ${errorDetail}`);
    }

    const { mimeType, data: base64Data } = imagePart.inlineData;
    
    return {
      imageUrl: `data:${mimeType};base64,${base64Data}`,
      text: textPart?.text,
    };

  } catch (error) {
    console.error("调用代理时出错:", error);
    if (error instanceof Error) {
        throw new Error(`通过代理生成图片失败: ${error.message}`);
    }
    throw new Error("通过代理生成图片失败，发生未知错误。");
  }
};
