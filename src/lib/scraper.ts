import * as cheerio from "cheerio";

interface ScrapedPage {
  url: string;
  title: string;
  content: string;
  language: "ar" | "en" | "mixed";
  links: string[];
}

function isPrivateHost(hostname: string): boolean {
  const blocked = ["localhost", "0.0.0.0", "[::1]", "127.0.0.1"];
  if (blocked.includes(hostname.toLowerCase())) return true;

  // Check private IP ranges
  const parts = hostname.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p))) {
    if (parts[0] === 10) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 0) return true;
  }

  return false;
}

function validateScrapingUrl(url: string): void {
  const parsed = new URL(url);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("Only http and https URLs are allowed");
  }
  if (isPrivateHost(parsed.hostname)) {
    throw new Error("Internal/private URLs are not allowed");
  }
}

export async function scrapePage(url: string, maxRedirects: number = 5): Promise<ScrapedPage> {
  validateScrapingUrl(url);

  const response = await fetch(url, {
    headers: {
      "User-Agent": "JawabBot/1.0 (https://jawab.ai)",
      "Accept": "text/html,application/xhtml+xml",
      "Accept-Language": "ar,en;q=0.9",
    },
    redirect: "manual",
  });

  // Handle redirects manually to validate the target URL
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    if (maxRedirects <= 0) {
      throw new Error(`Too many redirects following ${url}`);
    }
    const location = response.headers.get("location");
    if (location) {
      validateScrapingUrl(new URL(location, url).href);
      return scrapePage(new URL(location, url).href, maxRedirects - 1);
    }
    throw new Error(`Redirect without location header from ${url}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove scripts, styles, nav, footer, etc.
  $("script, style, nav, footer, header, iframe, noscript, svg").remove();
  $('[role="navigation"], [role="banner"], [role="contentinfo"]').remove();

  const title = $("title").text().trim() || $("h1").first().text().trim() || url;

  // Extract text content preserving structure
  const contentParts: string[] = [];

  $("main, article, [role='main'], .content, #content, body").each((_, el) => {
    $(el)
      .find("h1, h2, h3, h4, h5, h6, p, li, td, th, blockquote, .text")
      .each((_, textEl) => {
        const text = $(textEl).text().trim();
        if (text.length > 10) {
          contentParts.push(text);
        }
      });
  });

  // Deduplicate
  const uniqueParts = [...new Set(contentParts)];
  const content = uniqueParts.join("\n\n");

  // Detect language
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
  const arabicChars = (content.match(arabicRegex) || []).length;
  const totalChars = content.replace(/\s/g, "").length;
  const arabicRatio = totalChars > 0 ? arabicChars / totalChars : 0;

  let language: "ar" | "en" | "mixed" = "en";
  if (arabicRatio > 0.5) language = "ar";
  else if (arabicRatio > 0.1) language = "mixed";

  // Extract links for crawling
  const links: string[] = [];
  const baseUrl = new URL(url);
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const absoluteUrl = new URL(href, baseUrl.origin);
      if (absoluteUrl.hostname === baseUrl.hostname && !absoluteUrl.hash) {
        links.push(absoluteUrl.href);
      }
    } catch {
      // Skip invalid URLs
    }
  });

  return {
    url,
    title,
    content,
    language,
    links: [...new Set(links)],
  };
}

export async function crawlSite(
  startUrl: string,
  maxPages: number = 20,
  maxDepth: number = 3
): Promise<ScrapedPage[]> {
  const visited = new Set<string>();
  const pages: ScrapedPage[] = [];
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];

  while (queue.length > 0 && pages.length < maxPages) {
    const item = queue.shift();
    if (!item || visited.has(item.url) || item.depth > maxDepth) continue;

    visited.add(item.url);

    try {
      const page = await scrapePage(item.url);
      if (page.content.length > 50) {
        pages.push(page);
      }

      // Add child links to queue
      for (const link of page.links) {
        if (!visited.has(link)) {
          queue.push({ url: link, depth: item.depth + 1 });
        }
      }
    } catch (error) {
      console.error(`Failed to scrape ${item.url}:`, error);
    }
  }

  return pages;
}

export function chunkText(
  text: string,
  chunkSize: number = 2500,
  overlap: number = 200
): string[] {
  if (text.length <= chunkSize) return [text];

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + chunkSize;

    // Try to break at a sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const lastBreak = Math.max(lastPeriod, lastNewline);

      if (lastBreak > start + chunkSize * 0.5) {
        end = lastBreak + 1;
      }
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
  }

  return chunks.filter((c) => c.length > 20);
}
