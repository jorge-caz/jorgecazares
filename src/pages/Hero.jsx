import React, { useEffect, useState, useRef } from 'react';
import SectionContainer from '../components/SectionContainer';
import Button from '../components/Button';
import { usePortfolio } from '../context/PortfolioContext';
import Tilt from 'react-parallax-tilt';

const Hero = () => {
  const { hero } = usePortfolio();

  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const fullGreeting = `${hero.greeting} ${hero.title}`; // Full text to type
  const helloPart = hero.greeting; // "Hello,"
  const titlePart = ` ${hero.title}`; // " I'm Jorge Cazares"

  useEffect(() => {
    let index = 0;
    let currentText = '';
    const typeDelay = 70;

    const typeNextChar = () => {
      if (index < fullGreeting.length) {
        currentText += fullGreeting[index];
        setDisplayedText(currentText);
        index++;
        setTimeout(typeNextChar, typeDelay);
      } else {
        setIsTyping(false);
      }
    };

    typeNextChar();
  }, [fullGreeting]);

  // Splitting styled parts for color
  const splitStyledText = () => {
    const helloLength = helloPart.length;
    const helloText = displayedText.slice(0, helloLength);
    const titleText = displayedText.slice(helloLength);

    return (
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
        <span className="text-primary">{helloText}</span>
        <span className="text-black dark:text-gray-300 mb-8">{titleText}</span>
        <span className="text-black dark:text-gray-300 mb-8 animate-blink">|</span>
      </h1>
    );
  };

  const NoDragImage = () => {
    const preventDrag = (e) => {
      e.preventDefault(); // This stops the default image drag behavior
    };

    return (
      <div>
        <img
          src="/me.png"
          alt="Profile"
          className="w-full h-full object-cover"
          onDragStart={preventDrag} // Prevents dragging
        />
      </div>
    );
  };

  return (
    <SectionContainer id="home" className="flex items-center">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="order-2 md:order-1">
          {splitStyledText()}
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
            {hero.subtitle}
          </p>
          <div className="flex space-x-4">
            <Button
              primary
              onClick={() =>
                document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })
              }
            >
              {hero.ctaPrimary}
            </Button>
            <Button
              onClick={() =>
                document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })
              }
            >
              {hero.ctaSecondary}
            </Button>
          </div>
        </div>
        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-lg transform hover:scale-105 transition-all duration-300">
            <Tilt
              glareEnable={false}  // disables the shiny light reflection
              scale={1.05}          // subtle zoom on hover
              transitionSpeed={1500} // smooth and slow
              tiltMaxAngleX={10}
              tiltMaxAngleY={10}
              className="w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-primary shadow-lg"
            >
              <NoDragImage />
            </Tilt>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default Hero;
