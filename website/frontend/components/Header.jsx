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
    <div className="border-b w-full bg-blue-1000 text-white">
      <div className="flex items-center justify-between h-16 px-8">
        <div className="flex gap-x-6 items-center">
          <h2 className="text-lg font-semibold">{isPromptTune ? 'PromptTune' : 'ModelTune'}</h2>
          <p>by</p>
          <img
            src="https://raw.githubusercontent.com/Cloud-Code-AI/kaizen/main/assets/logo.png"
            className="h-8"
            alt="Kaizen Logo"
          />
        </div>

        {/* Mode Toggle in the Center */}
        <div className="flex justify-center">
          <label className="inline-flex items-center cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="hidden"
                checked={isPromptTune}
                onChange={handleToggle}
              />
              <div className={`block w-14 h-8 rounded-full transition-all duration-300 ${isPromptTune ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
              <div
                className={`absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ease-in-out ${
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