'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Compass, Mail, Lock, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = '/';
      } else {
        setErrorMsg(data.error || 'Invalid email or password');
      }
    } catch {
      setErrorMsg('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 text-hub-charcoal">
      <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-[#27322B] border border-hub-border shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-hub-terracotta to-hub-marigold flex items-center justify-center text-white font-bold mx-auto shadow-md">
            <Compass className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-display font-bold text-hub-charcoal">Welcome Back</h1>
          <p className="text-xs text-hub-sage">Log in to access your hometown communities & memories</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-hub-charcoal mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-hub-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-hub-charcoal mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-hub-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
              />
            </div>
          </div>

          {errorMsg && <p className="text-xs text-hub-terracotta font-medium">{errorMsg}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Signing In...' : 'Log In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-hub-border text-center text-xs text-hub-sage">
          <span>Don't have an account yet? </span>
          <Link href="/register" className="font-bold text-hub-terracotta hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
