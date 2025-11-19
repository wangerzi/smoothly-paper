import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Smoothly Paper - 论文流畅读',
  description: 'AI驱动的英文学术论文阅读辅助工具',
  keywords: ['论文阅读', 'AI', '学术英语', '翻译'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

