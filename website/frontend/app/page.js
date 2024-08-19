"use client"; 

import React, { useState } from 'react';
import Header from '@/components/Header';
import ModelTune from '../components/ModelTune';
import PromptTune from '../components/PromptTune'; // Import PromptTune
import IntroOverlay from '../components/IntroOverlay';
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Home() {
  const [isPromptTune, setIsPromptTune] = useState(true); // State to manage which component to render

  const handleToggle = (toggleState) => {
    setIsPromptTune(toggleState); // Update the state based on the toggle
  };

  return (
    <ThemeProvider> 
      <IntroOverlay />
      <main className="min-h-screen bg-background">
        <Header onToggle={handleToggle} />
        {/* Render the active component based on the toggle state */}
        <div className="mt-4">
          {isPromptTune ? <PromptTune /> : <ModelTune />}
        </div>
      </main>
    </ThemeProvider>
  );
}