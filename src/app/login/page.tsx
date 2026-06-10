"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Radar, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [useMagicLink, setUseMagicLink] = useState(false);

  async function handleGoogleSignIn() {
    setIsLoading(true);
    setError("");
    const result = await signIn("google", { callbackUrl: "/dashboard", redirect: false });
    if (result?.error) {
      setError("Google sign in failed. Ensure you have configured Google Client ID in your .env file.");
      setIsLoading(false);
    }
  }

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError("");

    if (useMagicLink) {
      const result = await signIn("email", {
        email: email.trim(),
        redirect: false,
        callbackUrl: "/dashboard",
      });

      setIsLoading(false);

      if (result?.error) {
        setError("Failed to send magic link. Please try again.");
        return;
      }

      setEmailSent(true);
    } else {
      if (!password) {
        setError("Password is required.");
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else {
        // Successful login via credentials will redirect via window.location by NextAuth,
        // but since redirect is false, we manually redirect.
        window.location.href = "/dashboard";
      }
    }
  }

  return (
    <div className="dot-grid-bg flex min-h-screen items-center justify-center p-6">
      <div className="glass-card w-full max-w-md p-8">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#0a0a0a]">
            <Radar className="size-5 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-[#0a0a0a]">
            PulseTrack
          </span>
        </div>

        <h1 className="text-2xl font-semibold text-[#0a0a0a]">Welcome back</h1>
        <p className="mt-1.5 text-sm text-[#6b7280]">
          Monitor competitors and never miss a move.
        </p>

        <div className="mt-8 space-y-4">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full border-black/10 bg-white/80 text-[#0a0a0a] hover:bg-black/5"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <GoogleIcon />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/8" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/90 px-2 text-[#9ca3af]">or</span>
            </div>
          </div>

          {emailSent ? (
            <div className="rounded-lg border border-black/8 bg-white/60 p-4 text-center">
              <p className="text-sm font-medium text-[#0a0a0a]">
                Check your inbox
              </p>
              <p className="mt-1 text-sm text-[#6b7280]">
                We sent a magic link to <strong>{email}</strong>
              </p>
              <p className="mt-2 text-xs text-[#9ca3af]">
                (If running locally without RESEND_API_KEY, check your terminal for the link)
              </p>
            </div>
          ) : (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[#0a0a0a]">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 border-black/10 bg-white/80"
                  required
                />
              </div>

              {!useMagicLink && (
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-[#0a0a0a]">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-black/10 bg-white/80"
                    required={!useMagicLink}
                  />
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="h-11 w-full bg-[#0a0a0a] text-white hover:bg-[#0a0a0a]/90"
                disabled={isLoading}
              >
                {isLoading 
                  ? (useMagicLink ? "Sending..." : "Signing in...") 
                  : (useMagicLink ? "Send magic link" : "Sign in with Email")}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setUseMagicLink(!useMagicLink);
                    setError("");
                  }}
                  className="text-sm text-[#6b7280] hover:text-[#0a0a0a] transition-colors"
                >
                  {useMagicLink 
                    ? "Prefer to sign in with a password?" 
                    : "Forgot password? Sign in with Magic Link"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
