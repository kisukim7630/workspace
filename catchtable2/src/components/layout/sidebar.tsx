"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Users, Settings, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const menuItems = [
  { href: "/dashboard", label: "대시보드", icon: Home },
  { href: "/dashboard/reservations", label: "예약 관리", icon: Calendar },
  { href: "/dashboard/waitlist", label: "대기열 관리", icon: Users },
  { href: "/dashboard/settings", label: "설정", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const SidebarContent = () => (
    <nav className="flex flex-col gap-2 p-4">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <aside className="hidden border-r bg-background md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-64 md:flex-col">
        <div className="flex h-16 items-center border-b px-6">
          <span className="text-lg font-bold text-primary">식당 관리</span>
        </div>
        <SidebarContent />
      </aside>

      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed left-4 top-20 z-50">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-16 items-center border-b px-6">
              <span className="text-lg font-bold text-primary">식당 관리</span>
            </div>
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

