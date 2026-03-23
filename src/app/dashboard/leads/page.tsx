"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jawab-leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leads</h1>
          <p className="text-gray-500 mt-1">View and manage captured leads from your chatbots.</p>
        </div>
        {leads.length > 0 && (
          <Button variant="outline" onClick={exportCSV} className="gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="h-4 bg-gray-200 rounded w-1/3" /></CardContent></Card>
          ))}
        </div>
      ) : leads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Users className="w-16 h-16 text-gray-300 mb-6" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads captured yet</h3>
            <p className="text-gray-500 text-sm">Your chatbot will automatically capture leads when visitors share their contact info.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {leads.map((lead) => (
            <Card key={lead.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{lead.name || "Unknown"}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      {lead.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>}
                      {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                      {lead.whatsapp && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{lead.whatsapp}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{lead.chatbot.name}</Badge>
                  <Badge variant={lead.status === "NEW" ? "default" : "secondary"}>{lead.status}</Badge>
                  <span className="text-xs text-gray-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
