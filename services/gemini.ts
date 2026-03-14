
import { GoogleGenAI, Type } from "@google/genai";

export interface GroundingLink {
  title: string;
  uri: string;
}

export interface ChatResponse {
  text: string;
  links: GroundingLink[];
  image?: string;
}

export class GeminiService {
  async generateChatResponse(
    history: { role: string; parts: any[] }[], 
    prompt: string,
    location?: { latitude: number, longitude: number },
    imagePart?: { inlineData: { data: string, mimeType: string } }
  ): Promise<ChatResponse> {
    // Re-initialize for each request to catch up-to-date environment config
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      const parts: any[] = [{ text: prompt }];
      if (imagePart) {
        parts.push(imagePart);
      }

      const response = await ai.models.generateContent({
        // Updated to gemini-2.5-flash as Google Maps tool is restricted to 2.5 series
        model: 'gemini-2.5-flash',
        contents: [
          ...history.map(h => ({ role: h.role === 'ai' ? 'model' : 'user', parts: h.parts })), 
          { role: 'user', parts }
        ],
        config: {
          systemInstruction: "You are Vartalap AI, a helpful assistant. Use emojis. Speak Hinglish. You have access to Google Search and Maps. If an image is provided, analyze it and answer related questions.",
          tools: [
            { googleSearch: {} },
            { googleMaps: {} }
          ],
          toolConfig: location ? {
            retrievalConfig: {
              latLng: {
                latitude: location.latitude,
                longitude: location.longitude
              }
            }
          } : undefined
        }
      });

      let text = response.text || "Main abhi thoda vyast hoon.";
      const links: GroundingLink[] = [];

      // Extract grounding sources for UI display as per transparency guidelines
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        const sourceLinks: string[] = [];
        chunks.forEach((chunk: any) => {
          if (chunk.web) {
            links.push({ title: chunk.web.title, uri: chunk.web.uri });
            sourceLinks.push(`- ${chunk.web.title}: ${chunk.web.uri}`);
          }
          if (chunk.maps) {
            links.push({ title: chunk.maps.title, uri: chunk.maps.uri });
            sourceLinks.push(`- ${chunk.maps.title}: ${chunk.maps.uri}`);
          }
        });
        
        if (sourceLinks.length > 0) {
          text += "\n\nSources:\n" + sourceLinks.join("\n");
        }
      }

      return { text, links };
    } catch (error) {
      console.error("Gemini Error:", error);
      return { text: "Network error! Please check your internet.", links: [] };
    }
  }

  async translateMessage(text: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following message. If it is in English, translate to Hinglish (Hindi + English). If it is in Hindi/Hinglish, translate to clear English. Message: "${text}"`,
        config: {
          systemInstruction: "You are a professional translator for Vartalap Bharat. Provide only the translated text, nothing else."
        }
      });
      return response.text || text;
    } catch (error) {
      return "Translation error.";
    }
  }

  async generateAiImage(prompt: string): Promise<string | null> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    try {
      // Nano banana series model used for image generation
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: `Generate a high quality image of: ${prompt}` }]
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
      });

      // Iterate parts to find the image data
      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
    } catch (error) {
      console.error("Image Gen Error:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();
