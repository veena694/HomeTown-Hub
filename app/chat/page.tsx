'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Image as ImageIcon, Search, User, Sparkles, MapPin, Plus, ArrowLeft, Shield, Paperclip, Share2, Compass, Bookmark, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

export default function ChatPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [textInput, setTextInput] = useState('');
  const [typingUser, setTypingUser] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // User search modal state
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load current user & conversations
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});

    fetch('/api/chat/conversations')
      .then((res) => res.json())
      .then((data) => {
        if (data.conversations) setConversations(data.conversations);
      })
      .catch(() => {});
  }, []);

  // Supabase Realtime Channel & Polling Fallback
  useEffect(() => {
    if (!activeConvId) return;

    // 1. Fetch initial message history
    fetch(`/api/chat/messages?conversationId=${activeConvId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages) setMessages(data.messages);
      })
      .catch(() => {});

    // 2. Subscribe to Supabase Realtime Channel for instant messaging & typing events
    const channel = supabase.channel(`conversation:${activeConvId}`);

    channel
      .on('broadcast', { event: 'new_message' }, ({ payload }) => {
        if (payload?.message) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === payload.message.id)) return prev;
            return [...prev, payload.message];
          });
        }
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload?.userId !== currentUser?.id) {
          setTypingUser(payload?.isTyping ? payload?.userName : null);
        }
      })
      .subscribe();

    // 3. Keep HTTP polling every 5s as fallback
    const interval = setInterval(() => {
      fetch(`/api/chat/messages?conversationId=${activeConvId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.messages) setMessages(data.messages);
        })
        .catch(() => {});
    }, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [activeConvId, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  // Handle Typing Broadcast Ephemeral Events
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInput(e.target.value);
    if (!activeConvId || !currentUser) return;

    const channel = supabase.channel(`conversation:${activeConvId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: currentUser.id, userName: currentUser.name, isTyping: true },
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUser.id, userName: currentUser.name, isTyping: false },
      });
    }, 2000);
  };

  // Image Upload Handling
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || (!textInput.trim() && !selectedImage)) return;

    let mediaUrl: string | undefined = undefined;
    setIsUploading(true);

    try {
      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok && uploadData.url) {
          mediaUrl = uploadData.url;
        }
      }

      const content = textInput.trim();
      setTextInput('');
      setSelectedImage(null);
      setImagePreview(null);

      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeConvId, content, mediaUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMessages((prev) => [...prev, data.message]);

        // Broadcast over Supabase Realtime for instant recipient delivery (< 50ms)
        const channel = supabase.channel(`conversation:${activeConvId}`);
        channel.send({
          type: 'broadcast',
          event: 'new_message',
          payload: { message: data.message },
        });
      }
    } catch {
      alert('Failed to send message');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSearchUsers = async (q: string) => {
    setUserSearchQuery(q);
    if (!q.trim()) {
      setUserSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/people?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.users) setUserSearchResults(data.users);
    } catch {}
  };

  const handleStartChat = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId }),
      });
      const data = await res.json();
      if (res.ok && data.conversation) {
        setConversations([data.conversation, ...conversations.filter((c) => c.id !== data.conversation.id)]);
        setActiveConvId(data.conversation.id);
        setIsNewChatOpen(false);
      }
    } catch {
      alert('Failed to start chat');
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConvId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-hub-charcoal">
      <div className="h-[80vh] rounded-3xl bg-white dark:bg-[#27322B] border border-hub-border shadow-xl flex overflow-hidden">
        {/* LEFT SIDEBAR: CONVERSATION LIST */}
        <div className={`w-full md:w-80 border-r border-hub-border flex-col justify-between bg-hub-ivory dark:bg-[#18201C] ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-hub-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-hub-terracotta" />
              <h2 className="font-display font-semibold text-lg text-hub-charcoal">Hometown Chat</h2>
            </div>
            <button
              onClick={() => setIsNewChatOpen(true)}
              className="p-2 rounded-xl bg-hub-terracotta text-white font-bold text-xs shadow-xs hover:bg-hub-terracottaDark"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {conversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-hub-sage space-y-2">
                <p>No conversations yet.</p>
                <button
                  onClick={() => setIsNewChatOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-hub-stone text-hub-charcoal font-semibold"
                >
                  Start New Chat
                </button>
              </div>
            ) : (
              conversations.map((c) => {
                const partner = c.participants?.find((p: any) => p.user?.id !== currentUser?.id)?.user;
                const lastMsg = c.messages?.[0];
                const isSelected = c.id === activeConvId;
                return (
                  <button
                    key={c.id}
                    onClick={() => setActiveConvId(c.id)}
                    className={`w-full p-3 rounded-2xl flex items-center gap-3 text-left transition-all min-h-[56px] ${
                      isSelected
                        ? 'bg-hub-terracotta text-white font-semibold shadow-xs'
                        : 'hover:bg-hub-stone text-hub-charcoal'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-hub-terracotta/20 text-hub-terracotta font-bold flex items-center justify-center text-sm flex-shrink-0">
                      {partner?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-hub-charcoal truncate">{partner?.name || 'Member'}</span>
                        {lastMsg && (
                          <span className="text-[10px] font-mono opacity-70">
                            {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate ${isSelected ? 'text-white/80' : 'text-hub-sage'}`}>
                        {lastMsg ? lastMsg.content || '📷 Media Attachment' : `Roots in ${partner?.profile?.hometownCity || 'Hometown'}`}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT MAIN WINDOW: ACTIVE CHAT */}
        <div className={`flex-1 flex-col justify-between bg-white dark:bg-[#27322B] ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
          {activeConv ? (
            <>
              {/* CHAT HEADER */}
              <div className="p-4 border-b border-hub-border flex items-center justify-between bg-hub-cream dark:bg-[#202A24]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveConvId(null)}
                    className="md:hidden p-1.5 rounded-lg bg-hub-stone text-hub-charcoal hover:bg-hub-border"
                    title="Back to Conversations"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-hub-terracotta text-white font-bold flex items-center justify-center text-sm">
                    {activeConv.participants?.find((p: any) => p.user?.id !== currentUser?.id)?.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-sm text-hub-charcoal">
                      {activeConv.participants?.find((p: any) => p.user?.id !== currentUser?.id)?.user?.name || 'Hometown Member'}
                    </h3>
                    <span className="text-[10px] text-hub-terracotta font-mono font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-hub-green animate-pulse" />
                      Supabase Realtime Connection Active
                    </span>
                  </div>
                </div>
              </div>

              {/* MESSAGES SCROLL CONTAINER */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => {
                  const isMine = m.senderId === currentUser?.id;
                  return (
                    <div key={m.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1.5 shadow-xs ${
                          isMine
                            ? 'bg-hub-terracotta text-white rounded-br-none'
                            : 'bg-hub-cream dark:bg-[#202A24] text-hub-charcoal border border-hub-border rounded-bl-none'
                        }`}
                      >
                        {m.mediaUrl && (
                          <div className="rounded-xl overflow-hidden mb-1">
                            <img src={m.mediaUrl} alt="Attachment" className="max-h-48 w-full object-cover" />
                          </div>
                        )}
                        {m.content && <p className="leading-relaxed whitespace-pre-line">{m.content}</p>}
                        <div className={`text-[9px] font-mono text-right opacity-75 ${isMine ? 'text-white' : 'text-hub-sage'}`}>
                          {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* TYPING INDICATOR */}
                {typingUser && (
                  <div className="flex justify-start">
                    <div className="px-3.5 py-2 rounded-2xl bg-hub-stone text-hub-sage text-[11px] italic font-mono flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-hub-terracotta animate-bounce" />
                      <span>{typingUser} is typing...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* IMAGE PREVIEW BAR */}
              {imagePreview && (
                <div className="px-4 py-2 bg-hub-stone border-t border-hub-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={imagePreview} alt="Preview" className="w-8 h-8 rounded-lg object-cover" />
                    <span className="text-xs text-hub-charcoal font-semibold">Image attachment ready</span>
                  </div>
                  <button onClick={() => { setSelectedImage(null); setImagePreview(null); }} className="text-xs text-red-500">✕ Cancel</button>
                </div>
              )}

              {/* INPUT BAR */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-hub-border flex items-center gap-2 bg-hub-cream dark:bg-[#202A24]">
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 rounded-xl bg-white dark:bg-[#27322B] border border-hub-border text-hub-sage hover:text-hub-terracotta"
                  title="Attach Photo"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder="Type your message..."
                  value={textInput}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-[#27322B] border border-hub-border text-xs text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                />

                <button
                  type="submit"
                  disabled={isUploading}
                  className="p-2.5 rounded-xl bg-hub-terracotta hover:bg-hub-terracottaDark text-white font-bold text-xs shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="my-auto text-center space-y-3 p-8 text-hub-sage">
              <div className="w-16 h-16 rounded-full bg-hub-terracotta/10 border border-hub-terracotta/30 flex items-center justify-center text-hub-terracotta mx-auto">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-display font-semibold text-hub-charcoal">Your hometown is full of people you haven't met yet.</h3>
              <p className="text-xs max-w-sm mx-auto">
                Select a conversation or start a new message to reconnect with fellow members from your hometown.
              </p>
              <button
                onClick={() => setIsNewChatOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-hub-terracotta text-white font-bold text-xs shadow-md"
              >
                Find People From Home
              </button>
            </div>
          )}
        </div>
      </div>

      {/* NEW CHAT USER SEARCH MODAL */}
      {isNewChatOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#27322B] border border-hub-border rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl text-hub-charcoal">
            <div className="flex items-center justify-between border-b border-hub-border pb-3">
              <h3 className="font-display font-semibold text-lg">Start New Conversation</h3>
              <button onClick={() => setIsNewChatOpen(false)} className="text-hub-sage hover:text-hub-charcoal">✕</button>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-hub-sage absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search member by name or city..."
                value={userSearchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {userSearchResults.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleStartChat(u.id)}
                  className="w-full p-3 rounded-2xl bg-hub-stone hover:bg-hub-cream border border-hub-border flex items-center justify-between text-xs text-left"
                >
                  <div>
                    <div className="font-semibold text-hub-charcoal">{u.name}</div>
                    <div className="text-[11px] text-hub-sage">Roots in {u.profile?.hometownCity || 'Hometown'}</div>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-hub-terracotta text-white font-bold text-[10px]">Chat</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
