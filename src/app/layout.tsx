import type { Metadata } from 'next';
import './globals.css';
import PasswordGate from '@/components/PasswordGate';

export const metadata: Metadata = {
  title: {
    default: '旋律新媒体AI伙伴 - 新媒体运营AI出图平台',
    template: '%s | 旋律AI',
  },
  description: '基于先进AI技术的新媒体运营辅助平台，提供漫画生成、自定义出图等智能新媒体工具。使用GPT-Image-2-Pro模型，一键生成高质量图片。',
  keywords: ['旋律AI', '新媒体', 'AI出图', '漫画生成', 'AI绘画', '内容创作', 'GPT-Image'],
  authors: [{ name: '旋律AI Team' }],
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1 },
  themeColor: '#0F0F1A',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: '旋律AI',
    title: '旋律新媒体AI伙伴 - 新媒体运营AI出图平台',
    description: '基于先进AI技术的新媒体运营辅助平台，助力内容创作者高效产出。',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className="dark">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0F0F1A] text-white font-body antialiased">
        <PasswordGate password="weilong">
          {children}
        </PasswordGate>
      </body>
    </html>
  );
}
