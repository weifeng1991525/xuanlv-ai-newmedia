'use client';

import React, { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import { Search, Ban, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, [page, search]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), pageSize: '10', search });
      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setTotal(data.total || 0);
      }
    } catch { toast.error('获取用户列表失败'); } finally { setIsLoading(false); }
  };

  const handleToggleBan = async (userId: string, currentBanned: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isBanned: !currentBanned }),
      });
      if (response.ok) {
        toast.success(currentBanned ? '用户已解封' : '用户已封禁');
        await fetchUsers();
      } else { toast.error('操作失败'); }
    } catch { toast.error('网络错误'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">用户管理</h1>
        <p className="text-sm text-gray-500">管理平台用户，支持搜索、封禁/解封操作</p>
      </div>

      <Card variant="glass" padding="lg">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="搜索用户名或邮箱..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              leftIcon={<Search size={16} />}
            />
          </div>
          <Badge variant="default" size="md">共 {total} 用户</Badge>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 text-teal-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">用户</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">角色</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">会员</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">额度</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">状态</th>
                  <th className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">注册时间</th>
                  <th className="text-right text-xs font-medium text-gray-500 pb-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4">
                      <div>
                        <p className="text-sm text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={user.role === 'ADMIN' ? 'amber' : 'default'} size="sm">
                        {user.role === 'ADMIN' ? '管理员' : '用户'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-gray-400">
                        {user.memberships?.[0]?.tier || 'FREE'}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-gray-400">
                        {user.memberships?.[0]?.creditsRemaining || 0}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={user.isBanned ? 'rose' : 'teal'} size="sm">
                        {user.isBanned ? '已封禁' : '正常'}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        variant={user.isBanned ? 'primary' : 'outline'}
                        size="sm"
                        leftIcon={user.isBanned ? <CheckCircle size={12} /> : <Ban size={12} />}
                        onClick={() => handleToggleBan(user.id, user.isBanned)}
                      >
                        {user.isBanned ? '解封' : '封禁'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {total > 10 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
            <p className="text-xs text-gray-500">
              显示 {(page - 1) * 10 + 1}-{Math.min(page * 10, total)} / 共 {total}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                上一页
              </Button>
              <Button variant="outline" size="sm" disabled={page * 10 >= total} onClick={() => setPage(page + 1)}>
                下一页
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
