"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
    <div className="flex-1 flex flex-col h-full bg-surface">
      {/* Sticky Header */}
      <header className="h-16 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-extrabold flex items-center font-headline text-emerald-900 tracking-tight">
            Chatbot Terminal
            {!loading && chatbots.length > 0 && (
              <span className="ml-3 px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-sm label-font font-bold uppercase tracking-widest">
                {chatbots.length} Deployed
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/chatbots/new">
            <button className="bg-primary text-on-primary px-4 py-2 rounded-lg flex items-center space-x-2 text-xs font-bold label-font hover:bg-primary-dim transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Create Instance</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Main Scrollable Viewport with Dashboard Spacing */}
      <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar relative">
        <div className="max-w-[1400px] space-y-8 mx-auto pb-20">
          
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10">
                   <div className="h-4 bg-outline-variant/20 rounded w-1/4" />
                   <div className="h-10 bg-outline-variant/20 rounded w-32" />
                </div>
              ))}
            </div>
          ) : chatbots.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center h-full">
              <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                <Bot className="w-10 h-10 text-on-surface-variant" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-950 font-headline tracking-tight mb-2">No active terminals</h3>
              <p className="text-on-surface-variant text-[13px] font-medium max-w-[300px] mb-8 leading-relaxed">
                Initialize your first AI assistant to begin capturing specialized knowledge and responding to your customers.
              </p>
              <Link href="/dashboard/chatbots/new">
                <button className="bg-primary text-on-primary px-6 py-3 rounded-lg flex items-center space-x-2 text-[13px] font-bold label-font hover:bg-primary-dim transition-colors shadow-sm">
                  <Plus className="w-4 h-4" />
                  <span>Initialize First Bot</span>
                </button>
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead className="bg-surface-container-low border-b border-outline-variant/30">
                    <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest label-font">
                      <th className="px-4 lg:px-8 py-4 w-12"><input type="checkbox" className="rounded border-outline-variant/40 text-primary focus:ring-primary w-3.5 h-3.5" /></th>
                      <th className="px-4 py-4 w-1/3">Terminal Designation</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Knowledge Base</th>
                      <th className="px-4 py-4">Activity Volume</th>
                      <th className="px-4 lg:px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10 text-xs text-on-surface">
                     {chatbots.map((bot) => (
                       <tr key={bot.id} className="table-row-hover transition-colors group">
                          <td className="px-4 lg:px-8 py-4"><input type="checkbox" className="rounded border-outline-variant/40 text-primary focus:ring-primary w-3.5 h-3.5" /></td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                 <Bot className="w-4 h-4 text-primary" />
                               </div>
                               <div>
                                  <div className="font-bold text-sm text-emerald-950 font-headline">{bot.name}</div>
                                  <div className="text-[10px] label-font text-on-surface-variant uppercase tracking-widest mt-0.5">HUB ID: {bot.id.split('-')[0].toUpperCase()}</div>
                               </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            {bot.isActive ? (
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest label-font">Active Tracking</span>
                            ) : (
                               <span className="bg-surface-container-high text-on-surface-variant text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest label-font">Offline</span>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-bold text-emerald-900">{bot._count.contents}</div>
                            <div className="text-[10px] text-on-surface-variant label-font uppercase tracking-widest">Sources Loaded</div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-center">
                                <span className="font-extrabold text-emerald-900">{bot._count.threads}</span>
                                <span className="text-[9px] label-font text-on-surface-variant uppercase tracking-widest">Chats</span>
                              </div>
                              <div className="w-px h-6 bg-outline-variant/20 mx-1"></div>
                              <div className="flex flex-col items-center">
                                <span className="font-extrabold text-blue-600">{bot._count.leads}</span>
                                <span className="text-[9px] label-font text-blue-800 uppercase tracking-widest bg-blue-50 px-1 rounded-sm">Leads</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 lg:px-8 py-4 text-right">
                             <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                               <button onClick={() => copyWidgetCode(bot.id)} className="p-1.5 hover:bg-surface-container-high rounded transition-colors text-on-surface-variant" title="Copy Widget Code">
                                 <Copy className="w-4 h-4" />
                               </button>
                               <Link href={`/dashboard/chatbots/${bot.id}`}>
                                 <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-container-high rounded-lg transition-colors border border-outline-variant/10">
                                    <ExternalLink className="w-3.5 h-3.5 text-emerald-800" />
                                    <span className="text-[11px] font-bold label-font text-emerald-900 uppercase tracking-widest">Configure</span>
                                 </button>
                               </Link>
                             </div>
                          </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
