import React, { createContext, useContext, useEffect, useState } from 'react';

// Default values for BrandPalette
const defaultBrandPalette = {
  primaryColor: '#000',
  secondaryColor: '#fff',
};

const BrandContext = createContext();

export const BrandProvider = ({ children }) => {
  const [brandPalette, setBrandPalette] = useState(defaultBrandPalette);

  useEffect(() => {
    const fetchBrandPalette = () => {
      try {
        const storedPalette = localStorage.getItem('brandPalette');
        if (storedPalette) {
          // Attempt to parse stored data
          const parsedPalette = JSON.parse(storedPalette);
          // Validate parsed data structure
          if (validateBrandPalette(parsedPalette)) {
            setBrandPalette(parsedPalette);
          } else {
            console.error('Invalid BrandPalette structure, reverting to defaults.');
            setBrandPalette(defaultBrandPalette);
          }
        }
      } catch (error) {
        console.error('Failed to parse brandPalette from localStorage:', error);
        setBrandPalette(defaultBrandPalette);
      }
    };

    const validateBrandPalette = (palette) => {
      // Simple type validation for BrandPalette object
      return (typeof palette.primaryColor === 'string' && typeof palette.secondaryColor === 'string');
    };

    // Check for localStorage availability
    if (typeof localStorage !== 'undefined') {
      fetchBrandPalette();
    } else {
      console.warn('localStorage is not available. Default values will be used.');
    }
  }, []);

  return (
    <BrandContext.Provider value={brandPalette}>
      {children}
    </BrandContext.Provider>
  );
};

export const useBrand = () => useContext(BrandContext);