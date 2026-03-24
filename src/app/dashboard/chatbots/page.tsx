"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Bot, MessageSquare, Users, ExternalLink, Copy, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";

interface Chatbot {
  id: string;
  name: string;
  language: string;
  isActive: boolean;
  _count: {
    threads: number;
    leads: number;
    contents: number;
  };
}

export default function ChatbotsPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/chatbots")
      .then((res) => res.json())
      .then((data) => {
        setChatbots(data.chatbots || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const copyWidgetCode = (id: string) => {
    const code = `<script src="${window.location.origin}/widget.js" data-chatbot-id="${id}"></script>`;
    navigator.clipboard.writeText(code);
    toast.success("Widget code copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Chatbots</h1>
          <p className="text-gray-500 mt-1">Manage your AI chatbots and their configurations.</p>
        </div>
        <Link href="/dashboard/chatbots/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" />
            New Chatbot
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : chatbots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Bot className="w-16 h-16 text-gray-300 mb-6" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No chatbots yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm text-center">
              Create your first chatbot to start engaging with your customers and capturing leads.
            </p>
            <Link href="/dashboard/chatbots/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
                <Plus className="w-4 h-4" />
                Create your first chatbot
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chatbots.map((bot) => (
            <Card key={bot.id} className="hover:shadow-md transition-shadow group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{bot.name}</h3>
                      <Badge variant={bot.isActive ? "default" : "secondary"} className="text-xs mt-1">
                        {bot.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100">
                    <MoreHorizontal className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {bot._count.threads} chats
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {bot._count.leads} leads
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/chatbots/${bot.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Manage
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={() => copyWidgetCode(bot.id)} className="gap-1">
                    <Copy className="w-3.5 h-3.5" />
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
