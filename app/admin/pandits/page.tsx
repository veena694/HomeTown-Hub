'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';

export default function AdminPanditsPage() {
  const [pandits] = useState([
    {
      id: 'pan-1',
      name: 'Pandit Devrat Sharma',
      hometown: 'Panipat',
      expertise: 'GT Road History & Haryanvi Folk Lore',
      languages: 'Hindi, Haryanvi, Sanskrit',
      status: 'VERIFIED',
    },
    {
      id: 'pan-2',
      name: 'Dr. Anita Shastri',
      hometown: 'Jaipur',
      expertise: 'Rajasthani Archway Architecture & Royal Manuscripts',
      languages: 'Hindi, Rajasthani, English',
      status: 'PENDING',
    },
  ]);

  const handleVerify = (id: string) => {
    alert(`Pandit application #${id} verified! Pandit badge assigned in database.`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/admin" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Admin Dashboard</span>
      </Link>

      <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-900 border border-white/10">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Pandit & Cultural Contributor Verifications</h1>
          <p className="text-xs text-slate-400">Review heritage research applications</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {pandits.map((p) => (
          <div key={p.id} className="p-6 rounded-3xl bg-slate-900 border border-white/10 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-bold">
                {p.status}
              </span>
              <span className="text-xs text-slate-400 font-mono">Hometown: {p.hometown}</span>
            </div>
            <h3 className="text-lg font-semibold text-white">{p.name}</h3>
            <p className="text-xs text-slate-300">Expertise: {p.expertise}</p>
            <p className="text-xs text-slate-400">Languages: {p.languages}</p>
            <button
              onClick={() => handleVerify(p.id)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg"
            >
              Verify Pandit Badge
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
