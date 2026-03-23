
# JAWAB: Build-Ready PRD for a Gulf-Local SiteGPT Clone

---

## 1\. TL;DR

JAWAB is an AI-powered chatbot SaaS platform purpose-built for Gulf-region SMBs, providing a full-featured SiteGPT clone with true Arabic/English bilingual support—including Gulf Arabic dialect and precise RTL/LTR handling. Any business—from dental clinics in Dubai to restaurants in Riyadh—can train a chatbot on their own site, answer visitors around the clock, capture WhatsApp-centric leads, and deeply customize the widget and workflow. Gulf data residency and Phase 2 WhatsApp API support set JAWAB apart in the market.

---

## 2\. Goals

**Business Goals:**

* Win 500+ paying Gulf SMB customers within a year post-launch.

* Sustain MRR growth ≥15% month-over-month; churn under 5%.

* Be the default, trusted AI chatbot for GCC business websites.

* Secure 10 agency/white-label partnerships in the first six months.

* Achieve visible local brand leadership via agency/partner ecosystem.

**User Goals:**

* Provide instant, always-on answers for customers in both Arabic and English.

* Seamlessly capture leads (including WhatsApp numbers, a Gulf essential).

* Deliver rapid setup (<15 minutes, no code) and painless onboarding.

* Eliminate repetitive staff queries and after-hours message overload.

* Enable easy escalation and post-chat analytics in a simple dashboard.

**Non-Goals (Phase 1):**

* WhatsApp Business API (roadmap: Phase 2 only).

* Enterprise SSO/in-depth IAM (focus: SMB segments first).

* Expansion outside GCC until core Gulf market is secured.

---

## 3\. User Stories

**Persona 1: Gulf SMB Owners**

* As a dental clinic owner, I want my chatbot to answer booking, insurance, and pricing questions at any hour in both Arabic and English so that my patients never wait for info.

* As a salon owner, I want the bot to default to Arabic for my customers but support English queries, so no visitor feels excluded.

* As a restaurant owner, I want to automatically capture WhatsApp numbers from reservation queries so I can follow up instantly.

* As a real estate agent, I want daily email digests from my chatbot showing leads and property interest so I can prioritize follow-up.

**Persona 2: End Customers**

* As an Arabic-speaking visitor, I want to chat in Gulf Arabic and get clear, polite answers without feeling like I’m using Google Translate.

* As an English-speaking expat, I want the chat to switch to English, with no loss of accuracy or context.

* As a bilingual Gulf resident, I want to mix Arabic and English in the same message (“Can I book جمعة؟”) and get a helpful response.

* As a mobile user, I want the widget to never block the main site content.

**Persona 3: Staff/Admin**

* As a receptionist, I want compiled chat logs and lead lists with timestamps so my outreach is organized.

* As support staff, I want to override bot answers for key questions to ensure policy accuracy.

* As a manager, I want multiple team members to help manage the bot—but only have access to assigned clients.

**Persona 4: Agency Partner**

* As a Gulf web agency, I want full white-label, multi-client management, with agency branding and prompt templates for common industries.

* As an integration-focused agency, I want API and webhooks for automating setup and connecting chat data to CRM.

---

## 4\. Functional Requirements

### AI Core (Critical)

* Bilingual GPT-4.1 engine, prioritized for Gulf Arabic dialect and English, handling mixed inputs, and reliably toggling RTL/LTR.

* Persona system: Multiple personas per chatbot, each with tone/temperature, assignable via API/dashboard.

* Custom instructions: Editable system/user prompt, with dynamic propagation.

* Q&A hard override: CRUD interface for high-priority topics (pricing, insurance), in both languages.

* Follow-up/quick prompts: Button-suggested Qs after each answer, in AR/EN.

* Message feedback/reactions: Per-response thumbs up/down, with dashboard analytics.

* Hybrid chat mode switching (AI/Agent), API-controllable.

### Content/Training (Critical)

* Deep website scraping with CSS selector/URL pattern targeting, up to 5-level crawl.

* Sitemap.xml bulk import; precise include/exclude filtering.

* File upload: PDF, DOCX, TXT, PPTX, XLSX, CSV, MD; full Unicode/Arabic textflow.

* YouTube (video, playlist, channel) transcript ingestion (English and Arabic).

* Cloud sync (Google Drive, Dropbox, Notion, OneDrive, SharePoint, Box).

