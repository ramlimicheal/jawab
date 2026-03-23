"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
        toast.success("Invitation sent!");
        setEmail("");
        const data = await res.json();
        if (data.member) setMembers([...members, data.member]);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to invite");
      }
    } catch {
      toast.error("Something went wrong");
    }
    setInviting(false);
  };

  const roleIcon = (role: string) => {
    switch (role) {
      case "OWNER": return <Crown className="w-3.5 h-3.5 text-amber-600" />;
      case "ADMIN": return <Shield className="w-3.5 h-3.5 text-blue-600" />;
      default: return <User className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Team</h1>
        <p className="text-gray-500 mt-1">Manage your team members and their permissions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite Team Member</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {chatbots.length > 1 && (
              <select
                value={selectedChatbot}
                onChange={(e) => setSelectedChatbot(e.target.value)}
                className="border border-gray-200 rounded-md px-3 py-2 text-sm"
              >
                {chatbots.map((bot) => (
                  <option key={bot.id} value={bot.id}>{bot.name}</option>
                ))}
              </select>
            )}
            <Input
              placeholder="colleague@company.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={handleInvite} disabled={inviting || !selectedChatbot} className="bg-emerald-600 hover:bg-emerald-700 gap-1">
              {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              Invite
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4"><div className="w-10 h-10 bg-gray-200 rounded-full" /><div className="h-4 bg-gray-200 rounded w-1/3" /></div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">No team members yet. Invite your first team member above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-bold">
                        {member.user.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">{member.user.name || "Unnamed"}</p>
                      <p className="text-sm text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="gap-1">
                    {roleIcon(member.role)}
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
