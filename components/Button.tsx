
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gold';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  variant = 'primary',
  disabled = false
}) => {
  const baseStyles = "px-6 py-2 rounded-full font-semibold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:scale-100";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20",
    secondary: "bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/20",
    outline: "border border-white/20 hover:bg-white/10 text-white",
    ghost: "text-white/70 hover:text-white hover:bg-white/10",
    gold: "bg-gradient-to-r from-yellow-600 to-yellow-400 hover:from-yellow-500 hover:to-yellow-300 text-slate-900 shadow-lg shadow-yellow-900/40 uppercase tracking-widest font-cinzel font-bold"
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};
