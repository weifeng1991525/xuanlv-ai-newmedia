'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Palette,
  Sparkles,
  Download,
  Image as ImageIcon,
  Loader2,
  ArrowLeft,
  Settings,
  Wand2,
  RefreshCw,
  Trash2,
  Package,
} from 'lucide-react';
import {
  generateImages,
  downloadUrlImage,
  SIZE_OPTIONS,
  QUALITY_OPTIONS,
  FORMAT_OPTIONS,
  urlToBlobUrl,
} from '@/lib/imageApi';
import { downloadImagesAsZip } from '@/lib/zipDownload';

interface GeneratedImage {
  id: string;
  imageUrl: string;
  /** 原始数据：Base64或URL */
  rawData: string;
  isUrl: boolean;
  revisedPrompt?: string;
  isLoading: boolean;
  error?: string;
}

// 3:4 比例选项
const CUSTOM_SIZE_OPTIONS = [
  { value: '1024x1536', label: '3:4 竖屏 (1024x1536)' },
  { value: '1536x1024', label: '3:2 横屏 (1536x1024)' },
  { value: '1024x1024', label: '1:1 正方形 (1024x1024)' },
  { value: '1792x1024', label: '16:9 横屏 (1792x1024)' },
  { value: '1024x1792', label: '9:16 竖屏 (1024x1792)' },
  { value: '2048x2048', label: '1:1 高清 (2048x2048)' },
  { value: '2048x1152', label: '16:9 高清 (2048x1152)' },
  { value: '3840x2160', label: '4K 横屏 (3840x2160)' },
  { value: '2160x3840', label: '4K 竖屏 (2160x3840)' },
];

