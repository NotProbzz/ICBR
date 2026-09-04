import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
  Smartphone, 
  Download, 
  QrCode, 
  Copy, 
  Check, 
  X, 
  ShieldCheck, 
  Camera, 
  WifiOff, 
  Zap, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

interface AndroidDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  isInstallable: boolean;
  isInstalled: boolean;
  onInstallPrompt: () => Promise<boolean>;
}

export const AndroidDownloadModal: React.FC<AndroidDownloadModalProps> = ({
  isOpen,
  onClose,
  isInstallable,
  isInstalled,
  onInstallPrompt,
}) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [installing, setInstalling] = useState(false);
  const [activeTab, setActiveTab] = useState<'apk' | 'qr' | 'manual' | 'specs'>('apk');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.href;
      setCurrentUrl(url);
      QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        color: {
          dark: '#064E3B',
          light: '#FFFFFF',
        },
      })
        .then((dataUrl) => setQrDataUrl(dataUrl))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleNativeInstall = async () => {
    setInstalling(true);
    try {
      const success = await onInstallPrompt();
      if (success) {
        onClose();
      }
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-emerald-200 hover:text-white hover:bg-emerald-700/50 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center p-1.5 shadow-inner">
              <img src="/icon.svg" alt="App Icon" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/60 text-emerald-200 text-xs font-medium mb-1">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Android PWA & WebAPK</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Download Bovine AI for Android
              </h2>
            </div>
          </div>

          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
            Install the full application directly onto your Android device. Launches standalone with instant camera scanner and offline ICAR breed encyclopedia.
          </p>
        </div>

        {/* Primary Action if Directly Installable on Mobile */}
        {isInstallable && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-sm text-emerald-900 font-medium">
              <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Your browser is ready for 1-tap Android installation!</span>
            </div>
            <button
              onClick={handleNativeInstall}
              disabled={installing}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              {installing ? 'Prompting...' : 'Install Now'}
            </button>
          </div>
        )}

        {isInstalled && (
          <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2.5 text-sm text-emerald-800 font-medium">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>This app is already installed in standalone mode on this device!</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/50 overflow-x-auto">
          <button
            onClick={() => setActiveTab('apk')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'apk'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Get Standalone APK (.apk)
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'qr'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Scan to Phone (PC to Mobile)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'manual'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            WebAPK Install
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`py-3 px-3.5 text-xs sm:text-sm font-medium border-b-2 transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'border-emerald-600 text-emerald-800 font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Info className="w-4 h-4" />
            Specs
          </button>
        </div>

        {/* Tab: Standalone APK (.apk) */}
        {activeTab === 'apk' && (
          <div className="p-6 space-y-5">
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Direct Android Package (.apk / .aab)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    If you want an independent installer package rather than a browser-managed app, you have two fast methods:
                  </p>
                </div>
              </div>
            </div>

            {/* Method 1: Instant PWABuilder (Official Microsoft/Google Tool) */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                    Option 1 (Fastest - 30 seconds)
                  </span>
                  <span className="text-xs text-slate-500 font-medium">No coding required</span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-900">
                Generate Signed APK via PWABuilder
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                PWABuilder is the industry standard (developed by Microsoft & Google). It takes this app's verified manifest & icons and compiles a ready-to-sideload <strong>Android .APK file</strong> or Google Play Store <strong>.AAB package</strong>.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={`https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(currentUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open in PWABuilder (Generate APK)</span>
                </a>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'URL Copied' : 'Copy Site URL'}</span>
                </button>
              </div>
            </div>

            {/* Method 2: GitHub Actions Automated Build */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  Option 2 (Automated CI/CD)
                </span>
                <span className="text-xs text-slate-500 font-medium">Included in this repo</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900">
                GitHub Actions Android Builder (.github/workflows/build-apk.yml)
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                We have added a GitHub Actions CI workflow to this project. When you export to GitHub (via the top-right Settings menu &gt; <em>Export to GitHub</em>), GitHub's Ubuntu runners will automatically compile <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-emerald-800">app-debug.apk</code> under the <strong>Actions</strong> artifacts tab.
              </p>
            </div>

            {/* Method 3: Native Android Studio Project */}
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm space-y-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                Option 3 (Developers)
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                Compile Locally with Android Studio & Gradle
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Export the ZIP archive via Settings &gt; <em>Download ZIP</em>. Open a terminal and run:
              </p>
              <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg text-[11px] font-mono select-all overflow-x-auto">
                npm install @capacitor/core @capacitor/cli @capacitor/android<br/>
                npx cap init "BovineAI" "com.bovineai.app" --web-dir dist<br/>
                npx cap add android && npx cap open android
              </div>
              <p className="text-[11px] text-slate-500">
                Then in Android Studio click <strong>Build &gt; Build APK(s)</strong>.
              </p>
            </div>
          </div>
        )}

        {/* Tab 1: QR Code & Link Transfer */}
        {activeTab === 'qr' && (
          <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-5 rounded-xl border border-slate-200">
              <div className="relative p-2 bg-white rounded-xl shadow-sm border border-slate-200 flex-shrink-0">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="QR Code to install on Android" className="w-44 h-44 rounded-lg" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                    Generating QR...
                  </div>
                )}
              </div>

              <div className="space-y-3 text-center sm:text-left flex-1">
                <h4 className="font-semibold text-slate-900 text-base">
                  Scan with your Android Camera
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Point your phone's default camera or Google Lens at this code to open the app on your phone. Then tap <strong>Install App</strong> or <strong>Add to Home screen</strong>.
                </p>

                <div className="pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={currentUrl}
                      className="w-full text-xs font-mono bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-700 select-all truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0 ${
                        copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy Link'}
                    </button>
                  </div>
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    You can copy & send this link via WhatsApp, email, or message.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick 3-step walkthrough */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-2">
                  1
                </span>
                <p className="text-xs font-semibold text-slate-900">Open in Mobile Chrome</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Scan code or paste URL into Chrome on your Android device.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-2">
                  2
                </span>
                <p className="text-xs font-semibold text-slate-900">Tap "Install App"</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Click the install button or tap Chrome's three dots (⋮) &gt; <em>Install app</em>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center mb-2">
                  3
                </span>
                <p className="text-xs font-semibold text-slate-900">Native Android Experience</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Launches full screen from your app drawer with direct camera and offline access.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Manual Install Instructions on Android */}
        {activeTab === 'manual' && (
          <div className="p-6 space-y-4">
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl">
              <h4 className="text-sm font-semibold text-emerald-950 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-700" />
                How Android Chrome WebAPK Works
              </h4>
              <p className="text-xs text-emerald-800/90 mt-1 leading-relaxed">
                When you install this PWA from Chrome, Android automatically builds and signs an authentic <strong>WebAPK package</strong>. It integrates into your Android application launcher, home screen, settings manager, and app permissions just like an app downloaded from the Google Play Store.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Open Chrome Browser on Android</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Navigate to this web address on your mobile phone or tablet.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Tap the Three Dots Menu (<span className="font-mono">⋮</span>)
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    In the top-right corner of Google Chrome, tap the menu button.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Select "Install app" or "Add to Home screen"</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Tap <strong>Install</strong> in the dialog. Android will place the app icon on your home screen and in your app list.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Also works on Samsung Internet, Edge for Android, Brave, and Firefox Mobile.</span>
            </div>
          </div>
        )}

        {/* Tab 3: App Specs */}
        {activeTab === 'specs' && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">App Type</span>
                <span className="text-sm font-semibold text-slate-900 mt-0.5 block">Progressive Web App (PWA) / WebAPK</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Target Platform</span>
                <span className="text-sm font-semibold text-slate-900 mt-0.5 block">Android 8.0+ / iOS 14+ / ChromeOS</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Install Footprint</span>
                <span className="text-sm font-semibold text-slate-900 mt-0.5 block">&lt; 2.5 MB (Instant install)</span>
              </div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">Hardware Access</span>
                <span className="text-sm font-semibold text-slate-900 mt-0.5 block">Rear & Front Field Camera</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Features Included</h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>53+ Registered ICAR indigenous cattle & buffalo breed catalog</span>
                </li>
                <li className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Live camera photo capture with automated breed morphological breakdown</span>
                </li>
                <li className="flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Service worker precaching for offline field encyclopedia browsing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>AI veterinary assistance with lactation, origin, and feed consultation</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 rounded-b-2xl">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Link Copied to Clipboard' : 'Copy Mobile Link'}
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
