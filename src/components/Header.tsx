import React, { useState } from 'react';
import { Camera, BookOpen, Scale, MessageSquareHeart, ShieldCheck, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: 'scanner' | 'encyclopedia' | 'comparator' | 'veterinary';
  setActiveTab: (tab: 'scanner' | 'encyclopedia' | 'comparator' | 'veterinary') => void;
  recentCount: number;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, recentCount }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabChange = (tab: 'scanner' | 'encyclopedia' | 'comparator' | 'veterinary') => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'scanner', label: 'AI Scanner', icon: Camera, showBadge: recentCount > 0 },
    { id: 'encyclopedia', label: 'Encyclopedia', icon: BookOpen, showBadge: false },
    { id: 'comparator', label: 'Compare', icon: Scale, showBadge: false },
    { id: 'veterinary', label: 'Vet Expert', icon: MessageSquareHeart, showBadge: false },
  ] as const;

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-900/20">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                {/* Custom Bovine Logo SVG Path */}
                <path d="M12,2C8.5,2,5.7,3.9,4.2,6.5c-0.2,0.4-0.1,0.9,0.2,1.2l2.3,2c0.2,0.2,0.5,0.3,0.8,0.3h1c0.4,0,0.8,0.1,1.1,0.3 C10.1,10.6,11,11,12,11s1.9-0.4,2.5-0.8C14.8,10.1,15.2,10,15.6,10h1c0.3,0,0.6-0.1,0.8-0.3l2.3-2c0.3-0.3,0.4-0.8,0.2-1.2 C18.3,3.9,15.5,2,12,2z M4,9c0,0-2.5,1.5-3,4.5c-0.5,2.9,1.5,4.5,1.5,4.5s1.5-2,1.5-3C4,14,4,9,4,9z M20,9c0,0,2.5,1.5,3,4.5 c0.5,2.9-1.5,4.5-1.5,4.5s-1.5-2-1.5-3C20,14,20,9,20,9z M12,13c-2.8,0-5,2.2-5,5s2.2,5,5,5s5-2.2,5-5S14.8,13,12,13z M12,21 c-1.7,0-3-1.3-3-3s1.3-3,3-3s3,1.3,3,3S13.7,21,12,21z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight text-white">
                  BovineAI
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800/60">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  ICAR-NBAGR Aligned
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Image-Based Recognition of Indigenous Cattle
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <nav className="flex items-center p-1 bg-stone-950/80 rounded-xl border border-stone-800 text-xs font-medium">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  id={`nav-${item.id}-btn`}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === item.id
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {item.showBadge && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-800 text-amber-200">
                      {recentCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 -mr-2 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-stone-800 animate-in slide-in-from-top-2 fade-in duration-200">
            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-amber-600/20 text-amber-400 border border-amber-600/30'
                      : 'text-stone-300 hover:bg-stone-800/50 border border-transparent'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                  {item.showBadge && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-xs bg-amber-800 text-amber-200">
                      {recentCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