export default function CustomImagePage() {
  const [prompt, setPrompt] = useState('');
  const [selectedSize, setSelectedSize] = useState('1024x1536');
  const [selectedQuality, setSelectedQuality] = useState<'low' | 'medium' | 'high' | 'auto'>('high');
  const [selectedFormat, setSelectedFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [imageCount, setImageCount] = useState<number | ''>(1);
  const [customCount, setCustomCount] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // 获取实际张数
  const getActualCount = (): number => {
    if (imageCount === '' && customCount) {
      const num = parseInt(customCount);
      return Math.min(Math.max(num, 1), 10);
    }
    return imageCount as number;
  };

  // 处理API返回的图片数据
  const processImageResult = (result: any, index: number): GeneratedImage => {
    const isUrlFormat = !!result.url;
    const rawData = result.b64_json || result.url || '';
    
    return {
      id: `img-${Date.now()}-${index}`,
      imageUrl: isUrlFormat ? result.url : '', // URL直接使用
      rawData: rawData,
      isUrl: isUrlFormat,
      revisedPrompt: result.revisedPrompt,
      isLoading: !isUrlFormat, // URL格式直接可用，Base64需要转换
      error: undefined,
    };
  };

  // 生成图片
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('请输入提示词');
      return;
    }

    const count = getActualCount();
    if (count < 1 || count > 10) {
      alert('张数必须在1-10之间');
      return;
    }

    setIsGenerating(true);
    
    // 初始化图片槽位
    const initialImages: GeneratedImage[] = Array.from({ length: count }, (_, i) => ({
      id: `img-${Date.now()}-${i}`,
      imageUrl: '',
      rawData: '',
      isUrl: false,
      isLoading: true,
    }));
    setImages(initialImages);

    try {
      const results = await generateImages({
        prompt: prompt.trim(),
        size: selectedSize,
        quality: selectedQuality,
        n: count,
        outputFormat: selectedFormat,
      });

      // 处理结果
      const processedImages = results.map((result, i) => processImageResult(result, i));
      
      // 如果是Base64格式，需要转换为Blob URL
      if (processedImages[0] && !processedImages[0].isUrl) {
        const updatedImages = await Promise.all(
          processedImages.map(async (img, idx) => {
            if (img.rawData) {
              try {
                const blobUrl = await urlToBlobUrl(img.rawData);
                return { ...img, imageUrl: blobUrl, isLoading: false };
              } catch {
                return { ...img, isLoading: false, error: '图片转换失败' };
              }
            }
            return { ...img, isLoading: false };
          })
        );
        setImages(updatedImages);
      } else {
        // URL格式直接显示
        setImages(processedImages.map(img => ({ ...img, isLoading: false })));
      }
    } catch (error: any) {
      setImages(prev => prev.map(img => ({
        ...img,
        isLoading: false,
        error: error.message || '生成失败',
      })));
    }

    setIsGenerating(false);
  };

  // 下载单张图片
  const handleDownload = (image: GeneratedImage, index: number) => {
    if (image.isUrl) {
      downloadUrlImage(image.rawData, `xuanlv-ai-${index + 1}.png`);
    } else if (image.rawData) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${image.rawData}`;
      link.download = `xuanlv-ai-${index + 1}.${selectedFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // 打包下载全部
  const handleDownloadZip = async () => {
    const completedImages = images.filter(img => img.imageUrl || img.rawData);
    if (completedImages.length === 0) return;

    setIsZipping(true);
    try {
      const imageItems = completedImages.map((img, idx) => ({
        data: img.rawData,
        filename: `xuanlv-ai-${idx + 1}.png`,
        isUrl: img.isUrl,
      }));
      await downloadImagesAsZip(imageItems, `xuanlv-ai-${Date.now()}.zip`);
    } catch (error) {
      console.error('打包下载失败:', error);
      alert('打包下载失败，请重试');
    }
    setIsZipping(false);
  };

  // 清空结果
  const handleClear = () => {
    setImages([]);
  };

  // 重新生成单张
  const handleRegenerate = async (index: number) => {
    if (!prompt.trim()) return;

    setImages(prev => prev.map((img, i) => 
      i === index ? { ...img, isLoading: true, error: undefined } : img
    ));

    try {
      const results = await generateImages({
        prompt: prompt.trim(),
        size: selectedSize,
        quality: selectedQuality,
        n: 1,
        outputFormat: selectedFormat,
      });

      if (results[0]) {
        const processed = processImageResult(results[0], index);
        
        if (processed.isUrl) {
          setImages(prev => prev.map((img, i) => 
            i === index ? { ...processed, isLoading: false } : img
          ));
        } else {
          // Base64 需要转换
          const blobUrl = await urlToBlobUrl(processed.rawData);
          setImages(prev => prev.map((img, i) => 
            i === index ? { ...processed, imageUrl: blobUrl, isLoading: false } : img
          ));
        }
      }
    } catch (error: any) {
      setImages(prev => prev.map((img, i) => 
        i === index ? { ...img, isLoading: false, error: error.message } : img
      ));
    }
  };

  const completedCount = images.filter(img => img.imageUrl).length;
  const actualCount = getActualCount();

  // 提示词模板
  const promptTemplates = [
    '一张极简科技风产品海报，黑色背景，中心主体发光，适合电商首页首屏',
    '未来感 UI 登录页插画，蓝金色调，干净背景，适合 SaaS 官网头图',
    '一只戴着橙色围巾的水獭，站在书店门口，电影感光影，高清摄影风格',
    '高端咖啡品牌宣传海报，暖色灯光，真实摄影风格，画面包含英文标题',
    '中国风山水画，水墨风格，远山近水，意境悠远，适合文化类公众号配图',
  ];

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
            <Link href="/comic" className="text-sm text-gray-400 hover:text-white transition-colors">
              漫画生成
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-10">
            <div className="tag mb-4">
              <Palette className="w-4 h-4 text-pink-400" />
              <span className="text-gray-300">自定义出图</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
              输入提示词，<span className="gradient-text">AI为您创作</span>
            </h1>
            <p className="text-gray-400 max-w-2xl">
              自由编写提示词，自定义数量、比例、质量，批量生成高质量新媒体素材图。
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左侧设置面板 */}
            <div className="space-y-6">
              {/* 创作设置 */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-pink-400" />
                  <h2 className="text-lg font-display font-semibold">创作设置</h2>
                </div>

                <div className="space-y-4">
                  {/* 图片数量 */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">生成数量</label>
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => { setImageCount(num); setCustomCount(''); }}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            imageCount === num && !customCount
                              ? 'bg-gradient-to-r from-indigo-500 to-pink-500 text-white'
                              : 'bg-white/5 text-gray-400 hover:bg-white/10'
                          }`}
                        >
                          {num}
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
                    <label className="block text-sm text-gray-400 mb-2">图片尺寸 (默认3:4)</label>
                    <select
                      value={selectedSize}
                      onChange={(e) => setSelectedSize(e.target.value)}
                      className="input-modern"
                    >
                      {CUSTOM_SIZE_OPTIONS.map((opt) => (
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
                      {QUALITY_OPTIONS.map((opt) => (
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

                  {/* 输出格式 */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">输出格式</label>
                    <div className="grid grid-cols-3 gap-2">
                      {FORMAT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setSelectedFormat(opt.value as any)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedFormat === opt.value
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

              {/* 提示词模板 */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Wand2 className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-display font-semibold">提示词模板</h2>
                </div>
                <div className="space-y-2">
                  {promptTemplates.map((template, index) => (
                    <button
                      key={index}
                      onClick={() => setPrompt(template)}
                      className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm text-gray-400 hover:text-white line-clamp-2"
                    >
                      {template}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧内容区 */}
            <div className="lg:col-span-2 space-y-6">
              {/* 提示词输入 */}
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-display font-semibold">输入提示词</h2>
                  <span className="text-sm text-gray-500">{prompt.length} 字</span>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述您想要的图片内容，例如：一张极简科技风产品海报，黑色背景，中心主体发光..."
                  rows={5}
                  className="input-modern resize-none"
                />

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
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
                      生成图片 ({actualCount}张)
                    </>
                  )}
                </button>
              </div>

              {/* 生成结果 */}
              {images.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-display font-semibold">生成结果</h2>
                      <span className="tag">
                        {completedCount}/{images.length} 张
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
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
                      <button
                        onClick={handleClear}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-sm text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                        清空
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {images.map((image, index) => (
                      <div key={image.id} className="glass-card p-4 group">
                        {/* 图片区域 */}
                        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-white/5 mb-3">
                          {image.isLoading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <Loader2 className="w-8 h-8 text-pink-400 animate-spin mb-2" />
                              <span className="text-sm text-gray-500">生成中...</span>
                            </div>
                          ) : image.error ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                              <ImageIcon className="w-10 h-10 text-red-400/50 mb-2" />
                              <span className="text-sm text-red-400">{image.error}</span>
                            </div>
                          ) : image.imageUrl ? (
                            <img
                              src={image.imageUrl}
                              alt={`生成的图片 ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : null}

                          {/* 悬浮操作 */}
                          {(image.imageUrl || image.rawData) && !image.isLoading && (
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleDownload(image, index)}
                                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                                title="下载"
                              >
                                <Download className="w-5 h-5 text-white" />
                              </button>
                              <button
                                onClick={() => handleRegenerate(index)}
                                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all"
                                title="重新生成"
                              >
                                <RefreshCw className="w-5 h-5 text-white" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* 图片信息 */}
                        {image.revisedPrompt && (
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {image.revisedPrompt}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 空状态 */}
              {images.length === 0 && (
                <div className="glass-card p-12">
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-indigo-500/20 flex items-center justify-center mb-4">
                      <Palette className="w-10 h-10 text-pink-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">准备开始创作</h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      在上方输入提示词后点击"生成图片"，AI将为您创作高质量图片
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
