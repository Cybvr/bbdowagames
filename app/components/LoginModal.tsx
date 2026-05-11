"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "firebase/auth";
import { fetchUserProfile } from "@/lib/firestore-service";
import { saveStoredUser } from "@/lib/session";
import { normalizeEmail, isAllowedEmail } from "@/lib/users";
import { Eye, EyeOff } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const normalizedEmail = normalizeEmail(email);

    if (isRegistering && password.length < 6) {
      setError("Use at least 6 characters for your password.");
      setIsLoading(false);
      return;
    }

    try {
      let userCredential;
      if (isRegistering) {
        userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      }

      const user = userCredential.user;
      if (user.email) {
        const profile = await fetchUserProfile(user.email);
        const sessionUser = {
          name: profile?.name || user.email.split("@")[0],
          email: user.email,
          isAdmin: profile?.role === "admin"
        };
        saveStoredUser(sessionUser);
        onSuccess();
        onClose();
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email already registered. Try logging in.");
      } else if (err.code === "auth/weak-password") {
        setError("Use at least 6 characters for your password.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!email) {
      setError("Enter your email first.");
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, normalizeEmail(email));
      setResetSent(true);
      setError("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-[400px] p-8 relative shadow-2xl border-b-[8px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-[var(--color-text-main)] font-black text-xl"
        >
          ✕
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center overflow-hidden  mx-auto mb-4">
            <img src="/logo.png" alt="WieldQuest Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-black text-[var(--color-text-main)] uppercase tracking-tight">
            {isRegistering ? "Create Account" : "Welcome Back"}
          </h2>
          <p className="text-[11px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest mt-1">
            {isRegistering ? "Join the challenge" : "Login to continue"}
          </p>
        </div>

        {resetSent ? (
          <div className="text-center py-4">
            <p className="text-green-600 font-bold mb-4">Reset link sent to your email!</p>
            <Button onClick={() => setResetSent(false)} variant="outline" className="w-full">Back to login</Button>
          </div>
        ) : (
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-[var(--color-text-main)] uppercase tracking-wide">Work Email</label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@bbdowestafrica.com"
                className="font-bold border-2"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-black text-[var(--color-text-main)] uppercase tracking-wide">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="font-bold border-2 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-blue)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)] focus-visible:ring-offset-2"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-[12px] font-bold text-center mt-2">{error}</p>
            )}

            <Button variant="game" size="xl" type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? "Wait..." : (isRegistering ? "Sign Up" : "Login")}
            </Button>

            <div className="flex flex-col gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-[11px] font-black text-[var(--color-blue)] uppercase tracking-widest hover:underline"
              >
                {isRegistering ? "Already have an account? Login" : "New here? Create account"}
              </button>
              {!isRegistering && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="text-[11px] font-black text-[var(--color-text-muted)] uppercase tracking-widest hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
