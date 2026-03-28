"use client";

import { BarChart3, MessageSquare, Users, TrendingUp, Clock } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="flex-1 flex flex-col h-full bg-surface">
      {/* Sticky Header */}
      <header className="h-16 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-extrabold flex items-center font-headline text-emerald-900 tracking-tight">
            Telemetry & Analytics
          </h2>
        </div>
      </header>

      {/* Main Scrollable Viewport with Dashboard Spacing */}
      <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar relative">
        <div className="max-w-[1400px] space-y-8 mx-auto pb-20">
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Conversations", value: "0", icon: MessageSquare, color: "emerald", trend: "0% Growth" },
              { title: "Leads Captured", value: "0", icon: Users, color: "blue", trend: "0% Conversion" },
              { title: "Avg Response Time", value: "0s", icon: Clock, color: "purple", trend: "P99 Speed" },
              { title: "Resolution Rate", value: "0%", icon: TrendingUp, color: "amber", trend: "Automated" },
            ].map((stat, i) => (
              <div key={i} className="p-6 rounded-2xl border border-outline-variant/10 shadow-sm outline outline-1 outline-transparent hover:outline-outline-variant/20 bg-surface-container-low transition-all">
                 <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-outline-variant/10 flex items-center justify-center">
                      <stat.icon className={`w-5 h-5 ${stat.color === 'emerald' ? 'text-emerald-600' : stat.color === 'blue' ? 'text-blue-600' : stat.color === 'purple' ? 'text-purple-600' : 'text-amber-600'}`} />
                    </div>
                    <span className="text-[9px] font-bold label-font bg-white/50 px-1.5 py-0.5 rounded text-on-surface-variant uppercase tracking-widest">
                      {stat.trend}
                    </span>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-bold mb-1 text-on-surface-variant uppercase tracking-widest label-font">{stat.title}</h4>
                    <div className="text-4xl font-extrabold text-emerald-900 font-headline tracking-tight">{stat.value}</div>
                 </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col min-h-[350px]">
               <h3 className="text-sm font-extrabold text-emerald-900 tracking-tight font-headline mb-6 border-b border-outline-variant/10 pb-4">Conversations Over Time</h3>
               <div className="flex-1 flex flex-col items-center justify-center text-center">
                 <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-3">
                    <BarChart3 className="w-5 h-5 text-on-surface-variant" />
                 </div>
                 <p className="text-emerald-900 font-bold text-sm">Insufficient Data</p>
                 <p className="text-[11px] label-font text-on-surface-variant mt-1.5 max-w-[250px] font-medium leading-relaxed">
                   Volumes will be aggregated here once active threads begin initializing.
                 </p>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col min-h-[350px]">
               <h3 className="text-sm font-extrabold text-emerald-900 tracking-tight font-headline mb-6 border-b border-outline-variant/10 pb-4">Lead Geography</h3>
               <div className="flex-1 flex flex-col items-center justify-center text-center">
                 <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-3">
                    <Users className="w-5 h-5 text-on-surface-variant" />
                 </div>
                 <p className="text-emerald-900 font-bold text-sm">Insufficient CRM Data</p>
                 <p className="text-[11px] label-font text-on-surface-variant mt-1.5 max-w-[250px] font-medium leading-relaxed">
                   Source origins will map physically once pipeline ingestion starts.
                 </p>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col min-h-[300px]">
             <h3 className="text-sm font-extrabold text-emerald-900 tracking-tight font-headline mb-6 border-b border-outline-variant/10 pb-4">Language Distribution</h3>
             <div className="flex-1 flex flex-col items-center justify-center text-center">
               <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-3">
                  <BarChart3 className="w-5 h-5 text-on-surface-variant" />
               </div>
               <p className="text-emerald-900 font-bold text-sm">Awaiting Network Data</p>
               <p className="text-[11px] label-font text-on-surface-variant mt-1.5 max-w-[250px] font-medium leading-relaxed">
                 The dual language breakdown (Arabic/English) will visualize automatically.
               </p>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
}
