'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Film,
  Sparkles,
  Download,
  Image as ImageIcon,
  Loader2,
  Copy,
  Check,
  ArrowLeft,
  Settings,
  Zap,
  Package,
} from 'lucide-react';
import {
  generateComicImage,
  base64ToBlobUrl,
  downloadUrlImage,
  QUALITY_OPTIONS,
} from '@/lib/imageApi';
import { downloadImagesAsZip } from '@/lib/zipDownload';

interface ComicPanel {
  index: number;
  text: string;
  imageUrl: string;
  rawData: string;
  isUrl: boolean;
  isLoading: boolean;
  error?: string;
}

// 3:4 比例选项
const COMIC_SIZE_OPTIONS = [
  { value: '1024x1536', label: '3:4 竖屏 (1024x1536)' },
  { value: '768x1024', label: '3:4 竖屏 (768x1024)' },
  { value: '1536x2048', label: '3:4 竖屏高清 (1536x2048)' },
];

export default function ComicPage() {
  const [copywriting, setCopywriting] = useState('');
  const [imageCount, setImageCount] = useState<number | ''>(4);
  const [customCount, setCustomCount] = useState('');
  const [selectedSize, setSelectedSize] = useState('1024x1536');
  const [selectedQuality, setSelectedQuality] = useState<'low' | 'medium' | 'high' | 'auto'>('high');
  const [panels, setPanels] = useState<ComicPanel[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // 将文案分割成多段
  const splitCopywriting = (text: string, count: number): string[] => {
    const chars = text.trim().split('');
    const segmentLength = Math.ceil(chars.length / count);
    const segments: string[] = [];
    
    for (let i = 0; i < count; i++) {
      const start = i * segmentLength;
      const end = Math.min(start + segmentLength, chars.length);
      if (start < chars.length) {
        segments.push(chars.slice(start, end).join(''));
      }
    }
    
    return segments;
  };

  // 获取实际张数
  const getActualCount = (): number => {
    if (imageCount === '' && customCount) {
      const num = parseInt(customCount);
      return Math.min(Math.max(num, 1), 10);
    }
    return imageCount as number;
  };

  // 生成漫画
  const handleGenerate = async () => {
    if (!copywriting.trim()) {
      alert('请输入文案内容');
      return;
    }

    const count = getActualCount();
    if (count < 1 || count > 10) {
      alert('张数必须在1-10之间');
      return;
    }

    setIsGenerating(true);
    const segments = splitCopywriting(copywriting, count);
    
    // 初始化面板
    const initialPanels: ComicPanel[] = segments.map((text, index) => ({
      index: index + 1,
      text,
      imageUrl: '',
      rawData: '',
      isUrl: false,
      isLoading: true,
    }));
    setPanels(initialPanels);

    // 逐张生成
    for (let i = 0; i < segments.length; i++) {
      try {
        const result = await generateComicImage(segments[i], {
          size: selectedSize,
          quality: selectedQuality,
        });
        
        // 处理API返回的数据
        const isUrlFormat = !!result.url;
        const rawData = result.b64_json || result.url || '';
        
        let imageUrl = '';
        if (isUrlFormat && result.url) {
          imageUrl = result.url;
        } else if (result.b64_json) {
          imageUrl = base64ToBlobUrl(result.b64_json);
        }
        
        setPanels(prev => prev.map((panel, idx) => 
          idx === i 
            ? { ...panel, imageUrl, rawData, isUrl: isUrlFormat, isLoading: false }
            : panel
        ));
      } catch (error: any) {
        setPanels(prev => prev.map((panel, idx) => 
          idx === i 
            ? { ...panel, isLoading: false, error: error.message || '生成失败' }
            : panel
        ));
      }
    }

    setIsGenerating(false);
  };

  // 下载单张图片
  const handleDownload = (panel: ComicPanel) => {
    if (panel.isUrl) {
      downloadUrlImage(panel.rawData, `comic-panel-${panel.index}.png`);
    } else if (panel.rawData) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${panel.rawData}`;
      link.download = `comic-panel-${panel.index}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 打包下载全部
  const handleDownloadZip = async () => {
    const completedPanels = panels.filter(p => p.imageUrl || p.rawData);
    if (completedPanels.length === 0) return;

    setIsZipping(true);
    try {
      const images = completedPanels.map(panel => ({
        data: panel.rawData,
        filename: `comic-panel-${panel.index}.png`,
        isUrl: panel.isUrl,
      }));
      await downloadImagesAsZip(images, `xuanlv-comic-${Date.now()}.zip`);
    } catch (error) {
      console.error('打包下载失败:', error);
      alert('打包下载失败，请重试');
    }
    setIsZipping(false);
  };

  // 复制文案
  const handleCopyText = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const completedCount = panels.filter(p => p.imageUrl).length;
  const actualCount = getActualCount();

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white">
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#0F0F1A]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2 group">
            <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">旋律AI</span>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/custom-image" className="text-sm text-gray-400 hover:text-white transition-colors">
              自定义出图
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-10">
            <div className="tag mb-4">
              <Film className="w-4 h-4 text-indigo-400" />
              <span className="text-gray-300">AI漫画生成</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              输入文案，<span className="gradient-text">一键生成漫画</span>
            </h1>
            <p className="text-gray-400 max-w-2xl">
              AI自动将文案分割为多格漫画分镜，生成极简黑白手绘条漫风格图片。
              支持自定义图片数量、比例和质量。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧设置面板 */}
            <div className="space-y-6">
              {/* 创作设置 */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-display font-semibold">创作设置</h2>
                </div>

                <div className="space-y-4">
                  {/* 图片数量 */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">图片数量</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[2, 4, 6, 8, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => { setImageCount(num); setCustomCount(''); }}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            imageCount === num && !customCount
                              ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {num}张
                        </button>
                      ))}
                    </div>
                    {/* 自定义张数 */}
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={customCount}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 10)) {
                            setCustomCount(val);
                            if (val) setImageCount('');
                          }
                        }}
                        placeholder="自定义"
                        className="w-24 input-modern text-sm py-2"
                      />
                      <span className="text-sm text-gray-500">张 (1-10)</span>
                    </div>
                  </div>

                  {/* 图片比例 - 默认3:4 */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">图片比例 (默认3:4)</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="input-modern"
                    >
                      {COMIC_SIZE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-[#1A1A2E]">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 图片质量 */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">图片质量</label>
                    <div className="grid grid-cols-2 gap-2">
                      {QUALITY_OPTIONS.slice(0, 3).map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSelectedQuality(opt.value as any)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                            selectedQuality === opt.value
                              ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 内置风格说明 */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-display font-semibold">内置漫画风格</h2>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  极简黑白手绘条漫，纯白背景，粗黑马克笔线条。
                  人物为表情夸张的火柴人形象，带有简单男女发型和夸张表情。
                  对话气泡和文字用简洁字体呈现，整体风格像随笔涂鸦，轻松吐槽风。
                </p>
              </div>
            </div>

            {/* 右侧内容区 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 文案输入 */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-display font-semibold">输入文案</h2>
                  <span className="text-sm text-gray-500">{copywriting.length} 字</span>
                </div>

                <textarea
                  value={copywriting}
                  onChange={(e) => setCopywriting(e.target.value)}
                  placeholder="请输入需要生成为漫画的文案内容。AI会自动将文案均匀分配到每一张漫画图片中..."
                  rows={6}
                  className="input-modern resize-none"
                />

                <button
                  onClick={handleGenerate}
                  disabled={!copywriting.trim() || isGenerating}
                  className="glow-button w-full mt-4 py-4 text-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      生成漫画 ({actualCount}张)
                    </>
                  )}
                </button>
              </div>

              {/* 生成结果 */}
              {panels.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-display font-semibold">生成结果</h2>
                      <span className="tag">
                        {completedCount}/{panels.length} 张
                      </span>
                    </div>
                    {completedCount > 0 && (
                      <button
                        onClick={handleDownloadZip}
                        disabled={isZipping}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 transition-all text-sm font-medium disabled:opacity-50"
                      >
                        {isZipping ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Package className="w-4 h-4" />
                        )}
                        {isZipping ? '打包中...' : '打包下载全部'}
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {panels.map((panel) => (
                      <div key={panel.index} className="glass-card p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="tag text-xs">第 {panel.index} 格</span>
                          {(panel.imageUrl || panel.rawData) && (
                            <button
                              onClick={() => handleDownload(panel)}
                              className="p-1.5 text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* 图片区域 */}
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 mb-3">
                          {panel.isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-2" />
                              <span className="text-sm text-gray-500">生成中...</span>
                            </div>
                          ) : panel.error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                              <ImageIcon className="w-10 h-10 text-red-400/50 mb-2" />
                              <span className="text-sm text-red-400">{panel.error}</span>
                            </div>
                          ) : panel.imageUrl ? (
                            <img
                              src={panel.imageUrl}
                              alt={`漫画第${panel.index}格`}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>

                        {/* 文案 */}
                        <div className="flex items-start gap-2">
                          <p className="flex-1 text-sm text-gray-400 leading-relaxed line-clamp-3">
                            {panel.text}
                          </p>
                          <button
                            onClick={() => handleCopyText(panel.text, panel.index)}
                            className="p-1 text-gray-600 hover:text-indigo-400 transition-colors flex-shrink-0"
                          >
                            {copiedIndex === panel.index ? (
                              <Check className="w-4 h-4 text-green-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 空状态 */}
              {panels.length === 0 && (
                <div className="glass-card p-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-pink-500/20 flex items-center justify-center mb-4">
                      <Film className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">准备开始创作</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      在上方输入文案后点击"生成漫画"，AI将自动为您创作漫画分镜
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
