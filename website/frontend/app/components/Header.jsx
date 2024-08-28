import { ThemeToggle } from "./ThemeToggle";
import React, { useState, useCallback } from 'react';

export default function Header({ onToggle }) {
  const [isPromptTune, setIsPromptTune] = useState(true); // State to manage toggle position

  const handleToggle = useCallback(() => {
    setIsPromptTune((prev) => {
      const newValue = !prev;
      onToggle(newValue);
      return newValue;
    });
  }, [onToggle]);

  return (
    <div className="border-b w-full bg-primary text-primary">
      <div className="flex items-center justify-between h-16 px-8 relative">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold w-32 text-right">
            {isPromptTune ? 'PromptTune' : 'ModelTune '}
          </h2>
          <span className="mx-4 text-secondary">|</span>
          <p className="mr-2 text-secondary">Powered by</p>
          <a href="https://beta.cloudcode.ai" target="_blank" rel="noopener noreferrer">
            <img
              src="https://raw.githubusercontent.com/Cloud-Code-AI/kaizen/main/assets/logo.png"
              className="h-6"
              alt="Kaizen Logo"
            />
          </a>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2">
          <label className="inline-flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="hidden"
                checked={isPromptTune}
                onChange={handleToggle}
              />
              <div className={`block w-14 h-8 rounded-full transition-all duration-300 ${isPromptTune ? 'bg-secondary' : 'bg-blue-500'}`}></div>
              <div
                className={`absolute left-1 top-1 w-6 h-6 bg-primary rounded-full transition-transform duration-300 ease-in-out ${
                  isPromptTune ? 'transform translate-x-0' : 'transform translate-x-6'
                }`}
              ></div>
            </div>
          </label>
        </div>

        {/* Theme Toggle on the Right */}
        <div>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}