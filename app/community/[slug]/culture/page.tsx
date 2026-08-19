'use client';

import React, { useState, useEffect } from 'react';
import { useLocationContext } from '@/lib/LocationContext';
import { Sparkles, BookOpen, ShieldCheck, MapPin, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CultureHubPage({ params }: { params: { slug: string } }) {
  const { setLocationBySlug } = useLocationContext();
  const { slug } = params;

  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Article Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('TRADITIONS');
  const [newSummary, setNewSummary] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setLocationBySlug(slug, 'SEARCH');
    fetch(`/api/culture?communitySlug=${slug}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.articles) setArticles(data.articles);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCreateArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSummary || !newContent) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/culture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communitySlug: slug,
          title: newTitle,
          category: newCategory,
          summary: newSummary,
          content: newContent,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setArticles([data.article, ...articles]);
        setIsFormOpen(false);
        setNewTitle('');
        setNewSummary('');
        setNewContent('');
        alert('Cultural heritage article published!');
      } else {
        alert(data.error || 'Failed to publish article');
      }
    } catch {
      alert('Publication error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeCity = slug.charAt(0).toUpperCase() + slug.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-hub-charcoal">
      <Link href={`/community/${slug}`} className="inline-flex items-center gap-1 text-xs text-hub-sage hover:text-hub-charcoal">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {activeCity} Community</span>
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hub-border pb-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hub-terracotta/10 text-hub-terracotta text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Verified Cultural Archive</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-hub-charcoal">
            {activeCity.toUpperCase()} HERITAGE ARCHIVE
          </h1>
          <p className="text-xs sm:text-sm text-hub-sage max-w-xl">
            Oral folklore, traditional crafts, festival lore, and historical manuscripts documented by verified Pandits & Cultural Scholars.
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Publish Heritage Article</span>
        </button>
      </div>

      {/* ARTICLES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article: any) => (
          <div key={article.id} className="p-6 rounded-3xl bg-white border border-hub-border shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-hub-cream border border-hub-border text-hub-terracotta text-[10px] font-mono font-bold">
                  {article.category}
                </span>
                {article.isVerified && (
                  <span className="flex items-center gap-1 text-[10px] text-hub-green font-bold" title="Verified by Pandit Scholar">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Scholar
                  </span>
                )}
              </div>

              <h3 className="font-display font-semibold text-lg text-hub-charcoal leading-snug">{article.title}</h3>
              <p className="text-xs text-hub-sage leading-relaxed line-clamp-3">{article.summary}</p>
            </div>

            <div className="pt-3 border-t border-hub-border flex items-center justify-between text-xs text-hub-sage">
              <span>By {article.author?.name || 'Pandit Devrat Sharma'}</span>
              <span className="text-[11px] font-mono text-hub-terracotta font-semibold">Read Lore →</span>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ARTICLE MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-hub-border rounded-3xl max-w-lg w-full p-6 space-y-4 text-hub-charcoal shadow-2xl">
            <div className="flex items-center justify-between border-b border-hub-border pb-3">
              <h3 className="font-display font-semibold text-lg">Publish Cultural Lore</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-hub-sage hover:text-hub-charcoal">✕</button>
            </div>

            <form onSubmit={handleCreateArticle} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Article Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basant Panchami Folk Songs of Haryana"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
                >
                  <option value="TRADITIONS">TRADITIONS</option>
                  <option value="FESTIVALS">FESTIVALS</option>
                  <option value="FOOD">FOOD & RECITES</option>
                  <option value="STORIES">ORAL HISTORIES</option>
                  <option value="FOLK_ART">FOLK ART & CRAFTS</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Short Summary</label>
                <input
                  type="text"
                  required
                  placeholder="Brief 1-line overview of this tradition..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Full Article / Manuscript Content</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Record the oral lore, historical facts, or manuscript details..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-hub-terracotta text-white font-bold text-xs shadow-md"
              >
                {isSubmitting ? 'Publishing Article...' : 'Publish to Cultural Archive'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
