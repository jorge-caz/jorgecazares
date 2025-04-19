import React from 'react';
import SectionContainer from '../components/SectionContainer';
import ContactForm from '../components/ContactForm';
import SocialLinks from '../components/SocialLinks';
import { usePortfolio } from '../context/PortfolioContext';

const Contact = () => {
  const { contact } = usePortfolio();
  
  return (
    <SectionContainer id="contact" className="bg-gray-50 dark:bg-dark-light">
      <h2 className="section-title">{contact.title}</h2>
      <div className="grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">{contact.subtitle}</h3>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            {contact.description}
          </p>
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Email</h4>
            <p className="text-gray-700 dark:text-gray-300">{contact.email}</p>
          </div>
          <div className="mb-8">
            <h4 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">Location</h4>
            <p className="text-gray-700 dark:text-gray-300">{contact.location}</p>
          </div>
          <div>
            <h4 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{contact.socialMedia.title}</h4>
            <SocialLinks />
          </div>
        </div>
        <div>
          <ContactForm />
        </div>
      </div>
    </SectionContainer>
  );
};

export default Contact;
