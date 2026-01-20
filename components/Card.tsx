
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'pshat' | 'remez' | 'drash' | 'sod' | 'none';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', glow = 'none', onClick }) => {
  const glowStyles = {
    pshat: 'portal-glow-pshat hover:border-yellow-400/50',
    remez: 'portal-glow-remez hover:border-sky-400/50',
    drash: 'portal-glow-drash hover:border-purple-400/50',
    sod: 'portal-glow-sod hover:border-green-400/50',
    none: ''
  };

  return (
    <div 
      onClick={onClick}
      className={`glass rounded-2xl overflow-hidden transition-all duration-500 ${glowStyles[glow]} ${onClick ? 'cursor-pointer hover:scale-[1.02]' : ''} ${className}`}
    >
      {children}
    </div>
  );
};
