import type { ReactNode } from 'react';

export const Card = ({ children, className = '' }: { children: ReactNode, className?: string }) => {
  return (
    <div className={`glass-card p-6 ${className}`}>
      {children}
    </div>
  );
};
