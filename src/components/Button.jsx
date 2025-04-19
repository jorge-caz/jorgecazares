import React from 'react';

const Button = ({ children, primary, onClick, className, type = 'button' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`btn ${primary ? 'btn-primary' : 'bg-gray-200 dark:bg-dark-lighter text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-dark-light'} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
