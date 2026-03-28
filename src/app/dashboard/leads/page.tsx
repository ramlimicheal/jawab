"use client";

import { useEffect, useState } from "react";
import { Users, Phone, Mail, Download, MessageSquare } from "lucide-react";

interface Lead {
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((res) => res.json())
      .then((data) => { setLeads(data.leads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    const headers = ["Name", "Email", "Phone", "WhatsApp", "Source", "Status", "Date", "Chatbot"];
    const rows = leads.map((l) => [l.name || "", l.email || "", l.phone || "", l.whatsapp || "", l.source, l.status, new Date(l.createdAt).toLocaleDateString(), l.chatbot.name]);
    const escapeCSV = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [headers.join(","), ...rows.map((r) => r.map(escapeCSV).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jawab-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface">
      {/* Sticky Header */}
      <header className="h-16 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-extrabold flex items-center font-headline text-emerald-900 tracking-tight">
            Acquisition Matrix
            {!loading && leads.length > 0 && (
              <span className="ml-3 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[11px] rounded-sm label-font font-bold uppercase tracking-widest">
                {leads.length} Records
              </span>
            )}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          {leads.length > 0 && (
             <button onClick={exportCSV} className="bg-surface border border-outline-variant/30 text-emerald-900 px-4 py-2 rounded-lg flex items-center space-x-2 text-xs font-bold label-font hover:bg-surface-container transition-colors shadow-sm">
               <Download className="w-4 h-4" />
               <span>Export CSV</span>
             </button>
          )}
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
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center h-full">
              <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                <Users className="w-10 h-10 text-on-surface-variant" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-extrabold text-emerald-950 font-headline tracking-tight mb-2">CRM Empty</h3>
              <p className="text-on-surface-variant text-[13px] font-medium max-w-[300px] mb-8 leading-relaxed">
                Your AI agents will automatically build pipelines by identifying intent and capturing details gracefully.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
               <div className="overflow-x-auto min-w-full">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead className="bg-surface-container-low border-b border-outline-variant/30">
                      <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest label-font">
                        <th className="px-4 lg:px-8 py-4 w-12"><input type="checkbox" className="rounded border-outline-variant/40 text-primary focus:ring-primary w-3.5 h-3.5" /></th>
                        <th className="px-4 py-4 w-1/4">Entity Identity</th>
                        <th className="px-4 py-4 w-1/3">Contact Vectors</th>
                        <th className="px-4 py-4">Source Hub</th>
                        <th className="px-4 py-4">Pipeline Status</th>
                        <th className="px-4 lg:px-8 py-4 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-xs text-on-surface">
                       {leads.map((lead) => (
                         <tr key={lead.id} className="table-row-hover transition-colors group">
                           <td className="px-4 lg:px-8 py-4"><input type="checkbox" className="rounded border-outline-variant/40 text-primary focus:ring-primary w-3.5 h-3.5" /></td>
                           <td className="px-4 py-4">
                             <div className="font-bold text-sm text-emerald-950 font-headline">{lead.name || "Unknown Entity"}</div>
                             <div className="text-[10px] label-font text-on-surface-variant uppercase tracking-widest mt-0.5">ID: {lead.id.split('-')[0].toUpperCase()}</div>
                           </td>
                           <td className="px-4 py-4">
                              <div className="flex flex-col space-y-1.5">
                                 {lead.email && <span className="flex items-center text-on-surface gap-2 font-medium"><Mail className="w-3.5 h-3.5 text-on-surface-variant" /> {lead.email}</span>}
                                 {lead.phone && <span className="flex items-center text-on-surface gap-2 font-medium"><Phone className="w-3.5 h-3.5 text-on-surface-variant" /> {lead.phone}</span>}
                                 {lead.whatsapp && <span className="flex items-center text-on-surface gap-2 font-medium"><MessageSquare className="w-3.5 h-3.5 text-blue-600" /> {lead.whatsapp}</span>}
                                 {!lead.email && !lead.phone && !lead.whatsapp && <span className="text-on-surface-variant italic">No data</span>}
                              </div>
                           </td>
                           <td className="px-4 py-4">
                             <span className="bg-surface-container px-2 py-1 rounded inline-flex items-center text-emerald-900 font-bold label-font text-[10px] uppercase tracking-widest border border-outline-variant/20">
                               {lead.chatbot.name}
                             </span>
                           </td>
                           <td className="px-4 py-4">
                              {lead.status === "NEW" ? (
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold label-font uppercase tracking-widest">Inbound</span>
                              ) : (
                                <span className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold label-font uppercase tracking-widest">{lead.status}</span>
                              )}
                           </td>
                           <td className="px-4 lg:px-8 py-4 text-right">
                              <div className="text-[11px] font-medium text-on-surface-variant">{new Date(lead.createdAt).toLocaleDateString()}</div>
                              <div className="text-[9px] label-font text-on-surface-variant/70 uppercase tracking-widest mt-0.5">{new Date(lead.createdAt).toLocaleTimeString()}</div>
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
