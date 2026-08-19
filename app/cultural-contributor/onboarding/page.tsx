'use client';

import React, { useState } from 'react';
import { Sparkles, ShieldCheck, BookOpen, Award, CheckCircle } from 'lucide-react';

export default function PanditOnboardingPage() {
  const [name, setName] = useState('');
  const [hometown, setHometown] = useState('');
  const [expertise, setExpertise] = useState('');
  const [languages, setLanguages] = useState('');
  const [traditions, setTraditions] = useState('');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !hometown || !expertise || !bio) {
      setErrorMessage('Please fill out all required fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/pandit/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          hometown,
          expertise,
          languages: languages.split(',').map((s) => s.trim()),
          traditions: traditions.split(',').map((s) => s.trim()),
          bio,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Application submitted successfully! Our platform curators will review your credentials.');
      } else {
        setErrorMessage(data.error || 'Submission failed');
      }
    } catch {
      setErrorMessage('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8 text-hub-charcoal">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hub-terracotta/10 text-hub-terracotta text-xs font-mono font-bold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Pandit & Cultural Scholar Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-hub-charcoal">
          PANDIT & CULTURAL SCHOLAR PORTAL
        </h1>
        <p className="text-sm text-hub-sage max-w-xl mx-auto">
          Dedicated archival space for traditional scholars, local historians, and elders preserving the sacred heritage of our hometowns.
        </p>
      </div>

      <div className="p-8 rounded-3xl bg-white border border-hub-border shadow-sm space-y-6">
        {successMessage ? (
          <div className="p-6 rounded-2xl bg-hub-green/10 border border-hub-green/30 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-hub-green mx-auto" />
            <h3 className="text-lg font-display font-semibold text-hub-charcoal">Application Received</h3>
            <p className="text-xs text-hub-sage">{successMessage}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-hub-charcoal mb-1">Full Scholar Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pandit Devrat Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>

              <div>
                <label className="block font-semibold text-hub-charcoal mb-1">Hometown / Primary Region *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Panipat, Haryana"
                  value={hometown}
                  onChange={(e) => setHometown(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-hub-charcoal mb-1">Primary Expertise & Scholarship *</label>
              <input
                type="text"
                required
                placeholder="e.g. Vedic Rituals, Haryanvi Folk Lore, GT Road History"
                value={expertise}
                onChange={(e) => setExpertise(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-hub-charcoal mb-1">Languages Spoken (comma separated)</label>
                <input
                  type="text"
                  placeholder="Hindi, Haryanvi, Sanskrit, English"
                  value={languages}
                  onChange={(e) => setLanguages(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
                />
              </div>
              <div>
                <label className="block font-semibold text-hub-charcoal mb-1">Specific Traditions / Customs (comma separated)</label>
                <input
                  type="text"
                  placeholder="Sanatan Traditions, Textile History, Basant Panchami"
                  value={traditions}
                  onChange={(e) => setTraditions(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-hub-charcoal mb-1">Scholar Bio & Research Background *</label>
              <textarea
                required
                rows={4}
                placeholder="Describe your research, family tradition, or archival contributions..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
              />
            </div>

            {errorMessage && <p className="text-xs text-hub-terracotta font-medium">{errorMessage}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs shadow-md transition-all"
            >
              {isSubmitting ? 'Submitting Application...' : 'Submit Pandit Application for Verification'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
