'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  ArrowLeft,
} from 'lucide-react';

const adminLinks = [
  { href: '/admin', label: '仪表盘', icon: LayoutDashboard },
  { href: '/admin/users', label: '用户管理', icon: Users },
  { href: '/admin/prompts', label: '提示词管理', icon: FileText },
  { href: '/admin/analytics', label: '数据分析', icon: BarChart3 },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-navy-500/50 backdrop-blur-xl border-r border-white/5 flex flex-col">
      {/* Back to site */}
      <div className="px-4 py-4 border-b border-white/5">
        <Link
          href="/home"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={16} />
          返回前台
        </Link>
      </div>

      {/* Nav links */}
      <div className="flex-1 py-4 px-2 space-y-1">
        <p className="px-3 mb-3 text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
          管理后台
        </p>
        {adminLinks.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'text-teal-400 bg-teal-500/10 shadow-neon'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={18} className={cn('flex-shrink-0', isActive ? 'text-teal-400' : 'text-gray-500')} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-white/5">
        <p className="text-[10px] text-gray-600">旋律AI 管理后台 v1.0</p>
      </div>
    </aside>
  );
}
