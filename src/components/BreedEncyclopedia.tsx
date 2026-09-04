import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  MapPin, 
  Milk, 
  Percent, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  Info
} from 'lucide-react';
import { INDIAN_BREEDS_DATABASE } from '../data/breedsData';
import { BreedEncyclopediaEntry } from '../types';

interface BreedEncyclopediaProps {
  onSelectForScan: (imageUrl: string, breedName: string) => void;
  onCompareWith: (breedName: string) => void;
}

export const BreedEncyclopedia: React.FC<BreedEncyclopediaProps> = ({ 
  onSelectForScan,
  onCompareWith
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState<'All' | 'Cattle' | 'Buffalo'>('All');
  const [purposeFilter, setPurposeFilter] = useState<'All' | 'Dairy' | 'Draught' | 'Dual-Purpose'>('All');
  const [selectedBreedId, setSelectedBreedId] = useState<string | null>(null);

  const filteredBreeds = useMemo(() => {
    return INDIAN_BREEDS_DATABASE.filter((breed) => {
      // Species match
      if (speciesFilter !== 'All' && breed.species !== speciesFilter) {
        return false;
      }
      // Purpose match
      if (purposeFilter !== 'All' && breed.purpose !== purposeFilter) {
        return false;
      }
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = breed.name.toLowerCase().includes(q);
        const matchesHindi = breed.hindiName?.toLowerCase().includes(q);
        const matchesState = breed.originState.toLowerCase().includes(q);
        const matchesTract = breed.originRegion.toLowerCase().includes(q);
        const matchesTrait = breed.specialTrait.toLowerCase().includes(q);
        const matchesHorns = breed.hornType.toLowerCase().includes(q);
        return matchesName || matchesHindi || matchesState || matchesTract || matchesTrait || matchesHorns;
      }
      return true;
    });
  }, [searchQuery, speciesFilter, purposeFilter]);

  return (
    <div className="space-y-6">
      
      {/* Header & Filter Controls */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-7 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>National Bureau of Animal Genetic Resources (NBAGR) Catalog</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Curated encyclopedia of indigenous Indian cattle (Bos indicus) and buffalo (Bubalus bubalis) breeds
            </p>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Showing <strong className="text-stone-900">{filteredBreeds.length}</strong> of {INDIAN_BREEDS_DATABASE.length} registered breeds
          </div>
        </div>

        {/* Filter controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-5">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="encyclopedia-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by breed, state, horns, traits..."
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
            />
          </div>

          {/* Species Filter */}
          <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-semibold">
            {(['All', 'Cattle', 'Buffalo'] as const).map((spec) => (
              <button
                key={spec}
                type="button"
                id={`filter-species-${spec.toLowerCase()}`}
                onClick={() => setSpeciesFilter(spec)}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  speciesFilter === spec
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {spec === 'All' ? 'All Bovine' : spec}
              </button>
            ))}
          </div>

          {/* Purpose Filter */}
          <div className="flex rounded-xl bg-stone-100 p-1 text-xs font-semibold">
            {(['All', 'Dairy', 'Dual-Purpose', 'Draught'] as const).map((purp) => (
              <button
                key={purp}
                type="button"
                id={`filter-purpose-${purp.toLowerCase()}`}
                onClick={() => setPurposeFilter(purp)}
                className={`flex-1 py-1.5 rounded-lg transition-all ${
                  purposeFilter === purp
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {purp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Breeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBreeds.map((breed) => {
          const isExpanded = selectedBreedId === breed.id;

          return (
            <div
              key={breed.id}
              className="bg-white border border-stone-200 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image Banner */}
                <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-900">
                  <img
                    src={breed.sampleImageUrl}
                    alt={breed.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
                  
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      breed.species === 'Cattle'
                        ? 'bg-amber-500 text-stone-950'
                        : 'bg-stone-950 text-white border border-stone-700'
                    }`}>
                      {breed.species} ({breed.scientificName})
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-900/90 text-stone-200 border border-stone-700">
                      {breed.purpose}
                    </span>
                  </div>

                  <div className="absolute bottom-3 inset-x-3 text-white">
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-xl font-black text-white">
                        {breed.name}
                      </h3>
                      {breed.hindiName && (
                        <span className="text-xs text-amber-300 font-medium">
                          {breed.hindiName}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-300 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                      <span className="truncate">{breed.originState} • {breed.originRegion}</span>
                    </p>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 space-y-4">
                  {/* ICAR Code Badge */}
                  <div className="flex items-center justify-between text-[11px] bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200/80">
                    <span className="text-stone-500 flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      ICAR Registration
                    </span>
                    <span className="font-mono font-bold text-stone-800">
                      {breed.icarCode}
                    </span>
                  </div>

                  {/* Production Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200/60">
                      <div className="text-[10px] text-stone-500 font-semibold flex items-center gap-1 mb-0.5">
                        <Milk className="w-3 h-3 text-blue-600" />
                        Avg. Lactation
                      </div>
                      <span className="font-bold text-stone-900">
                        {breed.averageLactationKg}
                      </span>
                    </div>

                    <div className="bg-stone-50/80 p-2.5 rounded-xl border border-stone-200/60">
                      <div className="text-[10px] text-stone-500 font-semibold flex items-center gap-1 mb-0.5">
                        <Percent className="w-3 h-3 text-emerald-600" />
                        Milk Fat %
                      </div>
                      <span className="font-bold text-stone-900">
                        {breed.milkFatPercent}
                      </span>
                    </div>
                  </div>

                  {/* Horn Morphology & Visual Hallmarks */}
                  <div className="text-xs space-y-2">
                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">
                        Horn Architecture:
                      </span>
                      <p className="text-stone-600 leading-relaxed text-[11px] mt-0.5">
                        {breed.hornType}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-stone-800 block text-[11px]">
                        Distinctive Breed Marker:
                      </span>
                      <p className="text-amber-900 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60 text-[11px] leading-relaxed">
                        {breed.specialTrait}
                      </p>
                    </div>
                  </div>

                  {/* Expandable Key Features */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-stone-100 text-xs space-y-2">
                      <span className="font-bold text-stone-900 block text-[11px]">
                        Anatomical Descriptors:
                      </span>
                      <ul className="space-y-1 text-[11px] text-stone-600">
                        {breed.keyFeatures.map((kf, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                            <span>{kf}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-[11px] text-stone-600 italic pt-1 border-t border-stone-100">
                        {breed.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-stone-50/80 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBreedId(isExpanded ? null : breed.id)}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1"
                >
                  <span>{isExpanded ? 'Less' : 'Anatomy'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onCompareWith(breed.name)}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-stone-700 bg-white border border-stone-200 hover:bg-stone-100 transition-all"
                  >
                    Compare
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectForScan(breed.sampleImageUrl, breed.name)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 shadow-xs transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-amber-200" />
                    <span>Test Scan</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
