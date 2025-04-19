import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './pages/Hero';
import About from './pages/About';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import { PortfolioProvider } from './context/PortfolioContext';
import portfolioConfig from './config/portfolioConfig';

function App() {
  const [darkMode, setDarkMode] = useState(portfolioConfig.theme.darkMode);

  useEffect(() => {
    // Apply dark mode class to body
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <PortfolioProvider>
      <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-dark' : 'bg-white'}`}>
        <Navbar toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        <Hero />
        <About />
        <Projects />
        <Contact />
      </div>
    </PortfolioProvider>
  );
}

export default App;
