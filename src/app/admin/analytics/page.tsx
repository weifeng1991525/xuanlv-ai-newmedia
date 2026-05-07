'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { TrendingUp, Users, Image, Film, DollarSign } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/analytics');
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch { toast.error('获取分析数据失败'); } finally { setIsLoading(false); }
    };
    fetchData();
  }, []);

  const overview = data?.overview || {};

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">数据分析</h1>
        <p className="text-sm text-gray-500">平台运营数据统计与分析（近30天）</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: '总用户数', value: overview.totalUsers || 0, color: 'text-teal-400', bg: 'bg-teal-500/10' },
          { icon: Image, label: '总生成次数', value: overview.totalGenerations || 0, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: Film, label: '漫画生成', value: '-', color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { icon: DollarSign, label: '总收入', value: `¥${((overview.totalRevenue || 0) / 100).toFixed(2)}`, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} variant="glass" padding="lg">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${stat.bg}`}>
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

      {/* Daily Stats Table */}
      <Card variant="glass" padding="lg">
        <h2 className="text-base font-display font-semibold text-white mb-4">每日数据明细</h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="sticky top-0 bg-navy-400">
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">日期</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3 pr-4">新增用户</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3 pr-4">生成次数</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3 pr-4">漫画</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3 pr-4">自定义图</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3">收入</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {(data?.dailyStats || []).map((day: any, idx: number) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 pr-4 text-xs text-gray-400">{day.date}</td>
                    <td className="py-2.5 pr-4 text-xs text-right text-gray-300">{day.newUsers}</td>
                    <td className="py-2.5 pr-4 text-xs text-right text-gray-300">{day.totalGenerations}</td>
                    <td className="py-2.5 pr-4 text-xs text-right text-gray-300">{day.comicCount}</td>
                    <td className="py-2.5 pr-4 text-xs text-right text-gray-300">{day.customImageCount}</td>
                    <td className="py-2.5 text-xs text-right text-gray-300">¥{(day.revenue / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
