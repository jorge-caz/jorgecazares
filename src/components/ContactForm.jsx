import React from 'react';
import Button from './Button';

const ContactForm = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const subject = form.subject.value;
    const message = form.message.value;

    // Construct mailto link
    const encodedSubject = encodeURIComponent(subject);
    const body = encodeURIComponent(`${message}`);
    const mailtoLink = `mailto:jorge_lc@mit.edu?subject=${encodedSubject}&body=${body}`;

    // Open email client
    window.location.href = mailtoLink;
  };

  return (
    <form className="space-y-6 max-w-lg mx-auto" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subject
        </label>
        <input
          type="text"
          id="subject"
          name="subject"
          placeholder="Email Subject"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-lighter text-gray-900 dark:text-white"
          required
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          rows="4"
          placeholder="Your message here..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-dark-lighter text-gray-900 dark:text-white"
          required
        ></textarea>
      </div>

      <Button primary type="submit" className="w-full">
        Send Message
      </Button>
    </form>
  );
};

export default ContactForm;