import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, PlaneTakeoff, PlaneLanding, Search, Plus, Trash2, Loader2, MapPin, Globe, Sparkles } from "lucide-react";
import { searchAirport } from "../api/skyscanner";
import type { AirportSuggestion } from "../api/skyscanner";

interface MulticityFormProps {
    onSearch: (origin: string, destination: string, firstDate: string, returnDate?: string, segments?: any[]) => void;
    isLoading: boolean;
    setSegments: (segments: any[]) => void;
}

interface SegmentState {
    origin: string;
    destination: string;
    date: string;
    selectedOrigin: AirportSuggestion | null;
    selectedDest: AirportSuggestion | null;
}

export default function MulticityForm({ onSearch, isLoading, setSegments }: MulticityFormProps) {
    const [segmentsLocal, setSegmentsLocal] = useState<SegmentState[]>([
        { origin: "", destination: "", date: "", selectedOrigin: null, selectedDest: null },
    ]);
    const [validationError, setValidationError] = useState("");

    const [activeField, setActiveField] = useState<{ segIdx: number; field: "origin" | "destination" } | null>(null);
    const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([]);
    const [loadingSugg, setLoadingSugg] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setActiveField(null);
                setSuggestions([]);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const activeQuery = activeField
        ? (activeField.field === "origin"
            ? segmentsLocal[activeField.segIdx]?.origin
            : segmentsLocal[activeField.segIdx]?.destination) ?? ""
        : "";
    const activeSelected = activeField
        ? (activeField.field === "origin"
            ? segmentsLocal[activeField.segIdx]?.selectedOrigin
            : segmentsLocal[activeField.segIdx]?.selectedDest)
        : null;

    useEffect(() => {
        if (!activeField || !activeQuery.trim() || activeSelected || activeQuery.trim().length < 2) {
            setSuggestions([]);
            return;
        }
        const timeout = setTimeout(async () => {
            setLoadingSugg(true);
            try {
                const results = await searchAirport(activeQuery.trim());
                setSuggestions(results);
            } catch {
                setSuggestions([]);
            } finally {
                setLoadingSugg(false);
            }
        }, 350);
        return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeQuery, !!activeSelected]);

    const updateSegment = (index: number, field: "origin" | "destination" | "date", value: string) => {
        const updated = [...segmentsLocal];
        updated[index] = { ...updated[index], [field]: value };
        if (field === "origin") updated[index].selectedOrigin = null;
        if (field === "destination") updated[index].selectedDest = null;
        setSegmentsLocal(updated);
        if (field === "origin" || field === "destination") {
            setActiveField({ segIdx: index, field });
        }
    };

    const selectAirport = (segIdx: number, field: "origin" | "destination", airport: AirportSuggestion) => {
        const updated = [...segmentsLocal];
        const displayText = `${airport.iata} — ${airport.name}`;
        if (field === "origin") {
            updated[segIdx] = { ...updated[segIdx], origin: displayText, selectedOrigin: airport };
        } else {
            updated[segIdx] = { ...updated[segIdx], destination: displayText, selectedDest: airport };
        }
        setSegmentsLocal(updated);
        setActiveField(null);
        setSuggestions([]);
    };

    const addSegment = () => {
        setSegmentsLocal([...segmentsLocal, { origin: "", destination: "", date: "", selectedOrigin: null, selectedDest: null }]);
    };

    const removeSegment = (index: number) => {
        setSegmentsLocal(segmentsLocal.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError("");

        for (let i = 0; i < segmentsLocal.length; i++) {
            const seg = segmentsLocal[i];
            const originCode = seg.selectedOrigin?.iata || seg.origin.split("—")[0].trim();
            const destCode = seg.selectedDest?.iata || seg.destination.split("—")[0].trim();
            if (!originCode || !destCode || !seg.date) {
                setValidationError(`Please fill all fields for segment ${i + 1}.`);
                return;
            }
            if (originCode.toUpperCase() === destCode.toUpperCase()) {
                setValidationError(`Segment ${i + 1}: Origin and destination cannot be the same.`);
                return;
            }
        }

        const formatted = segmentsLocal.map((s) => ({
            origin: (s.selectedOrigin?.iata || s.origin.split("—")[0].trim()).toUpperCase().trim(),
            destination: (s.selectedDest?.iata || s.destination.split("—")[0].trim()).toUpperCase().trim(),
            date: s.date,
        }));
        setSegments(formatted);
        const first = formatted[0];
        onSearch(first.origin, first.destination, first.date, undefined, formatted);
    };

    const inputBase = (isFocused: boolean) =>
        `w-full pl-11 pr-10 py-3.5 bg-white/5 border rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all duration-300 text-sm font-medium ${
            isFocused
                ? 'border-[#C9A86A]/60 shadow-[0_0_15px_rgba(201,168,106,0.08)]'
                : 'border-white/10 hover:border-white/20'
        }`;

    return (
        <div className="w-full max-w-6xl mx-auto" ref={containerRef}>
            <form onSubmit={handleSubmit}
                className="relative glass-dark rounded-3xl p-6 md:p-8 shadow-2xl glow-gold overflow-hidden"
            >
                <div className="absolute top-0 left-[10%] right-[10%] h-[1px] bg-gradient-to-r from-transparent via-[#C9A86A]/40 to-transparent" />

                <h2 className="text-lg md:text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Sparkles size={16} className="text-[#C9A86A]" /> Multi-City Journey
                </h2>

                {segmentsLocal.map((seg, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 relative mb-5">
                        {/* Origin */}
                        <div className="relative">
                            <label className="block text-[10px] font-semibold text-[#C9A86A]/80 uppercase tracking-[0.15em] mb-2 ml-1">
                                <PlaneTakeoff size={11} className="inline mr-1.5 -mt-0.5" /> Origin
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                    <MapPin size={16} />
                                </div>
                                <input type="text" value={seg.origin}
                                    onChange={(e) => updateSegment(index, "origin", e.target.value)}
                                    onFocus={() => setActiveField({ segIdx: index, field: "origin" })}
                                    placeholder="e.g. BEY or Beirut"
                                    className={inputBase(activeField?.segIdx === index && activeField?.field === "origin")}
                                />
                                {loadingSugg && activeField?.segIdx === index && activeField?.field === "origin" && (
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                        <Loader2 size={16} className="animate-spin text-[#C9A86A]" />
                                    </div>
                                )}
                            </div>
                            <AnimatePresence>
                                {activeField?.segIdx === index && activeField?.field === "origin" && suggestions.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#0D152D]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                                        {suggestions.slice(0, 6).map((s) => (
                                            <button key={s.entityId || s.iata} type="button"
                                                onClick={() => selectAirport(index, "origin", s)}
                                                className="w-full px-4 py-3 text-left hover:bg-[#C9A86A]/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0">
                                                <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[#C9A86A] shrink-0">
                                                    {s.iata || "—"}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-white/90">{s.name}</p>
                                                    <p className="text-xs text-gray-500">{[s.city, s.country].filter(Boolean).join(", ") || s.type}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Destination */}
                        <div className="relative">
                            <label className="block text-[10px] font-semibold text-[#C9A86A]/80 uppercase tracking-[0.15em] mb-2 ml-1">
                                <PlaneLanding size={11} className="inline mr-1.5 -mt-0.5" /> Destination
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                    <Globe size={16} />
                                </div>
                                <input type="text" value={seg.destination}
                                    onChange={(e) => updateSegment(index, "destination", e.target.value)}
                                    onFocus={() => setActiveField({ segIdx: index, field: "destination" })}
                                    placeholder="e.g. DXB or Dubai"
                                    className={inputBase(activeField?.segIdx === index && activeField?.field === "destination")}
                                />
                                {loadingSugg && activeField?.segIdx === index && activeField?.field === "destination" && (
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                        <Loader2 size={16} className="animate-spin text-[#C9A86A]" />
                                    </div>
                                )}
                            </div>
                            <AnimatePresence>
                                {activeField?.segIdx === index && activeField?.field === "destination" && suggestions.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                        className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#0D152D]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                                        {suggestions.slice(0, 6).map((s) => (
                                            <button key={s.entityId || s.iata} type="button"
                                                onClick={() => selectAirport(index, "destination", s)}
                                                className="w-full px-4 py-3 text-left hover:bg-[#C9A86A]/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0">
                                                <span className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-[#C9A86A] shrink-0">
                                                    {s.iata || "—"}
                                                </span>
                                                <div>
                                                    <p className="text-sm font-medium text-white/90">{s.name}</p>
                                                    <p className="text-xs text-gray-500">{[s.city, s.country].filter(Boolean).join(", ") || s.type}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-[10px] font-semibold text-[#C9A86A]/80 uppercase tracking-[0.15em] mb-2 ml-1">
                                <Calendar size={11} className="inline mr-1.5 -mt-0.5" /> Date
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
                                    <Calendar size={16} />
                                </div>
                                <input type="date" min={today} value={seg.date}
                                    onChange={(e) => updateSegment(index, "date", e.target.value)}
                                    className={inputBase(false)}
                                />
                            </div>
                        </div>

                        {/* Remove */}
                        {segmentsLocal.length > 1 && (
                            <div className="flex items-end">
                                <button type="button" onClick={() => removeSegment(index)}
                                    className="p-3 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all" title="Remove segment">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                <button type="button" onClick={addSegment}
                    className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-[#C9A86A] hover:text-[#d4b87a] transition-all mt-1">
                    <Plus size={16} /> Add Another Flight Segment
                </button>

                {validationError && (
                    <div className="text-red-400 text-xs font-medium bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-xl mt-4">
                        {validationError}
                    </div>
                )}

                <div className="flex justify-end mt-6">
                    <motion.button type="submit" disabled={isLoading}
                        whileHover={!isLoading ? { scale: 1.02 } : {}} whileTap={!isLoading ? { scale: 0.97 } : {}}
                        className="relative w-full md:w-auto px-10 py-3.5 rounded-full text-white font-medium flex items-center justify-center gap-2 overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#C9A86A] to-[#b9975f]" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#d4b87a] to-[#c9a86a] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <span className="relative z-10 flex items-center gap-2">
                            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Searching...</> : <><Search size={15} /> Search Multi-City</>}
                        </span>
                    </motion.button>
                </div>
            </form>
        </div>
    );
}
