import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FlightResult } from '../api/skyscanner';
import { Plane, Clock, ShieldCheck, Sparkles, ExternalLink, Search, RefreshCw } from 'lucide-react';

interface FlightResultsProps {
  flights: FlightResult[];
  isLoading: boolean;
  error: string;
  hasSearched: boolean;
  onRetry?: () => void;
}

function TiltCard({ children, className, isPrivateJet }: { children: React.ReactNode; className?: string; isPrivateJet?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.015)`;
    card.style.transition = 'transform 0.08s ease-out';

    const glowEl = card.querySelector('.card-glow') as HTMLElement;
    if (glowEl) {
      glowEl.style.background = `radial-gradient(600px circle at ${x}px ${y}px, ${isPrivateJet ? 'rgba(201,168,106,0.15)' : 'rgba(201,168,106,0.08)'}, transparent 40%)`;
    }
  };

  const handleMouseLeave = () => {
    setHovered(false);
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    const glowEl = card.querySelector('.card-glow') as HTMLElement;
    if (glowEl) glowEl.style.background = 'transparent';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setHovered(true)}
      className={className}
      style={{ transformStyle: 'preserve-3d', willChange: 'transform' }}
    >
      <div className="card-glow absolute inset-0 rounded-3xl pointer-events-none z-0" />
      {isPrivateJet && hovered && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-3xl border border-[#C9A86A]/40 pointer-events-none z-[1]"
        />
      )}
      {children}
    </div>
  );
}

export default function FlightResults({ flights, isLoading, error, hasSearched, onRetry }: FlightResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-white/5 border-t-[#C9A86A] animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-white/5 border-b-[#C9A86A]/60 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          <Plane size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#C9A86A] animate-pulse" />
        </div>
        <p className="mt-6 text-sm font-medium text-gray-500 tracking-wide uppercase">Searching luxury pathways...</p>
        <div className="flex gap-1 mt-3">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-[#C9A86A]/60"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl mx-auto py-12 px-8 bg-red-500/5 border border-red-500/20 rounded-3xl text-center backdrop-blur-sm"
      >
        <div className="w-14 h-14 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-5">
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Search Interrupted</h3>
        <p className="text-sm text-gray-400 leading-relaxed mb-6">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white/10 border border-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all"
          >
            <RefreshCw size={14} /> Try Again
          </button>
        )}
      </motion.div>
    );
  }

  if (!hasSearched) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16 px-6 max-w-lg mx-auto"
      >
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500 border border-white/10">
          <Search size={24} />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Where shall we fly?</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Enter your departure city, destination, and date above to browse available luxury charters and premium commercial flights.
        </p>
      </motion.div>
    );
  }

  if (flights.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-16 px-6 max-w-lg mx-auto"
      >
        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-500 border border-white/10">
          <Plane className="rotate-45" size={24} />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">No Flights Found</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          We couldn't find any flights for the selected route and date. Please try adjusting your parameters or choose a different date.
        </p>
      </motion.div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 md:px-0">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between border-b border-white/10 pb-4"
      >
        <h2 className="text-lg font-semibold text-white">
          Available Flights ({flights.length})
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          Prices include all taxes & fees
        </span>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {flights.map((flight, index) => (
          <motion.div
            key={flight.id}
            initial={{ opacity: 0, y: 30, rotateX: -5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            transition={{
              delay: index * 0.08,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <TiltCard
              isPrivateJet={flight.isPrivateJet}
              className={`group relative overflow-hidden rounded-3xl shadow-md border ${
                flight.isPrivateJet
                  ? 'bg-gradient-to-r from-gray-900 via-slate-900 to-brand-dark text-white border-yellow-600/30 shadow-[0_0_30px_rgba(201,168,106,0.1)]'
                  : 'bg-white/[0.04] backdrop-blur-sm text-white border-white/10 hover:shadow-xl hover:border-white/20'
              }`}
            >
              {flight.isPrivateJet && (
                <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-1.5 flex items-center justify-between text-[10px] md:text-xs font-semibold uppercase tracking-widest text-white z-10">
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} /> Exclusive SkyElite Charter
                  </span>
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} /> Private Terminal
                  </span>
                </div>
              )}

              <div className={`p-6 md:p-8 relative z-10 ${flight.isPrivateJet ? 'pt-10' : ''}`}>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="relative">
                      <img
                        src={flight.airlineLogo}
                        alt={flight.airlineName}
                        className={`w-12 h-12 rounded-2xl object-cover border ${
                          flight.isPrivateJet ? 'border-gray-700 bg-gray-800' : 'border-white/10 bg-white/5'
                        }`}
                      />
                      {flight.isPrivateJet && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                          <Sparkles size={10} className="text-white" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className={`font-semibold text-base ${flight.isPrivateJet ? 'text-white' : 'text-white'}`}>
                        {flight.airlineName}
                      </h3>
                      <div className={`flex items-center gap-1 text-xs mt-1 font-medium ${flight.isPrivateJet ? 'text-gray-400' : 'text-gray-500'}`}>
                        {flight.isPrivateJet ? (
                          <span className="text-amber-400 font-semibold flex items-center gap-1">
                            Gulfstream G650 or similar • VIP Class
                          </span>
                        ) : (
                          <span>Commercial Economy • Cabin luggage included</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-start gap-6 md:gap-10 flex-2">
                    <div className="text-left">
                      <span className={`block text-xl font-bold ${flight.isPrivateJet ? 'text-white' : 'text-white'}`}>
                        {flight.departureTime}
                      </span>
                      <span className={`block text-xs font-semibold uppercase tracking-wider ${flight.isPrivateJet ? 'text-gray-400' : 'text-gray-500'}`}>
                        {flight.origin}
                      </span>
                    </div>

                    <div className="flex flex-col items-center justify-center flex-1 max-w-[120px]">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${flight.isPrivateJet ? 'text-amber-400' : 'text-gray-400'}`}>
                        {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop`}
                      </span>
                      <div className="relative w-full flex items-center justify-center">
                        <div className={`h-[2px] w-full ${flight.isPrivateJet ? 'bg-gray-700' : 'bg-white/10'}`} />
                        <motion.div
                          className={`absolute p-1 rounded-full border ${
                            flight.isPrivateJet
                              ? 'bg-slate-900 border-gray-700 text-amber-400'
                              : 'bg-[#0D0D0F] border-white/10 text-gray-400'
                          }`}
                          animate={{ x: [0, 3, 0] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                          <Plane size={10} className="rotate-90" />
                        </motion.div>
                      </div>
                      <span className={`text-[10px] mt-1 font-medium flex items-center gap-1 ${flight.isPrivateJet ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Clock size={10} /> {flight.duration}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className={`block text-xl font-bold ${flight.isPrivateJet ? 'text-white' : 'text-white'}`}>
                        {flight.arrivalTime}
                      </span>
                      <span className={`block text-xs font-semibold uppercase tracking-wider ${flight.isPrivateJet ? 'text-gray-400' : 'text-gray-500'}`}>
                        {flight.destination}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-4 lg:pl-6 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0">
                    <div className="text-left lg:text-right">
                      <span className={`block text-xs font-semibold uppercase tracking-wider ${flight.isPrivateJet ? 'text-gray-400' : 'text-gray-500'}`}>
                        Est. Price
                      </span>
                      <span className={`text-2xl md:text-3xl font-bold tracking-tight ${
                        flight.isPrivateJet ? 'text-amber-400' : 'text-white'
                      }`}>
                        {formatPrice(flight.price)}
                      </span>
                    </div>

                    <motion.a
                      href={flight.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-6 py-2.5 rounded-full font-medium text-xs md:text-sm flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer ${
                        flight.isPrivateJet
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:brightness-110'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                      }`}
                    >
                      Book Now
                      <ExternalLink size={14} />
                    </motion.a>
                  </div>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
