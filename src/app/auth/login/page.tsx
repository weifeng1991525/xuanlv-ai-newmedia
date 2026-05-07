'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Music, Mail, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('请输入邮箱和密码'); return; }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        toast.success('登录成功');
        window.location.href = '/home';
      } else {
        const error = await response.json();
        toast.error(error.message || '登录失败');
      }
    } catch { toast.error('网络错误'); } finally { setIsLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy-500">
      <div className="absolute inset-0 bg-grid opacity-50" />

      <div className="relative w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <Link href="/home" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors mb-6">
            <ArrowLeft size={16} />
            返回首页
          </Link>
          <div className="flex items-center justify-center gap-2.5 mb-4">
            <Music className="h-10 w-10 text-teal-500" />
          </div>
          <h1 className="text-2xl font-display font-bold text-white mb-2">登录旋律AI</h1>
          <p className="text-sm text-gray-500">登录您的账号以继续使用</p>
        </div>

        <Card variant="glass" padding="lg">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="邮箱"
              type="email"
              placeholder="请输入邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
            />
            <Input
              label="密码"
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock size={16} />}
            />
            <Button type="submit" size="lg" isLoading={isLoading} className="w-full">
              登录
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
