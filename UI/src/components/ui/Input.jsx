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
    w-full px-4 py-3 border border-neutral-300 rounded-lg 
    bg-white text-neutral-900 placeholder-neutral-500 
    transition-all duration-200 resize-none
    focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500
    disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-500
    hover:border-neutral-400
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
