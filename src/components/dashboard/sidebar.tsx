"use client";

import { useState } from "react";
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
  PanelLeftClose,
  PanelLeftOpen,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <aside
      className={cn(
        "relative flex h-screen shrink-0 flex-col border-r border-[rgba(26,18,8,0.1)] bg-[#ffffff] transition-all duration-300",
        isCollapsed ? "w-[72px]" : "w-[220px]"
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-6 z-50 flex size-6 cursor-pointer items-center justify-center rounded-full border border-[rgba(26,18,8,0.1)] bg-white shadow-sm hover:bg-gray-50 p-0"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <PanelLeftOpen className="size-3 text-[#5c4a32]" />
        ) : (
          <PanelLeftClose className="size-3 text-[#5c4a32]" />
        )}
      </Button>

      <div
        className={cn(
          "flex items-center py-6",
          isCollapsed ? "justify-center px-0" : "gap-2 px-5"
        )}
      >
        <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-[#1a1208]">
          <Radar className="size-4 text-white" />
        </div>
        {!isCollapsed && (
          <span className="text-sm font-semibold tracking-tight text-[#1a1208]">
            PulseTrack
          </span>
        )}
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
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "relative flex items-center rounded-lg py-2 text-sm font-medium transition-colors",
                isCollapsed ? "justify-center px-0" : "gap-2.5 px-3",
                isActive
                  ? "bg-[#1a1208] text-white"
                  : "text-[#5c4a32] hover:bg-[rgba(26,18,8,0.05)] hover:text-[#1a1208]"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {!isCollapsed && <span className="flex-1">{item.label}</span>}
              {item.badge > 0 && !isCollapsed && (
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-[#fdf0ee] text-[#a63d2f]"
                  )}
                >
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
              {item.badge > 0 && isCollapsed && (
                <span className="absolute right-3 top-2 flex size-2 rounded-full bg-[#a63d2f]" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-[rgba(26,18,8,0.1)] p-4", isCollapsed && "items-center flex flex-col px-2")}>
        <div className={cn("flex items-center", isCollapsed ? "justify-center" : "gap-2.5")}>
          <Avatar className="size-8">
            <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
            <AvatarFallback className="bg-[rgba(26,18,8,0.05)] text-xs text-[#1a1208]">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#1a1208]">
                {user.name ?? "User"}
              </p>
              <p className="truncate text-xs text-[#9c8570]">{user.email}</p>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "mt-3 text-[#5c4a32] hover:text-[#1a1208]",
            isCollapsed ? "w-10 px-0 justify-center" : "w-full justify-start gap-2"
          )}
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={isCollapsed ? "Sign out" : undefined}
        >
          <LogOut className="size-3.5" />
          {!isCollapsed && "Sign out"}
        </Button>
      </div>
    </aside>
  );
}
