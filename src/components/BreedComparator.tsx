import React, { useState } from 'react';
import { Scale, ArrowRightLeft, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { INDIAN_BREEDS_DATABASE } from '../data/breedsData';
import { BreedEncyclopediaEntry } from '../types';

interface BreedComparatorProps {
  initialBreedA?: string;
  initialBreedB?: string;
}

export const BreedComparator: React.FC<BreedComparatorProps> = ({
  initialBreedA = 'Gir',
  initialBreedB = 'Sahiwal',
}) => {
  const [breedAName, setBreedAName] = useState(initialBreedA);
  const [breedBName, setBreedBName] = useState(initialBreedB);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breedA = INDIAN_BREEDS_DATABASE.find(b => b.name.toLowerCase() === breedAName.toLowerCase()) || INDIAN_BREEDS_DATABASE[0];
  const breedB = INDIAN_BREEDS_DATABASE.find(b => b.name.toLowerCase() === breedBName.toLowerCase()) || INDIAN_BREEDS_DATABASE[1];

  const handleSwap = () => {
    const temp = breedAName;
    setBreedAName(breedBName);
    setBreedBName(temp);
    setAiAnalysis(null);
  };

  const runAiDeepComparison = async () => {
    setIsLoadingAi(true);
    setError(null);
    try {
      const response = await fetch('/api/compare-breeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breedA: breedA.name,
          breedB: breedB.name,
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Could not fetch AI breed comparison');
      }

      const data = await response.json();
      setAiAnalysis(data.comparison);
    } catch (err: any) {
      console.error('Comparison error:', err);
      setError(err.message || 'Failed to generate comparison analysis');
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Comparator Header & Selectors */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              <span>Side-by-Side Bovine Breed Comparator</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Compare anatomical markers, lactation genetics, butterfat %, and climatic adaptation
            </p>
          </div>

          <button
            type="button"
            id="run-ai-comparison-btn"
            onClick={runAiDeepComparison}
            disabled={isLoadingAi}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
          >
            {isLoadingAi ? (
              <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-200" />
            )}
            <span>Generate Deep Veterinary Analysis</span>
          </button>
        </div>

        {/* Breed Selector Controls */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-6 items-center">
          {/* Select Breed A */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Select Primary Breed
            </label>
            <select
              id="select-breed-a"
              value={breedAName}
              onChange={(e) => {
                setBreedAName(e.target.value);
                setAiAnalysis(null);
              }}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              {INDIAN_BREEDS_DATABASE.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} ({b.species} - {b.purpose})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center md:col-span-1">
            <button
              type="button"
              id="swap-breeds-btn"
              onClick={handleSwap}
              title="Swap Breeds"
              className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all border border-stone-200"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Select Breed B */}
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Select Comparison Breed
            </label>
            <select
              id="select-breed-b"
              value={breedBName}
              onChange={(e) => {
                setBreedBName(e.target.value);
                setAiAnalysis(null);
              }}
              className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            >
              {INDIAN_BREEDS_DATABASE.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} ({b.species} - {b.purpose})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparison Grid Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Breed A Card */}
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="relative aspect-16/9 bg-stone-900">
            <img
              src={breedA.sampleImageUrl}
              alt={breedA.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
            <div className="absolute bottom-3 left-4 text-white">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-stone-950">
                {breedA.species} • {breedA.purpose}
              </span>
              <h3 className="text-2xl font-black mt-1">{breedA.name}</h3>
              <p className="text-xs text-stone-300">{breedA.originState} ({breedA.originRegion})</p>
            </div>
          </div>

          <div className="p-5 space-y-3.5 text-xs">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">ICAR-NBAGR Code</span>
              <span className="font-mono font-bold text-stone-900">{breedA.icarCode}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-bold block">Avg. Milk Yield</span>
                <span className="font-bold text-stone-900">{breedA.averageLactationKg}</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-bold block">Milk Fat %</span>
                <span className="font-bold text-stone-900">{breedA.milkFatPercent}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Horn Morphology</span>
              <p className="text-stone-700 bg-stone-50/70 p-2.5 rounded-xl border border-stone-200/60 leading-relaxed">
                {breedA.hornType}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Key Distinguishing Trait</span>
              <p className="text-amber-900 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 font-medium leading-relaxed">
                {breedA.specialTrait}
              </p>
            </div>
          </div>
        </div>

        {/* Breed B Card */}
        <div className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs">
          <div className="relative aspect-16/9 bg-stone-900">
            <img
              src={breedB.sampleImageUrl}
              alt={breedB.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 to-transparent" />
            <div className="absolute bottom-3 left-4 text-white">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-stone-950">
                {breedB.species} • {breedB.purpose}
              </span>
              <h3 className="text-2xl font-black mt-1">{breedB.name}</h3>
              <p className="text-xs text-stone-300">{breedB.originState} ({breedB.originRegion})</p>
            </div>
          </div>

          <div className="p-5 space-y-3.5 text-xs">
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">ICAR-NBAGR Code</span>
              <span className="font-mono font-bold text-stone-900">{breedB.icarCode}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-bold block">Avg. Milk Yield</span>
                <span className="font-bold text-stone-900">{breedB.averageLactationKg}</span>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                <span className="text-[10px] text-stone-500 font-bold block">Milk Fat %</span>
                <span className="font-bold text-stone-900">{breedB.milkFatPercent}</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Horn Morphology</span>
              <p className="text-stone-700 bg-stone-50/70 p-2.5 rounded-xl border border-stone-200/60 leading-relaxed">
                {breedB.hornType}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase text-stone-500 block mb-1">Key Distinguishing Trait</span>
              <p className="text-amber-900 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 font-medium leading-relaxed">
                {breedB.specialTrait}
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* AI Deep Comparative Evaluation Result */}
      {aiAnalysis && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-100">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-stone-900">
              Veterinary Comparative Report: {breedA.name} vs {breedB.name}
            </h3>
          </div>

          <div className="prose prose-sm max-w-none text-stone-700 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
            {aiAnalysis}
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

    </div>
  );
};
