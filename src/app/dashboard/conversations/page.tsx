"use client";

import { useEffect, useState } from "react";
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
    <div className="flex-1 flex flex-col h-full bg-surface">
      {/* Sticky Header */}
      <header className="h-16 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-extrabold flex items-center font-headline text-emerald-900 tracking-tight">
            Inbox HQ
            {!loading && threads.length > 0 && (
              <span className="ml-3 px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-sm label-font font-bold uppercase tracking-widest">
                {threads.length} Threads
              </span>
            )}
          </h2>
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
          ) : threads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center h-full">
              <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-10 h-10 text-on-surface-variant" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-950 font-headline tracking-tight mb-2">No active communications</h3>
              <p className="text-on-surface-variant text-[13px] font-medium max-w-[300px] mb-8 leading-relaxed">
                When a user initiates contact via your Chatbot widget, the full transcript will appear here.
              </p>
            </div>
          ) : (
             <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
               <div className="overflow-x-auto min-w-full">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-surface-container-low border-b border-outline-variant/30">
                      <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest label-font">
                        <th className="px-4 lg:px-8 py-4 w-1/4">Transmission Root</th>
                        <th className="px-4 py-4 w-1/4">Payload Size</th>
                        <th className="px-4 py-4 text-center">NLP Language</th>
                        <th className="px-4 py-4">Current Status</th>
                        <th className="px-4 lg:px-8 py-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-xs text-on-surface">
                       {threads.map((thread) => (
                         <tr key={thread.id} className="table-row-hover transition-colors group cursor-pointer">
                           <td className="px-4 lg:px-8 py-4">
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                                 <MessageSquare className="w-4 h-4 text-on-surface-variant" />
                               </div>
                               <div>
                                 <div className="font-bold text-sm text-emerald-950 font-headline">{thread.visitorName || `V-ID: ${thread.visitorId.slice(0, 8).toUpperCase()}`}</div>
                                 <div className="text-[10px] label-font text-on-surface-variant uppercase tracking-widest mt-0.5">HUB: {thread.chatbot.name}</div>
                               </div>
                             </div>
                           </td>
                           <td className="px-4 py-4">
                              <span className="font-extrabold text-emerald-900">{thread._count.messages}</span> <span className="text-[10px] uppercase font-bold label-font tracking-widest text-on-surface-variant">Data Frames</span>
                           </td>
                           <td className="px-4 py-4 text-center">
                              {thread.language ? (
                                <span className="inline-flex items-center bg-blue-50 text-blue-800 border border-blue-100 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest label-font">
                                  <Globe className="w-3 h-3 mr-1" /> {thread.language}
                                </span>
                              ) : (
                                <span className="text-on-surface-variant italic text-[10px] label-font uppercase tracking-widest">Detecting</span>
                              )}
                           </td>
                           <td className="px-4 py-4">
                              {thread.status === "ACTIVE" ? (
                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest label-font">Session Open</span>
                              ) : (
                                <span className="bg-surface-container-high text-on-surface-variant text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest label-font">{thread.status}</span>
                              )}
                           </td>
                           <td className="px-4 lg:px-8 py-4 text-right">
                              <div className="text-[11px] font-medium text-on-surface-variant">{new Date(thread.createdAt).toLocaleDateString()}</div>
                              <div className="text-[9px] flex items-center justify-end gap-1 label-font text-on-surface-variant/70 uppercase tracking-widest mt-0.5">
                                <Clock className="w-3 h-3" /> {new Date(thread.createdAt).toLocaleTimeString()}
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
