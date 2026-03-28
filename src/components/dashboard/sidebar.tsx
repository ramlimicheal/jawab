"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Users,
  BarChart3,
  FileText,
  UserPlus,
  CreditCard,
  Settings,
  LogOut,
  Moon,
  X,
} from "lucide-react";

const navGroups = [
  {
    title: "DASHBOARD",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Chatbots", href: "/dashboard/chatbots", icon: Bot },
      { label: "Conversations", href: "/dashboard/conversations", icon: MessageSquare },
    ],
  },
  {
    title: "ACQUISITION",
    items: [
      { label: "Leads", href: "/dashboard/leads", icon: Users },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    ],
  },
  {
    title: "KNOWLEDGE",
    items: [
      { label: "Content", href: "/dashboard/content", icon: FileText },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { label: "Team", href: "/dashboard/team", icon: UserPlus },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
      { label: "Settings", href: "/dashboard/settings", icon: Settings },
    ],
  },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userInitials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <aside className="w-64 bg-white border-r border-outline-variant/20 flex flex-col py-6 shrink-0 z-40 h-full">
      <div className="px-6 mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-emerald-900 font-headline">Jawab</h1>
          <p className="text-[10px] label-font text-on-surface-variant uppercase tracking-widest">Enterprise AI</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 hover:bg-surface-container rounded-lg text-on-surface-variant hover:text-emerald-900 transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 custom-scrollbar">
        {navGroups.map((group, groupIdx) => (
          <div key={group.title} className={cn("mb-6", groupIdx === 0 ? "" : "mt-6")}>
            <p className="px-3 text-[10px] font-bold text-on-surface-variant label-font mb-2">
              {group.title}
            </p>
            {group.items.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-lg transition-all duration-150 mb-1",
                    isActive
                      ? "bg-emerald-50 text-emerald-900 shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-container"
                  )}
                >
                  <item.icon className={cn("mr-3 w-4 h-4", isActive && "text-emerald-700")} strokeWidth={isActive ? 2.5 : 2} />
                  <span className={cn("text-sm label-font", isActive ? "font-bold" : "font-medium")}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="px-3 mt-4 space-y-1 shrink-0">
        <div className="flex items-center justify-between px-3 py-2 text-on-surface-variant cursor-not-allowed opacity-50">
          <div className="flex items-center">
            <Moon className="mr-3 w-4 h-4" />
            <span className="text-sm font-medium label-font">Dark mode</span>
          </div>
          <div className="w-8 h-4 bg-outline-variant/30 rounded-full relative">
            <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full"></div>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center px-3 py-2 text-error/70 hover:bg-error/5 rounded-lg transition-colors"
        >
          <LogOut className="mr-3 w-4 h-4" />
          <span className="text-sm font-medium label-font">Log out</span>
        </button>
      </div>

      <div className="px-4 mt-6 shrink-0">
        <div className="p-3 bg-surface-container-low rounded-xl flex items-center border border-outline-variant/10">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs shrink-0">
            {userInitials}
          </div>
          <div className="ml-2 overflow-hidden">
            <p className="text-xs font-bold truncate text-emerald-950 font-headline">{session?.user?.name || "User"}</p>
            <p className="text-[9px] label-font text-on-surface-variant truncate">{session?.user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
