"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Save, Loader2, AlertTriangle, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        toast.success("Auth Profile Modified.");
      } else {
        toast.error("Modification rejected");
      }
    } catch {
      toast.error("Network disconnect");
    }
    setSaving(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface">
      {/* Sticky Header */}
      <header className="h-16 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-extrabold flex items-center font-headline text-emerald-900 tracking-tight">
            System Preferences
          </h2>
        </div>
      </header>

      {/* Main Scrollable Viewport with Dashboard Spacing */}
      <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar relative">
        <div className="max-w-[1400px] space-y-8 mx-auto pb-20">

          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-4 lg:p-8 max-w-2xl">
             <div className="flex items-center gap-3 mb-8 border-b border-outline-variant/10 pb-4">
               <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                 <User className="w-5 h-5 text-emerald-800" />
               </div>
               <div>
                  <h3 className="font-extrabold text-emerald-950 font-headline text-lg tracking-tight">Operator Identity</h3>
                  <p className="text-[10px] label-font font-bold uppercase tracking-widest text-on-surface-variant mt-0.5">Modify core identity parameters</p>
               </div>
             </div>

             <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold label-font uppercase tracking-widest text-emerald-900 mb-2">Display Designation</label>
                  <input 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 bg-surface-container-low font-bold text-emerald-950 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold label-font uppercase tracking-widest text-emerald-900 mb-2">Authorized Root Email</label>
                  <input 
                    value={session?.user?.email || "SSO Bound"} 
                    disabled 
                    className="w-full h-12 px-4 rounded-xl border border-outline-variant/20 bg-surface text-on-surface-variant font-bold text-sm outline-none opacity-70 cursor-not-allowed"
                  />
                  <p className="text-[10px] font-bold label-font tracking-widest uppercase text-on-surface-variant/70 mt-2">Core Auth identifiers are permanently locked.</p>
                </div>

                <div className="pt-4 flex justify-end">
                   <button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary-dim text-on-primary font-bold text-[11px] label-font uppercase tracking-widest px-4 lg:px-8 rounded-xl h-12 shadow-sm transition-all disabled:opacity-50 flex items-center min-w-[150px] justify-center">
                     {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2"/> Commit Changes</>}
                   </button>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-4 lg:p-8 max-w-2xl">
              <div className="flex items-center gap-3 mb-8 border-b border-outline-variant/10 pb-4">
                 <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                   <ShieldCheck className="w-5 h-5 text-emerald-800" />
                 </div>
                 <div>
                    <h3 className="font-extrabold text-emerald-950 font-headline text-lg tracking-tight">Localization Protocol</h3>
                    <p className="text-[10px] label-font font-bold uppercase tracking-widest text-on-surface-variant mt-0.5">Define linguistic dashboard UI rules</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <button className="flex items-center justify-center border-2 border-primary bg-primary/5 text-primary rounded-xl h-16 font-extrabold font-headline tracking-tight text-sm shadow-sm">
                    English (US)
                 </button>
                 <button className="flex items-center justify-center border border-outline-variant/30 bg-surface-container-low text-on-surface-variant rounded-xl h-16 font-extrabold font-arabic text-lg tracking-tight hover:border-outline-variant/60 transition-colors">
                    العربية
                 </button>
              </div>
          </div>

          <div className="bg-red-50 rounded-2xl border border-red-200 shadow-sm p-4 lg:p-8 max-w-2xl">
             <div className="flex items-center gap-3 mb-6">
               <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                 <AlertTriangle className="w-5 h-5 text-red-600" />
               </div>
               <div>
                  <h3 className="font-extrabold text-red-900 font-headline text-lg tracking-tight">Nuclear Core</h3>
                  <p className="text-[10px] label-font font-bold uppercase tracking-widest text-red-700/80 mt-0.5">Irreversible Destructive Actions</p>
               </div>
             </div>
             
             <p className="text-sm font-medium text-red-900/80 mb-6 leading-relaxed max-w-md">
               Purging this node will annihilate all configured Chatbot deployments, CRM matrices, and localized vector schemas. This action cannot be halted once begun.
             </p>

             <button className="border border-red-300 bg-white text-red-600 hover:bg-red-100 font-bold text-[11px] label-font uppercase tracking-widest px-4 lg:px-8 rounded-xl h-12 shadow-sm transition-all flex items-center justify-center">
                Initialize Data Purge
             </button>
          </div>

        </div>
      </main>
    </div>
  );
}
