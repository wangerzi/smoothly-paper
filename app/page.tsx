import { Upload } from 'lucide-react';

export default function Home() {
  return (
    <main className="page-enter relative min-h-screen overflow-hidden bg-space">
      {/* 粒子背景效果 - 稍后实现 */}
      <div className="absolute inset-0 bg-gradient-to-br from-space via-space-elevated to-space opacity-80" />
      
      {/* 主内容 */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* 标题区域 */}
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-6xl font-bold">
            <span className="text-gradient">📚 Smoothly Paper</span>
          </h1>
          <p className="text-xl text-muted-foreground">让英文论文阅读变得优雅而高效</p>
        </div>

        {/* 上传卡片 */}
        <div className="glass-card w-full max-w-2xl p-12">
          {/* 拖拽上传区域 */}
          <div className="group relative overflow-hidden rounded-2xl border-2 border-dashed border-primary/50 p-16 text-center transition-all duration-300 hover:border-accent-cyan hover:scale-[1.02]">
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-primary/20 p-6 transition-all duration-300 group-hover:bg-accent-cyan/20 group-hover:shadow-glow-cyan">
                <Upload className="h-12 w-12 text-primary group-hover:text-accent-cyan" />
              </div>
              <div>
                <p className="mb-2 text-xl font-semibold text-foreground">
                  🎯 将 PDF 拖到这里
                </p>
                <p className="text-muted-foreground">或点击选择文件</p>
              </div>
              <p className="text-sm text-muted-foreground">支持 PDF 格式，最大 20MB</p>
            </div>

            {/* 隐藏的文件输入 */}
            <input
              type="file"
              accept=".pdf"
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </div>

          {/* 水平选择器 */}
          <div className="mt-8">
            <p className="mb-4 text-center text-sm text-muted-foreground">
              选择你的英语水平：
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[
                { level: '🌱 初级', desc: '3K词汇量', value: 'beginner' },
                { level: '🌿 中级', desc: '5K词汇量', value: 'intermediate' },
                { level: '🌲 高级', desc: '8K+词汇', value: 'advanced' },
              ].map((item) => (
                <button
                  key={item.value}
                  className="glass-card float-on-hover group p-6 text-center transition-all hover:border-primary/50"
                >
                  <p className="mb-2 text-lg font-semibold">{item.level}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 开始按钮 */}
          <button className="gradient-bg mt-8 w-full rounded-xl py-4 text-lg font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-glow-purple disabled:opacity-50 disabled:cursor-not-allowed">
            ━━━━ 开始智能解析 ━━━━
          </button>
        </div>

        {/* 底部提示 */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>✨ 本地运行 · 数据隐私 · AI 驱动</p>
        </div>
      </div>
    </main>
  );
}

