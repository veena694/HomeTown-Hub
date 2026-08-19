'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Sparkles, MapPin, MessageSquare, Heart } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
        if (data.unreadCount !== undefined) setUnreadCount(data.unreadCount);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch {
      alert('Operation failed');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6 text-hub-charcoal">
      <div className="flex items-center justify-between border-b border-hub-border pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hub-terracotta/10 text-hub-terracotta text-xs font-mono font-bold">
            <Bell className="w-3.5 h-3.5" />
            <span>Community Alerts ({unreadCount} Unread)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-hub-charcoal">
            YOUR NOTIFICATIONS
          </h1>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl bg-hub-stone hover:bg-hub-border text-hub-charcoal text-xs font-semibold flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4 text-hub-terracotta" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-12 text-center text-hub-sage text-xs font-mono">
          <Sparkles className="w-5 h-5 text-hub-terracotta mx-auto animate-spin mb-2" />
          <span>Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-10 rounded-3xl bg-hub-cream border border-hub-border text-center space-y-2 text-hub-sage">
          <Bell className="w-8 h-8 text-hub-terracotta mx-auto opacity-50" />
          <p className="text-xs">No notifications yet. Activity in your hometown community will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                n.isRead ? 'bg-white border-hub-border opacity-75' : 'bg-hub-cream border-hub-terracotta/40 shadow-xs'
              }`}
            >
              <span className="p-2 rounded-xl bg-hub-terracotta/10 text-hub-terracotta mt-0.5">
                <Sparkles className="w-4 h-4" />
              </span>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-semibold text-sm text-hub-charcoal">{n.title}</h4>
                  <span className="text-[10px] font-mono text-hub-sage">{new Date(n.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-hub-sage leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
