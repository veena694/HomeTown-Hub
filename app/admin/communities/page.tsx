'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DEMO_COMMUNITIES } from '@/lib/mockData';
import { Shield, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState(DEMO_COMMUNITIES);

  const handleStatusChange = (id: string, newStatus: string) => {
    alert(`Community ${id} status updated to ${newStatus} in database.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/admin" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Dashboard</span>
      </Link>

      <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900 border border-white/10">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Community Approvals & Governance</h1>
          <p className="text-xs text-slate-400">Review pending hometown community submissions</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-800/80 text-amber-400 font-mono uppercase">
            <tr>
              <th className="p-4">Community Name</th>
              <th className="p-4">Location</th>
              <th className="p-4">Members</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Governance Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {communities.map((comm) => (
              <tr key={comm.id} className="hover:bg-white/5">
                <td className="p-4 font-semibold text-white">{comm.name}</td>
                <td className="p-4">{comm.city}, {comm.state}</td>
                <td className="p-4 font-mono">{comm.memberCount}</td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                    APPROVED
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => handleStatusChange(comm.id, 'APPROVED')}
                    className="px-3 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-[10px]"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(comm.id, 'REJECTED')}
                    className="px-3 py-1 rounded-lg bg-red-500/20 text-red-300 font-semibold text-[10px]"
                  >
                    Suspend
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
