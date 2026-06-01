import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', title, actions, onClick }) => {
  return (
    <div onClick={onClick} className={`bg-white dark:bg-cw-surface-dark dark:border dark:border-cw-border-dark rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all duration-300 ${className}`}>
      {(title || actions) && (
        <div className="px-6 py-5 border-b border-cw-border-light dark:border-cw-border-dark/60 flex items-center justify-between">
          {title && <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>}
          {actions && <div className="flex items-center gap-3">{actions}</div>}
        </div>
      )}
      <div className="p-6 sm:p-8">{children}</div>
    </div>
  );
};
