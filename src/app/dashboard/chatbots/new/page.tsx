"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Hexagon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const createBotSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  language: z.enum(["ar", "en"]).default("ar"),
  brandColor: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Must be a valid hex color code"),
  welcomeMessage: z.string().optional(),
});

type CreateBotValues = z.infer<typeof createBotSchema>;

export default function NewChatbotPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateBotValues>({
    resolver: zodResolver(createBotSchema),
    defaultValues: {
      name: "",
      language: "ar",
      brandColor: "#059669",
      welcomeMessage: "أهلاً! كيف يمكنني مساعدتك؟",
    },
  });

  const language = watch("language");

  const handleLanguageChange = (val: "ar" | "en") => {
    setValue("language", val);
    if (val === "en") {
      setValue("welcomeMessage", "Hello! How can I help you today?");
    } else {
      setValue("welcomeMessage", "أهلاً! كيف يمكنني مساعدتك؟");
    }
  };

  const onSubmit = async (data: CreateBotValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/chatbots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || "Failed to create module");
        setLoading(false);
        return;
      }

      const resData = await res.json();
      toast.success("Intelligence Module instantiated.");
      router.push(`/dashboard/chatbots/${resData.chatbot.id}`);
    } catch {
      toast.error("Initialization failure");
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-surface">
      {/* Sticky Header */}
      <header className="h-16 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 lg:px-8 shrink-0 z-10 w-full relative">
        <div className="flex items-center space-x-6">
          <Link href="/dashboard/chatbots">
            <button className="flex items-center space-x-2 text-on-surface-variant hover:text-emerald-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="w-px h-6 bg-outline-variant/30"></div>
          <h2 className="text-xl font-extrabold flex items-center font-headline text-emerald-900 tracking-tight">
            Provision New Module
          </h2>
        </div>
      </header>

      {/* Main Scrollable Viewport */}
      <main className="flex-1 overflow-auto bg-surface custom-scrollbar p-4 lg:p-8">
        <div className="max-w-2xl mx-auto pb-20 mt-4">

          <div className="bg-white rounded-2xl p-4 lg:p-8 border border-outline-variant/20 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <div className="mb-8">
               <h3 className="text-sm font-extrabold text-emerald-950 font-headline mb-1">Configuration Parameters</h3>
               <p className="text-[11px] label-font text-on-surface-variant uppercase tracking-widest">Construct the identity logic for this specific AI agent.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative z-10">
              {/* Agent Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="text-[10px] uppercase font-bold text-emerald-900 tracking-widest label-font block">
                  Agent Designation
                </label>
                <input
                  id="name"
                  placeholder="e.g., Customer Support Bot"
                  className={`w-full h-12 px-4 rounded-xl border ${errors.name ? 'border-red-500 bg-red-50' : 'border-outline-variant/30 bg-surface-container-low'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium`}
                  {...register("name")}
                />
                {errors.name && <p className="text-[10px] label-font font-bold text-red-500 uppercase tracking-widest mt-1.5">{errors.name.message}</p>}
              </div>

              {/* Language Protocol */}
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-bold text-emerald-900 tracking-widest label-font block">
                  Primary Language Routing
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "ar", label: "ARABIC FIRST" },
                    { value: "en", label: "ENGLISH FIRST" },
                  ].map((lang) => (
                    <button
                      key={lang.value}
                      type="button"
                      onClick={() => handleLanguageChange(lang.value as "ar" | "en")}
                      className={`h-12 rounded-xl border-2 text-[10px] font-bold label-font uppercase tracking-widest transition-all ${
                        language === lang.value
                          ? "border-primary bg-primary/5 text-primary shadow-sm"
                          : "border-outline-variant/20 text-on-surface-variant hover:bg-surface-container hover:border-outline-variant/40"
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Welcome Message */}
              <div className="space-y-2">
                <label htmlFor="welcomeMessage" className="text-[10px] uppercase font-bold text-emerald-900 tracking-widest label-font block">
                  Initial Handshake Payload
                </label>
                <input
                  id="welcomeMessage"
                  className="w-full h-12 px-4 rounded-xl border border-outline-variant/30 bg-surface-container-low focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-medium text-emerald-900"
                  {...register("welcomeMessage")}
                />
                <p className="text-[10px] label-font text-on-surface-variant mt-1.5 font-medium">The first message the agent transmits when the socket opens.</p>
              </div>

              {/* Brand Color */}
              <div className="space-y-2">
                <label htmlFor="brandColor" className="text-[10px] uppercase font-bold text-emerald-900 tracking-widest label-font block">
                  Brand Hex Vector
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden border-2 border-outline-variant/20 shadow-sm group">
                    <input 
                      type="color" 
                      value={watch("brandColor")}
                      onChange={(e) => setValue("brandColor", e.target.value)}
                      className="absolute -top-2 -left-2 w-16 h-16 cursor-crosshair opacity-0 group-hover:opacity-100 z-10"
                    />
                    <div className="absolute inset-0 z-0" style={{ backgroundColor: watch("brandColor") }}></div>
                  </div>
                  <input
                    id="brandColor"
                    placeholder="#059669"
                    className={`h-12 w-32 px-4 rounded-xl border ${errors.brandColor ? 'border-red-500 bg-red-50' : 'border-outline-variant/30 bg-surface-container-low'} focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-mono uppercase text-sm font-bold text-emerald-950 tracking-wider`}
                    {...register("brandColor")}
                  />
                  {errors.brandColor && <p className="text-[10px] label-font font-bold text-red-500 uppercase tracking-widest ml-2">{errors.brandColor.message}</p>}
                </div>
              </div>

              {/* Submit Line */}
              <div className="pt-6 border-t border-outline-variant/10 mt-8">
                <button type="submit" className="w-full h-12 bg-primary hover:bg-primary-dim text-on-primary font-bold text-xs label-font uppercase tracking-widest rounded-xl shadow-sm transition-all flex items-center justify-center gap-2" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hexagon className="w-4 h-4" strokeWidth={2.5}/>}
                  {loading ? "Provisioning Matrix..." : "Execute Deployment"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </main>
    </div>
  );
}
