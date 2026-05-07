'use client';

import React, { useState } from 'react';
import { Prompt } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Plus, Pencil, Trash2, Save, X, Check } from 'lucide-react';

interface PromptEditorProps {
  prompts: Prompt[];
  onSave: (prompt: Partial<Prompt>) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export default function PromptEditor({ prompts, onSave, onDelete, isLoading }: PromptEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    category: 'COMIC' | 'CUSTOM_IMAGE' | 'GENERAL';
    systemPrompt: string;
  }>({
    name: '',
    description: '',
    category: 'GENERAL',
    systemPrompt: '',
  });

  const handleEdit = (prompt: Prompt) => {
    setEditingId(prompt.id);
    setFormData({
      name: prompt.name,
      description: prompt.description,
      category: prompt.category,
      systemPrompt: prompt.systemPrompt,
    });
  };

  const handleNew = () => {
    setEditingId(null);
    setIsCreating(true);
    setFormData({ name: '', description: '', category: 'GENERAL', systemPrompt: '' });
  };

  const handleSave = () => {
    if (!formData.name || !formData.systemPrompt) return;
    onSave({
      ...(editingId ? { id: editingId } : {}),
      name: formData.name,
      description: formData.description,
      category: formData.category,
      systemPrompt: formData.systemPrompt,
    });
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', description: '', category: 'GENERAL', systemPrompt: '' });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', description: '', category: 'GENERAL', systemPrompt: '' });
  };

  const categoryColors: Record<string, 'teal' | 'amber' | 'purple' | 'rose' | 'default'> = {
    COMIC: 'teal',
    CUSTOM_IMAGE: 'purple',
    GENERAL: 'default',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm text-gray-400">共 {prompts.length} 个提示词</h3>
        <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={handleNew}>
          新建提示词
        </Button>
      </div>

      {/* Editor form */}
      {(isCreating || editingId) && (
        <Card variant="glass" padding="lg" className="animate-fade-in">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-navy-500/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                  placeholder="提示词名称"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">分类</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as 'COMIC' | 'CUSTOM_IMAGE' | 'GENERAL' })}
                  className="w-full bg-navy-500/50 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                >
                  <option value="COMIC">漫画生成</option>
                  <option value="CUSTOM_IMAGE">自定义出图</option>
                  <option value="GENERAL">通用</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">描述</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-navy-500/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                placeholder="描述（可选）"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">系统提示词</label>
              <textarea
                value={formData.systemPrompt}
                onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                rows={8}
                className="w-full bg-navy-500/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
                placeholder="输入系统提示词内容..."
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary" size="sm" leftIcon={<Save size={14} />} onClick={handleSave}>
                保存
              </Button>
              <Button variant="ghost" size="sm" leftIcon={<X size={14} />} onClick={handleCancel}>
                取消
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Prompt list */}
      <div className="space-y-3">
        {prompts.map((prompt) => (
          <Card
            key={prompt.id}
            variant="bordered"
            padding="md"
            className={editingId === prompt.id ? 'border-teal-500/30' : ''}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-medium text-white">{prompt.name}</h4>
                  <Badge variant={categoryColors[prompt.category] || 'default'} size="sm">
                    {prompt.category}
                  </Badge>
                  {prompt.isPublished && (
                    <Badge variant="teal" size="sm">
                      <Check size={10} className="mr-1" />已发布
                    </Badge>
                  )}
                </div>
                {prompt.description && (
                  <p className="text-xs text-gray-500 mb-1">{prompt.description}</p>
                )}
                <p className="text-xs text-gray-600 truncate">{prompt.systemPrompt}</p>
                <p className="text-[10px] text-gray-600 mt-1">
                  使用 {prompt.usageCount} 次 · 创建于 {new Date(prompt.createdAt).toLocaleDateString('zh-CN')}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(prompt)}
                  className="p-1.5 text-gray-500 hover:text-teal-400 hover:bg-teal-500/10 rounded-lg transition-all"
                  title="编辑"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => onDelete(prompt.id)}
                  className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  title="删除"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
