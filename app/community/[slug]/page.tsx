'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLocationContext } from '@/lib/LocationContext';
import { MapPin, Users, Heart, MessageSquare, Plus, Sparkles, ShieldCheck, Share2, Pin, Image as ImageIcon } from 'lucide-react';

export default function CommunitySinglePage({ params }: { params: { slug: string } }) {
  const { setLocationBySlug } = useLocationContext();
  const { slug } = params;

  const [community, setCommunity] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Post Form State
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState('POST');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // New Comment Form State per post
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    setLocationBySlug(slug, 'SEARCH');

    Promise.all([
      fetch(`/api/communities`).then((r) => r.json()),
      fetch(`/api/posts?communitySlug=${slug}`).then((r) => r.json()),
    ])
      .then(([commData, postsData]) => {
        const found = commData.communities?.find((c: any) => c.slug === slug);
        if (found) setCommunity(found);
        if (postsData.posts) setPosts(postsData.posts);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  const handleJoinToggle = async () => {
    try {
      const res = await fetch(`/api/communities/${slug}/join`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsMember(data.isMember);
        alert(data.message);
      }
    } catch {
      alert('Join operation failed');
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newContent) return;

    setIsPosting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          communitySlug: slug,
          title: newTitle,
          content: newContent,
          type: newType,
          imageUrl: newImageUrl,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPosts([data.post, ...posts]);
        setNewTitle('');
        setNewContent('');
        setNewImageUrl('');
        alert('Post published!');
      } else {
        alert(data.error || 'Posting failed');
      }
    } catch {
      alert('Posting failed');
    } finally {
      setIsPosting(false);
    }
  };

  const handleAddComment = async (postId: string) => {
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(
          posts.map((p) => (p.id === postId ? { ...p, comments: [...(p.comments || []), data.comment] } : p))
        );
        setCommentInputs({ ...commentInputs, [postId]: '' });
      } else {
        alert(data.error || 'Failed to submit comment');
      }
    } catch {
      alert('Comment submission failed');
    }
  };

  const handleToggleReaction = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}/react`, { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(
          posts.map((p) => {
            if (p.id === postId) {
              const currentCount = p.reactionsCount || p.reactions?.length || 0;
              return { ...p, reactionsCount: data.reacted ? currentCount + 1 : Math.max(0, currentCount - 1) };
            }
            return p;
          })
        );
      }
    } catch {
      alert('Reaction failed');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-hub-sage">
        <Sparkles className="w-6 h-6 text-hub-terracotta mx-auto animate-spin" />
        <p className="mt-2 text-xs font-mono">Loading community hub...</p>
      </div>
    );
  }

  const commName = community?.name || `${slug.toUpperCase()} COMMUNITY`;
  const cityName = community?.city || slug.toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-hub-charcoal">
      {/* COMMUNITY COVER & HEADER */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-hub-cream via-white to-hub-stone border border-hub-border shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-hub-terracotta/10 text-hub-terracotta">
                <MapPin className="w-5 h-5" />
              </span>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-hub-charcoal">{commName}</h1>
              {community?.isVerified && (
                <span title="Verified Community">
                  <ShieldCheck className="w-5 h-5 text-hub-green" />
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-hub-sage max-w-2xl leading-relaxed">
              {community?.description || `Official community hub for residents, alumni, and diaspora members of ${cityName}.`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleJoinToggle}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                isMember
                  ? 'bg-hub-stone border border-hub-border text-hub-charcoal'
                  : 'bg-hub-terracotta hover:bg-hub-terracottaDark text-white'
              }`}
            >
              {isMember ? 'Joined Member ✓' : 'Join Hometown Hub'}
            </button>
            <Link
              href={`/community/${slug}/memory-map`}
              className="px-4 py-2.5 rounded-xl bg-hub-cream border border-hub-border text-hub-charcoal text-xs font-semibold hover:bg-hub-stone"
            >
              Scrapbook Map
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAIN FEED COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          {/* CREATE POST FORM */}
          <div className="p-5 rounded-3xl bg-white border border-hub-border shadow-xs space-y-3">
            <h3 className="font-display font-semibold text-base text-hub-charcoal flex items-center gap-2">
              <Plus className="w-4 h-4 text-hub-terracotta" />
              Share a Story or Announcement in {cityName}
            </h3>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Post title or headline..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-hub-charcoal text-sm focus:outline-none focus:border-hub-terracotta"
              />
              <textarea
                required
                rows={3}
                placeholder="What's happening in your hometown? Share news, memory requests, or questions..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
                >
                  <option value="POST">General Discussion</option>
                  <option value="ANNOUNCEMENT">Official Announcement</option>
                  <option value="DISCUSSION">Oral History Request</option>
                </select>

                <button
                  type="submit"
                  disabled={isPosting}
                  className="px-5 py-2 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs shadow-xs"
                >
                  {isPosting ? 'Publishing...' : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>

          {/* POSTS LIST */}
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="p-6 rounded-3xl bg-white border border-hub-border shadow-xs space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author?.profile?.avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                      alt={post.author?.name}
                      className="w-10 h-10 rounded-full object-cover border border-hub-border"
                    />
                    <div>
                      <h4 className="font-display font-semibold text-base text-hub-charcoal">{post.title}</h4>
                      <p className="text-[11px] text-hub-sage">
                        By <span className="font-semibold text-hub-charcoal">{post.author?.name}</span> • {new Date(post.createdAt || Date.now()).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {post.isPinned && (
                    <span className="p-1.5 rounded-xl bg-hub-terracotta/10 text-hub-terracotta" title="Pinned Announcement">
                      <Pin className="w-4 h-4" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-hub-charcoal leading-relaxed whitespace-pre-line">{post.content}</p>

                {/* POST REACTIONS & COMMENTS ACTION BAR */}
                <div className="pt-3 border-t border-hub-border flex items-center justify-between text-xs text-hub-sage">
                  <button
                    onClick={() => handleToggleReaction(post.id)}
                    className="flex items-center gap-1.5 text-hub-terracotta font-semibold hover:opacity-80"
                  >
                    <Heart className="w-4 h-4 fill-hub-terracotta" />
                    <span>{post.reactionsCount || post.reactions?.length || 0} Likes</span>
                  </button>

                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-hub-sage" />
                    <span>{post.comments?.length || 0} Comments</span>
                  </span>
                </div>

                {/* COMMENTS LIST */}
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-hub-border">
                    {post.comments.map((c: any) => (
                      <div key={c.id} className="p-3 rounded-2xl bg-hub-cream border border-hub-border text-xs space-y-1">
                        <span className="font-bold text-hub-charcoal">{c.author?.name || 'Member'}: </span>
                        <span className="text-hub-sage">{c.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* ADD COMMENT FORM */}
                <div className="flex gap-2 text-xs pt-2">
                  <input
                    type="text"
                    placeholder="Write a reply..."
                    value={commentInputs[post.id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                    className="flex-1 px-3.5 py-1.5 rounded-xl bg-hub-stone border border-hub-border text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                  />
                  <button
                    onClick={() => handleAddComment(post.id)}
                    className="px-3.5 py-1.5 rounded-xl bg-hub-terracotta text-white font-semibold text-xs"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-white border border-hub-border shadow-xs space-y-4">
            <h3 className="font-display font-semibold text-lg text-hub-charcoal">Community Guidelines</h3>
            <ul className="space-y-2 text-xs text-hub-sage">
              <li className="flex items-start gap-2">
                <span className="font-bold text-hub-terracotta">1.</span>
                <span>Treat fellow hometown members with dignity & respect.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-hub-terracotta">2.</span>
                <span>Preserve true oral histories, archival photos & heritage lore.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
