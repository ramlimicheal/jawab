"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, ArrowRight, ArrowLeft, Building2, Globe, MessageSquare, Palette, Code, Check } from "lucide-react";
import { toast } from "sonner";

const steps = [
  { title: "Business Info", icon: Building2, desc: "Tell us about your business" },
  { title: "Scrape Website", icon: Globe, desc: "Train AI on your website" },
  { title: "Test Chatbot", icon: MessageSquare, desc: "Try your chatbot" },
  { title: "Customize", icon: Palette, desc: "Brand your widget" },
  { title: "Embed", icon: Code, desc: "Add to your website" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [chatbotId, setChatbotId] = useState("");

  // Step 1 state
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [language, setLanguage] = useState("both");

  // Step 2 state
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [scrapeStatus, setScrapeStatus] = useState<"idle" | "scraping" | "done">("idle");

  // Step 4 state
  const [brandColor, setBrandColor] = useState("#059669");
  const [welcomeMessage, setWelcomeMessage] = useState("Hi! How can I help you today?");

  // Step 1: Create chatbot
  const handleCreateChatbot = async () => {
    if (!businessName) { toast.error("Please enter your business name"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: businessName, language, industry }),
      });
      if (res.ok) {
        const data = await res.json();
        setChatbotId(data.chatbot.id);
        setStep(1);
      } else {
        toast.error("Failed to create chatbot");
      }
    } catch { toast.error("Something went wrong"); }
    setLoading(false);
  };

  // Step 2: Scrape website
  const handleScrape = async () => {
    if (!websiteUrl) { toast.error("Please enter a URL"); return; }
    setScrapeStatus("scraping");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: websiteUrl, chatbotId }),
      });
      if (res.ok) {
        setScrapeStatus("done");
        toast.success("Website scraped successfully!");
      } else {
        setScrapeStatus("idle");
        toast.error("Scraping failed. You can skip this step.");
      }
    } catch {
      setScrapeStatus("idle");
      toast.error("Scraping failed");
    }
  };

  // Step 4: Save customization
  const handleCustomize = async () => {
    setLoading(true);
    try {
      await fetch(`/api/chatbots/${chatbotId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brandColor, welcomeMessage }),
      });
      setStep(4);
    } catch { toast.error("Failed to save"); }
    setLoading(false);
  };

  const progress = ((step + 1) / steps.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Set up your chatbot</h1>
          <span className="text-sm text-gray-500">Step {step + 1} of {steps.length}</span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-3">
          {steps.map((s, i) => (
            <div key={i} className={`flex items-center gap-1.5 text-xs font-medium ${i <= step ? "text-emerald-600" : "text-gray-400"}`}>
              {i < step ? <Check className="w-3.5 h-3.5" /> : <s.icon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {/* Step 1: Business Info */}
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Building2 className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Tell us about your business</h2>
                <p className="text-gray-500 text-sm mt-1">This helps us configure your chatbot.</p>
              </div>
              <div className="space-y-2">
                <Label>Business Name</Label>
                <Input placeholder="e.g., Dr. Khalid's Dental Clinic" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Industry</Label>
                <div className="grid grid-cols-2 gap-2">
                  {["Healthcare", "Real Estate", "Hospitality", "Retail", "Education", "Other"].map((ind) => (
                    <button key={ind} type="button" onClick={() => setIndustry(ind)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${industry === ind ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Language</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: "both", l: "Bilingual" }, { v: "ar", l: "Arabic" }, { v: "en", l: "English" }].map((lang) => (
                    <button key={lang.v} type="button" onClick={() => setLanguage(lang.v)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${language === lang.v ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                      {lang.l}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreateChatbot} className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Continue
              </Button>
            </div>
          )}

          {/* Step 2: Scrape Website */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Globe className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Train on your website</h2>
                <p className="text-gray-500 text-sm mt-1">We&apos;ll scrape your website to train the AI.</p>
              </div>
              <div className="space-y-2">
                <Label>Website URL</Label>
                <Input placeholder="https://yourwebsite.com" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
              </div>
              {scrapeStatus === "scraping" && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <p className="text-sm text-blue-700">Scraping your website... This may take a minute.</p>
                </div>
              )}
              {scrapeStatus === "done" && (
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <Check className="w-5 h-5 text-green-600" />
                  <p className="text-sm text-green-700">Website scraped successfully!</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)}>Skip for now</Button>
                <Button onClick={scrapeStatus === "done" ? () => setStep(2) : handleScrape} className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2" disabled={scrapeStatus === "scraping"}>
                  {scrapeStatus === "done" ? "Continue" : "Scrape Website"}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Test Chatbot */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <MessageSquare className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Test your chatbot</h2>
                <p className="text-gray-500 text-sm mt-1">Try chatting with your AI to see how it responds.</p>
              </div>
              <div className="border rounded-xl p-6 bg-gray-50 min-h-[200px] flex flex-col items-center justify-center">
                <MessageSquare className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-sm text-gray-500">Chat preview will appear here once content is added.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={() => setStep(3)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2">Continue <ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          )}

          {/* Step 4: Customize */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Palette className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Customize your widget</h2>
                <p className="text-gray-500 text-sm mt-1">Brand your chatbot to match your website.</p>
              </div>
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  <Input value={brandColor} onChange={(e) => setBrandColor(e.target.value)} className="w-32" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Input value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(2)} className="gap-1"><ArrowLeft className="w-4 h-4" /> Back</Button>
                <Button onClick={handleCustomize} className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  Continue
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Embed */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <Code className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900">Embed on your website</h2>
                <p className="text-gray-500 text-sm mt-1">Copy this code and paste it before the closing &lt;/body&gt; tag.</p>
              </div>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code>{`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-chatbot-id="${chatbotId}"></script>`}</code>
              </div>
              <Button
                onClick={() => {
                  navigator.clipboard.writeText(`<script src="${window.location.origin}/widget.js" data-chatbot-id="${chatbotId}"></script>`);
                  toast.success("Copied to clipboard!");
                }}
                variant="outline" className="w-full"
              >
                Copy Embed Code
              </Button>
              <Button onClick={() => router.push("/dashboard")} className="w-full bg-emerald-600 hover:bg-emerald-700 gap-2">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
