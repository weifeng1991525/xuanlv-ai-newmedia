'use client';

import React, { useState, useEffect } from 'react';
import { Prompt } from '@/types';
import PromptEditor from '@/components/admin/PromptEditor';
import { toast } from 'react-hot-toast';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchPrompts(); }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/admin/prompts');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
      }
    } catch { toast.error('获取提示词列表失败'); } finally { setIsLoading(false); }
  };

  const handleSave = async (prompt: Partial<Prompt>) => {
    try {
      const response = await fetch('/api/admin/prompts', {
        method: prompt.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt),
      });
      if (response.ok) {
        toast.success(prompt.id ? '提示词已更新' : '提示词已创建');
        await fetchPrompts();
      } else { toast.error('保存失败'); }
    } catch { toast.error('网络错误'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除此提示词吗？')) return;
    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (response.ok) { toast.success('提示词已删除'); await fetchPrompts(); }
      else { toast.error('删除失败'); }
    } catch { toast.error('网络错误'); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">提示词管理</h1>
        <p className="text-sm text-gray-500">管理AI生成所使用的系统提示词和用户模板</p>
      </div>
      <PromptEditor prompts={prompts} onSave={handleSave} onDelete={handleDelete} isLoading={isLoading} />
    </div>
  );
}
