"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearStoredUser, getStoredUser } from "@/lib/session";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/components/ui/tooltip";
import { Button } from "@/app/components/ui/button";

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
  const user = typeof window !== "undefined" ? getStoredUser() : null;

  function handleLogout() {
    clearStoredUser();
    router.replace("/login");
  }

  return (
    <TooltipProvider>
      <header className="flex items-center justify-between border-b-2 border-[var(--color-border)] pb-4 mb-4">
        <div className="flex items-center gap-8">
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/dashboard">
                <div className="bg-gradient-to-br from-[var(--color-green)] to-[var(--color-blue)] border-2 border-white border-b-[5px] border-b-[var(--color-blue-dark)] rounded-full text-white font-black h-[52px] w-[52px] flex items-center justify-center text-[26px] transition-all duration-100 active:border-b-0 active:translate-y-[5px]">
                  B
                </div>
              </Link>
            </TooltipTrigger>
            <TooltipContent>Brief to Brilliant Home</TooltipContent>
          </Tooltip>

          <nav className="flex gap-6 max-sm:hidden">
            <Link
              href="/quests"
              className="text-[var(--color-text-muted)] text-[15px] font-black uppercase no-underline tracking-wide px-3 py-2 rounded-xl transition-colors hover:text-[var(--color-blue)] hover:bg-[var(--color-page-bg)]"
            >
              Quests
            </Link>
            <Link
              href="/leaderboard"
              className="text-[var(--color-text-muted)] text-[15px] font-black uppercase no-underline tracking-wide px-3 py-2 rounded-xl transition-colors hover:text-[var(--color-blue)] hover:bg-[var(--color-page-bg)]"
            >
              Leaderboard
            </Link>
          </nav>
          {slot ? <div className="ml-2">{slot}</div> : null}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isAdmin ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" asChild className="h-9 px-3 text-[12px] font-black uppercase tracking-wider">
                      <Link href="/admin">Admin</Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Admin Panel</TooltipContent>
                </Tooltip>
              ) : null}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" asChild>
                    <Link href="/profile" aria-label="Profile">
                      <UserRound size={18} />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>View Profile</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    aria-label="Sign out"
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
