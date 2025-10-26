import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Activity } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      name: {
        type: Type.STRING,
        description: 'A short, catchy name for the activity.',
      },
      description: {
        type: Type.STRING,
        description: 'A brief, one-sentence description of the activity and its purpose.',
      },
      materials: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: 'A list of simple, common household items needed. If none, return an empty array.',
      },
      instructions: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
        description: 'A list of clear, step-by-step instructions for the parent to follow.',
      },
      developmentalBenefit: {
        type: Type.STRING,
        description: 'A brief explanation of how this activity specifically supports the chosen developmental area, especially considering any special needs.',
      },
    },
    required: ['name', 'description', 'materials', 'instructions', 'developmentalBenefit'],
  },
};


export const generateActivities = async (ageYears: string, ageMonths: string, skill: string, specialNeeds: string): Promise<Activity[]> => {
  const skillLabel = skill.replace(/-/g, ' ');

  let ageDescription = '';
  const years = parseInt(ageYears, 10) || 0;
  const months = parseInt(ageMonths, 10) || 0;

  if (years > 0 && months > 0) {
    ageDescription = `${years} year(s) and ${months} month(s) old`;
  } else if (years > 0) {
    ageDescription = `${years} year(s) old`;
  } else {
    ageDescription = `${months} month(s) old`;
  }
  
  let prompt = `
    You are an expert in childhood development, specializing in inclusive activities for children aged 0-12.
    Generate a list of 4 simple, fun, safe, and age-appropriate developmental activities for a child who is ${ageDescription}.
    The activities should focus on improving their ${skillLabel} skills and be easy to integrate into a daily routine.
  `;

  if (specialNeeds && specialNeeds.trim() !== '') {
    prompt += `
      \nIMPORTANT SPECIAL CONSIDERATION: This child has the following needs: "${specialNeeds}".
      You MUST tailor the activities to be suitable and beneficial for a child with these specific needs. 
      For example, for a visually impaired child, focus on sensory activities involving touch and sound. For a child with motor skill challenges, suggest adaptive ways to perform tasks like using larger objects.
      Ensure your suggestions are sensitive, supportive, and empowering. The "developmentalBenefit" must also address how the activity helps considering these needs.
    `;
  }

  prompt += `
    For each activity, include a brief explanation highlighting how it supports the chosen developmental area.
    Ensure the materials are common household items and the instructions are easy for a parent to follow.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text.trim();
    const activities = JSON.parse(text);
    return activities as Activity[];

  } catch (error) {
    console.error("Error generating activities:", error);
    throw new Error("Failed to generate activities. The AI may be experiencing high demand. Please try again later.");
  }
};

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  if (!prompt || prompt.trim() === '') {
    throw new Error("Prompt cannot be empty.");
  }

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `A simple, clear, child-friendly cartoon image of: ${prompt}. Minimal background, sticker style, vibrant colors.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
        return base64ImageBytes;
    } else {
        throw new Error("No image was generated. The prompt may have been blocked.");
    }

  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. Please check the prompt or try again later.");
  }
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    if (!prompt || prompt.trim() === '') {
        throw new Error("Edit instructions cannot be empty.");
    }
     if (!base64ImageData || !mimeType) {
        throw new Error("Source image is required.");
    }

    try {
        const imagePart = {
            inlineData: {
                data: base64ImageData,
                mimeType: mimeType,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }

        throw new Error("The AI did not return an edited image. The prompt may have been blocked or misunderstood.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit the image. Please try a different prompt or image.");
    }
};
