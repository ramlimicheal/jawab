"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MessageSquare, Users, TrendingUp, Clock } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your chatbot performance and engagement metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Conversations", value: "0", icon: MessageSquare, color: "emerald" },
          { title: "Leads Captured", value: "0", icon: Users, color: "blue" },
          { title: "Avg Response Time", value: "0s", icon: Clock, color: "purple" },
          { title: "Resolution Rate", value: "0%", icon: TrendingUp, color: "amber" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  stat.color === "emerald" ? "bg-emerald-50 text-emerald-600" :
                  stat.color === "blue" ? "bg-blue-50 text-blue-600" :
                  stat.color === "purple" ? "bg-purple-50 text-purple-600" :
                  "bg-amber-50 text-amber-600"
                }`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Conversations Over Time</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">No data yet. Start conversations to see analytics.</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Lead Sources</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">No leads yet. Leads will be categorized by source.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Language Distribution</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-gray-500 text-sm">Language analytics will appear once conversations start.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
