import React from 'react';

const Input = ({ 
  placeholder = '', 
  value = '', 
  onChange, 
  onKeyPress,
  disabled = false,
  className = '',
  multiline = false,
  rows = 3,
  ...props 
}) => {
  const baseClasses = `
    w-full px-4 py-3 border border-gray-200 rounded-lg 
    bg-white text-charcoal placeholder-gray-500 
    transition-all duration-200 resize-none
    focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent
    disabled:bg-gray-50 disabled:cursor-not-allowed
  `.trim().replace(/\s+/g, ' ');
  
  const classes = `${baseClasses} ${className}`;
  
  if (multiline) {
    return (
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyPress={onKeyPress}
        disabled={disabled}
        rows={rows}
        className={classes}
        {...props}
      />
    );
  }
  
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onKeyPress={onKeyPress}
      disabled={disabled}
      className={classes}
      {...props}
    />
  );
};

export default Input;
