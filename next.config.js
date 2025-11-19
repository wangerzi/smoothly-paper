/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用严格模式
  reactStrictMode: true,
  
  // 本地开发配置
  env: {
    APP_NAME: 'Smoothly Paper',
    APP_VERSION: '0.1.0',
  },
  
  // Webpack 配置
  webpack: (config, { isServer }) => {
    // 处理 better-sqlite3 native 模块
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    
    // 处理 PDF.js worker
    config.resolve.alias.canvas = false;
    
    return config;
  },
  
  // 图片优化配置
  images: {
    domains: [],
  },
  
  // 实验性特性
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;

