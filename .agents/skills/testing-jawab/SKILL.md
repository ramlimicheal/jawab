# Testing JAWAB Chatbot App

## Local Development Setup

### Prerequisites
- Node.js 18+, pnpm
- PostgreSQL running locally (user: `jawab`, password: `jawab123`, database: `jawab`)
- At least one AI provider key (Groq or OpenAI)

### Start Dev Server
```bash
cd /home/ubuntu/repos/jawab
pnpm install
pnpm next dev --port 3000
```

### Database
```bash
# Push schema to database
pnpm prisma db push

# Generate Prisma client
pnpm prisma generate
```

### Environment Variables
Copy `.env.example` to `.env` and configure:
- `DATABASE_URL`: PostgreSQL connection string
- `GROQ_API_KEY`: For Groq provider (Llama 3.3 70B chat)
- `OPENAI_API_KEY`: For OpenAI provider (GPT-4.1 chat + text-embedding-3-small)
- `AI_PROVIDER`: Auto-detected from which key is set, or set explicitly to `groq` or `openai`
- `NEXTAUTH_SECRET`: Any random string for dev
- `NEXTAUTH_URL`: `http://localhost:3000`

## Testing the Chatbot E2E

### 1. Register a Test User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test User","email":"test@test.com","password":"password123"}'
```

### 2. Login (save cookies)
```bash
# Get CSRF token
CSRF=$(curl -s -c /tmp/cookies.txt http://localhost:3000/api/auth/csrf | python3 -c "import sys,json;print(json.load(sys.stdin)['csrfToken'])")

# Login
curl -s -b /tmp/cookies.txt -c /tmp/cookies.txt -X POST http://localhost:3000/api/auth/callback/credentials \
  -d "csrfToken=${CSRF}&email=test@test.com&password=password123&json=true"
```

### 3. Create a Chatbot
```bash
curl -s -b /tmp/cookies.txt -X POST http://localhost:3000/api/chatbots \
  -H 'Content-Type: application/json' \
  -d '{"name":"Test Bot","language":"both","industry":"Healthcare"}'
# Save the returned chatbot ID
```

### 4. Scrape a Website
```bash
curl -s -b /tmp/cookies.txt -X POST http://localhost:3000/api/scrape \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://en.wikipedia.org/wiki/Dentistry","chatbotId":"CHATBOT_ID"}'
```

### 5. Test Chat via API
```bash
curl -s -X POST http://localhost:3000/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"chatbotId":"CHATBOT_ID","message":"What services do you offer?"}'
```

### 6. Test Widget in Browser
Create a test HTML page:
```html
<!DOCTYPE html>
<html><body>
<h1>Test Page</h1>
<script src="http://localhost:3000/widget.js" data-chatbot-id="CHATBOT_ID"></script>
</body></html>
```
Open as `file:///tmp/test-widget.html` in browser. The widget FAB appears bottom-right.

## Key Testing Flows

### Widget Chat Flow
1. Click FAB -> panel opens with chatbot name + welcome message
2. Type English message -> response appears (verify RAG context if content scraped)
3. Type Arabic message -> RTL rendering, Arabic response with Gulf dialect
4. Ask about contact/appointment -> lead capture form triggers automatically

### RAG Pipeline Verification
- Scrape a content-rich page (e.g. Wikipedia article)
- Ask a specific question about that content
- Response should include domain-specific details from scraped content (not generic)
- If response is generic, RAG retrieval may be broken (check embeddings)

### AI Provider Notes
- **Groq**: Uses Llama 3.3 70B for chat. No embedding model — uses local 256-dim bag-of-words fallback.
- **OpenAI**: Uses GPT-4.1 for chat + text-embedding-3-small (1536-dim) for embeddings.
- Switching providers after data is stored breaks embedding compatibility (different dimensions).

## Known Limitations
- `ignoreBuildErrors: true` in next.config.js — TypeScript errors are suppressed
- Stripe integration requires test-mode keys (not tested without them)
- Cross-origin widget embedding requires CORS headers (configured in next.config.js)
- PDF/DOCX upload pipeline not tested in this session
