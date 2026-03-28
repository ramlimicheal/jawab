import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { MessageSquare, Users, Bot, TrendingUp, Plus, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { VerificationBanner } from "@/components/dashboard/verification-banner";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/auth/login");

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] || "there";

  const [activeChatbots, totalConversations, leadsCaptured, resolvedConversations] = await Promise.all([
    prisma.chatbot.count({ where: { userId, isActive: true } }),
    prisma.thread.count({ where: { chatbot: { userId } } }),
    prisma.lead.count({ where: { chatbot: { userId } } }),
    prisma.thread.count({ where: { chatbot: { userId }, status: "RESOLVED" } })
  ]);

  const resolutionRate = totalConversations > 0 
    ? Math.round((resolvedConversations / totalConversations) * 100) 
    : 0;

  return (
    <div className="flex-1 flex flex-col h-full bg-surface">
      {/* Sticky Header mapping to Prototype */}
      <header className="h-16 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-6">
          <div>
            <h2 className="text-xl font-extrabold flex items-center font-headline text-emerald-900 tracking-tight">
              Dashboard
              <span className="ml-3 px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-sm label-font font-bold uppercase tracking-widest">
                {activeChatbots} Active Hubs
              </span>
            </h2>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/chatbots/new">
            <button className="bg-primary text-on-primary px-4 py-2 rounded-lg flex items-center space-x-2 text-xs font-bold label-font hover:bg-primary-dim transition-colors shadow-sm">
              <Plus className="w-4 h-4" />
              <span>Deploy Chatbot</span>
            </button>
          </Link>
        </div>
      </header>

      {/* Main Scrollable Viewport */}
      <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar relative">
        <div className="max-w-[1400px] space-y-8 mx-auto pb-20">
          {!session.user.emailVerified && <VerificationBanner />}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Total Conversations", value: totalConversations.toString(), icon: MessageSquare, bg: "bg-surface-container-low", text: "text-emerald-900", iconColor: "text-emerald-600", trend: "Lifetime" },
              { title: "Leads Captured", value: leadsCaptured.toString(), icon: Users, bg: "bg-surface-container-low", text: "text-emerald-900", iconColor: "text-emerald-600", trend: "Pipeline" },
              { title: "Active Chatbots", value: activeChatbots.toString(), icon: Bot, bg: "bg-surface-container-high", text: "text-emerald-950", iconColor: "text-primary", trend: "Running" },
              { title: "Resolution Rate", value: `${resolutionRate}%`, icon: TrendingUp, bg: "bg-surface-container", text: "text-emerald-900", iconColor: "text-emerald-700", trend: "Automated" },
            ].map((stat, i) => (
              <div key={i} className={`p-6 rounded-2xl border border-outline-variant/10 shadow-sm ${stat.bg} hover:shadow-md transition-shadow`}>
                 <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-outline-variant/10 flex items-center justify-center">
                      <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                    </div>
                    <span className="text-[9px] font-bold label-font bg-white/50 px-1.5 py-0.5 rounded text-on-surface-variant uppercase tracking-widest">
                      {stat.trend}
                    </span>
                 </div>
                 <div>
                    <h4 className="text-[10px] font-bold mb-1 text-on-surface-variant uppercase tracking-widest label-font">{stat.title}</h4>
                    <div className={`text-4xl font-extrabold ${stat.text} font-headline tracking-tight`}>{stat.value}</div>
                 </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions / Recent Activity */}
            <div className="bg-white/95 rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col min-h-[300px]">
               <h3 className="text-sm font-extrabold text-emerald-900 tracking-tight font-headline mb-6 border-b border-outline-variant/10 pb-4">Recent Support Threads</h3>
               
               <div className="flex-1 flex flex-col items-center justify-center text-center">
                 {totalConversations === 0 ? (
                    <>
                      <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-3">
                        <MessageSquare className="w-5 h-5 text-on-surface-variant" />
                      </div>
                      <p className="text-emerald-900 font-bold text-sm">No incoming data yet.</p>
                      <p className="text-[11px] label-font text-on-surface-variant mt-1.5 max-w-[250px] font-medium leading-relaxed">
                        Deploy your first widget to automatically start capturing customer support requests.
                      </p>
                    </>
                 ) : (
                    <>
                      <div className="text-3xl font-extrabold text-emerald-900 mb-2">{totalConversations}</div>
                      <p className="text-[11px] label-font font-bold text-on-surface-variant uppercase tracking-widest mb-4">Total Interactions Logged</p>
                      <Link href="/dashboard/conversations">
                        <button className="flex items-center space-x-1 border border-outline-variant/20 bg-surface px-4 py-2 rounded-lg text-xs font-bold text-emerald-800 label-font hover:bg-surface-container-high transition-colors">
                          <span>Open Inbox HQ</span>
                          <ArrowUpRight className="w-3 h-3 block opacity-50" />
                        </button>
                      </Link>
                    </>
                 )}
               </div>
            </div>

            <div className="bg-white/95 rounded-2xl p-6 shadow-sm border border-outline-variant/20 flex flex-col min-h-[300px]">
               <h3 className="text-sm font-extrabold text-emerald-900 tracking-tight font-headline mb-6 border-b border-outline-variant/10 pb-4">Lead Generation Engine</h3>
               
               <div className="flex-1 flex flex-col items-center justify-center text-center">
                 {leadsCaptured === 0 ? (
                    <>
                      <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-3">
                        <Users className="w-5 h-5 text-on-surface-variant" />
                      </div>
                      <p className="text-emerald-900 font-bold text-sm">Pipeline is empty.</p>
                      <p className="text-[11px] label-font text-on-surface-variant mt-1.5 max-w-[250px] font-medium leading-relaxed">
                        The AI agent can natively request emails and phone numbers from high-intent visitors.
                      </p>
                    </>
                 ) : (
                     <>
                      <div className="text-3xl font-extrabold text-primary mb-2">{leadsCaptured}</div>
                      <p className="text-[11px] label-font font-bold text-on-surface-variant uppercase tracking-widest mb-4">Unique Audiences Captured</p>
                      <Link href="/dashboard/leads">
                        <button className="flex items-center space-x-1 border border-outline-variant/20 bg-surface px-4 py-2 rounded-lg text-xs font-bold text-emerald-800 label-font hover:bg-surface-container-high transition-colors">
                          <span>Export CRM Data</span>
                          <ArrowUpRight className="w-3 h-3 block opacity-50" />
                        </button>
                      </Link>
                    </>
                 )}
               </div>
            </div>
          </div>

          {/* Launch Sequence Wrapper */}
          {activeChatbots === 0 && (
            <div className="bg-primary/5 rounded-2xl border border-primary/20 p-4 lg:p-8 relative overflow-hidden mt-4 shadow-sm">
               <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(#006d4a 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
               <div className="relative z-10">
                 <h2 className="text-lg font-bold text-emerald-950 font-headline mb-6 flex items-center">
                    <span className="material-symbols-outlined mr-2">rocket_launch</span>
                    Ignition Payload Sequence
                 </h2>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   {[
                    { step: "1", title: "Initialize Hub", desc: "Construct a new AI module to act as the cognitive core for your product.", href: "/dashboard/chatbots/new", cta: "Deploy Now" },
                    { step: "2", title: "Ingest Data", desc: "Pipe knowledge base URLs or flat PDFs into the memory matrix.", href: "/dashboard/content", cta: "Add Sources" },
                    { step: "3", title: "Inject JS Payload", desc: "Embed the monolithic tracking code into your application root.", href: "/dashboard/chatbots", cta: "Get Script" },
                   ].map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-5 border border-outline-variant/20 hover:border-primary/30 hover:shadow-md transition-all group flex flex-col">
                       <p className="text-[10px] label-font font-bold text-emerald-700 bg-emerald-50 w-fit px-2 py-0.5 rounded uppercase tracking-widest mb-3">STAGE {item.step}</p>
                       <h3 className="font-bold text-sm text-emerald-950 mb-1 font-headline">{item.title}</h3>
                       <p className="text-[11px] text-on-surface-variant font-medium leading-relaxed mb-5 flex-1">{item.desc}</p>
                       <Link href={item.href}>
                         <button className="w-full bg-surface hover:bg-surface-container-high border border-outline-variant/20 text-emerald-900 font-bold label-font text-xs py-2 rounded-lg transition-colors group-hover:bg-primary group-hover:text-on-primary group-hover:border-primary">
                           {item.cta}
                         </button>
                       </Link>
                    </div>
                   ))}
                 </div>
               </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
