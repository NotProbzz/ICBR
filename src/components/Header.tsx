import React from 'react';
import { Camera, BookOpen, Scale, MessageSquareHeart, ShieldCheck, Sparkles } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'scanner' | 'encyclopedia' | 'comparator' | 'veterinary';
  setActiveTab: (tab: 'scanner' | 'encyclopedia' | 'comparator' | 'veterinary') => void;
  recentCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, recentCount }) => {
  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-3 gap-4">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  Indian Bovine Breed AI
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  ICAR-NBAGR Aligned
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Image-Based Recognition of Indigenous Cattle & Buffaloes
              </p>
            </div>
          </div>

          {/* Navigation & Install Button */}
          <div className="flex items-center flex-wrap justify-center gap-2.5">
            <nav className="flex items-center p-1 bg-stone-950/80 rounded-xl border border-stone-800 text-xs font-medium">
              <button
                id="nav-scanner-btn"
                onClick={() => setActiveTab('scanner')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'scanner'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>AI Scanner</span>
                {recentCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-800 text-amber-200">
                    {recentCount}
                  </span>
                )}
              </button>

              <button
                id="nav-encyclopedia-btn"
                onClick={() => setActiveTab('encyclopedia')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'encyclopedia'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Encyclopedia</span>
              </button>

              <button
                id="nav-comparator-btn"
                onClick={() => setActiveTab('comparator')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'comparator'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                <Scale className="w-4 h-4" />
                <span>Compare</span>
              </button>

              <button
                id="nav-veterinary-btn"
                onClick={() => setActiveTab('veterinary')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'veterinary'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
              >
                <MessageSquareHeart className="w-4 h-4" />
                <span>Vet Expert</span>
              </button>
            </nav>

            {/* Android / Mobile App Download CTA */}
            <PWAInstallButton variant="header" />
          </div>

        </div>
      </div>
    </header>
  );
};
