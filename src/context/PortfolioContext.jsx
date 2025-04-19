import React, { createContext, useContext } from 'react';
import portfolioConfig from '../config/portfolioConfig';

// Create context
const PortfolioContext = createContext();

// Provider component
export const PortfolioProvider = ({ children }) => {
  return (
    <PortfolioContext.Provider value={portfolioConfig}>
      {children}
    </PortfolioContext.Provider>
  );
};

// Custom hook to use the portfolio context
export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error('usePortfolio must be used within a PortfolioProvider');
  }
  return context;
};

export default PortfolioContext;
