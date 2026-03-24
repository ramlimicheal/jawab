"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FileText, Globe, Upload, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface ContentItem {
  id: string;
  type: string;
  title: string;
  sourceUrl: string | null;
  status: string;
  chunksCount: number;
  createdAt: string;
  chatbot: { name: string };
}

export default function ContentPage() {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [scraping, setScraping] = useState(false);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = () => {
    fetch("/api/content")
      .then((res) => res.json())
      .then((data) => { setContents(data.contents || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleScrape = async () => {
    if (!scrapeUrl) return;
    setScraping(true);
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: scrapeUrl }),
      });
      if (res.ok) {
        toast.success("Scraping started! Content will appear shortly.");
        setScrapeUrl("");
        setTimeout(fetchContents, 3000);
      } else {
        const data = await res.json();
        toast.error(data.error || "Scraping failed");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setScraping(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/content/${id}`, { method: "DELETE" });
      if (res.ok) {
        setContents(contents.filter((c) => c.id !== id));
        toast.success("Content deleted");
      }
    } catch {
      toast.error("Failed to delete");
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "READY": return "default";
      case "PROCESSING": return "secondary";
      case "FAILED": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Content</h1>
        <p className="text-gray-500 mt-1">Manage training data sources for your chatbots.</p>
      </div>

      {/* Add content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Globe className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Scrape Website</h3>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="https://yourwebsite.com"
                value={scrapeUrl}
                onChange={(e) => setScrapeUrl(e.target.value)}
              />
              <Button onClick={handleScrape} disabled={scraping} className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Scrape
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Upload className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Upload Files</h3>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-emerald-300 transition-colors cursor-pointer">
              <p className="text-sm text-gray-500">Drag & drop PDF, DOCX, or TXT files</p>
              <p className="text-xs text-gray-400 mt-1">Max 10MB per file</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-4"><div className="h-4 bg-gray-200 rounded w-1/3" /></CardContent></Card>
          ))}
        </div>
      ) : contents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <FileText className="w-16 h-16 text-gray-300 mb-6" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No content sources yet</h3>
            <p className="text-gray-500 text-sm">Scrape a website or upload files to train your chatbot.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contents.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    item.type === "WEBSITE" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                  }`}>
                    {item.type === "WEBSITE" ? <Globe className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">
                      {item.sourceUrl || item.type} &middot; {item.chunksCount} chunks &middot; {item.chatbot.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={statusColor(item.status) as "default" | "secondary" | "destructive" | "outline"}>{item.status}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
