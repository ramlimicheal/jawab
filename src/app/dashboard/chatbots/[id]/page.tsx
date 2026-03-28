"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Bot, MessageSquare, Users, FileText, Loader2, Save, TerminalSquare, ExternalLink, Brush } from "lucide-react";
import { toast } from "sonner";

interface ChatbotDetail {
  id: string;
  name: string;
  language: string;
  isActive: boolean;
  systemPrompt: string | null;
  welcomeMessage: string;
  brandColor: string;
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
  const [activeTab, setActiveTab] = useState<"settings" | "appearance" | "embed">("settings");

  // Form states
  const [name, setName] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [brandColor, setBrandColor] = useState("#059669");

  useEffect(() => {
    fetch(`/api/chatbots/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setChatbot(data.chatbot);
        setName(data.chatbot.name);
        setWelcomeMessage(data.chatbot.welcomeMessage);
        setBrandColor(data.chatbot.brandColor || "#059669");
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
        body: JSON.stringify({ name, welcomeMessage, brandColor }),
      });
      if (res.ok) {
        toast.success("Identity parameters committed.");
      } else {
        toast.error("Constraint violation");
      }
    } catch {
      toast.error("Transmission failure");
    }
    setSaving(false);
  };

  const copyWidgetCode = () => {
    const code = `<script src="${window.location.origin}/widget.js" data-chatbot-id="${id}"></script>`;
    navigator.clipboard.writeText(code);
    toast.success("Script payload copied.");
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!chatbot) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 text-center h-full bg-surface">
        <div className="w-20 h-20 bg-surface-container-low rounded-full flex items-center justify-center mb-6 border border-outline-variant/20">
          <TerminalSquare className="w-8 h-8 text-on-surface-variant opacity-50" />
        </div>
        <p className="text-[13px] font-bold text-emerald-950 font-headline mb-4">Instance Not Found</p>
        <Link href="/dashboard/chatbots">
          <button className="bg-surface border border-outline-variant/30 px-4 py-2 rounded-lg text-xs font-bold text-emerald-800 label-font hover:bg-surface-container transition-colors">Abort & Return</button>
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "settings", icon: TerminalSquare, label: "Core Protocol" },
    { id: "appearance", icon: Brush, label: "Interface Specs" },
    { id: "embed", icon: ExternalLink, label: "Launch Payload" },
  ] as const;

  return (
    <div className="flex-1 flex flex-col h-full bg-surface">
      {/* Sticky Header */}
      <header className="h-16 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard/chatbots">
            <button className="flex items-center space-x-2 text-on-surface-variant hover:text-emerald-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="w-px h-6 bg-outline-variant/30"></div>
          <div className="flex items-center space-x-3">
             <div className="w-8 h-8 rounded-lg bg-surface-container-low border border-outline-variant/20 flex items-center justify-center shrink-0">
               <Bot className="w-4 h-4 text-emerald-700" />
             </div>
             <div>
               <h2 className="text-xl font-extrabold flex items-center font-headline text-emerald-900 tracking-tight leading-none">
                 {chatbot.name}
               </h2>
               <div className="flex items-center gap-2 mt-1">
                 {chatbot.isActive ? (
                    <span className="text-[9px] font-bold text-emerald-700 label-font uppercase tracking-widest flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></div>
                      Online Active
                    </span>
                 ) : (
                    <span className="text-[9px] font-bold text-on-surface-variant label-font uppercase tracking-widest flex items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400 mr-1.5"></div>
                      Standby
                    </span>
                 )}
               </div>
             </div>
          </div>
        </div>
        <div className="flex items-center space-x-6">
           {/* Telemetry preview */}
           <div className="hidden lg:flex items-center space-x-4 mr-4 text-on-surface-variant">
              <span className="flex items-center gap-1.5 text-[10px] label-font font-bold uppercase tracking-widest"><MessageSquare className="w-3.5 h-3.5" /> {chatbot._count.threads} CHATS</span>
              <span className="flex items-center gap-1.5 text-[10px] label-font font-bold uppercase tracking-widest text-primary"><Users className="w-3.5 h-3.5" /> {chatbot._count.leads} CRM</span>
              <span className="flex items-center gap-1.5 text-[10px] label-font font-bold uppercase tracking-widest"><FileText className="w-3.5 h-3.5" /> {chatbot._count.contents} VMS</span>
           </div>
           
           <button onClick={handleSave} disabled={saving} className="bg-primary text-on-primary px-4 py-2 rounded-lg flex items-center space-x-2 text-xs font-bold label-font hover:bg-primary-dim transition-colors shadow-sm disabled:opacity-50">
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" strokeWidth={2.5} />}
             <span>Commit Diff</span>
           </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-auto bg-surface custom-scrollbar">
        <div className="max-w-[75%] mx-auto pb-32 pt-10">
           
           {/* Tiered Configuration Setup */}
           <div className="grid grid-cols-12 gap-4 lg:p-8">
              {/* Navigation Sidemenu */}
              <div className="col-span-3">
                 <p className="text-[10px] label-font font-bold text-on-surface-variant uppercase tracking-widest px-3 mb-4">Module Controls</p>
                 <div className="flex flex-col space-y-1">
                   {tabs.map(t => (
                      <button 
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`flex items-center px-4 py-3 rounded-xl transition-all ${
                          activeTab === t.id 
                            ? 'bg-emerald-50 text-emerald-900 shadow-sm border border-emerald-100/50' 
                            : 'text-on-surface-variant hover:bg-surface-container-low border border-transparent hover:border-outline-variant/10'
                        }`}
                      >
                         <t.icon className={`w-4 h-4 mr-3 ${activeTab === t.id ? 'text-primary' : 'text-on-surface-variant/70'}`} strokeWidth={activeTab === t.id ? 2.5 : 2} />
                         <span className={`text-[11px] uppercase tracking-widest label-font ${activeTab === t.id ? 'font-extrabold' : 'font-bold'}`}>{t.label}</span>
                      </button>
                   ))}
                    {/* Launch Wrapper separate */}
                    <div className="mt-8 pt-6 border-t border-outline-variant/10">
                       <p className="text-[10px] label-font font-bold text-on-surface-variant uppercase tracking-widest px-3 mb-4">Integration</p>
                       <button onClick={copyWidgetCode} className="w-full flex items-center px-4 py-3 text-emerald-800 bg-surface border border-outline-variant/30 hover:border-emerald-300 hover:bg-emerald-50 rounded-xl transition-all group">
                         <Copy className="w-4 h-4 mr-3 text-emerald-600 group-hover:scale-110 transition-transform" strokeWidth={2.5}/>
                         <span className="text-[11px] uppercase tracking-widest label-font font-bold">Copy Node Payload</span>
                       </button>
                    </div>
                 </div>
              </div>

              {/* Viewport Core */}
              <div className="col-span-9">
                 <div className="bg-white rounded-3xl p-4 lg:p-8 border border-outline-variant/20 shadow-sm relative overflow-hidden min-h-[500px]">
                    
                    {/* View: Settings */}
                    {activeTab === "settings" && (
                       <div className="animate-in fade-in zoom-in-95 duration-200">
                          <h3 className="text-xl font-extrabold text-emerald-950 font-headline tracking-tight mb-2">Core Protocol</h3>
                          <p className="text-[13px] text-on-surface-variant font-medium mb-10 leading-relaxed border-b border-outline-variant/10 pb-6">Modify the underlying nomenclature and default directives of the AI module. Changes are instantly pushed to the CDN node.</p>

                          <div className="space-y-8 max-w-lg">
                            <div className="space-y-2">
                              <label className="text-[10px] uppercase font-bold text-emerald-900 tracking-widest label-font block">Module Target String</label>
                              <input 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Chatbot Name"
                                className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-bold text-emerald-950"
                              />
                            </div>

                            <div className="space-y-2 relative">
                              <label className="text-[10px] uppercase font-bold text-emerald-900 tracking-widest label-font block">Handshake Value (Initial Tx)</label>
                              <div className="absolute top-0 right-0 px-2 py-0.5 bg-surface-container rounded text-[9px] label-font font-bold text-on-surface-variant uppercase tracking-widest">
                                 {chatbot.language === "ar" ? "AR" : "EN"} DOMINANT
                              </div>
                              <textarea 
                                value={welcomeMessage} 
                                onChange={(e) => setWelcomeMessage(e.target.value)}
                                className="w-full min-h-[100px] p-4 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium text-emerald-950 resize-y"
                              />
                            </div>
                          </div>
                       </div>
                    )}

                    {/* View: Appearance */}
                    {activeTab === "appearance" && (
                       <div className="animate-in fade-in zoom-in-95 duration-200">
                          <h3 className="text-xl font-extrabold text-emerald-950 font-headline tracking-tight mb-2">Interface Specs</h3>
                          <p className="text-[13px] text-on-surface-variant font-medium mb-10 leading-relaxed border-b border-outline-variant/10 pb-6">Determine exactly how the intelligence module renders into your root application DOM.</p>

                          <div className="space-y-8 max-w-lg">
                             <div className="space-y-2">
                               <label className="text-[10px] uppercase font-bold text-emerald-900 tracking-widest label-font block">
                                 Primary Accent Vector
                               </label>
                               <div className="flex items-center gap-4">
                                 <div className="relative w-16 h-16 shrink-0 rounded-[14px] overflow-hidden border border-outline-variant/20 shadow-md group">
                                   <input 
                                     type="color" 
                                     value={brandColor}
                                     onChange={(e) => setBrandColor(e.target.value)}
                                     className="absolute -top-4 -left-4 w-24 h-24 cursor-crosshair opacity-0 group-hover:opacity-100 z-10 block"
                                   />
                                   <div className="absolute inset-0 z-0 flex items-center justify-center transition-colors pointer-events-none" style={{ backgroundColor: brandColor }}></div>
                                 </div>
                                 <input
                                   value={brandColor}
                                   onChange={(e) => setBrandColor(e.target.value)}
                                   className="h-14 w-36 px-4 rounded-[14px] border border-outline-variant/30 bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono uppercase text-sm font-bold text-emerald-950 tracking-widest text-center"
                                 />
                               </div>
                               <p className="text-[10px] text-on-surface-variant font-medium mt-3">This hex dictates the button array, message bubbles, and toggle bounds on the widget.</p>
                             </div>
                          </div>
                       </div>
                    )}

                    {/* View: Embed */}
                    {activeTab === "embed" && (
                       <div className="animate-in fade-in zoom-in-95 duration-200 h-full flex flex-col">
                          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full pointer-events-none -mt-20 -mr-20"></div>
                          <h3 className="text-xl font-extrabold text-emerald-950 font-headline tracking-tight mb-2">Launch Protocol</h3>
                          <p className="text-[13px] text-on-surface-variant font-medium mb-10 leading-relaxed border-b border-outline-variant/10 pb-6 relative z-10">
                            The deployment of this instance relies on a zero-dependency JavaScript snippet. Once inserted, the module bootstraps itself over your document.
                          </p>

                          <div className="relative z-10 flex-1">
                             <label className="text-[10px] uppercase font-bold text-emerald-900 tracking-widest label-font block mb-3">Runtime Snippet</label>
                             <div className="bg-[#0f172a] rounded-2xl p-6 border border-[#1e293b] shadow-2xl overflow-hidden relative group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent"></div>
                                <div className="absolute top-4 right-4 opacity-50 text-[9px] uppercase tracking-widest text-emerald-400 font-mono">index.html</div>
                                
                                <pre className="text-[13px] font-mono leading-loose text-[#94a3b8] overflow-x-auto pt-6 custom-scrollbar pb-2">
&lt;!-- Jawab AI Module --&gt;
<span className="text-blue-400">&lt;script</span> <span className="text-emerald-300">src</span>=<span className="text-amber-300">&quot;{typeof window !== 'undefined' ? window.location.origin : ''}/widget.js&quot;</span> <span className="text-emerald-300">data-chatbot-id</span>=<span className="text-amber-300">&quot;{id}&quot;</span><span className="text-blue-400">&gt;&lt;/script&gt;</span>
                                </pre>
                             </div>

                             <div className="mt-8 flex items-center justify-between p-4 rounded-xl border border-primary/20 bg-primary/5">
                                 <div className="flex items-center space-x-3">
                                   <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                      <TerminalSquare className="w-4 h-4 text-primary" />
                                   </div>
                                   <div>
                                      <p className="text-[11px] font-bold text-emerald-950">Instructions</p>
                                      <p className="text-[10px] text-emerald-800/70">Place strictly before <code className="bg-emerald-100 px-1 rounded mx-0.5">&lt;/body&gt;</code> tag.</p>
                                   </div>
                                 </div>
                                 <button onClick={copyWidgetCode} className="px-4 py-2 bg-white hover:bg-emerald-50 border border-emerald-100 text-emerald-800 text-[10px] label-font uppercase tracking-widest font-bold rounded-lg shadow-sm transition-colors">
                                    Copy snippet
                                 </button>
                             </div>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>

        </div>
      </main>
    </div>
  );
}
