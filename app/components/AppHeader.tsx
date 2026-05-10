"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut, UserRound, Menu, X, Swords, Trophy } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearStoredUser, getStoredUser } from "@/lib/session";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { Button } from "@/app/components/ui/button";
import { useState, useEffect } from "react";
import { type SessionUser } from "@/lib/session";

export default function AppHeader({
  isAdmin,
  slot,
  onLoginClick
}: {
  isAdmin?: boolean;
  slot?: ReactNode;
  onLoginClick?: () => void;
}) {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  function handleLogout() {
    clearStoredUser();
    router.replace("/dashboard");
  }

  return (
    <TooltipProvider>
      <header className="flex items-center justify-between border-b-2 border-[var(--color-border)] pb-4 mb-4">
        <div className="flex items-center gap-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboard">
                <div className="rounded-full h-[52px] w-[52px] flex items-center justify-center overflow-hidden transition-all duration-100 active:border-b-0 active:translate-y-[5px]">
                  <img src="/logo.png" alt="WieldQuest Logo" className="w-full h-full object-contain" />
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent>WieldQuest Home</TooltipContent>
          </Tooltip>

          {/* Desktop Nav */}
          <nav className="flex gap-6 max-md:hidden">
            <Link
              href="/dashboard/quests"
              className="text-[var(--color-text-muted)] text-[15px] font-black uppercase no-underline tracking-wide px-3 py-2 rounded-xl transition-colors hover:text-[var(--color-blue)] hover:bg-[var(--color-page-bg)]"
            >
              Quests
            </Link>
            <Link
              href="/dashboard/leaderboard"
              className="text-[var(--color-text-muted)] text-[15px] font-black uppercase no-underline tracking-wide px-3 py-2 rounded-xl transition-colors hover:text-[var(--color-blue)] hover:bg-[var(--color-page-bg)]"
            >
              Leaderboard
            </Link>
          </nav>

          {slot ? <div className="ml-2">{slot}</div> : null}
        </div>

        {/* Mobile Menu Overlay */}
        {isMenuOpen && (
          <div className="absolute top-[80px] left-0 right-0 z-50 bg-white border-b-4 border-[var(--color-border)] p-6 md:hidden animate-in slide-in-from-top duration-200 shadow-2xl">
            <nav className="flex flex-col gap-4">
              <Link
                href="/dashboard/quests"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 text-[18px] font-black uppercase no-underline tracking-wide p-4 rounded-2xl bg-[var(--color-page-bg)] text-[var(--color-text-main)]"
              >
                <Swords size={20} className="text-[var(--color-blue)]" />
                Quests
              </Link>
              <Link
                href="/dashboard/leaderboard"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 text-[18px] font-black uppercase no-underline tracking-wide p-4 rounded-2xl bg-[var(--color-page-bg)] text-[var(--color-text-main)]"
              >
                <Trophy size={20} className="text-[var(--color-blue)]" />
                Leaderboard
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 text-[18px] font-black uppercase no-underline tracking-wide p-4 rounded-2xl bg-[var(--color-page-bg)] text-[var(--color-text-main)]"
              >
                <UserRound size={20} className="text-[var(--color-blue)]" />
                My Profile
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 text-[18px] font-black uppercase no-underline tracking-wide p-4 rounded-2xl bg-[var(--color-page-bg)] text-[var(--color-text-main)] border-2 border-dashed border-[var(--color-blue)]"
                >
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 text-[18px] font-black uppercase no-underline tracking-wide p-4 rounded-2xl bg-red-50 text-red-600 border-2 border-dashed border-red-200 mt-4"
              >
                <LogOut size={20} />
                Log Out
              </button>
            </nav>
          </div>
        )}

        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>

          {user ? (
            <>
              {isAdmin ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" asChild className="hidden md:flex h-9 px-3 text-[12px] font-black uppercase tracking-wider">
                      <Link href="/admin">Admin</Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Admin Panel</TooltipContent>
                </Tooltip>
              ) : null}

              <Link
                href="/dashboard/profile"
                className="hidden md:flex min-w-0 items-center gap-2 rounded-xl px-2 py-1 no-underline transition-colors hover:bg-[var(--color-page-bg)]"
                aria-label="Profile"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-gradient-to-br from-[var(--color-green)] to-[var(--color-blue)] text-white">
                    <UserRound size={17} />
                  </AvatarFallback>
                </Avatar>
              </Link>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    aria-label="Sign out"
                    className="hidden md:flex"
                  >
                    <LogOut size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Log Out</TooltipContent>
              </Tooltip>
            </>
          ) : (
            <Button variant="game" size="sm" onClick={onLoginClick}>
              Sign In
            </Button>
          )}
        </div>
      </header>
    </TooltipProvider>
  );
}
