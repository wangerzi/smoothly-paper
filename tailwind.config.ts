import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        // 深空主题色
        space: {
          DEFAULT: '#0a0e27',
          elevated: '#1a1f3a',
          card: '#232946',
        },
        // 主色调：紫色渐变
        primary: {
          start: '#667eea',
          end: '#764ba2',
          glow: '#a78bfa',
          DEFAULT: '#667eea',
        },
        // 强调色：霓虹系
        accent: {
          cyan: '#06b6d4',
          pink: '#ec4899',
          yellow: '#fbbf24',
        },
        // 玻璃效果
        glass: 'rgba(35, 41, 70, 0.6)',
        
        // shadcn/ui 标准色
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: [
          'Inter',
          'SF Pro Display',
          'PingFang SC',
          'Microsoft YaHei',
          'sans-serif',
        ],
        serif: [
          'Merriweather',
          'Georgia',
          'Times New Roman',
          'Songti SC',
          'serif',
        ],
        mono: [
          'JetBrains Mono',
          'Fira Code',
          'SF Mono',
          'Consolas',
          'monospace',
        ],
        display: ['Lexend', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(167, 139, 250, 0.6), 0 0 40px rgba(167, 139, 250, 0.3)',
        'glow-cyan': '0 0 20px rgba(6, 182, 212, 0.6), 0 0 40px rgba(6, 182, 212, 0.3)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.6)',
      },
      keyframes: {
        'gradient-flow': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'gradient-flow': 'gradient-flow 15s ease infinite',
        'flicker': 'flicker 2s infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

