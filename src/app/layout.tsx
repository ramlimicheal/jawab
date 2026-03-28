import type { Metadata } from "next";
import { Manrope, Inter } from "next/font/google";
import "@/styles/globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth-provider";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Jawab — AI Chatbot for Gulf SMBs",
  description: "Train a native Arabic/English AI on your business data. Handles customer service and captures leads 24/7.",
  keywords: ["chatbot", "AI", "Gulf", "Arabic", "English", "SMB", "SaaS", "WhatsApp", "lead capture"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${inter.variable}`}>
      <body className="font-body antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
