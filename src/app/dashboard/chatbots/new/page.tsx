"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NewChatbotPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [language, setLanguage] = useState("both");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, websiteUrl, language }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to create chatbot");
        setLoading(false);
        return;
      }

      const data = await res.json();
      toast.success("Chatbot created successfully!");
      router.push(`/dashboard/chatbots/${data.chatbot.id}`);
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/chatbots">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create New Chatbot</h1>
          <p className="text-gray-500 text-sm mt-1">Set up an AI chatbot for your business.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Chatbot Details</CardTitle>
          <CardDescription>Enter the basic information for your new chatbot.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Chatbot Name</Label>
              <Input
                id="name"
                placeholder="e.g., Dr. Khalid's Dental Clinic"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">This name is for your reference only.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL (optional)</Label>
              <Input
                id="websiteUrl"
                type="url"
                placeholder="https://yourwebsite.com"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">We&apos;ll scrape your website to train the chatbot.</p>
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "both", label: "Bilingual (AR/EN)" },
                  { value: "ar", label: "Arabic Only" },
                  { value: "en", label: "English Only" },
                ].map((lang) => (
                  <button
                    key={lang.value}
                    type="button"
                    onClick={() => setLanguage(lang.value)}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      language === lang.value
                        ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Chatbot
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
