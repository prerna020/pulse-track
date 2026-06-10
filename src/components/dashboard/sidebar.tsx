"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Bell,
  LayoutDashboard,
  LogOut,
  Radar,
  Settings,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  alertCount?: number;
}

export function Sidebar({ user, alertCount = 0 }: SidebarProps) {
  const pathname = usePathname();

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user.email?.[0]?.toUpperCase() ||
    "?";

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, badge: 0 },
    { href: "/dashboard/competitors", label: "Competitors", icon: Users, badge: 0 },
    { href: "/dashboard/alerts", label: "Alerts", icon: Bell, badge: alertCount },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, badge: 0 },
  ];

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col border-r border-black/8 bg-white">
      <div className="flex items-center gap-2 px-5 py-6">
        <div className="flex size-7 items-center justify-center rounded-md bg-[#0a0a0a]">
          <Radar className="size-4 text-white" />
        </div>
        <span className="text-sm font-semibold tracking-tight text-[#0a0a0a]">
          PulseTrack
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-[#0a0a0a] text-white"
                  : "text-[#6b7280] hover:bg-black/5 hover:text-[#0a0a0a]"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge > 0 && (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-red-100 text-red-600"
                  )}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-black/8 p-4">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback className="bg-black/5 text-xs text-[#0a0a0a]">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#0a0a0a]">
              {user.name ?? "User"}
            </p>
            <p className="truncate text-xs text-[#9ca3af]">{user.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-3 w-full justify-start gap-2 text-[#6b7280] hover:text-[#0a0a0a]"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="size-3.5" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
