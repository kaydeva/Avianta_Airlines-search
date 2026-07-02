import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    searchHotelDestination,
    searchHotels,
    getHotelDetails,
} from "../api/hotels";

export default function HotelSearch() {
    const [query, setQuery] = useState("");
    const [destinationOptions, setDestinationOptions] = useState<any[]>([]);
    const [selectedDestination, setSelectedDestination] = useState<any>(null);

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        minPrice: 0,
        maxPrice: 20000,
        minStars: 0,
        amenities: [] as string[],
    });

    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState<any>(null);

    async function handleDestinationSearch(value: string) {
        setQuery(value);

        if (!value || value.length < 2) {
            setDestinationOptions([]);
            return;
        }

        const places = await searchHotelDestination(value);
        setDestinationOptions(places);
    }

    async function handleSearch() {
        if (!selectedDestination) return;

        try {
            setLoading(true);

            const hotels = await searchHotels(
                selectedDestination.entityId,
                checkIn,
                checkOut,
                2,
                1
            );

            setResults(hotels);
        } finally {
            setLoading(false);
        }
    }

    async function openModal(hotelId: string) {
        setModalOpen(true);
        const details = await getHotelDetails(hotelId);
        setModalData(details);
    }

    const filteredResults = results.filter((h) => {
        const price = h.price || 0;
        const stars = h.stars || 0;

        const priceMatch =
            price >= filters.minPrice && price <= filters.maxPrice;

        const starMatch = stars >= filters.minStars;

        const amenityMatch =
            filters.amenities.length === 0 ||
            filters.amenities.every((a) => h.amenities?.includes(a));

        return priceMatch && starMatch && amenityMatch;
    });

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-3xl mx-auto p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl"
        >
            <h2 className="text-2xl font-semibold text-white mb-4">
                Hotel Search
            </h2>

            {/* Destination Input */}
            <input
                value={query}
                onChange={(e) => handleDestinationSearch(e.target.value)}
                placeholder="Enter city or destination..."
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#C9A86A]"
            />

            {/* Autocomplete Options */}
            {destinationOptions.length > 0 && (
                <div className="mt-2 bg-white/10 border border-white/20 rounded-xl overflow-hidden">
                    {destinationOptions.map((place, i) => (
                        <button
                            key={i}
                            onClick={() => {
                                setSelectedDestination(place);
                                setQuery(place.name);
                                setDestinationOptions([]);
                            }}
                            className="w-full text-left px-4 py-3 text-white hover:bg-white/20 transition"
                        >
                            {place.name} — {place.city}, {place.country}
                        </button>
                    ))}
                </div>
            )}

            {/* Dates */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#C9A86A]"
                />

                <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#C9A86A]"
                />
            </div>

            {/* Filters */}
            <div className="mt-6 p-5 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
                <h3 className="text-white/90 font-semibold mb-4 flex items-center gap-2">
                    <span className="text-[#C9A86A] text-xl">✦</span>
                    Filters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                    {/* Min Price */}
                    <div>
                        <label className="text-white/70 text-sm mb-1 block">Min Price</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={filters.minPrice}
                            onChange={(e) =>
                                setFilters({ ...filters, minPrice: Number(e.target.value) })
                            }
                            className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#C9A86A] w-full"
                        />
                    </div>

                    {/* Max Price */}
                    <div>
                        <label className="text-white/70 text-sm mb-1 block">Max Price</label>
                        <input
                            type="number"
                            placeholder="20000"
                            value={filters.maxPrice}
                            onChange={(e) =>
                                setFilters({ ...filters, maxPrice: Number(e.target.value) })
                            }
                            className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#C9A86A] w-full"
                        />
                    </div>

                    {/* Min Stars */}
                    <div>
                        <label className="text-white/70 text-sm mb-1 block">Minimum Stars</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={filters.minStars}
                            onChange={(e) =>
                                setFilters({ ...filters, minStars: Number(e.target.value) })
                            }
                            className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[#C9A86A] w-full"
                        />
                    </div>

                    {/* Amenities */}
                    <div>
                        <label className="text-white/70 text-sm mb-1 block">Amenities</label>
                        <input
                            type="text"
                            placeholder="Pool, Wifi, Parking..."
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    amenities: e.target.value
                                        .split(",")
                                        .map((a) => a.trim())
                                        .filter((a) => a.length > 0),
                                })
                            }
                            className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C9A86A] w-full"
                        />
                    </div>
                </div>
            </div>


            {/* Search Button */}
            <button
                onClick={handleSearch}
                disabled={!selectedDestination}
                className="mt-4 w-full py-3 rounded-xl bg-[#C9A86A] hover:bg-[#b9975f] text-white font-medium transition-all duration-300 shadow-lg active:scale-95 disabled:opacity-50"
            >
                Search Hotels
            </button>

            {/* Skeleton Loader */}
            {loading && (
                <div className="mt-6 space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div
                            key={i}
                            className="animate-pulse p-4 rounded-xl bg-white/10 border border-white/20"
                        >
                            <div className="h-40 bg-white/20 rounded-xl mb-3"></div>
                            <div className="h-4 bg-white/20 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-white/20 rounded w-1/3"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Results */}
            {!loading && filteredResults.length > 0 && (
                <div className="mt-6 space-y-4">
                    {filteredResults.map((hotel, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-xl bg-white/10 border border-white/20 text-white"
                        >
                            <img
                                src={hotel.imageUrl}
                                alt={hotel.name}
                                className="w-full h-40 object-cover rounded-xl mb-3"
                            />

                            <h3 className="text-lg font-semibold">{hotel.name}</h3>
                            <p className="text-sm text-white/70">{hotel.address}</p>
                            <p className="text-sm mt-1">
                                ⭐ {hotel.stars} — {hotel.reviewScore} ({hotel.reviewCount} reviews)
                            </p>
                            <p className="mt-2 font-medium">
                                {hotel.price} {hotel.currency}
                            </p>

                            <button
                                onClick={() => openModal(hotel.hotelId)}
                                className="mt-3 px-4 py-2 rounded-lg bg-[#C9A86A] hover:bg-[#b9975f] text-white transition"
                            >
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {modalOpen && modalData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            className="bg-white/10 border border-white/20 p-6 rounded-2xl w-full max-w-lg text-white"
                        >
                            <h3 className="text-xl font-semibold mb-3">
                                {modalData.name}
                            </h3>

                            <img
                                src={modalData.images?.[0]}
                                className="w-full h-48 object-cover rounded-xl mb-4"
                            />

                            <p>{modalData.description || "No description available."}</p>

                            <button
                                onClick={() => setModalOpen(false)}
                                className="mt-4 px-6 py-3 rounded-xl bg-[#C9A86A] hover:bg-[#b9975f] text-white"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
