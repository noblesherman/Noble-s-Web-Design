import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  to?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  to, 
  onClick, 
  className = '',
  type = 'button',
  disabled = false
}) => {
  const baseStyles = "relative inline-flex items-center justify-center rounded-lg font-heading font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  const sizeStyles = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm md:text-base",
    lg: "px-7 py-4 text-base md:text-lg"
  };
  
  const variants = {
    primary: "rainbow-cta text-white hover:scale-[1.02]",
    secondary: "bg-surface text-text border border-border hover:border-primary/50 hover:text-primary",
    outline: "bg-transparent border border-text/20 text-text hover:border-text hover:bg-white/5",
    ghost: "bg-transparent text-muted hover:text-text hover:bg-white/5"
  };

  const content = (
    <>
      {children}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}>
        {content}
      </Link>
    );
  }

  return (
    <motion.button 
      whileTap={{ scale: 0.98 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variants[variant]} ${className}`}
    >
      {content}
    </motion.button>
  );
};
