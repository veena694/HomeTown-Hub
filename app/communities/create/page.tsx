'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MapPin, Sparkles, ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function CreateCommunityPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState(['Be respectful & welcoming', 'Preserve authentic memories']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthRequired, setIsAuthRequired] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !state || !description) {
      setErrorMsg('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setIsAuthRequired(false);

    try {
      const res = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, city, district, state, description, rules }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || 'Community submitted for review!');
        router.push('/communities');
      } else {
        setErrorMsg(data.error || 'Authentication required to create a community.');
        if (res.status === 401 || (data.error && data.error.toLowerCase().includes('auth'))) {
          setIsAuthRequired(true);
        }
      }
    } catch {
      setErrorMsg('Network error while submitting community');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-hub-charcoal">
      <Link href="/communities" className="inline-flex items-center gap-1.5 text-xs text-hub-sage hover:text-hub-charcoal">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Communities Directory</span>
      </Link>

      <div className="p-8 rounded-3xl bg-white dark:bg-[#27322B] border border-hub-border shadow-sm space-y-6">
        <div className="border-b border-hub-border pb-4 space-y-1">
          <div className="flex items-center gap-2 text-hub-terracotta font-mono font-bold text-xs">
            <Sparkles className="w-4 h-4" />
            <span>New Hometown Hub Proposal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-hub-charcoal">
            Create a Hometown Community
          </h1>
          <p className="text-xs text-hub-sage">
            Propose a new digital community hub for your city, town, or village.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-hub-charcoal mb-1">Community Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Varanasi Ghats & Heritage Collective"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-hub-charcoal mb-1">City / Town *</label>
              <input
                type="text"
                required
                placeholder="e.g. Varanasi"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
              />
            </div>
            <div>
              <label className="block font-semibold text-hub-charcoal mb-1">District</label>
              <input
                type="text"
                placeholder="e.g. Varanasi District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
              />
            </div>
            <div>
              <label className="block font-semibold text-hub-charcoal mb-1">State / Region *</label>
              <input
                type="text"
                required
                placeholder="e.g. Uttar Pradesh"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-hub-charcoal mb-1">Description & Heritage Vision *</label>
            <textarea
              required
              rows={4}
              placeholder="Describe the culture, history, and community goals for this hometown hub..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
            />
          </div>

          {errorMsg && (
            <div className="p-4 rounded-2xl bg-hub-terracotta/10 border border-hub-terracotta/30 text-xs space-y-3">
              <p className="text-hub-terracotta font-semibold">{errorMsg}</p>
              {isAuthRequired && (
                <div className="flex flex-wrap gap-2 pt-1">
                  <Link
                    href="/login"
                    className="px-4 py-2 rounded-xl bg-hub-terracotta text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Log In to Your Account</span>
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl bg-hub-stone text-hub-charcoal font-bold text-xs border border-hub-border flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create a New Account</span>
                  </Link>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs shadow-md transition-all"
          >
            {isSubmitting ? 'Submitting Proposal...' : 'Submit Community for Review'}
          </button>
        </form>
      </div>
    </div>
  );
}
