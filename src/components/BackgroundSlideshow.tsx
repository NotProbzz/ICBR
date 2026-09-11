import React, { useState, useEffect } from 'react';

const bgImages = [
  'https://images.unsplash.com/photo-1545468800-85cc9bc6ecf7?q=80&w=2000&auto=format&fit=crop', // Scenic cow in green field
  'https://images.unsplash.com/photo-1596733430284-f743728fc62b?q=80&w=2000&auto=format&fit=crop', // Close up aesthetic cow
  'https://images.unsplash.com/photo-1570044955745-925a297e6417?q=80&w=2000&auto=format&fit=crop', // Cattle in misty landscape
  'https://images.unsplash.com/photo-1502472483120-d3a6639c0213?q=80&w=2000&auto=format&fit=crop'  // Sunset grazing
];

export function BackgroundSlideshow() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % bgImages.length);
    }, 6000); // Change image every 6 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-0 bg-stone-950">
      {bgImages.map((src, index) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${
            index === currentIndex ? 'opacity-30' : 'opacity-0'
          }`}
        >
          <img
            src={src}
            alt="background"
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      
      {/* Dark gradient overlay to ensure text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-950/80 via-stone-950/60 to-stone-950/90 backdrop-blur-[2px]" />
    </div>
  );
}
