import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

let _genAI: GoogleGenerativeAI | null = null;

function getClient() {
  if (!apiKey) return null;
  if (!_genAI) _genAI = new GoogleGenerativeAI(apiKey);
  return _genAI;
}

export const hasGeminiKey = !!apiKey;

/**
 * Call Gemini with a prompt expecting JSON response.
 * Returns null if no API key configured (caller should use fallback).
 */
export async function geminiJSON<T>(prompt: string, opts?: { temperature?: number }): Promise<T | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: opts?.temperature ?? 0.1,
        maxOutputTokens: 4096,
      },
    });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("[gemini] JSON ok, bytes=" + text.length);
    return JSON.parse(text) as T;
  } catch (e) {
    console.error("[gemini] JSON error:", e);
    return null;
  }
}

/**
 * Call Gemini with a prompt expecting plain text.
 */
export async function geminiText(prompt: string, opts?: { temperature?: number }): Promise<string | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const model = client.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "text/plain",
        temperature: opts?.temperature ?? 0.4,
        maxOutputTokens: 1024,
      },
    });
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (e) {
    console.error("Gemini text error:", e);
    return null;
  }
}
