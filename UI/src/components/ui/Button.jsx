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
    primary: 'bg-charcoal text-white hover:bg-gray-800 disabled:bg-gray-400',
    secondary: 'bg-white text-charcoal border border-gray-200 hover:bg-gray-50 disabled:bg-gray-100',
    ghost: 'bg-transparent text-charcoal hover:bg-gray-100 disabled:text-gray-400',
    accent: 'bg-pastel-lavender text-charcoal hover:bg-purple-200 disabled:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 disabled:bg-yellow-400'
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
