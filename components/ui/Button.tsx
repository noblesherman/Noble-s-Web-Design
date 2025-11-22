import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  to?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  to, 
  onClick, 
  className = '',
  type = 'button',
  disabled = false
}) => {
  const baseStyles = "inline-flex items-center justify-center px-6 py-3 rounded-lg font-heading font-semibold tracking-wide transition-all duration-300 text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-secondary text-white hover:shadow-[0_0_20px_rgba(37,99,235,0.5)] hover:scale-[1.02]",
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
      <Link to={to} className={`${baseStyles} ${variants[variant]} ${className}`}>
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
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {content}
    </motion.button>
  );
};