// convex/index.ts
import { WorkflowManager } from "@convex-dev/workflow";
import { components } from "./_generated/api";
import { GoogleGenAI } from '@google/genai'

export const workflow = new WorkflowManager(components.workflow);

// biome-ignore lint/style/noNonNullAssertion: <explanation>
export const genAi = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export const titles_per_result = 1;