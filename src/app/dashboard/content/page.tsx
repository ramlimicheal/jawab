"use client";

import { useEffect, useState } from "react";
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
        toast.success("Extraction sequence initiated.");
        setScrapeUrl("");
        setTimeout(fetchContents, 3000);
      } else {
        const data = await res.json();
        toast.error(data.error || "Scraping failed");
      }
    } catch {
      toast.error("Transmission failure");
    }
    setScraping(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/content/${id}`, { method: "DELETE" });
      if (res.ok) {
        setContents(contents.filter((c) => c.id !== id));
        toast.success("Source purged.");
      }
    } catch {
      toast.error("Failed to delete source");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface">
      {/* Sticky Header */}
      <header className="h-16 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-extrabold flex items-center font-headline text-emerald-900 tracking-tight">
            Knowledge Base
            {!loading && contents.length > 0 && (
              <span className="ml-3 px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-sm label-font font-bold uppercase tracking-widest">
                {contents.length} Sources
              </span>
            )}
          </h2>
        </div>
      </header>

      {/* Main Scrollable Viewport with Dashboard Spacing */}
      <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar relative">
        <div className="max-w-[1400px] space-y-8 mx-auto pb-20">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                   <Globe className="w-4 h-4 text-emerald-600" />
                 </div>
                 <div>
                    <h3 className="font-extrabold text-emerald-950 font-headline text-sm">URL Extraction Node</h3>
                    <p className="text-[10px] label-font font-bold uppercase tracking-widest text-on-surface-variant">Scrape Live DOM</p>
                 </div>
               </div>
               <div className="flex gap-2 relative">
                 <input
                   placeholder="https://yourwebsite.com/faq"
                   value={scrapeUrl}
                   onChange={(e) => setScrapeUrl(e.target.value)}
                   className="flex-1 h-12 px-4 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                 />
                 <button onClick={handleScrape} disabled={scraping} className="bg-primary hover:bg-primary-dim text-on-primary font-bold text-[11px] label-font uppercase tracking-widest px-6 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px]">
                   {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-2"/> Ingest</>}
                 </button>
               </div>
            </div>

            <div className="bg-white rounded-2xl border border-outline-variant/20 p-6 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                 <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                   <Upload className="w-4 h-4 text-blue-600" />
                 </div>
                 <div>
                    <h3 className="font-extrabold text-emerald-950 font-headline text-sm">File Ingestion Node</h3>
                    <p className="text-[10px] label-font font-bold uppercase tracking-widest text-on-surface-variant">Process FLat PDF/TXT</p>
                 </div>
               </div>
               <div className="border border-dashed border-outline-variant/40 bg-surface-container-low rounded-xl h-12 flex items-center justify-center text-center hover:border-primary/50 transition-colors cursor-pointer group">
                 <p className="text-[11px] font-bold label-font uppercase tracking-widest text-on-surface-variant group-hover:text-primary transition-colors">Select Payload (Max 10MB)</p>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
             {loading ? (
                <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
             ) : contents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                   <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                     <FileText className="w-8 h-8 text-on-surface-variant" strokeWidth={1.5} />
                   </div>
                   <h3 className="text-xl font-extrabold text-emerald-950 font-headline tracking-tight mb-2">No data sources deployed</h3>
                   <p className="text-on-surface-variant text-[12px] font-medium max-w-[350px] leading-relaxed">
                     Inject URLs or flat files above. The AI will chunk and embed the knowledge automatically.
                   </p>
                </div>
             ) : (
                <div className="overflow-x-auto min-w-full">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-surface-container-low border-b border-outline-variant/30">
                      <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest label-font">
                        <th className="px-4 lg:px-8 py-4 w-1/3">Source Target</th>
                        <th className="px-4 py-4 w-1/4">Assigned Bot</th>
                        <th className="px-4 py-4 text-center">Data Chunks</th>
                        <th className="px-4 py-4">Status</th>
                        <th className="px-4 lg:px-8 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-xs text-on-surface">
                       {contents.map((item) => (
                         <tr key={item.id} className="table-row-hover transition-colors group">
                            <td className="px-4 lg:px-8 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.type === "WEBSITE" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"}`}>
                                   {item.type === "WEBSITE" ? <Globe className="w-4 h-4 text-emerald-600" /> : <FileText className="w-4 h-4 text-blue-600" />}
                                </div>
                                <div>
                                   <div className="font-bold text-sm text-emerald-950 font-headline truncate max-w-[300px]">{item.title}</div>
                                   <div className="text-[10px] label-font text-on-surface-variant uppercase tracking-widest mt-0.5 truncate max-w-[300px]">
                                     {item.type === "WEBSITE" ? item.sourceUrl : "FILE UPLOAD"}
                                   </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                               <span className="font-bold text-emerald-900 border border-outline-variant/20 bg-surface-container px-2 py-0.5 rounded text-[10px] uppercase tracking-widest label-font">
                                  {item.chatbot.name}
                               </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                               <span className="font-extrabold text-emerald-950">{item.chunksCount}</span>
                               <span className="text-[9px] label-font text-on-surface-variant uppercase tracking-widest block">Blocks</span>
                            </td>
                            <td className="px-4 py-4">
                               {item.status === "READY" ? (
                                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest label-font">Vectorized</span>
                               ) : item.status === "FAILED" ? (
                                  <span className="bg-red-50 text-red-600 border border-red-200 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest label-font">Timeout</span>
                               ) : (
                                  <span className="bg-surface-container-high text-on-surface-variant text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-widest label-font animate-pulse">Processing...</span>
                               )}
                            </td>
                            <td className="px-4 lg:px-8 py-4 text-right">
                               <button onClick={() => handleDelete(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-red-50 text-on-surface-variant hover:text-red-600 rounded" title="Purge Record">
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}
