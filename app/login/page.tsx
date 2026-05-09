"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { createSessionUser, getStoredUser, saveStoredUser } from "@/lib/session";
import {
  allowedEmailDomain,
  allowedEmailDomainsLabel,
  isAllowedEmail,
  normalizeEmail,
} from "@/lib/users";

import { Card } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    if (getStoredUser()) {
      router.replace("/dashboard");
    }
  }, [router]);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setLoginError("Please enter your work email.");
      return;
    }

    if (!isAllowedEmail(normalizedEmail)) {
      setLoginError(`Use one of these work emails to play: ${allowedEmailDomainsLabel}.`);
      return;
    }

    saveStoredUser(createSessionUser(normalizedEmail));
    setLoginError("");
    router.replace("/dashboard");
  }

  return (
    <div className="flex flex-col flex-1 justify-center">
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full" aria-labelledby="login-title">
        {/* Left Column: Hero */}
        <div className="flex flex-col gap-6">
          <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-br from-[var(--color-green)] to-[var(--color-blue)] flex items-center justify-center text-[40px] font-black text-white border-4 border-white shadow-[0_6px_0_var(--color-border)]" aria-hidden="true">
            <span>B</span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">BBDO WA Game</p>
            <h1 className="text-[56px] font-black leading-[0.95] tracking-tighter text-[var(--color-text-main)]" id="login-title">
              Brief to<br />Brilliant
            </h1>
            <p className="text-[var(--color-text-description)] text-xl mt-4 max-w-[320px] leading-relaxed">
              Beat creative quests, save tokens, and climb the league.
            </p>
          </div>
        </div>

        {/* Right Column: Form */}
        <Card className="p-10 shadow-xl border-b-[8px]">
          <form className="flex flex-col gap-6" onSubmit={handleLogin}>
            <div className="flex flex-col gap-3">
              <label htmlFor="login-email" className="text-[13px] font-black text-[var(--color-text-main)] uppercase tracking-wide">Work email</label>
              <Input
                autoComplete="email"
                id="login-email"
                className="h-14 bg-[#f8fcff] border-2 border-[var(--color-border)] rounded-xl font-bold px-4 text-lg focus:ring-[var(--color-blue)] transition-all"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setLoginError("");
                }}
                placeholder={`you@${allowedEmailDomain}`}
                type="email"
                value={email}
              />
            </div>

            <Button variant="game" size="xl" type="submit" className="w-full h-16 text-xl">
              Start challenge
            </Button>
            {loginError ? (
              <p className="text-red-500 text-sm font-bold text-center animate-pulse" role="alert">
                {loginError}
              </p>
            ) : null}
          </form>
        </Card>
      </section>
    </div>
  );
}
