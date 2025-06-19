import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  onClick, 
  className = '',
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus-ring rounded-lg p-2';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-neutral-400 shadow-sm',
    secondary: 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50 disabled:bg-neutral-100 shadow-sm',
    outline: 'bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 disabled:text-neutral-400 disabled:border-neutral-300',
    ghost: 'bg-transparent text-neutral-700 hover:bg-neutral-100 disabled:text-neutral-400',
    accent: 'bg-burgundy-600 text-white hover:bg-burgundy-700 disabled:bg-neutral-400 shadow-sm',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 shadow-sm',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-yellow-400 shadow-sm',
    success: 'bg-sage-600 text-white hover:bg-sage-700 disabled:bg-neutral-400 shadow-sm'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
    ${className}
  `.trim().replace(/\s+/g, ' ');
  
  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
