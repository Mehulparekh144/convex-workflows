import { v } from "convex/values";
import { workflow } from ".";
import { api, internal } from "./_generated/api";
import { mutation } from "./_generated/server";

export const kickoffWorkflow = mutation({
  args: {
    url: v.string()
  },
  handler: async (ctx, args) => {
    await workflow.start(
      ctx,
      internal.workflow.generateYoutubeSummaryWorkflow,
      { url: args.url },
    );
  },
});

export const generateYoutubeSummaryWorkflow = workflow.define({
  args: {
    url: v.string()
  },
  handler: async (step, args): Promise<{
    title: string,
    rating: number,
    feedback: string
  }[][] | null> => {
    const { url } = args;
    const transcript: string = await step.runAction(internal.transcripts.getYoutubeTranscripts, {
      url
    }, {
      retry: {
        maxAttempts: 2,
        initialBackoffMs: 1000, // 1 second of backoff. Backoff means the time between retries.
        base: 2 // exponential backoff. This means the time between retries will double each time.
      }
    })

    const summary: string = await step.runAction(internal.transcripts.generateSummary, {
      transcript
    })



    const allTitles = await Promise.all([
      step.runAction(internal.agents.storyTellerAgent, {
        summary
      }),
      step.runAction(internal.agents.michaelScottAgent, {
        summary
      })
    ])

    const reviews = await Promise.all(
      allTitles.flat().map(title => step.runAction(internal.reviewers.engagementReviewer, { title }))
    )

    return reviews;
  }
})