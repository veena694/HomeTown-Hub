'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Compass, Users, MapPin, Bell, User, Shield, Sparkles, LogOut, Menu, X, ChevronDown, Navigation, Search, Home, Briefcase, Sun, Moon, LogIn, UserPlus, MessageSquare, Edit3 } from 'lucide-react';
import { useLocationContext } from '@/lib/LocationContext';
import { useTheme } from '@/lib/ThemeContext';
import { DEMO_COMMUNITIES } from '@/lib/mockData';
import LocationEditorModal from './LocationEditorModal';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [user, setUser] = useState<any>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isLocationEditorOpen, setIsLocationEditorOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  const {
    currentLocation,
    homeLocation,
    nowLocation,
    profileLoading,
    setLocationBySlug,
    useMyLocation,
    switchToHome,
    switchToNow,
  } = useLocationContext();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    fetch('/api/notifications')
      .then((res) => res.json())
      .then((data) => {
        if (data.unreadCount !== undefined) setUnreadNotifications(data.unreadCount);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const filteredLocationResults = DEMO_COMMUNITIES.filter((c) =>
    locationSearchQuery ? c.city.toLowerCase().includes(locationSearchQuery.toLowerCase()) || c.name.toLowerCase().includes(locationSearchQuery.toLowerCase()) : true
  );

  const handleSelectLocation = (slug: string) => {
    setLocationBySlug(slug, 'SEARCH');
    setIsLocationDropdownOpen(false);
    setLocationSearchQuery('');
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Compass },
    { href: '/hometown-today', label: 'Hometown Today', icon: MapPin },
    { href: '/communities', label: 'Communities', icon: Users },
    { href: '/people', label: 'Reconnect', icon: User },
    { href: '/chat', label: 'Chat', icon: MessageSquare },
    { href: '/cultural-contributor/onboarding', label: 'Pandit Hub', icon: Sparkles },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFDF7]/95 dark:bg-[#18201C]/95 backdrop-blur-md border-b border-hub-border shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Global Location Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-hub-terracotta to-hub-marigold flex items-center justify-center text-white font-bold shadow-md shadow-hub-terracotta/20 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-lg text-hub-charcoal tracking-tight group-hover:text-hub-terracotta transition-colors">
                HOMETOWN HUB
              </span>
            </div>
          </Link>

          {/* GLOBAL LOCATION SWITCHER BADGE */}
          <div className="relative">
            <button
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-hub-cream border border-hub-terracotta/40 hover:border-hub-terracotta text-xs font-semibold text-hub-terracotta flex items-center gap-1.5 shadow-2xs transition-all max-w-[150px] sm:max-w-none truncate"
            >
              <MapPin className="w-3.5 h-3.5 text-hub-terracotta animate-pulse flex-shrink-0" />
              <span className="font-mono truncate">
                {profileLoading ? 'Loading...' : currentLocation ? `${currentLocation.city}` : 'Select Location'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-hub-sage flex-shrink-0" />
            </button>

            {/* LOCATION SWITCHER DROPDOWN MENU */}
            {isLocationDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 sm:w-84 rounded-2xl bg-white dark:bg-[#27322B] border border-hub-border p-4 shadow-xl z-50 text-hub-charcoal space-y-4 animate-accordion-down max-h-[85vh] overflow-y-auto">
                {/* Search Box */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-hub-sage absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search any location..."
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-hub-stone border border-hub-border text-xs text-hub-charcoal focus:outline-none focus:border-hub-terracotta"
                  />
                </div>

                {/* Use My Location Option */}
                <button
                  onClick={() => {
                    useMyLocation();
                    setIsLocationDropdownOpen(false);
                  }}
                  className="w-full p-2.5 rounded-xl bg-hub-green/10 hover:bg-hub-green/20 border border-hub-green/30 text-hub-charcoal text-xs font-semibold flex items-center justify-between transition-colors min-h-[44px]"
                >
                  <span className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-hub-green" />
                    Use My Current Location
                  </span>
                  <span className="text-[10px] font-mono bg-hub-green/20 text-hub-charcoal px-2 py-0.5 rounded-full font-bold">GPS</span>
                </button>

                {/* HOME ↔ NOW Quick Toggle */}
                <div className="p-3 rounded-xl bg-hub-stone border border-hub-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-hub-sage uppercase tracking-wider font-semibold">Your Profile Places</span>
                    <button
                      onClick={() => {
                        setIsLocationDropdownOpen(false);
                        setIsLocationEditorOpen(true);
                      }}
                      className="text-[11px] text-hub-terracotta font-semibold hover:underline flex items-center gap-1 min-h-[32px]"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit Locations</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        switchToHome();
                        setIsLocationDropdownOpen(false);
                      }}
                      disabled={!homeLocation}
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 truncate min-h-[40px] ${
                        homeLocation
                          ? 'bg-hub-terracotta/10 hover:bg-hub-terracotta/20 border border-hub-terracotta/30 text-hub-terracotta'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5 text-hub-terracotta flex-shrink-0" />
                      <span className="truncate">HOME ({homeLocation ? homeLocation.city : 'Set Home'})</span>
                    </button>

                    <button
                      onClick={() => {
                        switchToNow();
                        setIsLocationDropdownOpen(false);
                      }}
                      disabled={!nowLocation}
                      className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 truncate min-h-[40px] ${
                        nowLocation
                          ? 'bg-hub-sky/20 hover:bg-hub-sky/30 border border-hub-sky/40 text-hub-charcoal'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5 text-hub-sky flex-shrink-0" />
                      <span className="truncate">NOW ({nowLocation ? nowLocation.city : 'Set Now'})</span>
                    </button>
                  </div>
                </div>

                {/* Available Hometown Communities */}
                <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                  <div className="text-[10px] font-mono text-hub-sage uppercase tracking-wider mb-1 font-semibold">
                    Hometown Communities
                  </div>
                  {filteredLocationResults.map((comm) => (
                    <button
                      key={comm.slug}
                      onClick={() => handleSelectLocation(comm.slug)}
                      className={`w-full p-2 rounded-xl text-xs text-left flex items-center justify-between transition-all min-h-[36px] ${
                        currentLocation?.slug === comm.slug
                          ? 'bg-hub-terracotta text-white font-bold'
                          : 'hover:bg-hub-stone text-hub-charcoal'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" />
                        {comm.city}, {comm.state}
                      </span>
                      <span className="text-[10px] opacity-75 font-mono">{comm.memberCount} Members</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-hub-terracotta/10 text-hub-terracotta border border-hub-terracotta/30 font-semibold'
                    : 'text-hub-sage hover:text-hub-charcoal hover:bg-hub-stone'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-hub-terracotta' : 'text-hub-sage'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Actions & Theme Switcher */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-hub-stone hover:bg-hub-border text-hub-charcoal transition-colors border border-hub-border flex items-center gap-1.5 text-xs min-h-[38px]"
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-hub-sage" />
                <span className="text-[11px] font-mono text-hub-sage">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-hub-marigold" />
                <span className="text-[11px] font-mono text-hub-marigold">Light</span>
              </>
            )}
          </button>

          <Link
            href="/notifications"
            className="relative p-2 rounded-xl bg-hub-stone hover:bg-hub-border text-hub-charcoal transition-colors border border-hub-border min-h-[38px] flex items-center justify-center"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-hub-terracotta text-white text-[9px] font-bold">
                {unreadNotifications}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {(user.role === 'PLATFORM_ADMIN' || user.role === 'COMMUNITY_ADMIN') && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-xl bg-hub-green/20 border border-hub-green/40 text-hub-charcoal text-xs font-semibold flex items-center gap-1.5"
                >
                  <Shield className="w-3.5 h-3.5 text-hub-green" />
                  <span>Admin</span>
                </Link>
              )}
              <Link
                href={`/profile/${user.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#27322B] border border-hub-border hover:border-hub-terracotta transition-colors shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-hub-terracotta text-white text-xs font-bold flex items-center justify-center">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs font-semibold text-hub-charcoal">{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-hub-sage hover:text-red-600 hover:bg-red-50 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-xl bg-hub-stone hover:bg-hub-border text-hub-charcoal text-xs font-semibold flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-hub-terracotta" />
                <span>Log In</span>
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-hub-terracotta to-hub-terracottaDark text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile / Tablet Controls */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-hub-stone text-hub-charcoal border border-hub-border min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Toggle Theme"
          >
            {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-hub-marigold" />}
          </button>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-hub-stone text-hub-charcoal min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER NAVIGATION MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-hub-border bg-white dark:bg-[#27322B] px-4 py-5 space-y-4 text-hub-charcoal animate-accordion-down max-h-[85vh] overflow-y-auto">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-hub-sage uppercase tracking-wider font-semibold">Navigation</span>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all min-h-[44px] ${
                    isActive
                      ? 'bg-hub-terracotta text-white shadow-xs'
                      : 'hover:bg-hub-stone text-hub-charcoal'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-hub-border space-y-2">
            <span className="text-[10px] font-mono text-hub-sage uppercase tracking-wider font-semibold">Account & Preferences</span>
            
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsLocationEditorOpen(true);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-hub-stone text-hub-charcoal text-xs font-semibold flex items-center justify-between min-h-[44px]"
            >
              <span className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-hub-terracotta" />
                Edit Home & Now Locations
              </span>
              <ChevronDown className="w-4 h-4 -rotate-90 text-hub-sage" />
            </button>

            {user ? (
              <div className="space-y-2 pt-1">
                <Link
                  href={`/profile/${user.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-hub-cream dark:bg-[#202A24] border border-hub-border text-sm font-semibold text-hub-charcoal flex items-center gap-3 min-h-[44px]"
                >
                  <div className="w-7 h-7 rounded-full bg-hub-terracotta text-white font-bold flex items-center justify-center text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span>{user.name} Profile</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-red-50 text-red-600 font-semibold text-xs flex items-center gap-2 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-hub-stone text-hub-charcoal text-xs font-bold text-center flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <LogIn className="w-4 h-4 text-hub-terracotta" />
                  <span>Log In</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-2.5 rounded-xl bg-hub-terracotta text-white text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm min-h-[44px]"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LOCATION EDITOR MODAL */}
      <LocationEditorModal isOpen={isLocationEditorOpen} onClose={() => setIsLocationEditorOpen(false)} />
    </header>
  );
}
