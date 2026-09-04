import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BreedScanner } from './components/BreedScanner';
import { BreedEncyclopedia } from './components/BreedEncyclopedia';
import { BreedComparator } from './components/BreedComparator';
import { VeterinaryAssistant } from './components/VeterinaryAssistant';
import { PWAInstallButton, OfflineIndicator } from './components/PWAInstallButton';
import { BreedRecognitionResult } from './types';
import { ShieldCheck, Info, Sparkles, Smartphone } from 'lucide-react';

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
    <div className="min-h-screen bg-stone-100/70 text-stone-900 flex flex-col font-sans selection:bg-amber-200">
      
      {/* Primary Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recentCount={history.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Top Banner / System Advisory */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-semibold">
              Indigenous Bovine Genetic Registry:
            </span>
            <span className="text-stone-700">
              Covers 15+ Bos indicus zebu cattle & 10+ Bubalus bubalis riverine buffalo breeds with ICAR-NBAGR accession metrics.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 font-medium text-amber-900 shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>A2 Milk & Morphological Standards</span>
            </div>
            <div className="hidden sm:block border-l border-amber-500/30 h-4 mx-1" />
            <PWAInstallButton variant="header" />
          </div>
        </div>

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
            <p className="text-[11px] text-stone-500 mt-0.5">
              Morphological pattern recognition based on ICAR-NBAGR descriptors for livestock conservation and dairy genomics.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-stone-500">
            <span>Powered by Gemini Multimodal Vision</span>
            <span>•</span>
            <span>Express + Vite</span>
            <span>•</span>
            <span>A2 Dairy Profiling</span>
          </div>
        </div>
      </footer>

      {/* Offline Status Toast */}
      <OfflineIndicator />

    </div>
  );
}
