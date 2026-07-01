import React, { useState } from "react";
import { Calendar, PlaneTakeoff, PlaneLanding, Search, Plus, Trash2 } from "lucide-react";

interface MulticityFormProps {
    onSearch: (origin: string, destination: string, firstDate: string) => void;
    isLoading: boolean;
    setSegments: (segments: any[]) => void;
}

export default function MulticityForm({ onSearch, isLoading, setSegments }: MulticityFormProps) {
    const [segmentsLocal, setSegmentsLocal] = useState([
        { origin: "", destination: "", date: "" },
    ]);
    const [validationError, setValidationError] = useState("");

    const today = new Date().toISOString().split("T")[0];

    const updateSegment = (index: number, field: "origin" | "destination" | "date", value: string) => {
        const updated = [...segmentsLocal];
        updated[index][field] = value;
        setSegmentsLocal(updated);
    };

    const addSegment = () => {
        setSegmentsLocal([...segmentsLocal, { origin: "", destination: "", date: "" }]);
    };

    const removeSegment = (index: number) => {
        const updated = segmentsLocal.filter((_, i) => i !== index);
        setSegmentsLocal(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError("");

        for (const seg of segmentsLocal) {
            if (!seg.origin || !seg.destination || !seg.date) {
                setValidationError("Please fill all segment fields.");
                return;
            }
        }

        const first = segmentsLocal[0];
        setSegments(
            segmentsLocal.map((s) => ({
                origin: s.origin.toUpperCase().trim(),
                destination: s.destination.toUpperCase().trim(),
                date: s.date,
            }))
        );

        onSearch(first.origin.toUpperCase().trim(), first.destination.toUpperCase().trim(), first.date);
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <form
                onSubmit={handleSubmit}
                className="glass-card p-6 md:p-8 rounded-3xl shadow-xl border border-white/40 flex flex-col gap-5 md:gap-6"
            >
                <h2 className="text-lg md:text-xl font-semibold mb-2">Multi‑City Journey</h2>

                {segmentsLocal.map((seg, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-5 relative">
                        {/* Origin */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                                Origin
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <PlaneTakeoff size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={seg.origin}
                                    onChange={(e) => updateSegment(index, "origin", e.target.value)}
                                    placeholder="e.g. BEY"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300/50 transition-all text-sm font-medium uppercase"
                                />
                            </div>
                        </div>

                        {/* Destination */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                                Destination
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <PlaneLanding size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={seg.destination}
                                    onChange={(e) => updateSegment(index, "destination", e.target.value)}
                                    placeholder="e.g. DXB"
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300/50 transition-all text-sm font-medium uppercase"
                                />
                            </div>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
                                Date
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Calendar size={18} />
                                </div>
                                <input
                                    type="date"
                                    min={today}
                                    value={seg.date}
                                    onChange={(e) => updateSegment(index, "date", e.target.value)}
                                    className="w-full pl-11 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300/50 transition-all text-sm font-medium"
                                />
                            </div>
                        </div>

                        {/* Remove */}
                        {segmentsLocal.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removeSegment(index)}
                                className="absolute -right-2 top-0 text-red-500 hover:text-red-700"
                            >
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                ))}

                <button
                    type="button"
                    onClick={addSegment}
                    className="inline-flex items-center gap-2 text-xs md:text-sm font-medium text-[#202A36] hover:text-[#C9A86A] transition-all mt-1"
                >
                    <Plus size={16} />
                    Add Another Flight Segment
                </button>

                {validationError && (
                    <div className="text-red-600 text-xs font-medium bg-red-50/50 border border-red-100 px-4 py-2.5 rounded-xl animate-fade-in">
                        {validationError}
                    </div>
                )}

                <div className="flex justify-end mt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full md:w-auto px-8 py-4 rounded-full text-white font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
                        style={{ backgroundColor: "#202A36" }}
                        onMouseEnter={(e) => {
                            if (!isLoading) e.currentTarget.style.backgroundColor = "#1a2229";
                        }}
                        onMouseLeave={(e) => {
                            if (!isLoading) e.currentTarget.style.backgroundColor = "#202A36";
                        }}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    />
                                </svg>
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search size={18} />
                                Search Multi‑City
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
