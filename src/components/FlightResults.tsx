import type { FlightResult } from '../api/skyscanner';
import { Plane, Clock, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';

interface FlightResultsProps {
  flights: FlightResult[];
  isLoading: boolean;
  error: string;
  hasSearched: boolean;
}

export default function FlightResults({ flights, isLoading, error, hasSearched }: FlightResultsProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-100 border-t-brand-dark animate-spin"></div>
        </div>
        <p className="mt-6 text-sm font-medium text-gray-500 tracking-wide uppercase">Searching luxury pathways...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 px-6 bg-red-50/60 border border-red-100 rounded-3xl text-center animate-fade-in">
        <div className="w-12 h-12 bg-red-100/80 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Search Interrupted</h3>
        <p className="text-sm text-gray-600 leading-relaxed">{error}</p>
      </div>
    );
  }

  if (!hasSearched) {
    return (
      <div className="text-center py-16 px-6 max-w-lg mx-auto animate-fade-in">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <Plane size={24} />
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">Where shall we fly?</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          Enter your departure city, destination, and date above to browse available luxury charters and premium commercial flights.
        </p>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="text-center py-16 px-6 max-w-lg mx-auto animate-fade-in">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
          <Plane className="rotate-45" size={24} />
        </div>
        <h3 className="text-xl font-medium text-gray-800 mb-2">No Flights Found</h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          We couldn't find any flights for the selected route and date. Please try adjusting your parameters or choose a different date.
        </p>
      </div>
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
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Available Flights ({flights.length})
        </h2>
        <span className="text-xs text-gray-500 font-medium">
          Prices include all taxes & fees
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {flights.map((flight) => (
          <div
            key={flight.id}
            className={`group relative overflow-hidden rounded-3xl shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.01] border ${
              flight.isPrivateJet
                ? 'bg-gradient-to-r from-gray-900 via-slate-900 to-brand-dark text-white border-yellow-600/30'
                : 'bg-white/95 text-gray-800 border-gray-100'
            }`}
          >
            {/* Private Jet Highlight Header */}
            {flight.isPrivateJet && (
              <div className="absolute top-0 right-0 left-0 bg-gradient-to-r from-amber-500 to-yellow-600 px-6 py-1.5 flex items-center justify-between text-[10px] md:text-xs font-semibold uppercase tracking-widest text-white">
                <span className="flex items-center gap-1">
                  <Sparkles size={12} /> Exclusive SkyElite Charter
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} /> Private Terminal
                </span>
              </div>
            )}

            <div className={`p-6 md:p-8 ${flight.isPrivateJet ? 'pt-10' : ''}`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Airline & Flight Route Details */}
                <div className="flex items-center gap-4 flex-1">
                  <img
                    src={flight.airlineLogo}
                    alt={flight.airlineName}
                    className={`w-12 h-12 rounded-2xl object-cover border ${
                      flight.isPrivateJet ? 'border-gray-700 bg-gray-800' : 'border-gray-150 bg-gray-50'
                    }`}
                  />
                  <div>
                    <h3 className={`font-semibold text-base ${flight.isPrivateJet ? 'text-white' : 'text-gray-900'}`}>
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

                {/* Timing & Route Map */}
                <div className="flex items-center justify-between md:justify-start gap-6 md:gap-10 flex-2">
                  {/* Departure */}
                  <div className="text-left">
                    <span className={`block text-xl font-bold ${flight.isPrivateJet ? 'text-white' : 'text-gray-900'}`}>
                      {flight.departureTime}
                    </span>
                    <span className={`block text-xs font-semibold uppercase tracking-wider ${flight.isPrivateJet ? 'text-gray-400' : 'text-gray-500'}`}>
                      {flight.origin}
                    </span>
                  </div>

                  {/* Route Indicator */}
                  <div className="flex flex-col items-center justify-center flex-1 max-w-[120px]">
                    <span className={`text-[10px] font-semibold uppercase tracking-wider mb-1 ${flight.isPrivateJet ? 'text-amber-400' : 'text-gray-400'}`}>
                      {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop`}
                    </span>
                    <div className="relative w-full flex items-center justify-center">
                      <div className={`h-[2px] w-full ${flight.isPrivateJet ? 'bg-gray-700' : 'bg-gray-200'}`} />
                      <div className={`absolute p-1 rounded-full border ${
                        flight.isPrivateJet 
                          ? 'bg-slate-900 border-gray-700 text-amber-400' 
                          : 'bg-white border-gray-200 text-gray-400'
                      }`}>
                        <Plane size={10} className="rotate-90" />
                      </div>
                    </div>
                    <span className={`text-[10px] mt-1 font-medium flex items-center gap-1 ${flight.isPrivateJet ? 'text-gray-400' : 'text-gray-500'}`}>
                      <Clock size={10} /> {flight.duration}
                    </span>
                  </div>

                  {/* Arrival */}
                  <div className="text-right">
                    <span className={`block text-xl font-bold ${flight.isPrivateJet ? 'text-white' : 'text-gray-900'}`}>
                      {flight.arrivalTime}
                    </span>
                    <span className={`block text-xs font-semibold uppercase tracking-wider ${flight.isPrivateJet ? 'text-gray-400' : 'text-gray-500'}`}>
                      {flight.destination}
                    </span>
                  </div>
                </div>

                {/* Price and Booking CTA */}
                <div className="flex items-center justify-between lg:flex-col lg:items-end lg:justify-center gap-4 lg:pl-6 border-t lg:border-t-0 lg:border-l border-gray-100/10 pt-4 lg:pt-0">
                  <div className="text-left lg:text-right">
                    <span className={`block text-xs font-semibold uppercase tracking-wider ${flight.isPrivateJet ? 'text-gray-400' : 'text-gray-500'}`}>
                      Est. Price
                    </span>
                    <span className={`text-2xl md:text-3xl font-bold tracking-tight ${
                      flight.isPrivateJet ? 'text-amber-400' : 'text-gray-900'
                    }`}>
                      {formatPrice(flight.price)}
                    </span>
                  </div>

                  <a
                    href={flight.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-6 py-2.5 rounded-full font-medium text-xs md:text-sm flex items-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 cursor-pointer ${
                      flight.isPrivateJet
                        ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:brightness-110'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                    }`}
                  >
                    Book Now
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
