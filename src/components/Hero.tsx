import { useEffect, useRef } from "react";

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
      className="
        relative 
        h-screen w-screen 
        overflow-hidden 
        flex items-center justify-center
      "
    >
      {/* FIXED BACKGROUND VIDEO (autofill-proof) */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        crossOrigin="anonymous"
        className="
          fixed top-0 left-0
          w-full h-full
          object-cover
          pointer-events-none
          select-none
          will-change-transform
          scale-[1.03]   /* tiny zoom to hide any micro-gap */
          z-0
        "
      >
        <source
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_091828_e240eb17-6edc-4129-ad9d-98678e3fd238.mp4"
          type="video/mp4"
        />
      </video>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/20 pointer-events-none z-0" />

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 max-w-5xl mx-auto animate-[fadeIn_1.2s_ease-out]">

        <span className="inline-block text-[10px] sm:text-[11px] md:text-xs font-medium tracking-widest uppercase mb-6 sm:mb-8 text-white/80 bg-white/10 backdrop-blur-md px-4 sm:px-5 py-2 rounded-full border border-white/20 shadow-sm">
          Private Jet Search Engine
        </span>

        <h1 className="flex flex-col items-center select-none">
          <span className="text-4xl sm:text-5xl md:text-7xl lg:text-[7rem] font-light text-white/90 leading-none tracking-tight drop-shadow-xl">
            Clarity.
          </span>
          <span className="text-4xl sm:text-5xl md:text-7xl lg:text-[7rem] font-semibold leading-none tracking-tight -mt-2 sm:-mt-4 text-[#C9A86A] drop-shadow-xl">
            Elevated.
          </span>
        </h1>

        <p className="mt-6 sm:mt-10 text-sm sm:text-base md:text-xl text-white/80 font-light max-w-xs sm:max-w-xl mx-auto leading-relaxed drop-shadow-lg">
          Compare private jet options instantly — then book directly with verified operators.
        </p>

        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
          <button
            onClick={() => {
              const element = document.getElementById("story");
              if (element) element.scrollIntoView({ behavior: "smooth" });
            }}
            className="w-full sm:w-auto px-8 sm:px-10 py-3.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-medium hover:bg-white/20 transition-all duration-300 hover:shadow-lg active:scale-95"
          >
            Discover Avianta
          </button>

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
