import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  MapPin, 
  Milk, 
  Percent, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ChevronRight, 
  HelpCircle,
  FileText,
  MessageSquare,
  Activity
} from 'lucide-react';
import { BreedRecognitionResult } from '../types';

interface ScanResultCardProps {
  result: BreedRecognitionResult;
  onConsultVet: (breedName: string) => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ result, onConsultVet }) => {
  const isNonBovine = result.species === 'Non-Bovine / Unrecognized';

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-300';
    if (score >= 70) return 'text-amber-700 bg-amber-50 border-amber-300';
    return 'text-rose-700 bg-rose-50 border-rose-300';
  };

  const getConfidenceBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  if (isNonBovine) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6 text-stone-800 shadow-sm">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-amber-950">
              Non-Bovine or Unclear Image Detected
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed">
              {result.summaryVerdict || 'The AI model could not confirm an indigenous Indian cattle (Bos indicus) or buffalo (Bubalus bubalis) in this picture.'}
            </p>
            <div className="pt-2 text-xs text-stone-600 bg-white/70 p-3 rounded-xl border border-amber-200">
              <strong>Tip for best livestock breed recognition:</strong>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-stone-700">
                <li>Upload a clear lateral (side-profile) photo showing the whole body, head, horns, and hump.</li>
                <li>Ensure the animal is well-lit with clear view of the forehead, dewlap, and coat patterns.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden divide-y divide-stone-100">
      
      {/* Top Banner / Verdict Header */}
      <div className="p-5 sm:p-7 bg-stone-900 text-white relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                {result.species}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-800 text-stone-300 border border-stone-700">
                {result.classification.category} Breed
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                ICAR: {result.classification.icarNbagrCode || 'NBAGR Registered'}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {result.breedName}
              </h2>
              <span className="text-sm italic text-stone-400 font-serif">
                ({result.scientificName})
              </span>
            </div>

            <p className="text-sm text-stone-300 mt-1 max-w-2xl leading-relaxed">
              {result.summaryVerdict}
            </p>
          </div>

          {/* Confidence Score Pill */}
          <div className="flex flex-col items-start md:items-end justify-center shrink-0">
            <div className="flex items-center gap-2 bg-stone-800/90 px-4 py-2 rounded-2xl border border-stone-700">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                  AI Match Confidence
                </span>
                <span className="text-xl font-black text-amber-400">
                  {Math.round(result.confidenceScore)}%
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <div className="w-36 h-2 bg-stone-800 rounded-full mt-2 overflow-hidden">
              <div 
                className={`h-full ${getConfidenceBarColor(result.confidenceScore)} transition-all duration-700`}
                style={{ width: `${Math.min(100, Math.max(5, result.confidenceScore))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Productivity & Geographical Origin strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 sm:p-6 bg-stone-50/70">
        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold mb-1">
            <MapPin className="w-3.5 h-3.5 text-amber-600" />
            <span>Native Tract</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
            {result.classification.nativeTract}
          </p>
          <p className="text-[10px] text-stone-500 mt-0.5">
            {result.classification.states?.join(', ')}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold mb-1">
            <Milk className="w-3.5 h-3.5 text-blue-600" />
            <span>Lactation Yield</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
            {result.classification.averageMilkYieldPerLactation}
          </p>
          <p className="text-[10px] text-stone-500 mt-0.5">
            A2 beta-casein profile
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold mb-1">
            <Percent className="w-3.5 h-3.5 text-emerald-600" />
            <span>Butterfat Content</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
            {result.classification.milkFatPercentage}
          </p>
          <p className="text-[10px] text-stone-500 mt-0.5">
            High SNF & ghee value
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-stone-200/80">
          <div className="flex items-center gap-1.5 text-stone-500 text-xs font-semibold mb-1">
            <Activity className="w-3.5 h-3.5 text-purple-600" />
            <span>Status</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-stone-900 leading-tight">
            {result.classification.conservationStatus || 'Stable'}
          </p>
          <p className="text-[10px] text-stone-500 mt-0.5">
            ICAR-NBAGR Classification
          </p>
        </div>
      </div>
      
      {/* Key Distinguishing Features */}
      {result.keyDistinguishingCharacteristics && result.keyDistinguishingCharacteristics.length > 0 && (
        <div className="p-5 sm:p-6 bg-amber-50/40">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            Key Morphological Identifiers Observed
          </h3>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {result.keyDistinguishingCharacteristics.map((trait, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white/90 p-2.5 rounded-xl border border-amber-200/60 text-xs text-stone-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium">{trait}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Morphological Feature Breakdown Grid */}
      <div className="p-5 sm:p-7">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4 flex items-center justify-between">
          <span>Anatomical & Morphological Examination</span>
          <span className="text-xs font-normal normal-case text-stone-500">
            Based on ICAR breed descriptors
          </span>
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800 block mb-1">
              Horns & Poll
            </span>
            <p className="text-xs text-stone-800 font-medium leading-relaxed">
              {result.morphologicalMarkers.horns || 'Not explicitly visible or polled'}
            </p>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800 block mb-1">
              Ears & Ear-Notch
            </span>
            <p className="text-xs text-stone-800 font-medium leading-relaxed">
              {result.morphologicalMarkers.ears}
            </p>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800 block mb-1">
              Hump & Dewlap (Bos indicus)
            </span>
            <p className="text-xs text-stone-800 font-medium leading-relaxed">
              {result.morphologicalMarkers.humpAndDewlap}
            </p>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800 block mb-1">
              Coat Color & Markings
            </span>
            <p className="text-xs text-stone-800 font-medium leading-relaxed">
              {result.morphologicalMarkers.coatColorAndPattern}
            </p>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800 block mb-1">
              Forehead & Cranial Dome
            </span>
            <p className="text-xs text-stone-800 font-medium leading-relaxed">
              {result.morphologicalMarkers.foreheadAndFace}
            </p>
          </div>

          <div className="bg-stone-50/80 p-3.5 rounded-2xl border border-stone-200/80">
            <span className="text-[11px] font-bold uppercase tracking-wide text-amber-800 block mb-1">
              Body Frame & Stature
            </span>
            <p className="text-xs text-stone-800 font-medium leading-relaxed">
              {result.morphologicalMarkers.bodyFrameAndStature}
            </p>
          </div>
        </div>
      </div>

      {/* Differential Diagnosis / Alternative Possibilities */}
      {result.alternatePossibilities && result.alternatePossibilities.length > 0 && (
        <div className="p-5 sm:p-7 bg-stone-50/50">
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-3 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-stone-500" />
            Differential Diagnosis (Alternative Candidates)
          </h3>
          <div className="space-y-2">
            {result.alternatePossibilities.map((alt, idx) => (
              <div key={idx} className="bg-white p-3 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900">{alt.breedName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 text-stone-600">
                    {Math.round(alt.confidence)}% similarity
                  </span>
                </div>
                <div className="text-stone-600 font-medium">
                  <span className="text-stone-400 mr-1">Differentiating factor:</span>
                  {alt.differentiatingTraits}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Management & Care Recommendations */}
      <div className="p-5 sm:p-7">
        <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 mb-4">
          Husbandry, Feeding & Veterinary Care
        </h3>
        
        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <span className="font-bold text-stone-800 block">Climate & Housing</span>
            <p className="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/70">
              {result.managementAndCare?.climateSuitability}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-stone-800 block">Recommended Ration & Feeding</span>
            <p className="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/70">
              {result.managementAndCare?.feedingRecommendations}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-stone-800 block">Vaccination & Immunity Priorities</span>
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/70 text-stone-600 space-y-1">
              {result.managementAndCare?.commonDiseasesAndVaccination?.map((disease, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{disease}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="font-bold text-stone-800 block">Breeding & Conservation Tip</span>
            <p className="text-stone-600 leading-relaxed bg-stone-50 p-3 rounded-xl border border-stone-200/70">
              {result.managementAndCare?.breedingTips}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-6 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs text-stone-500">
          Scientific Reference: ICAR-NBAGR India Registered Indigenous Germplasm.
        </span>

        <button
          type="button"
          id="consult-vet-btn"
          onClick={() => onConsultVet(result.breedName)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-sm transition-all"
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>Consult AI Vet on {result.breedName} Care</span>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
        </button>
      </div>

    </div>
  );
};
