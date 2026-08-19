'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, MapPin, Sparkles, Check, X, ArrowRight, AlertCircle } from 'lucide-react';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [pendingCommunities, setPendingCommunities] = useState<any[]>([]);
  const [pendingPandits, setPendingPandits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized or network error');
        return res.json();
      })
      .then((data) => {
        if (data.metrics) setMetrics(data.metrics);
        if (data.recentUsers) setRecentUsers(data.recentUsers);
        if (data.pendingCommunities) setPendingCommunities(data.pendingCommunities);
        if (data.pendingPandits) setPendingPandits(data.pendingPandits);
      })
      .catch((err) => setErrorMsg(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleApproveCommunity = async (communityId: string) => {
    try {
      const res = await fetch('/api/admin/communities', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ communityId, action: 'APPROVE' }),
      });
      if (res.ok) {
        setPendingCommunities(pendingCommunities.filter((c) => c.id !== communityId));
        alert('Community approved!');
      }
    } catch {
      alert('Approval failed');
    }
  };

  const handleApprovePandit = async (panditId: string) => {
    try {
      const res = await fetch('/api/admin/pandits', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ panditId, action: 'APPROVE' }),
      });
      if (res.ok) {
        setPendingPandits(pendingPandits.filter((p) => p.id !== panditId));
        alert('Pandit verified!');
      }
    } catch {
      alert('Verification failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-hub-sage">
        <Sparkles className="w-6 h-6 text-hub-terracotta mx-auto animate-spin" />
        <p className="mt-2 text-xs font-mono">Loading platform administration analytics...</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-3xl bg-white border border-hub-border text-center space-y-3 text-hub-charcoal">
        <AlertCircle className="w-8 h-8 text-hub-terracotta mx-auto" />
        <h3 className="font-display font-semibold text-lg">Admin Access Protected</h3>
        <p className="text-xs text-hub-sage">Server-side RBAC restriction active. Log in with a PLATFORM_ADMIN account to manage the platform.</p>
        <Link href="/onboarding" className="inline-block px-4 py-2 rounded-xl bg-hub-terracotta text-white font-bold text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-hub-charcoal">
      <div className="flex items-center justify-between border-b border-hub-border pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hub-green/10 text-hub-green text-xs font-mono font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>Platform Governance Center</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-hub-charcoal">PLATFORM ADMIN DASHBOARD</h1>
        </div>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-hub-border shadow-xs">
          <div className="font-mono text-2xl font-bold text-hub-terracotta">{metrics?.totalUsers || 0}</div>
          <div className="text-xs text-hub-sage">Total Registered Users</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-hub-border shadow-xs">
          <div className="font-mono text-2xl font-bold text-hub-terracotta">{metrics?.activeCommunities || 0}</div>
          <div className="text-xs text-hub-sage">Active Communities</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-hub-border shadow-xs">
          <div className="font-mono text-2xl font-bold text-hub-terracotta">{metrics?.totalMemories || 0}</div>
          <div className="text-xs text-hub-sage">Preserved Memories</div>
        </div>
        <div className="p-5 rounded-3xl bg-white border border-hub-border shadow-xs">
          <div className="font-mono text-2xl font-bold text-hub-terracotta">{metrics?.pendingCommunities || 0}</div>
          <div className="text-xs text-hub-sage">Pending Proposals</div>
        </div>
      </div>

      {/* PENDING APPROVAL QUEUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PENDING COMMUNITIES QUEUE */}
        <div className="p-6 rounded-3xl bg-white border border-hub-border shadow-xs space-y-4">
          <h3 className="font-display font-semibold text-lg text-hub-charcoal">Pending Community Proposals</h3>
          {pendingCommunities.length === 0 ? (
            <p className="text-xs text-hub-sage italic">No pending community proposals.</p>
          ) : (
            <div className="space-y-3">
              {pendingCommunities.map((c) => (
                <div key={c.id} className="p-3.5 rounded-2xl bg-hub-cream border border-hub-border flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-hub-charcoal">{c.name}</div>
                    <div className="text-[11px] text-hub-sage">{c.city}, {c.state}</div>
                  </div>
                  <button
                    onClick={() => handleApproveCommunity(c.id)}
                    className="px-3 py-1.5 rounded-xl bg-hub-terracotta text-white font-semibold text-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* PENDING PANDITS QUEUE */}
        <div className="p-6 rounded-3xl bg-white border border-hub-border shadow-xs space-y-4">
          <h3 className="font-display font-semibold text-lg text-hub-charcoal">Pending Pandit Verification Applications</h3>
          {pendingPandits.length === 0 ? (
            <p className="text-xs text-hub-sage italic">No pending Pandit scholar applications.</p>
          ) : (
            <div className="space-y-3">
              {pendingPandits.map((p) => (
                <div key={p.id} className="p-3.5 rounded-2xl bg-hub-cream border border-hub-border flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-hub-charcoal">{p.name}</div>
                    <div className="text-[11px] text-hub-sage">{p.hometown} • {p.expertise}</div>
                  </div>
                  <button
                    onClick={() => handleApprovePandit(p.id)}
                    className="px-3 py-1.5 rounded-xl bg-hub-green text-white font-semibold text-xs flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Verify</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
