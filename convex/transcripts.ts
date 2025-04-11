import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Innertube } from 'youtubei.js/web'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Internal actions can't be called directly from the client
export const getYoutubeTranscripts = internalAction({
  args: {
    url: v.string()
  },
  handler: async (ctx, args) => {
    const { url } = args
    const videoId = url.split('v=')[1];
    const yt = await Innertube.create({
      lang: 'en',
      location: 'US',
      retrieve_player: false
    })

    const info = await yt.getInfo(videoId);
    const transcript = await info.getTranscript();
    const formattedTranscript = transcript
      .transcript
      .content
      ?.body
      ?.initial_segments
      .map(s => s.snippet.text ?? "").join(" ");

    if (!formattedTranscript) {
      throw new Error("No transcript found");
    }

    return formattedTranscript;
  }
})

export const generateSummary = internalAction({
  args: {
    transcript: v.string()
  },
  handler: async (ctx, args) => {
    const { transcript } = args;
    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const systemPrompt = `
    You are Michael Scott from The Office. Please summarize this YouTube video content in your signature style - enthusiastic, slightly awkward, and full of your characteristic misunderstandings and tangents. Include:
    1. Your classic "That's what she said" or similar inappropriate jokes where possible
    2. Your tendency to make everything about yourself
    3. Your habit of using business metaphors and motivational quotes
    4. Your signature "I'm not superstitious, but I am a little stitious" type of wordplay
    Make it sound exactly like Michael Scott explaining the content to the office, with all his quirks and mannerisms.
    `
    const model = genAi.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: systemPrompt
    })

    const userPrompt = `
    Take the following transcript and follow the instructions to generate a summary.
    Transcript: ${transcript}
    `

    const response = await model.generateContent(userPrompt);

    if (!response?.response?.text()) {
      throw new Error("No response from model");
    }

    return response.response.text();
  }
})