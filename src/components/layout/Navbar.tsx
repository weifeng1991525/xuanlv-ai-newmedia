'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import {
  Music,
  Menu,
  X,
  User,
  LogOut,
  Crown,
  Home,
  Film,
  Palette,
  Settings,
} from 'lucide-react';

const navLinks = [
  { href: '/home', label: '首页', icon: Home },
  { href: '/comic', label: '漫画生成', icon: Film },
  { href: '/custom-image', label: '自定义出图', icon: Palette },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, checkSession } = useAuth();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-40 transition-all duration-300',
        isScrolled
          ? 'bg-navy-500/90 backdrop-blur-xl border-b border-white/5 shadow-glass'
          : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div className="relative">
              <Music className="h-8 w-8 text-teal-500 transition-transform group-hover:scale-110" />
              <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse-glow" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-display font-bold text-white tracking-tight">
                旋律AI
              </span>
              <span className="text-[10px] text-gray-500 -mt-0.5 tracking-widest uppercase">
                New Media AI Partner
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'text-teal-400 bg-teal-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <link.icon size={16} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link href="/membership">
                  <Button variant="ghost" size="sm" leftIcon={<Crown size={14} />}>
                    会员中心
                  </Button>
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" leftIcon={<Settings size={14} />}>
                      管理后台
                    </Button>
                  </Link>
                )}
                <div className="flex items-center gap-2 pl-3 border-l border-white/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-sm text-gray-300">{user.name}</span>
                </div>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button size="sm">登录 / 注册</Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-navy-500/95 backdrop-blur-xl border-t border-white/5 animate-fade-in">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-teal-400 bg-teal-500/10'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  )}
                >
                  <link.icon size={18} />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-3 border-t border-white/5 mt-3">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    useAuth.getState().logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 w-full"
                >
                  <LogOut size={18} />
                  退出登录
                </button>
              ) : (
                <Link
                  href="/auth/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-teal-400"
                >
                  <User size={18} />
                  登录 / 注册
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
