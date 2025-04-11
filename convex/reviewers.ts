import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { genAi } from ".";
import { type Schema, Type } from "@google/genai";

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'The title of the video',
      nullable: false
    },
    rating: {
      type: Type.NUMBER,
      description: 'Engagement rating out of 10',
      nullable: false
    },
    feedback: {
      type: Type.STRING,
      description: 'Engagement feedback explaining the rating',
      nullable: false
    }
  },
  required: ['title', 'rating', 'feedback']
}

export const engagementReviewer = internalAction({
  args: {
    title: v.string()
  },
  handler: async (ctx, args) => {
    const { title } = args;

    const response = await genAi.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          text: `
      You are an Engagement & Appeal expert for YouTube titles. Analyze the given title based on these key engagement factors:

      1. Emotional Impact:
         - Does the title evoke emotions?
         - What feelings does it trigger in viewers?
         - Is there emotional resonance?

      2. Curiosity Gap:
         - Does it create intrigue?
         - Does it make viewers want to know more?
         - Is there a mystery or hook?

      3. Click Appeal:
         - Would viewers be compelled to click?
         - Is it attention-grabbing?
         - Does it stand out?

      4. Value Proposition:
         - Does it promise clear value?
         - What benefit does it offer viewers?
         - Is the value immediately apparent?

      Provide:
      - An engagement rating out of 10
      - Detailed feedback focusing ONLY on engagement and appeal aspects, explaining the rating and suggesting improvements

      Title to review: "${title}"
      `
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema
      }
    })

    if (!response?.text) {
      throw new Error("No response from model");
    }

    const review = JSON.parse(response.text);
    return review;
  }
})

