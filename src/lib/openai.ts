import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
- For booking/appointment queries, try to capture the visitor's WhatsApp number
- For pricing queries, provide available information and suggest contacting the business
- Keep responses concise but helpful (2-4 sentences typical)
- Use appropriate greeting based on time and culture ("السلام عليكم", "أهلاً", "مرحباً")
- Include follow-up question suggestions when relevant

LEAD CAPTURE:
- When users show purchase intent (booking, pricing, availability), gently ask for contact info
- Prioritize WhatsApp number capture (Gulf standard)
- Never be pushy about lead capture - make it natural and helpful`;

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

  const response = await openai.chat.completions.create({
    model: "gpt-4.1",
    messages: [{ role: "system", content: fullSystemPrompt }, ...messages],
    temperature,
    max_tokens: 1000,
  });

  return response.choices[0]?.message?.content || "I apologize, I couldn't generate a response. Please try again.";
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  return response.data[0].embedding;
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const batchSize = 100;
  const allEmbeddings: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch,
    });
    allEmbeddings.push(...response.data.map((d) => d.embedding));
  }

  return allEmbeddings;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
