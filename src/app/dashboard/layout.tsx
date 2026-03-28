"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { ErrorBoundary } from "@/components/error-boundary";
import { Loader2, Menu } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen bg-surface overflow-hidden relative">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/40 z-30 transition-opacity backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop Fixed, Mobile Transform */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"} shadow-2xl lg:shadow-none`}>
         <Sidebar onClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative lg:border-l lg:border-outline-variant/20 lg:ml-64 z-10 custom-scrollbar lg:shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.05)] w-full">
        
        {/* Mobile App Bar */}
        <div className="lg:hidden h-14 bg-white border-b border-outline-variant/20 flex items-center justify-between px-4 shrink-0 shadow-sm relative z-20">
           <div className="flex items-center">
             <button onClick={() => setMobileMenuOpen(true)} className="p-2 -ml-2 text-emerald-900 hover:bg-surface-container rounded-lg transition-colors border border-outline-variant/10" aria-label="Open menu">
                <Menu className="w-5 h-5" />
             </button>
             <div className="ml-3 font-headline font-extrabold text-emerald-950 tracking-tight text-lg flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-[4px] bg-primary flex items-center justify-center -rotate-3">
                  <div className="w-1.5 h-1.5 rounded-sm bg-white border border-transparent"></div>
                </div>
                Jawab
             </div>
           </div>
           <div></div>
        </div>

        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </div>
    </div>
  );
}
