"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { auth } from "@/lib/firebase";
import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink 
} from "firebase/auth";
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
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // 1. Check if the user is already logged in (local session)
    if (getStoredUser()) {
      router.replace("/dashboard");
      return;
    }

    // 2. Check if this is a sign-in link
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem("emailForSignIn");
      
      if (!emailForSignIn) {
        emailForSignIn = window.prompt("Please provide your email for confirmation");
      }

      if (emailForSignIn) {
        setIsLoading(true);
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .then((result) => {
            window.localStorage.removeItem("emailForSignIn");
            if (result.user.email) {
              saveStoredUser(createSessionUser(result.user.email));
              router.replace("/dashboard");
            }
          })
          .catch((error) => {
            console.error("Error signing in with email link", error);
            setLoginError("The link is invalid or has expired.");
            setIsLoading(false);
          });
      }
    }
  }, [router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoginError("");

    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      setLoginError("Please enter your work email.");
      return;
    }

    if (!isAllowedEmail(normalizedEmail)) {
      setLoginError(`Use one of these work emails to play: ${allowedEmailDomainsLabel}.`);
      return;
    }

    setIsLoading(true);

    const actionCodeSettings = {
      // URL you want to redirect back to. 
      url: window.location.origin + "/login",
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", normalizedEmail);
      setIsSent(true);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error sending sign-in link", error);
      setLoginError(error.message || "Failed to send login link. Please try again.");
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-blue)]"></div>
        <p className="mt-4 font-bold text-[var(--color-text-main)]">Authenticating...</p>
      </div>
    );
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
          {isSent ? (
            <div className="flex flex-col gap-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-black text-[var(--color-text-main)] uppercase tracking-tight">Check your email!</h2>
              <p className="text-[var(--color-text-description)] font-medium">
                We've sent a magic login link to <span className="text-[var(--color-text-main)] font-bold">{email}</span>.
              </p>
              <Button 
                variant="outline" 
                onClick={() => setIsSent(false)}
                className="mt-4 font-bold"
              >
                Try a different email
              </Button>
            </div>
          ) : (
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

              <Button variant="game" size="xl" type="submit" className="w-full h-16 text-xl" disabled={isLoading}>
                {isLoading ? "Sending..." : "Start challenge"}
              </Button>
              {loginError ? (
                <p className="text-red-500 text-sm font-bold text-center animate-bounce" role="alert">
                  {loginError}
                </p>
              ) : null}
              <p className="text-[11px] text-center text-[var(--color-text-muted)] font-bold uppercase tracking-wider">
                Passwordless login • No signup required
              </p>
            </form>
          )}
        </Card>
      </section>
    </div>
  );
}
