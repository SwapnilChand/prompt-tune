"use client"; 

import PromptTune from '../components/PromptTune';
import { ThemeProvider } from "@/components/theme-provider";

export default function Home() {
  return (
    <ThemeProvider> 
      <main className="min-h-screen bg-background">
        <PromptTune />
      </main>
    </ThemeProvider>
  );
}
