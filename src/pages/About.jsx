import React from 'react';
import SectionContainer from '../components/SectionContainer';
import { usePortfolio } from '../context/PortfolioContext';

const About = () => {
  const { about } = usePortfolio();
  
  return (
    <SectionContainer id="about" className="bg-gray-50 dark:bg-dark-light">
      <h2 className="section-title">{about.title}</h2>
      <div className="max-w-3xl mx-auto">
        {about.paragraphs.map((paragraph, index) => (
          <p key={index} className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            {paragraph}
          </p>
        ))}
        <div className="grid md:grid-cols-2 gap-6 mt-10">
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-3 text-primary">Skills</h3>
            <ul className="space-y-2">
              {about.skills.map((skill, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h3 className="text-xl font-bold mb-3 text-primary">Education</h3>
            <ul className="space-y-2">
              {about.education.map((edu, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                  <span>{edu}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default About;
