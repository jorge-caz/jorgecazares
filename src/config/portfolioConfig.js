// This file contains all the editable content for the portfolio website
// Edit this file to update the content of your portfolio

const portfolioConfig = {
  // General site information
  siteInfo: {
    title: "Developer Portfolio",
    description: "Personal portfolio website showcasing my projects and skills",
    author: "Jorge Cazares"
  },

  // Hero section
  hero: {
    greeting: "Hello,",
    title: "I'm Jorge Cazares",
    subtitle: "Welcome to my portfolio! I love creating projects just for fun.",
    ctaPrimary: "View My Work",
    ctaSecondary: "Contact Me"
  },

  // About section
  about: {
    title: "About Me",
    paragraphs: [
      "Since a young age, I have always been driven by complex problem solving. I started programming since the age of 8, and I highly value intellectual challenges. I am firm believer that sky is the limit and that no one should ever set themselves a single limitation in their lives: with enough determination, anything is possible.",
      "I developed a passion for teaching at the age of 13 right after I learned single variable calculus and wanted to share my knowledge to the world. Currently, I am working on my own tutoring website and hope to help students all around the world."
    ],
    skills: [
      "Full-Stack Web Development",
      "Tutoring and Mentoring",
      "Business Strategy",
      "Project Management"
    ],
    education: [
      "AA in General Studies, Laredo College",
      "BS in Math & CS, MIT",
    ]
  },

  // Projects section
  projects: [
    {
      id: 1,
      title: "Sparkmind.pro",
      description: "A tutoring platform connecting students with expert tutors across various subjects.",
      githubUrl: "https://github.com/jorge-caz/sparkmind",
      imageUrl: "/sparkmind.png",
      status: false,
    },
    {
      id: 2,
      title: "TradeAPixel.com",
      description: "An innovative platform for digital asset trading and pixel art marketplace.",
      githubUrl: "https://github.com/jorge-caz/tradeapixel",
      imageUrl: "/tradeapixel.png",
      status: false,
    }
  ],

  // Contact section
  contact: {
    title: "Get In Touch",
    subtitle: "Contact Me",
    description: "Have a question or want to work together? Feel free to reach out using the contact form or through my social media channels.",
    email: "jorge_lc@mit.edu",
    location: "Cambridge, MA",
    socialMedia: {
      title: "Social Media",
      links: [
        { platform: "Instagram", url: "#" },
        { platform: "Twitter", url: "#" },
        { platform: "Discord", url: "#" },
        { platform: "Facebook", url: "#" },
        { platform: "YouTube", url: "#" }
      ]
    }
  },

  // Theme settings
  theme: {
    darkMode: true, // Set to true for dark mode by default, false for light mode
    primaryColor: "#ff3333" // Red color as requested
  }
};

export default portfolioConfig;
