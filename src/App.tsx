import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import SearchForm from "./components/SearchForm";
import RoundtripForm from "./components/RoundTripForm";
import MulticityForm from "./components/MultiCityForm";
import FlightResults from "./components/FlightResults";
import HotelSearch from "./components/HotelSearch";
import CarSearch from "./components/CarSearch";
import LandingSections from "./components/LandingSections";

import { searchFlights } from "./api/skyscanner";
import { searchRoundtrip } from "./api/roundtrip";
import { searchMulticity } from "./api/multiCity";
import type { FlightResult } from "./api/skyscanner";

import { Sparkles, Plane, Building2, Car } from "lucide-react";

const SERVICE_TABS = [
  { id: "flights", label: "Flights", Icon: Plane },
  { id: "hotels", label: "Hotels", Icon: Building2 },
  { id: "cars", label: "Car Hire", Icon: Car },
] as const;

type ServiceTab = typeof SERVICE_TABS[number]["id"];

const FLIGHT_MODES = [
  { id: "oneway", label: "One-Way" },
  { id: "roundtrip", label: "Roundtrip" },
  { id: "multicity", label: "Multi-City" },
] as const;

type FlightMode = typeof FLIGHT_MODES[number]["id"];

export default function App() {
  const [serviceTab, setServiceTab] = useState<ServiceTab>("flights");
  const [flightMode, setFlightMode] = useState<FlightMode>("oneway");
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [returnDate, setReturnDate] = useState("");
  const [segments, setSegments] = useState<any[]>([]);

  const handleSearch = async (
    origin: string,
    destination: string,
    date: string,
    reqReturnDate?: string,
    reqSegments?: any[]
  ) => {
    setIsLoading(true);
    setError("");
    setHasSearched(true);

    setTimeout(() => {
      document.getElementById("results-area")?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      let results: FlightResult[] = [];

      if (flightMode === "oneway") {
        results = await searchFlights(origin, destination, date);
      }

      if (flightMode === "roundtrip") {
        const actualReturnDate = reqReturnDate || returnDate;
        if (!actualReturnDate) throw new Error("Please select a return date.");
        results = await searchRoundtrip(origin, destination, date, actualReturnDate);
      }

      if (flightMode === "multicity") {
        const actualSegments = reqSegments || segments;
        if (!actualSegments || actualSegments.length === 0) throw new Error("Please add at least one flight segment.");
        results = await searchMulticity(actualSegments);
      }

      setFlights(results);
    } catch (err: any) {
      const msg = err?.response?.data?.error || err?.message || "An unexpected error occurred.";
      setError(msg);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSearch = () => {
    document.getElementById("search-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#0D0D0F] text-[#F5F5F2] selection:bg-[#C9A86A]/30 selection:text-[#D8C9A3]">
      <Navbar />
      <Hero onBookNowClick={scrollToSearch} />

      {/* ══════════ MAIN SEARCH SECTION ══════════ */}
      <section
        id="search-section"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-16 md:py-24 scroll-mt-28"
      >


        <div className="relative z-10 space-y-10">
          {/* Section heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-[10px] font-semibold uppercase tracking-wider text-[#C9A86A]"
            >
              <Sparkles size={11} /> Premium Travel Engine
            </motion.div>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white">
              Search. Compare. <span className="font-semibold text-[#C9A86A]">Fly.</span>
            </h2>
            <p className="text-sm md:text-base text-gray-400 max-w-lg mx-auto">
              Real-time flights, hotels, and car hire from one elegant search — powered by Skyscanner.
            </p>
          </motion.div>

          {/* Service tabs */}
          <div className="flex justify-center">
            <div className="inline-flex bg-white/5 backdrop-blur-sm rounded-2xl p-1 gap-1 border border-white/10">
              {SERVICE_TABS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  onClick={() => setServiceTab(id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${serviceTab === id
                    ? "text-white"
                    : "text-gray-500 hover:text-gray-300"
                    }`}
                >
                  <Icon size={15} className={serviceTab === id ? "text-[#C9A86A]" : ""} />
                  {label}
                  {serviceTab === id && (
                    <motion.div
                      layoutId="service-tab-indicator"
                      className="absolute inset-0 rounded-xl bg-white/10 border border-white/10 -z-10"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">

            {/* FLIGHTS */}
            {serviceTab === "flights" && (
              <motion.div
                key="flights"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="space-y-8"
              >
                {/* Flight mode selector */}
                <div className="flex justify-center gap-2 flex-wrap">
                  {FLIGHT_MODES.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => setFlightMode(id)}
                      className={`relative px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${flightMode === id
                        ? "bg-[#C9A86A] text-white border-[#C9A86A] shadow-lg shadow-[#C9A86A]/20"
                        : "bg-white/[0.04] text-gray-400 border-white/10 hover:border-[#C9A86A]/40 hover:text-white"
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {flightMode === "oneway" && (
                    <motion.div
                      key="oneway"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.25 }}
                    >
                      <SearchForm onSearch={handleSearch} isLoading={isLoading} />
                    </motion.div>
                  )}

                  {flightMode === "roundtrip" && (
                    <motion.div
                      key="roundtrip"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.25 }}
                    >
                      <RoundtripForm
                        onSearch={handleSearch}
                        isLoading={isLoading}
                        setReturnDate={setReturnDate}
                      />
                    </motion.div>
                  )}

                  {flightMode === "multicity" && (
                    <motion.div
                      key="multicity"
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ duration: 0.25 }}
                    >
                      <MulticityForm
                        onSearch={handleSearch}
                        isLoading={isLoading}
                        setSegments={setSegments}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Results area */}
                <div id="results-area" className="scroll-mt-32">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={hasSearched ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <FlightResults
                      flights={flights}
                      isLoading={isLoading}
                      error={error}
                      hasSearched={hasSearched}
                    />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* HOTELS */}
            {serviceTab === "hotels" && (
              <motion.div
                key="hotels"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <HotelSearch />
              </motion.div>
            )}

            {/* CARS */}
            {serviceTab === "cars" && (
              <motion.div
                key="cars"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <CarSearch />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </section>

      <LandingSections />
    </div>
  );
}


