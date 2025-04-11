import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { Innertube } from 'youtubei.js/web'
import { genAi } from ".";

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

    const systemPrompt = `
    You are a helpful assistant that summarizes given transcripts from a youtube video. Please explain in 2-3 paragraphs and use keywords that can help with search engine optimization.
    `

    const userPrompt = `
    Take the following transcript and follow the instructions to generate a summary.
    Transcript: ${transcript}
    `

    const response = await genAi.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          text: systemPrompt
        },
        {
          text: userPrompt
        }
      ]
    })


    if (!response?.text) {
      throw new Error("No response from model");
    }

    return response.text;
  }
})