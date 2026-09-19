import { db } from "./db";

export type IngestType = "SCRAPE" | "PDF" | "DOCX" | "MANUAL" | "REINDEX";
export type IngestStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export async function createIngestJob(opts: { chatbotId: string; type: IngestType; payload?: any; contentId?: string }) {
  return (db as any).ingestJob.create({
    data: {
      chatbotId: opts.chatbotId,
      type: opts.type,
      payload: opts.payload ? JSON.stringify(opts.payload) : null,
      contentId: opts.contentId ?? null,
      status: "PENDING",
    },
  });
}

export async function processJobs(limit = 5) {
  const jobs = await (db as any).ingestJob.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" }, take: limit });
  for (const job of jobs) {
    await (db as any).ingestJob.update({ where: { id: job.id }, data: { status: "PROCESSING" } });
    try {
      const payload = job.payload ? JSON.parse(job.payload) : {};
      if (job.type === "SCRAPE" && payload.url) {
        const { scrapePage } = await import("./scraper");
        const { chunkText: chunkTextFromScraper } = await import("./scraper");
        const { generateEmbeddings } = await import("./openai");
        const page = await scrapePage(payload.url);
        const text = page.content;
        const chunks = chunkTextFromScraper(text, 800, 100);
        const embeddings = await generateEmbeddings(chunks);
        const content = await (db as any).content.create({
          data: { chatbotId: job.chatbotId, type: "WEBSITE", sourceUrl: payload.url, textContent: text.slice(0, 20000), status: "READY", chunkCount: chunks.length },
        });
        for (let i = 0; i < chunks.length; i++) {
          const emb = embeddings[i];
          await (db as any).contentChunk.create({
            data: { contentId: content.id, text: chunks[i], embedding: JSON.stringify(emb), tokenCount: Math.ceil(chunks[i].length/4), chunkIndex: i },
          }).catch(async () => {
            // try with vector column if available
            await (db as any).$executeRawUnsafe(`INSERT INTO "ContentChunk" (id, "contentId", text, embedding, "embeddingVec", "tokenCount", "chunkIndex") VALUES ($1,$2,$3,$4,$5::vector,$6,$7)`, `cuid_${Date.now()}_${i}`, content.id, chunks[i], JSON.stringify(emb), `[${emb.join(",")}]`, Math.ceil(chunks[i].length/4), i).catch(()=>{});
          });
        }
      }
      await (db as any).ingestJob.update({ where: { id: job.id }, data: { status: "READY" } });
      if (job.contentId) await (db as any).content.update({ where: { id: job.contentId }, data: { status: "READY" } }).catch(()=>{});
    } catch (e: any) {
      await (db as any).ingestJob.update({ where: { id: job.id }, data: { status: "FAILED", error: String(e?.message || e).slice(0, 2000) } });
      if (job.contentId) await (db as any).content.update({ where: { id: job.contentId }, data: { status: "FAILED" } }).catch(()=>{});
    }
  }
  return jobs.length;
}

function chunkText(text: string, size: number, overlap: number): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += size - overlap) chunks.push(text.slice(i, i+size));
  return chunks.filter(Boolean);
}
