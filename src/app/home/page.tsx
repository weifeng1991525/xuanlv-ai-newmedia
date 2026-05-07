'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  Wand2,
  Image as ImageIcon,
  Layers,
  Download,
  Zap,
  Shield,
  Users,
  ChevronRight,
  Play,
  Star,
  Film,
  Palette,
} from 'lucide-react';

// 粒子组件
const Particles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string; delay: number }>>([]);

  useEffect(() => {
    const colors = ['#6366F1', '#EC4899', '#F59E0B', '#06B6D4'];
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 5,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="particles-container">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full opacity-20 animate-pulse-glow"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

// 光晕组件
const GlowOrbs = () => (
  <>
    <div 
      className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 animate-morph"
      style={{ 
        background: 'linear-gradient(135deg, #6366F1, #EC4899)',
        top: '10%',
        left: '10%',
      }} 
    />
    <div 
      className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-15 animate-morph"
      style={{ 
        background: 'linear-gradient(135deg, #F59E0B, #EC4899)',
        top: '50%',
        right: '5%',
        animationDelay: '-5s',
      }} 
    />
    <div 
      className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-10 animate-morph"
      style={{ 
        background: 'linear-gradient(135deg, #06B6D4, #6366F1)',
        bottom: '10%',
        left: '30%',
        animationDelay: '-10s',
      }} 
    />
  </>
);

// 特性卡片数据
const features = [
  {
    icon: Film,
    title: 'AI漫画生成',
    description: '输入文案，AI自动分割分镜，生成极简黑白手绘条漫风格图片',
    href: '/comic',
    gradient: 'from-indigo-500 to-purple-500',
  },
  {
    icon: Palette,
    title: '自定义出图',
    description: '自由编写提示词，自定义数量、比例、质量，批量生成高质量素材',
    href: '/custom-image',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Layers,
    title: '批量生成',
    description: '一次最多生成10张图片，大幅提升内容创作效率',
    href: '/custom-image',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Download,
    title: '高清导出',
    description: '支持PNG、JPEG、WebP格式，最高3840px超高清分辨率',
    href: '/custom-image',
    gradient: 'from-cyan-500 to-blue-500',
  },
];

// 统计数据
const stats = [
  { value: '5,000+', label: '内容创作者' },
  { value: '100,000+', label: '生成图片' },
  { value: '98%', label: '用户满意度' },
  { value: '50+', label: '合作机构' },
];

// 使用流程
const steps = [
  { step: '01', title: '输入提示词', description: '描述您想要的图片内容', icon: Wand2 },
  { step: '02', title: 'AI智能生成', description: 'GPT-Image-2-Pro 高质量出图', icon: Sparkles },
  { step: '03', title: '下载使用', description: '高清素材即刻可用', icon: Download },
];

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F1A] text-white overflow-hidden">
      <Particles />
      
      {/* 导航栏 */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-display gradient-text">旋律AI</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="/comic" className="text-gray-400 hover:text-white transition-colors">漫画生成</Link>
            <Link href="/custom-image" className="text-gray-400 hover:text-white transition-colors">自定义出图</Link>
            <Link href="/membership" className="text-gray-400 hover:text-white transition-colors">会员方案</Link>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/comic">
              <button className="glow-button px-5 py-2.5 text-sm font-medium">
                开始创作
                <ArrowRight className="inline-block ml-1 w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero区域 */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        <GlowOrbs />
        
        {/* 网格背景 */}
        <div className="absolute inset-0 grid-bg opacity-30" />
        
        <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
          {/* 标签 */}
          <div 
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-gray-300">Powered by GPT-Image-2-Pro</span>
          </div>
          
          {/* 主标题 */}
          <h1 
            className={`text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            让AI成为您的
            <br />
            <span className="gradient-text">新媒体创作伙伴</span>
          </h1>
          
          {/* 副标题 */}
          <p 
            className={`text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            基于先进AI技术，为新媒体运营者提供漫画生成、自定义出图、
            批量素材制作等一站式智能创作服务
          </p>
          
          {/* CTA按钮 */}
          <div 
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <Link href="/comic">
              <button className="glow-button px-8 py-4 text-lg font-semibold flex items-center gap-2 group">
                <Film className="w-5 h-5" />
                开始创作
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <Link href="/custom-image">
              <button className="px-8 py-4 text-lg font-semibold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2">
                <Palette className="w-5 h-5" />
                自定义出图
              </button>
            </Link>
          </div>
          
          {/* 统计数据 */}
          <div 
            className={`grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold gradient-text-static mb-1">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* 向下滚动提示 */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2">
            <div className="w-1.5 h-3 bg-white/40 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* 功能特性区域 */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-gray-300">核心功能</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              全方位新媒体创作工具
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              从文案到图片，AI全程陪伴您的内容创作旅程
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} href={feature.href}>
                  <div 
                    className={`feature-card h-full cursor-pointer group`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 feature-icon`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-white mb-2 group-hover:gradient-text transition-all">{feature.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">{feature.description}</p>
                    <div className="flex items-center gap-1 text-sm text-indigo-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      了解更多 <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 使用流程区域 */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="tag mb-4">
              <Play className="w-4 h-4 text-pink-400" />
              <span className="text-gray-300">使用流程</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              三步完成素材制作
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative text-center group">
                  {/* 连接线 */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 left-[60%] w-[80%] h-[2px] bg-gradient-to-r from-white/10 to-transparent" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="text-8xl font-display font-bold text-white/5 absolute -top-4 left-1/2 -translate-x-1/2">
                      {item.step}
                    </div>
                    <div className="relative inline-flex p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-6 group-hover:scale-110 transition-transform duration-500">
                      <Icon className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-display font-semibold text-white mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 信任区域 */}
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: '数据安全', description: '端到端加密，创作数据严格保密', gradient: 'from-emerald-500 to-teal-500' },
              { icon: Zap, title: '极速生成', description: '平均30秒内完成图片生成', gradient: 'from-amber-500 to-yellow-500' },
              { icon: Users, title: '专业团队', description: '资深新媒体运营专家与AI工程师打造', gradient: 'from-blue-500 to-indigo-500' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-card p-8 text-center">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${item.gradient} mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA区域 */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="animated-border glass-card p-12 text-center">
            <Star className="w-12 h-12 text-amber-400 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              准备好提升内容创作效率了吗？
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              加入5,000+内容创作者的行列，让AI助力您的下一个爆款内容
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/comic">
                <button className="glow-button px-8 py-4 text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  立即开始
                </button>
              </Link>
              <Link href="/membership">
                <button className="px-8 py-4 text-lg font-semibold rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                  查看会员方案
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="relative py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold gradient-text">旋律AI</span>
            </div>
            <p className="text-sm text-gray-500">
              © 2024 旋律新媒体AI伙伴. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/comic" className="text-sm text-gray-500 hover:text-white transition-colors">漫画生成</Link>
              <Link href="/custom-image" className="text-sm text-gray-500 hover:text-white transition-colors">自定义出图</Link>
              <Link href="/membership" className="text-sm text-gray-500 hover:text-white transition-colors">会员方案</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
