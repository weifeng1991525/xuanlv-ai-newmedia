/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  images: {
    unoptimized: true,
  },
  // GitHub Pages 部署在子路径下，必须配置 basePath
  basePath: '/xuanlv-ai-newmedia',
  // 确保资源路径正确
  assetPrefix: '/xuanlv-ai-newmedia',
  trailingSlash: true,
};

module.exports = nextConfig;
