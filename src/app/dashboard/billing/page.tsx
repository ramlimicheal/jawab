"use client";

import { CreditCard, Check, Zap } from "lucide-react";
import { PLAN_PRICES } from "@/lib/utils";

export default function BillingPage() {
  const currentPlan = "ENTERPRISE BETA";

  const plans = [
    { key: "STARTER", name: "Starter Node", price: PLAN_PRICES.STARTER.monthly, features: ["2 Active Terminals", "2,000 Transmissions", "50 Memory Cores", "3 Operator Clearances", "Standard SLA"] },
    { key: "GROWTH", name: "Growth Vector", price: PLAN_PRICES.GROWTH.monthly, popular: true, features: ["5 Active Terminals", "10,000 Transmissions", "200 Memory Cores", "10 Operator Clearances", "High Priority SLA", "Webhooks Active"] },
    { key: "SCALE", name: "Scale Network", price: PLAN_PRICES.SCALE.monthly, features: ["20 Active Terminals", "50,000 Transmissions", "1,000 Memory Cores", "50 Operator Clearances", "Dedicated Engineer", "Full API Access"] },
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
      console.error("Transmission failed");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface">
      {/* Sticky Header */}
      <header className="h-16 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-6">
          <h2 className="text-xl font-extrabold flex items-center font-headline text-emerald-900 tracking-tight">
            Financial Ledger
          </h2>
        </div>
      </header>

      {/* Main Scrollable Viewport with Dashboard Spacing */}
      <main className="flex-1 overflow-auto p-4 lg:p-8 custom-scrollbar relative">
        <div className="max-w-[1400px] space-y-8 mx-auto pb-20">

          <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 max-w-4xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container/20 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-extrabold font-headline text-emerald-900 tracking-tight text-lg mb-0.5">Development Pre-Release</p>
                <p className="text-[11px] label-font font-bold uppercase tracking-widest text-on-surface-variant">Unmetered Access Remaining</p>
              </div>
            </div>
            <div className="bg-surface-container border border-outline-variant/30 text-emerald-900 font-extrabold text-[10px] label-font uppercase tracking-widest px-3 py-1 pb-1 rounded shadow-sm">
               {currentPlan}
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-5xl">
            {plans.map((plan) => (
              <div key={plan.key} className={`bg-white rounded-2xl border shadow-sm p-6 relative flex flex-col transition-all hover:shadow-md ${plan.popular ? 'border-primary outline outline-1 outline-primary' : 'border-outline-variant/20 hover:border-outline-variant/40'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-3 py-1 rounded shadow-sm text-[9px] font-bold label-font tracking-widest uppercase">
                    Recommended Spec
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="font-extrabold text-emerald-950 font-headline mb-2">{plan.name}</h3>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-extrabold tracking-tight font-headline text-emerald-900">{plan.price}</span>
                    <span className="text-[11px] font-bold label-font uppercase tracking-widest text-on-surface-variant mb-1">AED/m</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                      <span className="text-xs font-bold font-headline text-emerald-950">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-[11px] font-bold label-font uppercase tracking-widest transition-all ${
                    plan.popular
                      ? "bg-primary text-on-primary hover:bg-primary-dim shadow-sm"
                      : "bg-surface-container text-emerald-900 border border-outline-variant/30 hover:bg-surface-container-high"
                  }`}
                  onClick={() => handleUpgrade(plan.key)}
                >
                  <Zap className="w-4 h-4" />
                  Install {plan.name}
                </button>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}
