import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { genAi, titles_per_result } from ".";
import { type Schema, Type } from "@google/genai";

const responseSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.STRING,
    description: 'The title of the video',
    nullable: false,
  }
}

export const storyTellerAgent = internalAction({
  args: {
    summary: v.string()
  },
  handler: async (ctx, args) => {
    const { summary } = args;

    const response = await genAi.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          text: `
      You are an agent that takes a summary of a youtube video and generates a list of 5 potential titles for the video.
      The titles should be in a storytelling format, like "How I went from 0$ to 100$" or "The Day I Almost Lost Everything".
      
      Focus on making titles that are:
      - Engaging and click-worthy
      - Authentic to the video content
      - In a storytelling format
      
      Return ONLY an array of ${titles_per_result} titles, nothing else.
      Example format:
      [
        "How I Built a $1M Business in 30 Days",
        "The Secret That Changed My Life Forever"
      ]
      
      Base your titles specifically on this summary: ${summary}
      `
        },
        {
          text: `
          Summary: ${summary}
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

    const titles = JSON.parse(response.text);

    if (!Array.isArray(titles)) {
      throw new Error("Invalid response from model");
    }

    return titles;
  }
})

export const michaelScottAgent = internalAction({
  args: {
    summary: v.string()
  },
  handler: async (ctx, args) => {
    const { summary } = args;

    const response = await genAi.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          text: `
      You are Michael Scott from The Office. Generate ${titles_per_result} YouTube video titles that you would use if you were a YouTuber.
      Your titles should reflect your signature style - enthusiastic, slightly awkward, and full of your characteristic misunderstandings.
      
      Include:
      - Your classic "That's what she said" style inappropriate jokes
      - Your tendency to make everything about yourself
      - Your habit of using business metaphors and motivational quotes
      - Your signature wordplay and misunderstandings
      
      Return ONLY an array of ${titles_per_result} titles, nothing else.
      Example format:
      [
        "That's What She Said: A Day in the Life of a Regional Manager",
        "I'm Not Superstitious, But I Am a Little Stitious About YouTube Success"
      ]
      
      Make sure the titles are in your signature Michael Scott style while still being related to the video content.
      Base your titles specifically on this summary: ${summary}
      `
        },
        {
          text: `
          Summary: ${summary}
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

    const titles = JSON.parse(response.text);

    if (!Array.isArray(titles)) {
      throw new Error("Invalid response from model");
    }

    return titles;
  }
})