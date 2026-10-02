import React, { createContext, useContext, useEffect, useState } from "react";

interface GrayscaleContextType {
  isGrayscale: boolean;
  toggleGrayscale: () => void;
}

const GrayscaleContext = createContext<GrayscaleContextType>({
  isGrayscale: false,
  toggleGrayscale: () => {},
});

export const GrayscaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isGrayscale, setIsGrayscale] = useState<boolean>(() => {
    try {
      return localStorage.getItem("fowzy_grayscale_mode") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (isGrayscale) {
      document.documentElement.classList.add("grayscale-mode");
    } else {
      document.documentElement.classList.remove("grayscale-mode");
    }
    try {
      localStorage.setItem("fowzy_grayscale_mode", String(isGrayscale));
    } catch {
      // ignore
    }
  }, [isGrayscale]);

  const toggleGrayscale = () => {
    setIsGrayscale((prev) => !prev);
  };

  return (
    <GrayscaleContext.Provider value={{ isGrayscale, toggleGrayscale }}>
      {children}
    </GrayscaleContext.Provider>
  );
};

export const useGrayscale = () => useContext(GrayscaleContext);
