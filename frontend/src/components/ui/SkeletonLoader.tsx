import React from 'react';

interface SkeletonLoaderProps {
  rows?: number;
  columns?: number;
  variant?: 'table' | 'cards' | 'chat';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ rows = 8, columns = 4, variant = 'table' }) => {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-panel rounded-2xl p-6 space-y-3">
            <div className="skeleton h-3 w-24" />
            <div className="skeleton h-8 w-32" />
            <div className="skeleton h-3 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'chat') {
    return (
      <div className="space-y-6 p-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex gap-3 max-w-[70%] ${i % 2 !== 0 ? 'flex-row-reverse' : ''}`}>
              <div className="skeleton h-10 w-10 rounded-full shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="skeleton h-4 w-full" style={{ width: `${60 + Math.random() * 40}%` }} />
                <div className="skeleton h-4 w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Table variant
  return (
    <div className="overflow-hidden">
      {/* Header */}
      <div className="flex gap-4 px-5 py-4 border-b border-white/5">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton h-3 flex-1" style={{ maxWidth: i === 0 ? '30%' : '20%' }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 px-5 py-4 border-b border-white/[0.02]">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="skeleton h-4"
              style={{
                flex: j === 0 ? 2 : 1,
                animationDelay: `${(i * columns + j) * 50}ms`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
