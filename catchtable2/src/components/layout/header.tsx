"use client";

import Link from "next/link";
import { Search, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">맛집예약</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/search"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              검색
            </Link>
            <Link
              href="/reservations"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              예약 내역
            </Link>
            <Link
              href="/waitlist"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              대기 내역
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
            <Link href="/search">
              <Search className="h-5 w-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
            <Link href="/dashboard">
              <User className="h-5 w-5" />
            </Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                <Link
                  href="/search"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  검색
                </Link>
                <Link
                  href="/reservations"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  예약 내역
                </Link>
                <Link
                  href="/waitlist"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  대기 내역
                </Link>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  대시보드
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

