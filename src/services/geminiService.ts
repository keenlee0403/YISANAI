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
  // Initialize the GoogleGenAI client with the API key from environment variables.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const personImagePart = await fileToGenerativePart(personFile);
    const clothingImagePart = await fileToGenerativePart(clothingFile);

    const prompt = "Analyze the first image which contains a person, and the second image which contains an article of clothing. Generate a new, photorealistic image where the person from the first image is wearing the clothing from the second image. The background and the person's pose should be preserved as much as possible.";

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: {
        parts: [
          personImagePart,
          clothingImagePart,
          { text: prompt },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT], // Must include both Modality.IMAGE and Modality.TEXT
      },
    });

    const result: GeneratedImageResult = {
      imageUrl: null,
      text: null,
    };

    // Process the response from the API
    if (response.candidates && response.candidates.length > 0 && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          result.text = part.text;
        } else if (part.inlineData) {
          const base64ImageBytes = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          result.imageUrl = `data:${mimeType};base64,${base64ImageBytes}`;
        }
      }
    }
    
    if (!result.imageUrl) {
        // Add a fallback text if the AI doesn't return an image, which can happen.
        const fallbackText = response.text?.trim();
        if (fallbackText) {
             throw new Error(`AI did not return an image. Response: ${fallbackText}`);
        }
        throw new Error("AI did not return an image. Please try again with different images.");
    }

    return result;

  } catch (error) {
    console.error("Error generating image with Gemini:", error);
    if (error instanceof Error) {
        throw new Error(`An error occurred while communicating with the AI: ${error.message}`);
    }
    throw new Error("An unknown error occurred during image generation.");
  }
};
