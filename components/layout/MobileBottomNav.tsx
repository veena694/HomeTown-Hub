'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, MapPin, Users, User, Bell } from 'lucide-react';

export default function MobileBottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', icon: Compass },
    { href: '/hometown-today', label: 'Today', icon: MapPin },
    { href: '/communities', label: 'Hubs', icon: Users },
    { href: '/people', label: 'People', icon: User },
    { href: '/notifications', label: 'Alerts', icon: Bell },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-hub-border py-2 px-3 flex items-center justify-around shadow-lg">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-hub-terracotta font-bold' : 'text-hub-sage hover:text-hub-charcoal'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'text-hub-terracotta' : 'text-hub-sage'}`} />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