* Auto/manual sync: dashboard cron/bulk controls.

* Search/filter/bulk resync/delete.

### Deployment (Critical)

* Embeddable, mobile-optimized JS widget—one script tag, with per-message auto RTL/LTR.

* Configurable distance-from-bottom and mobile/desktop placement.

* Widget v2: persistent thread history, improved navigation (planned Phase 2+).

* Widget previewer in admin; copy-paste embed code with direct chatbot URL fallback.

### Customization (High)

* Brand/user theme: Logo, palette, bot name, home message, icons, all widget text.

* Font family (Cairo/Tajawal for AR), ≥14px for readability.

* Full editable localization object, English and Arabic, with preview toggle and instant apply.

### Analytics/Admin (High)

* All chat data stored, exportable, tagged (Open/Escalated/Resolved).

* Timestamps in Gulf time zone.

* Daily/weekly summary emails (in preferred dashboard language).

* Lead and escalation tracking; CSV export.

### Collaboration/Escalation (High)

* Add team members (roles: Admin/Member), per-chatbot access granularity.

* Escalate chats (button, keyword, low-AI-confidence triggers); full context/handoff; staff notified instantly.

### Lead Capture (High)

* Keyword-triggered lead form (name, phone, WhatsApp); fully AR/EN, with Gulf code prefill.

* Leads dashboard; drill-down to source chat; CSV export.

### Developer Features (High)

* REST API: All objects CRUD; Bearer auth, full error handling and pagination.

* Webhooks: Events: message, lead, escalation; HMAC/RSA signing, retries.

* Detailed error codes, HTTP status, JSON contract.

### Integrations (Medium/Phased)

* Freshdesk Messaging: AI/Agent/Hybrid routing, dashboard config, webhook sync.

* Slack: DMs, channel @mentions, app manifest, threaded answers.

* WhatsApp Business API: Phase 2+, full conversational API, handoff to live staff as needed.

* Crisp, Intercom, Zendesk, Google Chat: future-phase.

### Security (Critical)

* Data residency: AWS me-south-1/Cloudflare ME.

* Full SOC2, GDPR, and Gulf data law compliance.

* End-to-end encryption (TLS 1.3, AES-256-at-rest).

* Strong API key and webhook authentication.

* Privacy: customer data never used to train general AI.

### Pricing/Billing (High)

* 7-day trial, no card; plans in AED (monthly/annual: Starter 149/99, Growth 399/299, Scale 899/699, Enterprise custom).

* Add-ons: Remove branding, extra messages, webhook.

* Stripe AED billing, compliant receipts.

### Agencies/White-Label (Medium)

* Unlimited client accounts, agency dashboard, custom branding.

* Arabic+English prompt/industry template library.

* Affiliate tracking for agency referrals.

---

## 5\. User Experience

### Entry Point & Onboarding

1. User lands on jawab.ai, toggles AR/EN via header control.

2. Click “ابدأ تجربتك المجانية / Start Your Free Trial.”

3. Sign up (email/pass or Google OAuth). Language auto-detected.

4. Five-step onboarding wizard:

  * (1) Business info (name, industry, default bot language).

  * (2) URL to train (auto scrape + progress bar; fallback: upload file/text).

  * (3) “Bot Ready”—sample Q&A, test widget in real time.

  * (4) Customize (brand color, logo, welcome msg, preview AR/EN/RTL/LTR).

  * (5) Embed code; one-click copy; platform-specific instructions.

### Chat Widget (End Customer)

* Appears lower-right; shows business name/logo, AR/EN toggle.

* Widget messages: auto detect RTL or LTR per user message/bot response.

* Welcome: “أهلًا... / Hello!” and quick prompt chips (“مواعيد العيادة”, “Clinic hours”).

* Input: Arabic Cairo font, right-aligned if Arabic input. English LTR by default.

* Typing indicator (3-dot); <3s reply.

* Lead trigger: auto-slide form for WhatsApp when matching keyword (“حجز/booking”).

* Message reactions (thumbs up/down); feedback submitted inline.

* Escalation: explicit “تحدث مع موظف / Talk to a human” button, or triggers as needed.

### Admin Dashboard

* Statistics: volume this week, leads, deflection rate.

* Chat history: filter by bot, language, status, date; view full transcripts.

* Content: add/edit links, files, snippets; youtube/cloud sync.

