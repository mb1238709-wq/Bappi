import { GoogleGenAI } from "@google/genai";

// Ensure API key is present
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY is missing from environment variables.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

/**
 * Edits an image using Gemini 2.5 Flash Image model.
 * 
 * @param base64Image Raw base64 string of the original image (no data URI prefix).
 * @param mimeType MIME type of the original image.
 * @param prompt Text prompt describing the desired edit.
 * @returns Promise resolving to the data URI of the generated image.
 */
export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Iterate through parts to find the image
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from Gemini.");
    }

    const parts = candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        // Construct standard Data URI for display
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Fallback if no image found in response (sometimes model refuses and sends text explanation)
    const textPart = parts.find(p => p.text);
    if (textPart && textPart.text) {
      throw new Error(`Model returned text instead of image: ${textPart.text}`);
    }

    throw new Error("No image data found in response.");

  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};