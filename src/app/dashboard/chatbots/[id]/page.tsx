"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Bot, MessageSquare, Users, FileText, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface ChatbotDetail {
  id: string;
  name: string;
  language: string;
  active: boolean;
  websiteUrl: string | null;
  systemPrompt: string | null;
  welcomeMessage: string;
  placeholder: string;
  primaryColor: string;
  position: string;
  temperature: number;
  _count: { threads: number; leads: number; contents: number };
}

export default function ChatbotDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [chatbot, setChatbot] = useState<ChatbotDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#059669");

  useEffect(() => {
    fetch(`/api/chatbots/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setChatbot(data.chatbot);
        setName(data.chatbot.name);
        setWelcomeMessage(data.chatbot.welcomeMessage);
        setPlaceholder(data.chatbot.placeholder);
        setPrimaryColor(data.chatbot.primaryColor);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/chatbots/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, welcomeMessage, placeholder, primaryColor }),
      });
      if (res.ok) {
        toast.success("Chatbot updated!");
      } else {
        toast.error("Failed to update");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setSaving(false);
  };

  const copyWidgetCode = () => {
    const code = `<script src="${window.location.origin}/widget.js" data-chatbot-id="${id}"></script>`;
    navigator.clipboard.writeText(code);
    toast.success("Widget code copied!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Chatbot not found.</p>
        <Link href="/dashboard/chatbots">
          <Button variant="outline" className="mt-4">Back to Chatbots</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/chatbots">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              <Bot className="w-6 h-6 text-emerald-600" />
              {chatbot.name}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge variant={chatbot.active ? "default" : "secondary"}>
                {chatbot.active ? "Active" : "Inactive"}
              </Badge>
              <span className="text-sm text-gray-500 flex items-center gap-4">
                <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {chatbot._count.threads} chats</span>
                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {chatbot._count.leads} leads</span>
                <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {chatbot._count.contents} sources</span>
              </span>
            </div>
          </div>
        </div>
        <Button onClick={copyWidgetCode} variant="outline" className="gap-2">
          <Copy className="w-4 h-4" /> Copy Widget Code
        </Button>
      </div>

      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="embed">Embed</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your chatbot&apos;s basic settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Chatbot Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Welcome Message</Label>
                <Input value={welcomeMessage} onChange={(e) => setWelcomeMessage(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Input Placeholder</Label>
                <Input value={placeholder} onChange={(e) => setPlaceholder(e.target.value)} />
              </div>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 gap-2" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget Appearance</CardTitle>
              <CardDescription>Customize how your chatbot looks on your website.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex items-center gap-3">
                  <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-32" />
                </div>
              </div>
              <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 gap-2" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="embed" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Embed Code</CardTitle>
              <CardDescription>Copy this code and paste it before the closing &lt;/body&gt; tag on your website.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <code>{`<script src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget.js" data-chatbot-id="${id}"></script>`}</code>
              </div>
              <Button onClick={copyWidgetCode} variant="outline" className="mt-4 gap-2">
                <Copy className="w-4 h-4" /> Copy Code
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
