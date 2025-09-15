
import React, { useState, useEffect } from 'react';

const loadingMessages = [
  '正在召唤AI设计师...',
  '分析您的独特风格...',
  '正在进行虚拟穿搭...',
  '即将呈现您的新造型...',
  'AI正在精心缝制，请稍候...',
  '魔法正在发生，马上就好！',
];

const LoadingOverlay: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  const [message, setMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    if (isLoading) {
      const intervalId = setInterval(() => {
        setMessage(prevMessage => {
          const currentIndex = loadingMessages.indexOf(prevMessage);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 2500); 
      return () => clearInterval(intervalId);
    }
  }, [isLoading]);

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex flex-col items-center justify-center z-50 text-white transition-opacity duration-300">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-400"></div>
      <p className="mt-6 text-lg font-semibold tracking-wide">{message}</p>
    </div>
  );
};

export default LoadingOverlay;
