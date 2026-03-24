import OpenAI from "openai";
import https from "https";

// Force IPv4 connections to fix ETIMEDOUT on Cloudflare-fronted APIs (Groq, Gemini)
// where IPv6 DNS resolution succeeds but the connection times out
const ipv4Agent = new https.Agent({ family: 4 });

// Support Groq, Gemini, and OpenAI as AI providers
// All use OpenAI-compatible APIs, so we can use the same client
const AI_PROVIDER = process.env.AI_PROVIDER || (
  process.env.GEMINI_API_KEY ? "gemini" :
  process.env.GROQ_API_KEY ? "groq" : "openai"
);

function getProviderConfig(): { apiKey: string | undefined; baseURL: string | undefined } {
  switch (AI_PROVIDER) {
    case "gemini":
      return {
        apiKey: process.env.GEMINI_API_KEY,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
      };
    case "groq":
      return {
        apiKey: process.env.GROQ_API_KEY,
        baseURL: "https://api.groq.com/openai/v1",
      };
    default:
      return {
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: undefined,
      };
  }
}

const providerConfig = getProviderConfig();
const chatClient = new OpenAI({
  apiKey: providerConfig.apiKey,
  baseURL: providerConfig.baseURL,
  httpAgent: ipv4Agent,
});

// For embeddings, use OpenAI if available, otherwise fall back to local embeddings
const embeddingClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY, httpAgent: ipv4Agent })
  : null;

// Model mapping based on provider
const CHAT_MODEL = AI_PROVIDER === "gemini" ? "gemini-2.0-flash" :
  AI_PROVIDER === "groq" ? "llama-3.3-70b-versatile" : "gpt-4.1";

export const GULF_ARABIC_SYSTEM_PROMPT = `You are JAWAB, a professional bilingual AI customer service assistant for Gulf-region businesses.

LANGUAGE RULES:
- Detect the user's language automatically from their message
- If the user writes in Arabic (including Gulf dialect - Khaleeji), respond in Arabic
- If the user writes in English, respond in English
- If the user mixes Arabic and English (code-switching), respond in the dominant language
- Use Gulf Arabic dialect (خليجي) naturally - use terms like "شلونك", "إنشاء الله", "يعني" where appropriate
- Never use formal/classical Arabic (فصحى) unless the context demands it
- Always be polite and professional in both languages

BEHAVIORAL RULES:
- Answer questions based ONLY on the provided context/knowledge base
- If you don't know the answer, say so politely and offer to connect with a human
- For pricing queries, provide available information and suggest contacting the business
- Keep responses concise but helpful (2-5 sentences typical)
- Use appropriate greeting based on time and culture ("السلام عليكم", "أهلاً", "مرحباً")
- Include follow-up question suggestions when relevant

APPOINTMENT BOOKING (IMPORTANT - provide a premium experience):
When a user asks to book an appointment or schedule a visit:
1. Warmly acknowledge their interest and make them feel valued
2. Ask what specific service they need (if not already mentioned)
3. Mention typical available time slots (morning, afternoon, evening) and days
4. Explain what the visit experience will be like:
   - How long the appointment typically takes
   - What they should bring or prepare
   - What to expect during the visit (consultation, assessment, etc.)
   - Any preparation needed beforehand
5. Mention any special offers or first-visit benefits if known from context
6. Ask for their preferred date, time, and WhatsApp number to confirm the booking
7. Reassure them about the quality of service they will receive
- Make the booking feel like a VIP experience, not a transaction

LEAD CAPTURE:
- When users show purchase intent (booking, pricing, availability), gently ask for contact info
- Prioritize WhatsApp number capture (Gulf standard)
- Never be pushy about lead capture - make it natural and helpful
- For appointment requests, always ask for: preferred date/time, name, and WhatsApp number`;

export async function generateChatResponse(
  messages: { role: "user" | "assistant" | "system"; content: string }[],
  context: string,
  systemPrompt?: string,
  temperature: number = 0.7
): Promise<string> {
  const fullSystemPrompt = `${systemPrompt || GULF_ARABIC_SYSTEM_PROMPT}

BUSINESS KNOWLEDGE BASE:
${context}

Use the above knowledge base to answer questions. If the answer is not in the knowledge base, say you're not sure and offer to connect with a human agent.`;

  const response = await chatClient.chat.completions.create({
    model: CHAT_MODEL,
    messages: [{ role: "system", content: fullSystemPrompt }, ...messages],
    temperature,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (embeddingClient) {
    const response = await embeddingClient.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    return response.data[0].embedding;
  }

  // Fallback: simple hash-based embedding when no embedding API is available
  return simpleTextEmbedding(text);
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (embeddingClient) {
    const batchSize = 100;
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      const response = await embeddingClient.embeddings.create({
        model: "text-embedding-3-small",
        input: batch,
      });
      allEmbeddings.push(...response.data.map((d) => d.embedding));
    }

    return allEmbeddings;
  }

  // Fallback: generate simple embeddings locally
  return texts.map((text) => simpleTextEmbedding(text));
}

// Simple bag-of-words embedding for when no embedding API is available
// Uses term frequency hashed into a fixed-size vector (256 dimensions)
function simpleTextEmbedding(text: string): number[] {
  const normalized = text.toLowerCase().replace(/[^\w\s\u0600-\u06FF]/g, " ");
  const words = normalized.split(/\s+/).filter((w) => w.length > 2);

  const dims = 256;
  const embedding = new Array(dims).fill(0);

  for (const word of words) {
    let hash = 0;
    for (let i = 0; i < word.length; i++) {
      hash = ((hash << 5) - hash + word.charCodeAt(i)) | 0;
    }
    const idx = Math.abs(hash) % dims;
    embedding[idx] += 1;
  }

  // L2 normalize
  const norm = Math.sqrt(embedding.reduce((sum: number, v: number) => sum + v * v, 0));
  if (norm > 0) {
    for (let i = 0; i < dims; i++) {
      embedding[i] /= norm;
    }
  }

  return embedding;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dotProduct / denom;
}
