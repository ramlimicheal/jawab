"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, Globe } from "lucide-react";

interface Thread {
  id: string;
  visitorId: string;
  visitorName: string | null;
  language: string | null;
  status: string;
  createdAt: string;
  _count: { messages: number };
  chatbot: { name: string };
}

export default function ConversationsPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/conversations")
      .then((res) => res.json())
      .then((data) => { setThreads(data.threads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Conversations</h1>
        <p className="text-gray-500 mt-1">View all chat conversations across your chatbots.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 bg-gray-200 rounded w-1/3" /></CardContent></Card>
          ))}
        </div>
      ) : threads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <MessageSquare className="w-16 h-16 text-gray-300 mb-6" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No conversations yet</h3>
            <p className="text-gray-500 text-sm">Conversations will appear here when visitors chat with your bot.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {threads.map((thread) => (
            <Card key={thread.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{thread.visitorName || `Visitor ${thread.visitorId.slice(0, 8)}`}</p>
                    <p className="text-sm text-gray-500">{thread.chatbot.name} &middot; {thread._count.messages} messages</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {thread.language && (
                    <Badge variant="outline" className="gap-1"><Globe className="w-3 h-3" />{thread.language.toUpperCase()}</Badge>
                  )}
                  <Badge variant={thread.status === "ACTIVE" ? "default" : "secondary"}>{thread.status}</Badge>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(thread.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
