import React from 'react';

const SectionContainer = ({ id, className, children }) => {
  return (
    <section id={id} className={`min-h-screen py-16 ${className}`}>
      <div className="section-container">
        {children}
      </div>
    </section>
  );
};

export default SectionContainer;
