import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingProps {
  message?: string;
  subMessage?: string;
}

export default function Loading({ message = '加载中...', subMessage }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="relative">
        <div className="w-16 h-16 border-2 border-teal-500/20 border-t-teal-500 rounded-full animate-spin" />
        <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-teal-400" />
      </div>
      <p className="text-sm text-gray-400 mt-4">{message}</p>
      {subMessage && <p className="text-xs text-gray-600 mt-1">{subMessage}</p>}
    </div>
  );
}
