import React from 'react';
import { FaInstagram, FaTwitter, FaDiscord, FaFacebook, FaYoutube, FaLinkedinIn, FaGithub } from 'react-icons/fa';
import SocialButton from './SocialButton';

const SocialLinks = () => {
  const socialLinks = [
    { icon: <FaInstagram size={20} />, href: 'https://www.instagram.com/jorgito.cazares', label: 'Instagram' },
    //{ icon: <FaTwitter size={20} />, href: '#', label: 'Twitter' },
    { icon: <FaGithub size={20} />, href: 'https://www.github.com/jorge-caz', label: 'Github' },
    { icon: <FaLinkedinIn size={20} />, href: 'https://www.linkedin.com/in/jorge-luis-cazares/', label: 'Linkedin' },
    { icon: <FaYoutube size={20} />, href: 'https://www.youtube.com/@jorge_cazares', label: 'YouTube' },
  ];

  return (
    <div className="flex space-x-4">
      {socialLinks.map((link, index) => (
        <SocialButton
          key={index}
          icon={link.icon}
          href={link.href}
          label={link.label}
        />
      ))}
    </div>
  );
};

export default SocialLinks;
