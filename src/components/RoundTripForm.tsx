import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlaneTakeoff, PlaneLanding, Calendar, Search, Loader2, Users, ChevronDown, MapPin, Globe } from "lucide-react";
import { searchAirport } from "../api/skyscanner";
import type { AirportSuggestion } from "../api/skyscanner";

interface RoundtripFormProps {
    onSearch: (origin: string, destination: string, departDate: string, returnDate?: string) => void;
    isLoading: boolean;
    setReturnDate: (d: string) => void;
}

const CABIN_CLASSES = [
    { value: "economy", label: "Economy" },
    { value: "premium_economy", label: "Premium Economy" },
    { value: "business", label: "Business" },
    { value: "first", label: "First Class" },
];

type FocusField = 'origin' | 'dest' | null;

export default function RoundtripForm({ onSearch, isLoading, setReturnDate }: RoundtripFormProps) {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [departDate, setDepartDate] = useState("");
    const [returnDateLocal, setReturnDateLocal] = useState("");
    const [adults, setAdults] = useState(1);
    const [cabinClass, setCabinClass] = useState("economy");
    const [showCabin, setShowCabin] = useState(false);
    const [validationError, setValidationError] = useState("");
    const [focused, setFocused] = useState<FocusField>(null);

    const [originSugg, setOriginSugg] = useState<AirportSuggestion[]>([]);
    const [destSugg, setDestSugg] = useState<AirportSuggestion[]>([]);
    const [selectedOrigin, setSelectedOrigin] = useState<AirportSuggestion | null>(null);
    const [selectedDest, setSelectedDest] = useState<AirportSuggestion | null>(null);
    const [showOriginDrop, setShowOriginDrop] = useState(false);
    const [showDestDrop, setShowDestDrop] = useState(false);
    const [loadingOrigin, setLoadingOrigin] = useState(false);
    const [loadingDest, setLoadingDest] = useState(false);

    const originRef = useRef<HTMLDivElement>(null);
    const destRef = useRef<HTMLDivElement>(null);
    const cabinRef = useRef<HTMLDivElement>(null);
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (originRef.current && !originRef.current.contains(e.target as Node)) setShowOriginDrop(false);
            if (destRef.current && !destRef.current.contains(e.target as Node)) setShowDestDrop(false);
            if (cabinRef.current && !cabinRef.current.contains(e.target as Node)) setShowCabin(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        if (!origin.trim() || selectedOrigin || origin.trim().length < 2) { setOriginSugg([]); return; }
        const t = setTimeout(async () => {
            setLoadingOrigin(true);
            try { const r = await searchAirport(origin.trim()); setOriginSugg(r); setShowOriginDrop(r.length > 0); }
            catch { setOriginSugg([]); } finally { setLoadingOrigin(false); }
        }, 350);
        return () => clearTimeout(t);
    }, [origin, selectedOrigin]);

    useEffect(() => {
        if (!destination.trim() || selectedDest || destination.trim().length < 2) { setDestSugg([]); return; }
        const t = setTimeout(async () => {
            setLoadingDest(true);
            try { const r = await searchAirport(destination.trim()); setDestSugg(r); setShowDestDrop(r.length > 0); }
            catch { setDestSugg([]); } finally { setLoadingDest(false); }
        }, 350);
        return () => clearTimeout(t);
    }, [destination, selectedDest]);

    const inputBase = (focusedField: FocusField) =>
        `w-full pl-11 pr-10 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm font-medium ${focused === focusedField
            ? 'border-[#C9A86A]/60 shadow-[0_0_15px_rgba(201,168,106,0.08)]'
            : 'border-white/10 hover:border-white/20'
        }`;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError("");

        const originCode = selectedOrigin?.iata || origin.split("—")[0].trim();
        const destCode = selectedDest?.iata || destination.split("—")[0].trim();

        if (!originCode) { setValidationError("Please enter a departure airport."); return; }
        if (!destCode) { setValidationError("Please enter a destination airport."); return; }
        if (!departDate) { setValidationError("Please select a departure date."); return; }
        if (!returnDateLocal) { setValidationError("Please select a return date."); return; }
        if (originCode.toUpperCase() === destCode.toUpperCase()) {
            setValidationError("Origin and destination cannot be the same.");
            return;
        }

        setReturnDate(returnDateLocal);
        onSearch(originCode.toUpperCase(), destCode.toUpperCase(), departDate, returnDateLocal);
    };

    const SuggDropdown = ({
        items, onSelect, show, icon,
    }: { items: AirportSuggestion[]; onSelect: (s: AirportSuggestion) => void; show: boolean; icon: React.ReactNode }) => (
        <AnimatePresence>
            {show && items.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#0D152D]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
                >
                    {items.slice(0, 6).map((s) => (
                        <button
                            key={s.entityId || s.iata}
                            type="button"
                            onClick={() => onSelect(s)}
                            className="w-full text-left px-5 py-3 hover:bg-[#C9A86A]/10 flex items-center gap-3 transition-colors border-b border-white/5 last:border-0 group"
                        >
                            <span className="text-[#C9A86A]/60 group-hover:text-[#C9A86A] transition-colors">{icon}</span>
                            <div>
                                <div className="text-sm font-semibold text-white/90">
                                    {s.iata && <span className="text-[#C9A86A] mr-1.5">{s.iata}</span>}
                                    {s.name}
                                </div>
                                <div className="text-xs text-gray-500">{[s.city, s.country].filter(Boolean).join(", ")}</div>
                            </div>
                        </button>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="w-full max-w-6xl mx-auto">
            <form
                onSubmit={handleSubmit}
                className="relative glass-dark rounded-3xl p-6 md:p-8 shadow-2xl glow-gold overflow-hidden"
            >
                <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#C9A86A]/40 to-transparent" />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {/* Origin */}
                    <div className="relative" ref={originRef}>
                        <label className="block text-[10px] font-semibold text-[#C9A86A]/80 uppercase tracking-[0.15em] mb-2 ml-1">
                            <PlaneTakeoff size={11} className="inline mr-1.5 -mt-0.5" /> Leaving From
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                {loadingOrigin ? <Loader2 size={16} className="animate-spin text-[#C9A86A]" /> : <MapPin size={16} />}
                            </div>
                            <input
                                type="text"
                                placeholder="City or airport"
                                value={origin}
                                onChange={(e) => { setOrigin(e.target.value); setSelectedOrigin(null); }}
                                onFocus={() => setFocused('origin')}
                                onBlur={() => setFocused(null)}
                                className={inputBase('origin')}
                            />
                            {origin && (
                                <button type="button" onClick={() => { setOrigin(''); setSelectedOrigin(null); }}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                </button>
                            )}
                        </div>
                        <SuggDropdown
                            items={originSugg}
                            show={showOriginDrop}
                            icon={<PlaneTakeoff size={13} />}
                            onSelect={(s) => { setSelectedOrigin(s); setOrigin(s.iata ? `${s.iata} — ${s.name}` : s.name); setShowOriginDrop(false); }}
                        />
                    </div>

                    {/* Destination */}
                    <div className="relative" ref={destRef}>
                        <label className="block text-[10px] font-semibold text-[#C9A86A]/80 uppercase tracking-[0.15em] mb-2 ml-1">
                            <PlaneLanding size={11} className="inline mr-1.5 -mt-0.5" /> Going To
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                {loadingDest ? <Loader2 size={16} className="animate-spin text-[#C9A86A]" /> : <Globe size={16} />}
                            </div>
                            <input
                                type="text"
                                placeholder="City or airport"
                                value={destination}
                                onChange={(e) => { setDestination(e.target.value); setSelectedDest(null); }}
                                onFocus={() => setFocused('dest')}
                                onBlur={() => setFocused(null)}
                                className={inputBase('dest')}
                            />
                            {destination && (
                                <button type="button" onClick={() => { setDestination(''); setSelectedDest(null); }}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                                </button>
                            )}
                        </div>
                        <SuggDropdown
                            items={destSugg}
                            show={showDestDrop}
                            icon={<PlaneLanding size={13} />}
                            onSelect={(s) => { setSelectedDest(s); setDestination(s.iata ? `${s.iata} — ${s.name}` : s.name); setShowDestDrop(false); }}
                        />
                    </div>

                    {/* Depart Date */}
                    <div>
                        <label className="block text-[10px] font-semibold text-[#C9A86A]/80 uppercase tracking-[0.15em] mb-2 ml-1">
                            <Calendar size={11} className="inline mr-1.5 -mt-0.5" /> Depart Date
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                <Calendar size={16} />
                            </div>
                            <input
                                type="date"
                                min={today}
                                value={departDate}
                                onChange={(e) => setDepartDate(e.target.value)}
                                className={inputBase(null)}
                            />
                        </div>
                    </div>

                    {/* Return Date */}
                    <div>
                        <label className="block text-[10px] font-semibold text-[#C9A86A]/80 uppercase tracking-[0.15em] mb-2 ml-1">
                            <Calendar size={11} className="inline mr-1.5 -mt-0.5" /> Return Date
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                <Calendar size={16} />
                            </div>
                            <input
                                type="date"
                                min={departDate || today}
                                value={returnDateLocal}
                                onChange={(e) => setReturnDateLocal(e.target.value)}
                                className={inputBase(null)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 mt-5">
                    <div className="flex items-center gap-4 flex-wrap">
                        <div>
                            <label className="block text-[10px] font-semibold text-[#C9A86A]/70 uppercase tracking-[0.15em] mb-2 ml-1">Passengers</label>
                            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 w-fit">
                                <Users size={14} className="text-gray-500" />
                                <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))} className="text-gray-400 font-bold px-1 hover:text-[#C9A86A] transition-colors text-sm">−</button>
                                <span className="text-sm font-semibold text-white w-5 text-center">{adults}</span>
                                <button type="button" onClick={() => setAdults(Math.min(9, adults + 1))} className="text-gray-400 font-bold px-1 hover:text-[#C9A86A] transition-colors text-sm">+</button>
                            </div>
                        </div>

                        <div className="relative" ref={cabinRef}>
                            <label className="block text-[10px] font-semibold text-[#C9A86A]/70 uppercase tracking-[0.15em] mb-2 ml-1">Cabin Class</label>
                            <button type="button" onClick={() => setShowCabin(!showCabin)}
                                className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm font-medium text-white/80 hover:border-[#C9A86A]/40 transition-all">
                                {CABIN_CLASSES.find(c => c.value === cabinClass)?.label}
                                <ChevronDown size={14} className={`transition-transform duration-200 ${showCabin ? "rotate-180" : ""}`} />
                            </button>
                            <AnimatePresence>
                                {showCabin && (
                                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        className="absolute z-50 top-full left-0 mt-2 bg-[#0D152D]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden min-w-[180px]">
                                        {CABIN_CLASSES.map((c) => (
                                            <button key={c.value} type="button"
                                                onClick={() => { setCabinClass(c.value); setShowCabin(false); }}
                                                className={`w-full text-left px-5 py-3 text-sm transition-colors hover:bg-[#C9A86A]/10 ${cabinClass === c.value ? "text-[#C9A86A] font-semibold bg-[#C9A86A]/5" : "text-white/70"}`}>
                                                {c.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="sm:ml-auto w-full sm:w-auto flex flex-col sm:items-end gap-3">
                        {validationError && (
                            <motion.p initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-red-400 text-xs font-medium">
                                {validationError}
                            </motion.p>
                        )}
                        <motion.button type="submit" disabled={isLoading}
                            whileHover={!isLoading ? { scale: 1.02 } : {}} whileTap={!isLoading ? { scale: 0.97 } : {}}
                            className="relative w-full md:w-auto px-10 py-3.5 rounded-full text-white font-medium flex items-center justify-center gap-2 overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-[#C9A86A] to-[#b9975f]" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#d4b87a] to-[#c9a86a] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <span className="relative z-10 flex items-center gap-2">
                                {isLoading ? <><Loader2 size={16} className="animate-spin" /> Searching...</> : <><Search size={15} /> Search Roundtrip</>}
                            </span>
                        </motion.button>
                    </div>
                </div>
            </form>
        </div>
    );
}
