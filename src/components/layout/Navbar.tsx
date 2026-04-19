"use client";

import { Button } from "@/components/ui/Button";
import { useSidebarStore } from "@/store";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import {
  List,
  Sun,
  Moon,
  Bell,
  SignOut,
  Gear,
  CaretDown,
} from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { toggle } = useSidebarStore();
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 backdrop-blur-md px-4 lg:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        className="lg:hidden"
        aria-label="Toggle sidebar"
        id="sidebar-toggle"
      >
        <List size={18} />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          id="theme-toggle"
          aria-label="Toggle theme"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun size={18} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon size={18} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>

        <Button variant="ghost" size="icon" id="notifications-btn" aria-label="Notifications">
          <Bell size={18} />
        </Button>

        <div className="relative" ref={menuRef}>
          <button
            id="user-menu-btn"
            onClick={() => setMenuOpen((o) => !o)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-2 py-1.5",
              "hover:bg-accent transition-colors duration-150",
              "text-sm font-medium"
            )}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <div className="relative flex h-7 w-7 overflow-hidden items-center justify-center rounded-full bg-foreground text-background">
              <Image
                src={session?.user?.image || `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(session?.user?.name ?? "User")}`}
                alt={session?.user?.name ?? "Avatar"}
                fill
                className="object-cover"
                sizes="28px"
              />
            </div>
            <span className="hidden sm:block max-w-30 truncate">
              {session?.user?.name ?? "Account"}
            </span>
            <CaretDown
              size={14}
              className={cn(
                "text-muted-foreground transition-transform duration-200",
                menuOpen && "rotate-180"
              )}
            />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-52 rounded-xl border border-border bg-card shadow-xl overflow-hidden z-50 animate-fade-in">
              <div className="px-3 py-3 border-b border-border">
                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
              <div className="py-1">
                <Link
                  href="/dashboard/settings"
                  className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Gear size={16} className="text-muted-foreground" />
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/auth/login" })}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors text-destructive"
                >
                  <SignOut size={16} />
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
