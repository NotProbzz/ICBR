import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BreedScanner } from './components/BreedScanner';
import { BreedEncyclopedia } from './components/BreedEncyclopedia';
import { BreedComparator } from './components/BreedComparator';
import { VeterinaryAssistant } from './components/VeterinaryAssistant';
import { BreedRecognitionResult } from './types';
import { BackgroundSlideshow } from './components/BackgroundSlideshow';

const LOCAL_STORAGE_HISTORY_KEY = 'bovine_breed_scan_history_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'encyclopedia' | 'comparator' | 'veterinary'>('scanner');
  const [history, setHistory] = useState<BreedRecognitionResult[]>([]);
  const [activeBreedContext, setActiveBreedContext] = useState<string | null>(null);
  const [comparatorBreedA, setComparatorBreedA] = useState('Gir');
  const [comparatorBreedB, setComparatorBreedB] = useState('Sahiwal');

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading history:', e);
    }
  }, []);

  const handleScanComplete = (result: BreedRecognitionResult) => {
    setActiveBreedContext(result.breedName);
    setHistory((prev) => {
      const updated = [result, ...prev.filter(h => h.id !== result.id)].slice(0, 20);
      try {
        localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving history:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_HISTORY_KEY);
    } catch (e) {
      console.error('Error clearing history:', e);
    }
  };

  const handleConsultVet = (breedName: string) => {
    setActiveBreedContext(breedName);
    setActiveTab('veterinary');
  };

  const handleSelectBreedForScan = (imageUrl: string, breedName: string) => {
    setActiveTab('scanner');
    // The scanner can trigger scan with the sample
  };

  const handleCompareBreed = (breedName: string) => {
    setComparatorBreedA(breedName);
    setActiveTab('comparator');
  };

  return (
    <div className="min-h-screen text-stone-100 flex flex-col font-sans selection:bg-amber-500/30 relative">
      <BackgroundSlideshow />
      
      <div className="relative z-10 flex flex-col min-h-screen">
      {/* Primary Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recentCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* View Switching */}
        {activeTab === 'scanner' && (
          <BreedScanner
            onScanComplete={handleScanComplete}
            onConsultVet={handleConsultVet}
            history={history}
            onClearHistory={handleClearHistory}
          />
        )}

        {activeTab === 'encyclopedia' && (
          <BreedEncyclopedia
            onSelectForScan={handleSelectBreedForScan}
            onCompareWith={handleCompareBreed}
          />
        )}

        {activeTab === 'comparator' && (
          <BreedComparator
            initialBreedA={comparatorBreedA}
            initialBreedB={comparatorBreedB}
          />
        )}

        {activeTab === 'veterinary' && (
          <VeterinaryAssistant
            initialBreedContext={activeBreedContext}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-400 text-xs py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-stone-200">
              Indian Cattle & Buffalo Breed Recognition System (PashuPehchan AI)
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5 max-w-xl">
              Morphological pattern recognition based on ICAR-NBAGR descriptors for livestock conservation and dairy genomics.
            </p>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
