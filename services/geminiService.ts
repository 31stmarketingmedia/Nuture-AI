// Fix: Import Modality from @google/genai
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Activity, Plan } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const activityResponseSchema = {
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

const planResponseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "A catchy and encouraging title for the daily plan, like 'A Day of Fun and Growth!'"
        },
        schedule: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    time: {
                        type: Type.STRING,
                        description: "A time block for the activity, e.g., 'Morning (9:00 AM - 10:30 AM)'."
                    },
                    activityName: {
                        type: Type.STRING,
                        description: "The name of the activity for this time slot. Can be one of the provided activities or a general one like 'Lunch Time' or 'Free Play'."
                    },
                    description: {
                        type: Type.STRING,
                        description: "A short, one-sentence description of what to do during this time block."
                    }
                },
                required: ["time", "activityName", "description"]
            }
        }
    },
    required: ["title", "schedule"]
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
    You are an expert in childhood development, specializing in inclusive, home-based activities for children aged 0-12.
    Generate a list of 4 simple, fun, safe, and age-appropriate developmental activities for a child who is ${ageDescription}.
    The activities should focus on improving their ${skillLabel} skills and be easy to do at home.
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
        responseSchema: activityResponseSchema,
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

export const generatePlan = async (activities: Activity[], ageYears: string, ageMonths: string, specialNeeds: string): Promise<Plan> => {
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
    
    const activityNames = activities.map(a => a.name).join(', ');

    let prompt = `
        You are Nurture AI, an expert AI planner for children's activities.
        Create a balanced and engaging daily schedule for a child who is ${ageDescription}.
        The schedule should be suitable for a home environment.

        The parent wants to focus on these activities: "${activityNames}".

        Please create a structured daily plan that includes these activities. Also, intelligently incorporate essential daily routines like meals (breakfast, lunch, snack, dinner), a nap or quiet time, and free play. The goal is a healthy, fun, and manageable schedule for a parent at home.
    `;

    if (specialNeeds && specialNeeds.trim() !== '') {
        prompt += `
          \nIMPORTANT SPECIAL CONSIDERATION: The child has the following needs: "${specialNeeds}".
          You MUST ensure the schedule is sensitive to these needs. For example, if the child has sensory issues, don't schedule two highly stimulating activities back-to-back. If they have motor skill challenges, ensure there is ample rest time between physically demanding activities.
        `;
    }

    prompt += `
        Return the plan as a JSON object.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: planResponseSchema,
            },
        });

        const text = response.text.trim();
        const plan = JSON.parse(text);
        return plan as Plan;

    } catch (error) {
        console.error("Error generating plan:", error);
        throw new Error("Failed to generate a plan. The AI may be busy. Please try again.");
    }
};

// Fix: Add generateImage function
export const generateImage = async (prompt: string, aspectRatio: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: `simple, child-friendly, cartoon style: ${prompt}`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio,
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return base64ImageBytes;
    } else {
      throw new Error("No image was generated.");
    }

  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. The AI may be busy. Please try again.");
  }
};

// Fix: Add editImage function
export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    return part.inlineData.data;
                }
            }
        }
        
        throw new Error("No edited image was returned from the model.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image. The AI may be busy. Please try again.");
    }
};
