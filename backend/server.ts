import { getGeminiResponse } from "./gemini.js";
import express, { Request, Response, RequestHandler } from "express";
import dotenv from "dotenv";
import cors from "cors";

// Load environment variables
dotenv.config();

type Message = {
  role: "system" | "user" | "assistant";
  content: string;
};

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Gemini chat endpoint
app.post("/api/chat", (async (req, res) => {
  try {
    const { message, context = {} } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const messages: Message[] = [
      {
        role: "system",
        content: `You are an AI writing assistant. Complete the user's text naturally, continuing their thought or sentence.
         Respond ONLY with the completion text, no explanations or additional content. Keep the completion concise and relevant.

Current webpage context:
${JSON.stringify(context)}`,
      },
      {
        role: "user",
        content: message,
      },
    ];

    console.log(messages);

    // Generate response
    const result = await getGeminiResponse(messages);

    res.json({ response: result });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}) as RequestHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
