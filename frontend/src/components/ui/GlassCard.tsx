import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', hoverable = false }) => {
  return (
    <div 
      className={`
        glass p-6 
        ${hoverable ? 'hover:border-accent/40 hover:shadow-accent/5 transition-all duration-300' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default GlassCard;
