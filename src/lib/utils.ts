import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function detectLanguage(text: string): "ar" | "en" {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g;
  const arabicChars = (text.match(arabicRegex) || []).length;
  const totalChars = text.replace(/\s/g, "").length;
  return totalChars > 0 && arabicChars / totalChars > 0.3 ? "ar" : "en";
}

export function formatDate(date: Date | string, locale: string = "en"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale === "ar" ? "ar-AE" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Dubai",
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function generateWidgetCode(chatbotId: string, appUrl: string): string {
  return `<script>
  (function(w,d,s,o,f,js,fjs){
    w['JawabWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','jawab','${appUrl}/widget/jawab.js'));
  jawab('init', { chatbotId: '${chatbotId}' });
</script>`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const PLAN_LIMITS = {
  FREE: { chatbots: 1, messages: 50, contents: 3, teamMembers: 1 },
  STARTER: { chatbots: 2, messages: 2000, contents: 50, teamMembers: 3 },
  GROWTH: { chatbots: 5, messages: 10000, contents: 200, teamMembers: 10 },
  SCALE: { chatbots: 20, messages: 50000, contents: 1000, teamMembers: 50 },
  ENTERPRISE: { chatbots: -1, messages: -1, contents: -1, teamMembers: -1 },
} as const;

export const PLAN_PRICES = {
  STARTER: { monthly: 149, annual: 99 },
  GROWTH: { monthly: 399, annual: 299 },
  SCALE: { monthly: 899, annual: 699 },
  ENTERPRISE: { monthly: 0, annual: 0 },
} as const;
