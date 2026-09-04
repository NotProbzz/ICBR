import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Sparkles, 
  RefreshCw, 
  X, 
  Scan, 
  Image as ImageIcon, 
  CheckCircle,
  HelpCircle,
  History,
  Trash2
} from 'lucide-react';
import { BreedRecognitionResult } from '../types';
import { ScanResultCard } from './ScanResultCard';
import { SampleImagePicker } from './SampleImagePicker';

interface BreedScannerProps {
  onScanComplete: (result: BreedRecognitionResult) => void;
  onConsultVet: (breedName: string) => void;
  history: BreedRecognitionResult[];
  onClearHistory: () => void;
}

export const BreedScanner: React.FC<BreedScannerProps> = ({ 
  onScanComplete, 
  onConsultVet, 
  history, 
  onClearHistory 
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState('Initializing vision model...');
  const [currentResult, setCurrentResult] = useState<BreedRecognitionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera when unmounting
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check browser permissions or upload a file.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setSelectedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setErrorMessage(null);
      setCurrentResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleSelected = async (sampleUrl: string, breedHint: string) => {
    setErrorMessage(null);
    setCurrentResult(null);
    setUserNotes(`Sample verification: ${breedHint}`);
    
    // Set immediate preview
    setSelectedImage(sampleUrl);

    try {
      // Try to fetch sample and convert to base64
      const response = await fetch(sampleUrl);
      if (response.ok) {
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setSelectedImage(base64data);
          runRecognition(base64data, `Sample verification of ${breedHint}`);
        };
        reader.readAsDataURL(blob);
        return;
      }
    } catch (err) {
      console.warn('Direct client fetch failed; delegating URL to backend:', err);
    }
    // Fallback: send sampleUrl directly, server will download and process
    runRecognition(sampleUrl, `Sample verification of ${breedHint}`);
  };

  const runRecognition = async (imageDataToUse?: string, notesOverride?: string) => {
    const img = imageDataToUse || selectedImage;
    if (!img) {
      setErrorMessage('Please upload an image or take a photo first.');
      return;
    }

    setIsScanning(true);
    setErrorMessage(null);
    setCurrentResult(null);

    // Progress animations
    const steps = [
      'Detecting bovine anatomical contours...',
      'Analyzing horn orientation, curvature & poll...',
      'Inspecting thoracic hump, dewlap & umbilical flap...',
      'Mapping cranial dome, ear morphology & coat pigment...',
      'Benchmarking against ICAR-NBAGR Indigenous Breed Registry...',
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      stepIdx = (stepIdx + 1) % steps.length;
      setScanStepMessage(steps[stepIdx]);
    }, 1100);

    try {
      const response = await fetch('/api/recognize-breed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: img,
          userNotes: notesOverride !== undefined ? notesOverride : userNotes,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Server error during breed recognition');
      }

      const data: BreedRecognitionResult = await response.json();
      data.imageUrl = img;
      setCurrentResult(data);
      onScanComplete(data);
    } catch (err: any) {
      clearInterval(interval);
      console.error('Scan error:', err);
      let msg = err.message || 'Failed to complete recognition. Please try another image.';
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.error?.message) {
          msg = parsed.error.message;
        } else if (parsed?.error && typeof parsed.error === 'string') {
          msg = parsed.error;
        }
      } catch {}
      setErrorMessage(msg);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Main Upload / Camera Area */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Bovine Breed Image Recognition
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Upload a photograph of cattle or buffalo to analyze anatomical traits and identify indigenous breed
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isCameraActive ? (
              <button
                type="button"
                id="start-camera-btn"
                onClick={startCamera}
                disabled={isScanning}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-all disabled:opacity-50"
              >
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Open Live Camera</span>
              </button>
            ) : (
              <button
                type="button"
                id="stop-camera-btn"
                onClick={stopCamera}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white text-xs font-semibold transition-all"
              >
                <X className="w-4 h-4 text-rose-400" />
                <span>Close Camera</span>
              </button>
            )}

            <button
              type="button"
              id="upload-file-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isScanning}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Photo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>

        {/* Live Camera Viewfinder */}
        {isCameraActive && (
          <div className="mt-6 relative rounded-2xl overflow-hidden bg-black aspect-4/3 max-w-xl mx-auto border-2 border-amber-500">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Alignment overlay crosshair */}
            <div className="absolute inset-0 pointer-events-none border-2 border-dashed border-amber-400/50 m-6 rounded-xl flex items-center justify-center">
              <div className="text-center px-4 py-2 rounded-lg bg-black/60 backdrop-blur-xs text-amber-200 text-xs font-medium">
                Align cattle side-profile (head, horns & hump)
              </div>
            </div>

            <div className="absolute bottom-4 inset-x-0 flex justify-center">
              <button
                type="button"
                id="capture-photo-btn"
                onClick={capturePhoto}
                className="px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-bold shadow-lg flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Snapshot</span>
              </button>
            </div>
          </div>
        )}

        {cameraError && (
          <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
            {cameraError}
          </div>
        )}

        {/* Selected Image Stage / Drag & Drop Dropzone */}
        {!isCameraActive && (
          <div className="mt-6">
            {selectedImage ? (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-stone-900 max-w-xl mx-auto">
                <div className="relative aspect-4/3 sm:aspect-16/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Livestock candidate"
                    className="w-full h-full object-contain"
                  />

                  {/* Scanning HUD overlay when active */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-stone-950/75 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
                      <div className="relative mb-4">
                        <div className="w-16 h-16 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
                        <Scan className="w-7 h-7 text-amber-400 absolute inset-0 m-auto animate-pulse" />
                      </div>
                      <p className="text-sm font-bold text-amber-300">
                        {scanStepMessage}
                      </p>
                      <p className="text-xs text-stone-400 mt-1 max-w-xs">
                        Gemini AI multimodal vision model running morphological feature extraction
                      </p>
                    </div>
                  )}
                </div>

                {/* Image Actions Bar */}
                <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-stone-400 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                    Ready for AI recognition
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    disabled={isScanning}
                    className="text-stone-400 hover:text-rose-400 transition-colors"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-300 hover:border-amber-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all bg-stone-50/50 hover:bg-amber-50/30"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100/80 text-amber-700 flex items-center justify-center mx-auto mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-stone-900">
                  Drop a livestock photo here, or click to browse
                </h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Supports high-resolution photos (JPG, PNG, WebP). For best accuracy, capture lateral full-body or head & horn profile.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Optional Notes & Trigger Scan Button */}
        {selectedImage && !isScanning && (
          <div className="mt-6 max-w-xl mx-auto space-y-4">
            <div>
              <label htmlFor="user-notes" className="block text-xs font-semibold text-stone-700 mb-1">
                Field Observations / Region (Optional)
              </label>
              <input
                id="user-notes"
                type="text"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder="e.g., Sourced from Saurashtra; heavy milk producer; crescent horns"
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
            </div>

            <button
              type="button"
              id="run-recognition-btn"
              onClick={() => runRecognition()}
              className="w-full py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-sm font-bold shadow-md shadow-amber-900/10 flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>Run ICAR Breed Recognition AI</span>
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 max-w-xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 min-w-0">
              <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Recognition Notice: </span>
                <span>{errorMessage}</span>
              </div>
            </div>
            {selectedImage && (
              <button
                type="button"
                id="retry-recognition-btn"
                onClick={() => runRecognition()}
                disabled={isScanning}
                className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-colors disabled:opacity-50 text-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Quick Test Samples Picker */}
      <SampleImagePicker 
        onSelectSample={handleSampleSelected} 
        disabled={isScanning} 
      />

      {/* Recognition Result Card Display */}
      {currentResult && (
        <div id="recognition-result-section" className="scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-stone-900">
                Breed Identification Report
              </h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedImage(null);
                setCurrentResult(null);
              }}
              className="text-xs text-stone-500 hover:text-stone-800 font-medium"
            >
              Scan Another Specimen
            </button>
          </div>

          <ScanResultCard 
            result={currentResult} 
            onConsultVet={onConsultVet} 
          />
        </div>
      )}

      {/* Recent Scans History Section */}
      {history.length > 0 && (
        <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-stone-600" />
              <h3 className="text-sm font-bold text-stone-900">
                Recent Scans in Current Session ({history.length})
              </h3>
            </div>
            <button
              type="button"
              id="clear-history-btn"
              onClick={onClearHistory}
              className="text-xs text-stone-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {history.slice(0, 6).map((item) => (
              <div
                key={item.id}
                onClick={() => setCurrentResult(item)}
                className="bg-white p-3 rounded-2xl border border-stone-200 hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer flex items-center gap-3"
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.breedName}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 bg-stone-100"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-stone-900 truncate">
                      {item.breedName}
                    </p>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {Math.round(item.confidenceScore)}%
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 truncate">
                    {item.classification?.nativeTract || item.species}
                  </p>
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
