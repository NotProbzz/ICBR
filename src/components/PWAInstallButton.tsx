import React, { useState } from 'react';
import { Download, Smartphone, Check, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AndroidDownloadModal } from './AndroidDownloadModal';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'hero' | 'floating';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState(false);

  const handleClick = async () => {
    // If the browser natively supports the install prompt right now, trigger it!
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        // If dismissed or on desktop, open the guide modal
        setModalOpen(true);
      }
    } else {
      // Otherwise open the guided Android/Mobile download modal with QR code & instructions
      setModalOpen(true);
    }
  };

  return (
    <>
      {variant === 'header' && (
        <button
          onClick={handleClick}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 shadow-sm ${
            isInstalled
              ? 'bg-emerald-800/80 text-emerald-200 hover:bg-emerald-800'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white hover:shadow-md'
          } ${className}`}
          title="Download App for Android or iPhone"
        >
          {isInstalled ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-300" />
              <span>App Installed</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5" />
              <span>Download for Android</span>
            </>
          )}
        </button>
      )}

      {variant === 'hero' && !isInstalled && (
        <button
          onClick={handleClick}
          className={`inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all ${className}`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Download Android App</span>
        </button>
      )}

      {/* Android / Mobile Install Modal with live QR code and step-by-step guides */}
      <AndroidDownloadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isInstallable={isInstallable}
        isInstalled={isInstalled}
        onInstallPrompt={install}
      />
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 text-white px-3.5 py-2 text-xs font-medium shadow-xl animate-in slide-in-from-bottom duration-300">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      <span>Offline Mode — Browsing cached ICAR breed database</span>
    </div>
  );
};
