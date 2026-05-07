'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Sparkles } from 'lucide-react';

interface PasswordGateProps {
  children: React.ReactNode;
  password: string;
}

const STORAGE_KEY = 'xuanlv_auth';

export default function PasswordGate({ children, password }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 检查本地存储的认证状态
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.authenticated && data.timestamp) {
          // 检查是否过期（7天）
          const daysSinceAuth = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);
          if (daysSinceAuth < 7) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (inputPassword === password) {
      setIsAuthenticated(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        authenticated: true,
        timestamp: Date.now(),
      }));
    } else {
      setError('密码错误，请重试');
      setInputPassword('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold gradient-text mb-2">旋律AI</h1>
          <p className="text-gray-400 text-sm">请输入密码继续访问</p>
        </div>

        {/* 密码输入框 */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">访问密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={inputPassword}
                  onChange={(e) => setInputPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!inputPassword}
              className="glow-button w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              进入系统
            </button>
          </form>
        </div>

        {/* 底部提示 */}
        <p className="text-center text-xs text-gray-600 mt-6">
          旋律新媒体AI伙伴 · 内部使用
        </p>
      </div>
    </div>
  );
}
