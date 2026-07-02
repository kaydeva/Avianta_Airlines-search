import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Clock, Search, Car, Loader2, ExternalLink, Sparkles } from 'lucide-react';
import { searchCarLocation } from '../api/cars';
import type { CarLocation } from '../api/cars';

export default function CarSearch() {
  const [pickupQuery, setPickupQuery] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [dropoffDate, setDropoffDate] = useState('');
  const [dropoffTime, setDropoffTime] = useState('10:00');

  const [suggestions, setSuggestions] = useState<CarLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<CarLocation | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchingLoc, setSearchingLoc] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [validationError, setValidationError] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split('T')[0];
  const inputBase = `w-full pl-11 pr-4 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A86A]/60 transition-all duration-300 text-sm font-medium border-white/10 hover:border-white/20 focus:shadow-[0_0_15px_rgba(201,168,106,0.08)]`;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!pickupQuery.trim() || selectedLocation || pickupQuery.trim().length < 2) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setSearchingLoc(true);
      try {
        const results = await searchCarLocation(pickupQuery);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setSearchingLoc(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [pickupQuery, selectedLocation]);

  const handleLocationSelect = (loc: CarLocation) => {
    setSelectedLocation(loc);
    setPickupQuery(loc.name);
    setShowDropdown(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    if (!selectedLocation) { setValidationError('Please select a pickup location.'); return; }
    if (!pickupDate) { setValidationError('Please select a pickup date.'); return; }
    if (!dropoffDate) { setValidationError('Please select a drop-off date.'); return; }

    setIsLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/api/cars/searchLocation?query=${encodeURIComponent(selectedLocation.name)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server returned error status: ${response.status}`);
      }
      await response.json();
    } catch (err: any) {
      setError(err.message || 'Failed to search car hire.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8">
      <form onSubmit={handleSearch}
        className="relative glass-dark rounded-3xl p-6 md:p-8 shadow-2xl glow-gold overflow-hidden"
      >
        <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#C9A86A]/40 to-transparent" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative lg:col-span-1" ref={dropdownRef}>
            <label className="block text-[10px] font-semibold text-[#C9A86A]/80 uppercase tracking-[0.15em] mb-2 ml-1">
              <MapPin size={11} className="inline mr-1.5 -mt-0.5" /> Pickup Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                {searchingLoc ? <Loader2 size={16} className="animate-spin text-[#C9A86A]" /> : <MapPin size={16} />}
              </div>
              <input type="text" value={pickupQuery}
                onChange={(e) => { setPickupQuery(e.target.value); setSelectedLocation(null); }}
                placeholder="e.g. Dubai Airport, JFK..."
                className={inputBase}
              />
            </div>
            <AnimatePresence>
              {showDropdown && suggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#0D152D]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                  {suggestions.slice(0, 6).map((s) => (
                    <button key={s.entityId} type="button" onClick={() => handleLocationSelect(s)}
                      className="w-full text-left px-5 py-3 hover:bg-[#C9A86A]/10 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0">
                      <Car size={15} className="text-[#C9A86A]/60 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-white/90">{s.name}</div>
                        <div className="text-xs text-gray-500">{[s.city, s.country].filter(Boolean).join(', ')}</div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#C9A86A]/80 uppercase tracking-[0.15em] mb-2 ml-1">
              <Calendar size={11} className="inline mr-1.5 -mt-0.5" /> Pickup Date & Time
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500"><Calendar size={16} /></div>
                <input type="date" min={today} value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className={inputBase} />
              </div>
              <div className="relative w-28">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><Clock size={14} /></div>
                <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className={inputBase} />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-[#C9A86A]/80 uppercase tracking-[0.15em] mb-2 ml-1">
              <Calendar size={11} className="inline mr-1.5 -mt-0.5" /> Drop-off Date & Time
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500"><Calendar size={16} /></div>
                <input type="date" min={pickupDate || today} value={dropoffDate} onChange={(e) => setDropoffDate(e.target.value)} className={inputBase} />
              </div>
              <div className="relative w-28">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500"><Clock size={14} /></div>
                <input type="time" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} className={inputBase} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-5">
          <div className="sm:ml-auto w-full sm:w-auto flex flex-col sm:items-end gap-3">
            {validationError && (
              <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-xs font-medium">{validationError}</motion.p>
            )}
            <motion.button type="submit" disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02 } : {}} whileTap={!isLoading ? { scale: 0.97 } : {}}
              className="relative w-full sm:w-auto px-10 py-3.5 rounded-full text-white font-medium flex items-center justify-center gap-2 overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#C9A86A] to-[#b9975f]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4b87a] to-[#c9a86a] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">
                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Searching...</> : <><Search size={15} /> Search Car Hire</>}
              </span>
            </motion.button>
          </div>
        </div>
      </form>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3">
                <div className="h-32 bg-gradient-to-r from-white/5 to-white/10 rounded-2xl animate-pulse" />
                <div className="h-4 bg-white/10 rounded-full animate-pulse w-3/4" />
                <div className="h-3 bg-white/5 rounded-full animate-pulse w-1/2" />
              </div>
            ))}
          </motion.div>
        )}

        {error && !isLoading && (
          <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="max-w-xl mx-auto text-center py-12 px-8 bg-red-500/5 border border-red-500/20 rounded-3xl backdrop-blur-sm">
            <p className="text-red-400 font-medium">{error}</p>
          </motion.div>
        )}

        {!isLoading && !error && hasSearched && (
          <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="relative glass-dark rounded-3xl border border-white/10 p-10 text-center shadow-lg overflow-hidden">
            <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#C9A86A]/40 to-transparent" />
            <Car size={48} className="mx-auto text-[#C9A86A]/60 mb-5" />
            <h3 className="text-xl font-semibold text-white mb-2">
              Car Hire Available in {selectedLocation?.name}
            </h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed mb-6">
              We found your pickup location. For full car inventory, pricing, and real-time availability,
              you'll be directed to our car hire partner platform.
            </p>
            <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              href={`https://www.skyscanner.com/car-hire`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-white font-medium overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-r from-[#C9A86A] to-[#b9975f]" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4b87a] to-[#c9a86a] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-2">View Car Options <ExternalLink size={16} /></span>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
