'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Users, Image, Film, TrendingUp, DollarSign, Activity } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch { /* ignore */ } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const overview = stats?.overview || {};
  const statCards = [
    { icon: Users, label: '总用户数', value: overview.totalUsers || 0, color: 'text-teal-400', bgColor: 'bg-teal-500/10' },
    { icon: Image, label: '总生成次数', value: overview.totalGenerations || 0, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { icon: Film, label: '漫画生成', value: '-', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    { icon: DollarSign, label: '总收入', value: `¥${((overview.totalRevenue || 0) / 100).toFixed(2)}`, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-white mb-1">管理仪表盘</h1>
        <p className="text-sm text-gray-500">旋律AI平台运营数据概览</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="glass" padding="lg">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xl font-display font-bold text-white">{stat.value}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card variant="glass" padding="lg">
        <h2 className="text-base font-display font-semibold text-white mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: '用户管理', href: '/admin/users', icon: Users },
            { label: '提示词管理', href: '/admin/prompts', icon: Activity },
            { label: '数据分析', href: '/admin/analytics', icon: TrendingUp },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <a key={action.label} href={action.href} className="p-4 bg-navy-500/30 border border-white/5 rounded-xl hover:border-teal-500/20 transition-all group">
                <Icon className="h-5 w-5 text-gray-500 group-hover:text-teal-400 mb-2 transition-colors" />
                <p className="text-sm text-gray-400 group-hover:text-white transition-colors">{action.label}</p>
              </a>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
