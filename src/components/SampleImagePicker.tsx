import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { INDIAN_BREEDS_DATABASE } from '../data/breedsData';

interface SampleImagePickerProps {
  onSelectSample: (imageUrl: string, breedHint: string) => void;
  disabled?: boolean;
}

export const SampleImagePicker: React.FC<SampleImagePickerProps> = ({ onSelectSample, disabled }) => {
  // Select 6 prime distinctive breeds as immediate test subjects
  const sampleBreeds = INDIAN_BREEDS_DATABASE.filter(b => 
    ['gir', 'murrah', 'sahiwal', 'kankrej', 'jaffarabadi', 'ongole'].includes(b.id)
  );

  return (
    <div className="bg-stone-50/70 border border-stone-200/80 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h3 className="text-sm font-semibold text-stone-900">
            Quick Test with Verified Breed Samples
          </h3>
        </div>
        <span className="text-xs text-stone-500">
          Click any specimen to run instant AI recognition
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {sampleBreeds.map((breed) => (
          <button
            key={breed.id}
            type="button"
            id={`sample-breed-${breed.id}`}
            disabled={disabled}
            onClick={() => onSelectSample(breed.sampleImageUrl, breed.name)}
            className="group text-left relative overflow-hidden rounded-xl border border-stone-200 bg-white p-2 transition-all hover:border-amber-400 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex flex-col"
          >
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-stone-100 mb-2">
              <img
                src={breed.sampleImageUrl}
                alt={breed.name}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
              <span className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide ${
                breed.species === 'Cattle' 
                  ? 'bg-amber-100/90 text-amber-900 border border-amber-300'
                  : 'bg-stone-900/90 text-white'
              }`}>
                {breed.species}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-stone-900 leading-tight group-hover:text-amber-700">
                  {breed.name}
                </p>
                <p className="text-[10px] text-stone-500 font-medium">
                  {breed.purpose}
                </p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-stone-400 group-hover:text-amber-600 transform transition-transform group-hover:translate-x-0.5" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
