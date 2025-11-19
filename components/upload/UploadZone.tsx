'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileText, X } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export function UploadZone({ onFileSelect, selectedFile, disabled = false }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理拖拽进入
  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  // 处理拖拽离开
  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  // 处理拖拽悬停
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // 处理文件放下
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  // 处理文件选择
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  // 处理点击上传区域
  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  // 清除已选文件
  const handleClearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border-2 border-dashed 
        p-16 text-center transition-all duration-300 cursor-pointer
        ${isDragging 
          ? 'border-accent-cyan bg-accent-cyan/10 scale-[1.02]' 
          : 'border-primary/50 hover:border-accent-cyan hover:scale-[1.02]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {selectedFile ? (
        // 已选择文件状态
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-green-500/20 p-6">
            <FileText className="h-12 w-12 text-green-400" />
          </div>
          <div className="w-full">
            <div className="flex items-center justify-center gap-2 mb-2">
              <p className="text-xl font-semibold text-foreground truncate max-w-md">
                {selectedFile.name}
              </p>
              <button
                onClick={handleClearFile}
                className="rounded-full p-1 hover:bg-red-500/20 transition-colors"
                title="移除文件"
              >
                <X className="h-5 w-5 text-red-400" />
              </button>
            </div>
            <p className="text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          <p className="text-sm text-green-400">
            ✓ 文件已选择，点击可重新选择
          </p>
        </div>
      ) : (
        // 未选择文件状态
        <div className="flex flex-col items-center gap-4">
          <div className={`
            rounded-full bg-primary/20 p-6 transition-all duration-300
            ${isDragging ? 'bg-accent-cyan/20 shadow-glow-cyan' : 'group-hover:bg-accent-cyan/20 group-hover:shadow-glow-cyan'}
          `}>
            <Upload className={`
              h-12 w-12 transition-colors
              ${isDragging ? 'text-accent-cyan' : 'text-primary group-hover:text-accent-cyan'}
            `} />
          </div>
          <div>
            <p className="mb-2 text-xl font-semibold text-foreground">
              {isDragging ? '🎯 放下文件' : '🎯 将 PDF 拖到这里'}
            </p>
            <p className="text-muted-foreground">或点击选择文件</p>
          </div>
          <p className="text-sm text-muted-foreground">支持 PDF 格式，最大 20MB</p>
        </div>
      )}

      {/* 隐藏的文件输入 */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

