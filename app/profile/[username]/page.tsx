'use client';

import React, { useState, useEffect } from 'react';
import { User, MapPin, Briefcase, GraduationCap, Edit3, X, Sparkles } from 'lucide-react';

export default function ProfilePage({ params }: { params: { username: string } }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editHometown, setEditHometown] = useState('');
  const [editCurrentCity, setEditCurrentCity] = useState('');
  const [editProfession, setEditProfession] = useState('');
  const [editSchool, setEditSchool] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setEditName(data.user.name || '');
          setEditBio(data.user.profile?.bio || '');
          setEditHometown(data.user.profile?.hometownCity || 'Hometown');
          setEditCurrentCity(data.user.profile?.currentCity || 'Delhi');
          setEditProfession(data.user.profile?.profession || '');
          setEditSchool(data.user.profile?.school || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          hometownCity: editHometown,
          currentCity: editCurrentCity,
          profession: editProfession,
          school: editSchool,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUser({
          ...user,
          name: editName,
          profile: {
            ...user.profile,
            bio: editBio,
            hometownCity: editHometown,
            currentCity: editCurrentCity,
            profession: editProfession,
            school: editSchool,
          },
        });
        setIsEditOpen(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch {
      alert('Profile update error');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-hub-sage">
        <Sparkles className="w-6 h-6 text-hub-terracotta mx-auto animate-spin" />
        <p className="mt-2 text-xs font-mono">Loading profile...</p>
      </div>
    );
  }

  const p = user?.profile || {};

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8 text-hub-charcoal">
      <div className="p-8 rounded-3xl bg-white border border-hub-border shadow-sm space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-hub-terracotta text-white font-display font-bold text-2xl flex items-center justify-center border-2 border-hub-border shadow-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-hub-charcoal">{user?.name || 'Hometown Member'}</h1>
              <p className="text-xs text-hub-terracotta font-medium">{p.profession || 'Community Member'}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditOpen(true)}
            className="px-4 py-2 rounded-xl bg-hub-stone hover:bg-hub-border text-hub-charcoal text-xs font-semibold flex items-center gap-1.5"
          >
            <Edit3 className="w-3.5 h-3.5 text-hub-terracotta" />
            <span>Edit Profile</span>
          </button>
        </div>

        <p className="text-xs text-hub-sage leading-relaxed bg-hub-cream p-4 rounded-2xl border border-hub-border italic">
          "{p.bio || 'Living away, roots deep in my hometown.'}"
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-hub-charcoal">
          <div className="p-3.5 rounded-2xl bg-white border border-hub-border flex items-center gap-2">
            <MapPin className="w-4 h-4 text-hub-terracotta" />
            <span>Hometown Roots: <strong>{p.hometownCity || 'Hometown'}</strong></span>
          </div>
          <div className="p-3.5 rounded-2xl bg-white border border-hub-border flex items-center gap-2">
            <MapPin className="w-4 h-4 text-hub-sage" />
            <span>Current City: <strong>{p.currentCity || 'Delhi'}</strong></span>
          </div>
          {p.school && (
            <div className="p-3.5 rounded-2xl bg-white border border-hub-border flex items-center gap-2 sm:col-span-2">
              <GraduationCap className="w-4 h-4 text-hub-sage" />
              <span>School / Alma Mater: <strong>{p.school}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-hub-border rounded-3xl max-w-md w-full p-6 space-y-4 text-hub-charcoal shadow-2xl">
            <div className="flex items-center justify-between border-b border-hub-border pb-3">
              <h3 className="font-display font-semibold text-lg">Edit Your Profile</h3>
              <button onClick={() => setIsEditOpen(false)} className="text-hub-sage hover:text-hub-charcoal">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-sm text-hub-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Hometown City</label>
                <input
                  type="text"
                  value={editHometown}
                  onChange={(e) => setEditHometown(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Current Living City</label>
                <input
                  type="text"
                  value={editCurrentCity}
                  onChange={(e) => setEditCurrentCity(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Profession</label>
                <input
                  type="text"
                  value={editProfession}
                  onChange={(e) => setEditProfession(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 rounded-xl bg-hub-terracotta text-white font-bold text-xs shadow-md"
              >
                {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
