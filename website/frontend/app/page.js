"use client"; 

import React, { useState } from 'react';
import Header from '@/components/Header';
import ModelTune from '../components/ModelTune';
import PromptTune from '../components/PromptTune';
import IntroOverlay from '../components/IntroOverlay';
import { ThemeProvider } from "@/components/ThemeProvider";
import ConfirmationDialog from '../components/ConfirmationDialog'; // Import the dialog
import { ToastProvider } from "@/components/ui/toast"; // Adjust the import based on your structure

export default function Home() {
  const [isPromptTune, setIsPromptTune] = useState(true); // State to manage which component to render
  const [showDialog, setShowDialog] = useState(false); // State to manage the dialog visibility

  const handleToggle = () => {
    setShowDialog(true); // Show the confirmation dialog
  };

  const handleConfirmToggle = () => {
    setIsPromptTune(prev => !prev); // Toggle the component
    setShowDialog(false); // Close the dialog
  };

  const handleCancelToggle = () => {
    setShowDialog(false); // Close the dialog without toggling
  };

  return (
    <ToastProvider>
      <ThemeProvider>
        <IntroOverlay />
        <main className="min-h-screen bg-background">
          <Header onToggle={handleToggle} />
          <div className="mt-4">
            {isPromptTune ? <PromptTune /> : <ModelTune />}
          </div>
          {/* Show the confirmation dialog if needed */}
          {showDialog && (
            <ConfirmationDialog
              onConfirm={handleConfirmToggle}
              onCancel={handleCancelToggle}
            />
          )}
        </main>
      </ThemeProvider>
    </ToastProvider>
  );
}