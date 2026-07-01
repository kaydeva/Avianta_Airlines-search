import { useEffect, useRef } from 'react';

interface HeroProps {
  onBookNowClick: () => void;
}

export default function Hero({ onBookNowClick }: HeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.defaultMuted = true;
      videoRef.current.muted = true;
      videoRef.current.play().catch(() => { });
    }
  }, []);

  return (
    <section
      id="start"
      className="relative h-screen w-full flex items-center justify-center overflow-hidden"
    >
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-cover -z-20"
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4"
          type="video/mp4"
        />
      </video>

      {/* Cinematic Dark Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/20 -z-10 pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-5xl mx-auto animate-[fadeIn_1.2s_ease-out]">

        {/* Luxury Label */}
        <span className="inline-block text-[10px] sm:text-[11px] md:text-xs font-medium tracking-widest uppercase mb-6 sm:mb-8 text-white/80 bg-white/10 backdrop-blur-md px-4 sm:px-5 py-2 rounded-full border border-white/20 shadow-sm">
          Private Jet Search Engine
        </span>

        {/* Cinematic Heading */}
        <h1 className="flex flex-col items-center select-none">
          <span className="text-4xl sm:text-5xl md:text-7xl lg:text-[7rem] font-light text-white/90 leading-none tracking-tight drop-shadow-xl">
            Clarity.
          </span>
          <span className="text-4xl sm:text-5xl md:text-7xl lg:text-[7rem] font-semibold leading-none tracking-tight -mt-2 sm:-mt-4 text-[#C9A86A] drop-shadow-xl">
            Elevated.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 sm:mt-10 text-sm sm:text-base md:text-xl text-white/80 font-light max-w-xs sm:max-w-xl mx-auto leading-relaxed drop-shadow-lg">
          Compare private jet options instantly — then book directly with verified operators.
        </p>

        {/* Buttons */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">

          {/* Discover Button */}
          <button
            onClick={() => {
              const element = document.getElementById('story');
              if (element) element.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-8 sm:px-10 py-3.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium hover:bg-white/20 transition-all duration-300 hover:shadow-lg active:scale-95"
          >
            Discover Avianta
          </button>

          {/* Search Button */}
          <button
            onClick={onBookNowClick}
            className="w-full sm:w-auto px-8 sm:px-10 py-3.5 rounded-full font-medium text-white bg-[#C9A86A] hover:bg-[#b9975f] transition-all duration-300 shadow-xl hover:shadow-2xl active:scale-95"
          >
            Start Search
          </button>

        </div>
      </div>
    </section>
  );
}
