import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名
 * 用于组合组件的默认样式和外部传入的样式
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

