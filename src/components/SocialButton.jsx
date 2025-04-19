import React from 'react';

const SocialButton = ({ icon, href, label }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 dark:bg-dark-lighter text-gray-700 dark:text-white hover:bg-primary hover:text-white transform hover:scale-110 transition-all duration-300"
      aria-label={label}
    >
      {icon}
    </a>
  );
};

export default SocialButton;
