export type BovineSpecies = 
  | 'Cattle (Bos indicus)' 
  | 'Buffalo (Bubalus bubalis)' 
  | 'Exotic / Crossbred Bovine' 
  | 'Non-Bovine / Unrecognized';

export type BreedPurpose = 'Dairy' | 'Draught' | 'Dual-Purpose';

export interface MorphologicalMarkers {
  horns: string;
  ears: string;
  humpAndDewlap: string;
  coatColorAndPattern: string;
  foreheadAndFace: string;
  bodyFrameAndStature: string;
  tailSwitch: string;
}

export interface ClassificationData {
  species: BovineSpecies;
  category: BreedPurpose;
  nativeTract: string;
  states: string[];
  icarNbagrCode: string;
  averageMilkYieldPerLactation: string;
  milkFatPercentage: string;
  conservationStatus: 'Abundant' | 'Stable' | 'Vulnerable' | 'Endangered' | 'Rare';
}

export interface ManagementGuide {
  climateSuitability: string;
  feedingRecommendations: string;
  commonDiseasesAndVaccination: string[];
  breedingTips: string;
  draughtOrDairyUtility: string;
}

export interface AlternativeMatch {
  breedName: string;
  confidence: number;
  differentiatingTraits: string;
}

export interface BreedRecognitionResult {
  id: string;
  timestamp: number;
  species: BovineSpecies;
  breedName: string;
  scientificName: string;
  confidenceScore: number;
  summaryVerdict: string;
  morphologicalMarkers: MorphologicalMarkers;
  classification: ClassificationData;
  managementAndCare: ManagementGuide;
  keyDistinguishingCharacteristics: string[];
  confidenceAnalysis: string;
  alternatePossibilities: AlternativeMatch[];
  imageUrl?: string;
}

export interface BreedEncyclopediaEntry {
  id: string;
  name: string;
  hindiName?: string;
  species: 'Cattle' | 'Buffalo';
  scientificName: string;
  purpose: BreedPurpose;
  originState: string;
  originRegion: string;
  icarCode: string;
  averageLactationKg: string;
  milkFatPercent: string;
  hornType: string;
  coatColor: string;
  specialTrait: string;
  description: string;
  sampleImageUrl: string;
  keyFeatures: string[];
}

export interface ChatExpertMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
