-- Jawab Phase 1: pgvector support for ContentChunk
-- Run on Supabase Postgres: requires pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
-- embeddingVec is Unsupported("vector(1536)") — Prisma will create it as vector(1536)
-- Add HNSW index for ANN search (cosine). Run after first deploy if table exists:
-- CREATE INDEX IF NOT EXISTS "ContentChunk_embeddingVec_idx" ON "ContentChunk" USING hnsw ("embeddingVec" vector_cosine_ops);
-- Fallback: JS cosineSimilarity in src/lib/openai.ts when extension missing.
