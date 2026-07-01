import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";

import SearchForm from "./components/SearchForm";
import RoundtripForm from "./components/RoundTripForm";
import MulticityForm from "./components/MultiCityForm";

import FlightResults from "./components/FlightResults";
import LandingSections from "./components/LandingSections";

import { searchFlights } from "./api/skyscanner";        // ONE-WAY
import { searchRoundtrip } from "./api/roundtrip";       // ROUNDTRIP
import { searchMulticity } from "./api/multiCity";       // MULTI-CITY

import type { FlightResult } from "./api/skyscanner";
import { Sparkles } from "lucide-react";

export default function App() {
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // search mode: "oneway" | "roundtrip" | "multicity"
  const [searchMode, setSearchMode] = useState<"oneway" | "roundtrip" | "multicity">("oneway");

  // roundtrip dates
  const [returnDate, setReturnDate] = useState("");

  // multicity segments
  const [segments, setSegments] = useState<any[]>([]);

  const handleSearch = async (origin: string, destination: string, date: string) => {
    setIsLoading(true);
    setError("");
    setHasSearched(true);

    const resultsElement = document.getElementById("results-area");
    if (resultsElement) {
      resultsElement.scrollIntoView({ behavior: "smooth" });
    }

    try {
      let results: any[] = [];

      if (searchMode === "oneway") {
        results = await searchFlights(origin, destination, date);
      }

      if (searchMode === "roundtrip") {
        if (!returnDate) {
          throw new Error("Please select a return date.");
        }
        results = await searchRoundtrip(origin, destination, date, returnDate);
      }

      if (searchMode === "multicity") {
        if (!segments.length) {
          throw new Error("Please add at least one segment.");
        }
        results = await searchMulticity(segments);
      }

      setFlights(results);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookNow = () => {
    const searchElement = document.getElementById("search-section");
    if (searchElement) {
      searchElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-gray-900 selection:bg-amber-100 selection:text-amber-900">
      <Navbar />
      <Hero onBookNowClick={handleBookNow} />

      <section
        id="search-section"
        className="max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-28 scroll-mt-20 space-y-12"
      >
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-100 text-[10px] md:text-xs font-semibold uppercase tracking-wider text-amber-700">
            <Sparkles size={12} className="text-amber-500" /> Hybrid Search Engine
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-gray-900">
            Search Premium Pathways
          </h2>
          <p className="text-sm md:text-base text-gray-500 max-w-lg mx-auto">
            Compare private charters with first-class commercial connections in one elegant search.
          </p>
        </div>

        {/* Search Mode Selector */}
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setSearchMode("oneway")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${searchMode === "oneway"
                ? "bg-[#C9A86A] text-white"
                : "bg-white/20 text-gray-700 border border-gray-300"
              }`}
          >
            One‑Way
          </button>

          <button
            onClick={() => setSearchMode("roundtrip")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${searchMode === "roundtrip"
                ? "bg-[#C9A86A] text-white"
                : "bg-white/20 text-gray-700 border border-gray-300"
              }`}
          >
            Roundtrip
          </button>

          <button
            onClick={() => setSearchMode("multicity")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${searchMode === "multicity"
                ? "bg-[#C9A86A] text-white"
                : "bg-white/20 text-gray-700 border border-gray-300"
              }`}
          >
            Multi‑City
          </button>
        </div>

        {/* Main Search Form */}
        {searchMode === "oneway" && (
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        )}

        {searchMode === "roundtrip" && (
          <RoundtripForm
            onSearch={handleSearch}
            isLoading={isLoading}
            setReturnDate={setReturnDate}
          />
        )}

        {searchMode === "multicity" && (
          <MulticityForm
            onSearch={handleSearch}
            isLoading={isLoading}
            setSegments={setSegments}
          />
        )}

        <div id="results-area" className="scroll-mt-32">
          <FlightResults
            flights={flights}
            isLoading={isLoading}
            error={error}
            hasSearched={hasSearched}
          />
        </div>
      </section>

      <LandingSections />
    </div>
  );
}
