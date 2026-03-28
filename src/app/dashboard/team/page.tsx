"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { UserPlus, Users, Loader2, Crown, Shield, User } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  role: string;
  user: { id: string; name: string | null; email: string };
}

interface ChatbotOption {
  id: string;
  name: string;
}

export default function TeamPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [chatbots, setChatbots] = useState<ChatbotOption[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState("");
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/team").then((res) => res.json()),
      fetch("/api/chatbots").then((res) => res.json()),
    ])
      .then(([teamData, botData]) => {
        setMembers(teamData.members || []);
        const bots = botData.chatbots || [];
        setChatbots(bots);
        if (bots.length > 0) setSelectedChatbot(bots[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleInvite = async () => {
    if (!email) return;
    setInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, chatbotId: selectedChatbot, role: "MEMBER" }),
      });
      if (res.ok) {
        toast.success("Access Provisioned. Email transmitted.");
        setEmail("");
        const data = await res.json();
        if (data.member) setMembers([...members, data.member]);
      } else {
        const data = await res.json();
        toast.error(data.error || "Provisioning denied");
      }
    } catch {
      toast.error("Network disconnect");
    }
    setInviting(false);
  };

  const roleIcon = (role: string) => {
    switch (role) {
      case "OWNER": return <Crown className="w-3.5 h-3.5 text-amber-600" />;
      case "ADMIN": return <Shield className="w-3.5 h-3.5 text-blue-600" />;
      default: return <User className="w-3.5 h-3.5 text-on-surface-variant" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface">
      {/* Sticky Header */}
      <header className="h-16 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-extrabold flex items-center font-headline text-emerald-900 tracking-tight">
            Security & Access
            {!loading && members.length > 0 && (
              <span className="ml-3 px-2 py-0.5 bg-primary/10 text-primary text-[11px] rounded-sm label-font font-bold uppercase tracking-widest">
                {members.length} Clearances
              </span>
            )}
          </h2>
        </div>
      </header>

      {/* Main Scrollable Viewport with Dashboard Spacing */}
      <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar relative">
        <div className="max-w-[1400px] space-y-8 mx-auto pb-20">

          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden p-6 max-w-3xl">
            <div className="flex items-center gap-3 mb-6">
               <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                 <UserPlus className="w-4 h-4 text-emerald-600" />
               </div>
               <div>
                  <h3 className="font-extrabold text-emerald-950 font-headline text-sm">Provision Network Login</h3>
                  <p className="text-[10px] label-font font-bold uppercase tracking-widest text-on-surface-variant">Grant Chatbot Terminal Access</p>
               </div>
             </div>

             <div className="flex gap-2 relative">
                {chatbots.length > 0 && (
                  <select
                    value={selectedChatbot}
                    onChange={(e) => setSelectedChatbot(e.target.value)}
                    className="h-12 px-4 rounded-xl border border-outline-variant/30 bg-surface-container-low font-bold text-emerald-900 text-sm focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer w-[200px]"
                  >
                    {chatbots.map((bot) => (
                      <option key={bot.id} value={bot.id}>Hub: {bot.name}</option>
                    ))}
                  </select>
                )}
                <input
                  placeholder="agent@company.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 h-12 px-4 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium"
                />
                <button onClick={handleInvite} disabled={inviting || !selectedChatbot} className="bg-primary hover:bg-primary-dim text-on-primary font-bold text-[11px] label-font uppercase tracking-widest px-6 rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px]">
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Authorize</>}
                </button>
             </div>
          </div>

          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden max-w-4xl">
             {loading ? (
                <div className="p-6 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
             ) : members.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                   <div className="w-16 h-16 bg-surface-container-low rounded-full flex items-center justify-center mb-6">
                     <Users className="w-8 h-8 text-on-surface-variant" strokeWidth={1.5} />
                   </div>
                   <h3 className="text-xl font-extrabold text-emerald-950 font-headline tracking-tight mb-2">Isolated Node</h3>
                   <p className="text-on-surface-variant text-[12px] font-medium max-w-[350px] leading-relaxed">
                     You are the sole authorized operator. Provision new clearances above.
                   </p>
                </div>
             ) : (
                <div className="overflow-x-auto min-w-full">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead className="bg-surface-container-low border-b border-outline-variant/30">
                      <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest label-font">
                        <th className="px-4 lg:px-8 py-4 w-1/2">Operator Identity</th>
                        <th className="px-4 py-4 w-1/4">Clearance Level</th>
                        <th className="px-4 py-4">Auth Route</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10 text-xs text-on-surface">
                       {members.map((member) => (
                         <tr key={member.id} className="table-row-hover transition-colors group">
                           <td className="px-4 lg:px-8 py-4 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-surface-container border border-outline-variant/20 flex items-center justify-center font-bold text-emerald-800 text-[10px] uppercase font-headline">
                                {member.user.name?.split(" ").map((n) => n[0]).join("") || "OP"}
                              </div>
                              <div>
                                 <div className="font-bold text-sm text-emerald-950 font-headline">{member.user.name || "Unknown"}</div>
                                 <div className="text-[10px] label-font text-on-surface-variant uppercase tracking-widest mt-0.5">{member.user.email}</div>
                              </div>
                           </td>
                           <td className="px-4 py-4">
                              <div className="inline-flex items-center gap-1.5 border border-outline-variant/30 bg-surface-container px-2 py-1 rounded text-[10px] font-bold label-font uppercase tracking-widest text-emerald-900 shadow-sm">
                                {roleIcon(member.role)}
                                {member.role}
                              </div>
                           </td>
                           <td className="px-4 py-4">
                             <div className="text-[10px] label-font text-on-surface-variant uppercase tracking-widest">Single Sign-On</div>
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
