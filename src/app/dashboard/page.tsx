"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, Bot, TrendingUp, ArrowUpRight, Plus, AlertCircle, Loader2 as Spinner } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "there";
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSendVerification = async () => {
    setSendingVerification(true);
    try {
      const res = await fetch("/api/auth/verify-email", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setVerificationSent(true);
      }
    } catch {
      // silently fail
    } finally {
      setSendingVerification(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Email Verification Banner */}
      {session?.user && !session.user.emailVerified && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-800">Verify your email</p>
              <p className="text-xs text-amber-600">Please verify your email address to unlock all features.</p>
            </div>
          </div>
          {verificationSent ? (
            <span className="text-xs text-emerald-600 font-medium">Verification email sent!</span>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
              onClick={handleSendVerification}
              disabled={sendingVerification}
            >
              {sendingVerification && <Spinner className="w-3 h-3 animate-spin mr-1" />}
              Send verification email
            </Button>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome back, {firstName}
          </h1>
          <p className="text-gray-500 mt-1">Here&apos;s what&apos;s happening with your chatbots.</p>
        </div>
        <Link href="/dashboard/chatbots/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Plus className="w-4 h-4" />
            New Chatbot
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Total Conversations", value: "0", change: "+0%", icon: MessageSquare, color: "emerald" },
          { title: "Leads Captured", value: "0", change: "+0%", icon: Users, color: "blue" },
          { title: "Active Chatbots", value: "0", change: "", icon: Bot, color: "purple" },
          { title: "Resolution Rate", value: "0%", change: "+0%", icon: TrendingUp, color: "amber" },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
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
                {stat.change && (
                  <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" />
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">No conversations yet.</p>
              <p className="text-gray-400 text-xs mt-1">Create a chatbot and embed it on your site to start.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">No leads captured yet.</p>
              <p className="text-gray-400 text-xs mt-1">Your chatbot will capture leads automatically.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Create a Chatbot", desc: "Set up your first AI chatbot with your business info.", href: "/dashboard/chatbots/new", cta: "Create Chatbot" },
              { step: "2", title: "Add Your Content", desc: "Scrape your website or upload documents to train the AI.", href: "/dashboard/content", cta: "Add Content" },
              { step: "3", title: "Embed on Your Site", desc: "Copy the widget code and paste it on your website.", href: "/dashboard/chatbots", cta: "Get Embed Code" },
            ].map((item, i) => (
              <div key={i} className="flex flex-col p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-all">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-sm flex items-center justify-center mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 mb-4 flex-grow">{item.desc}</p>
                <Link href={item.href}>
                  <Button variant="outline" size="sm" className="w-full">{item.cta}</Button>
                </Link>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
