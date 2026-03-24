"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, Zap } from "lucide-react";
import { PLAN_PRICES } from "@/lib/utils";

export default function BillingPage() {
  const currentPlan = "FREE";

  const plans = [
    { key: "STARTER", name: "Starter", price: PLAN_PRICES.STARTER.monthly, features: ["2 chatbots", "2,000 messages/mo", "50 content sources", "3 team members", "Email support"] },
    { key: "GROWTH", name: "Growth", price: PLAN_PRICES.GROWTH.monthly, popular: true, features: ["5 chatbots", "10,000 messages/mo", "200 content sources", "10 team members", "Priority support", "Webhooks"] },
    { key: "SCALE", name: "Scale", price: PLAN_PRICES.SCALE.monthly, features: ["20 chatbots", "50,000 messages/mo", "1,000 content sources", "50 team members", "Dedicated support", "API access"] },
  ];

  const handleUpgrade = async (planKey: string) => {
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      console.error("Checkout failed");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Billing</h1>
        <p className="text-gray-500 mt-1">Manage your subscription and billing details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>You are currently on the free trial.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-lg">Free Trial</p>
              <p className="text-sm text-gray-500">14 days remaining</p>
            </div>
            <Badge className="ml-auto">{currentPlan}</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.key} className={plan.popular ? "border-emerald-600 shadow-lg relative" : ""}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-gray-500 ml-1">AED/mo</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full gap-2 ${plan.popular ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleUpgrade(plan.key)}
              >
                <Zap className="w-4 h-4" />
                Upgrade to {plan.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