* Lead/Export: table, CSV, filter/search.

* Customizer: GUI for color/logo/widgets in real time (RTL/LTR toggle).

* Settings: team, integrations, webhook, agency options.

* API/webhook key management; usage by plan.

---

## 6\. Narrative

Dr. Khalid Al-Mansouri, a dentist in Dubai, juggled late-night WhatsApp messages with day-long procedures. He’d lose leads overnight, as after-hours inquiries about braces, pricing, or insurance often went unanswered until morning. When he discovered JAWAB, Dr. Khalid hesitated: could AI really manage his Arabic, English, and Gulf dialect clientele? He signed up—onboarding took eight minutes. JAWAB scanned his bilingual website, extracted FAQs, and immediately answered live: “هل عندكم تنظيف اليوم؟” (Do you accept walk-ins today?) in perfect conversational Arabic. Dr. Khalid personalized the bot’s branding and added a WhatsApp lead form for booking queries.

Within 24 hours, JAWAB had handled 47 unique website questions. Amna, his receptionist, arrived to a summary email and a dashboard—11 WhatsApp numbers ready for callbacks, every chat scored for satisfaction. Not a single inquiry missed, escalation to human when needed, no language errors. Bookings jumped 30%. Dr. Khalid’s “digital receptionist” never sleeps—or lets opportunity slip away.

---

## 7\. Success Metrics

**User-focused:**

* Deflection rate ≥70%.

* Avg. bot reply under 3 seconds.

* Arabic satisfaction >4/5 (message reactions).

* Onboarding-to-live embed: ≥80% within 24h.

**Business:**

* 500 Gulf SMBs (paid) in 12 months.

* Monthly churn <5%.

* Free trial to paid conversion ≥25%.

* Agency/partner signups ≥10 in 6 months.

**Technical:**

* API uptime 99.9%.

* Widget JS <1.5s load on 3G/Middle East.

* Webhook success 99%+.

* Arabic NLP (reaction/human review) ≥85% positive.

**Tracking:**

* Events: sign_up, onboarding_steps, bot_trained, widget_embedded, message, reaction, lead, escalation, plan, content_add, integration, webhook_config, daily_emails.

---

## 8\. Technical Considerations

**Stack:**

* Frontend: Next.js 14, TypeScript, Tailwind, shadcn/ui, next-intl, Cairo/Tajawal and English font pairing.

* Widget: Vanilla-JS, Shadow DOM, <50KB gzipped, CDN load, per-message RTL/LTR, mobile/full-screen AR.

* Backend: Node.js, Express, PostgreSQL+pgvector, Redis, BullMQ, Resend, Stripe, Cloudflare R2.

* AI: OpenAI GPT-4.1 + embeddings, tuned system prompt for Gulf Arabic, chunking logic (2,500 chars, 200 overlap).

* Scraping: Playwright/Cheerio (UTF-8, Arabic block U+0600–U+06FF, CSS selectors, Arabic-heavy site handling).

* File ingest: PDF/DOCX with Arabic parsing, fallback for complex RTL extraction.

* Compliance: Data in AWS Bahrain (me-south-1) or Cloudflare ME. PDPL (Saudi/UAE), GDPR-ready, data deletion/export.

**Data Models:**  

*Comprehensive—see requirements above. All key objects (User, Chatbot, Thread, Message, Content, File, QA, Lead, Persona, Prompt, Webhook, Plan, etc.) with detailed field lists and settings.*

**APIs:**  

*Full CRUD REST API mirroring SiteGPT endpoints (see requirements), bearing all response format, error, and pagination specs. HMAC-secured webhooks for events (ADD_MESSAGE, LEAD_CAPTURED, ESCALATION, etc.).*

**Challenges:**

* True Gulf dialect coverage: iterative prompt tuning, admin feedback loop.

* Arabic PDF parsing: validate on real regional files.

* Fast mobile/global widget, widget code is isolated (Shadow DOM, logical CSS).

* WhatsApp API approvals: start early; final go-live in Phase 2.

---

## 9\. Milestones & Sequencing

**Team:** 1 Product, 2-3 Full-stack/AI Eng, 1 Arabic-native UI/UX

---

*This PRD is 100% build-ready for Devin, Antigravity, or any qualified developer team seeking to ship a Gulf-local SiteGPT clone—JAWAB—for launch and scale.*