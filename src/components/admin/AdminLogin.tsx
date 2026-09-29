import React, { useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { BrandLogo } from "@/components/BrandLogo";
import { Lock, Mail, ArrowLeft, Loader2, AlertCircle, ShieldCheck } from "lucide-react";

interface AdminLoginProps {
  onLoginSuccess: (email: string) => void;
  onBackToPublic: () => void;
}

export function AdminLogin({ onLoginSuccess, onBackToPublic }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!configured) {
      setErrorMsg(
        "Supabase credentials are not configured yet. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file."
      );
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data?.user) {
        onLoginSuccess(data.user.email || email.trim());
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Authentication error occurred";
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center px-4 pt-20 sm:pt-24 pb-12">
      {/* Back button */}
      <button
        type="button"
        onClick={onBackToPublic}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-zinc-900/60 px-4 py-1.5 text-xs font-medium text-zinc-400 backdrop-blur-md transition hover:border-white/20 hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Public Library</span>
      </button>

      <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-zinc-950 text-white shadow-inner">
            <Lock className="h-5 w-5 text-zinc-300" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Owner Portal</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Sign in with your admin credentials to curate and manage Creafolio.
          </p>
        </div>

        {!configured && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-300">Supabase Not Connected</span>
              <p className="text-[11px] leading-relaxed text-amber-200/90">
                Provide <code className="font-mono text-white">VITE_SUPABASE_URL</code> &{" "}
                <code className="font-mono text-white">VITE_SUPABASE_ANON_KEY</code> in{" "}
                <code className="font-mono text-white">.env</code> to connect authentication.
              </p>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-300">
              Admin Email
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 transition focus-within:border-white/30">
              <Mail className="h-4 w-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@creafolio.com"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-300">
              Password
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 transition focus-within:border-white/30">
              <Lock className="h-4 w-4 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-xs font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
            <span>Sign In to Dashboard</span>
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center">
          <p className="text-[11px] text-zinc-500">
            Protected by Supabase Row Level Security.
            <br />
            Public accounts and registrations are disabled.
          </p>
        </div>
      </div>
    </main>
  );
}
