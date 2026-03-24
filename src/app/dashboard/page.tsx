"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Bot, TrendingUp, ArrowUpRight, Plus, Clock, Globe, Phone, Mail } from "lucide-react";
import Link from "next/link";

interface DashboardThread {
  id: string;
  visitorId: string;
  visitorName: string | null;
  language: string | null;
  status: string;
  createdAt: string;
  _count: { messages: number };
  chatbot: { name: string };
}

interface DashboardLead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  source: string;
  status: string;
  createdAt: string;
  chatbot: { name: string };
}

interface DashboardData {
  stats: {
    conversations: number;
    leads: number;
    activeChatbots: number;
  };
  recentThreads: DashboardThread[];
  recentLeads: DashboardLead[];
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const stats = data?.stats;
  const recentThreads = data?.recentThreads || [];
  const recentLeads = data?.recentLeads || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your chatbots.</p>
        </div>
        <Link href="/dashboard/chatbots/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" />
            New Chatbot
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Conversations", value: loading ? "—" : String(stats?.conversations ?? 0), icon: MessageSquare, color: "emerald" },
          { title: "Leads Captured", value: loading ? "—" : String(stats?.leads ?? 0), icon: Users, color: "blue" },
          { title: "Active Chatbots", value: loading ? "—" : String(stats?.activeChatbots ?? 0), icon: Bot, color: "purple" },
          { title: "Resolution Rate", value: "—", icon: TrendingUp, color: "amber" },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                  stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                  stat.color === "purple" ? "bg-purple-50 text-purple-600" :
                  "bg-amber-50 text-amber-600"
                }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                {!loading && stats && i < 3 && (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    Live
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Conversations</CardTitle>
            {recentThreads.length > 0 && (
              <Link href="/dashboard/conversations">
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">View all</Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/3" /></div>
                  </div>
                ))}
              </div>
            ) : recentThreads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">No conversations yet.</p>
                <p className="text-gray-400 text-xs mt-1">Create a chatbot and embed it on your site to start.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentThreads.map((thread) => (
                  <div key={thread.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-gray-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{thread.visitorName || `Visitor ${thread.visitorId.slice(0, 8)}`}</p>
                        <p className="text-xs text-gray-500">{thread.chatbot.name} · {thread._count.messages} messages</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {thread.language && (
                        <Badge variant="outline" className="text-xs gap-1"><Globe className="w-3 h-3" />{thread.language.toUpperCase()}</Badge>
                      )}
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(thread.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Leads</CardTitle>
            {recentLeads.length > 0 && (
              <Link href="/dashboard/leads">
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">View all</Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3 p-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    <div className="flex-1"><div className="h-4 bg-gray-200 rounded w-1/3" /></div>
                  </div>
                ))}
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="w-12 h-12 text-gray-300 mb-4" />
                <p className="text-gray-500 text-sm">No leads captured yet.</p>
                <p className="text-gray-400 text-xs mt-1">Your chatbot will capture leads automatically.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{lead.name || "Unknown"}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {lead.whatsapp && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.whatsapp}</span>}
                          {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{lead.chatbot.name}</Badge>
                      <Badge variant={lead.status === "NEW" ? "default" : "secondary"} className="text-xs">{lead.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Create a Chatbot", desc: "Set up your first AI chatbot with your business info.", href: "/dashboard/chatbots/new", cta: "Create Chatbot" },
              { step: "2", title: "Add Your Content", desc: "Scrape your website or upload documents to train the AI.", href: "/dashboard/content", cta: "Add Content" },
              { step: "3", title: "Embed on Your Site", desc: "Copy the widget code and paste it on your website.", href: "/dashboard/chatbots", cta: "Get Embed Code" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-4 flex-grow">{item.desc}</p>
                <Link href={item.href}>
                  <Button variant="outline" size="sm" className="w-full">{item.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
