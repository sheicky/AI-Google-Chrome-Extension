import { OpenAI } from "openai";
import { Logger } from "./logger.js";
import dotenv from "dotenv";

dotenv.config();

const logger = new Logger("geminiClient");

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

const GEMINI_MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-2.0-flash-exp",
];

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

const openai = new OpenAI({
  apiKey: process.env.GEMINI_API_KEY,
  baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function tryWithRetries(
  modelName: string,
  messages: Message[],
  maxRetries: number = MAX_RETRIES
): Promise<string> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      logger.info(
        `Attempting to generate content with model ${modelName} (attempt ${
          attempt + 1
        }/${maxRetries})`
      );

      logger.debug(
        "GEMINI Messages:",
        messages.map((m) => ({ role: m.role, length: m.content.length }))
      );

      const response = await openai.chat.completions.create({
        model: modelName,
        messages: messages,
      });

      logger.info(`Generated content with model ${modelName}`);

      return response.choices[0].message.content || "";
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
        logger.warn(`Retrying in ${delay}ms...`, { error: lastError });
        await sleep(delay);
        continue;
      }
      logger.error(
        `Failed to generate content after ${
          attempt + 1
        } attempts for model ${modelName}`,
        { error: lastError }
      );
    }
  }

  throw lastError;
}

export async function getGeminiResponse(messages: Message[]): Promise<string> {
  let lastError: Error | null = null;

  logger.info("Starting AI response generation with fallback models");

  for (const modelName of GEMINI_MODELS) {
    try {
      const response = await tryWithRetries(modelName, messages);
      logger.info(`Successfully generated response using model ${modelName}`);
      return response;
    } catch (error) {
      lastError = error as Error;
      logger.warn(
        `All retries failed for model ${modelName}, attempting next model`,
        { error: lastError }
      );
      continue;
    }
  }

  logger.error("All models and retries exhausted", { error: lastError });
  throw new Error(
    `All models and retries failed. Last error: ${lastError?.message}`
  );
}
