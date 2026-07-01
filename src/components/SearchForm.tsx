import React, { useState } from 'react';
import { PlaneTakeoff, PlaneLanding, Calendar, Search } from 'lucide-react';

interface SearchFormProps {
  onSearch: (origin: string, destination: string, date: string) => void;
  isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!origin.trim()) {
      setValidationError('Please enter a departure city or airport code.');
      return;
    }
    if (!destination.trim()) {
      setValidationError('Please enter a destination city or airport code.');
      return;
    }
    if (!date) {
      setValidationError('Please select a travel date.');
      return;
    }

    if (origin.trim().toUpperCase() === destination.trim().toUpperCase()) {
      setValidationError('Origin and destination cannot be the same.');
      return;
    }

    onSearch(origin.toUpperCase().trim(), destination.toUpperCase().trim(), date);
  };

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-6xl mx-auto">
      <form 
        onSubmit={handleSubmit}
        className="glass-card p-6 md:p-8 rounded-3xl shadow-xl border border-white/40 flex flex-col gap-5 md:gap-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {/* Origin Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
              Leaving From
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <PlaneTakeoff size={18} />
              </div>
              <input
                type="text"
                placeholder="e.g. BEY (Beirut)"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                maxLength={20}
                className="w-full pl-11 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300/50 transition-all text-sm font-medium uppercase"
              />
            </div>
          </div>

          {/* Destination Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
              Going To
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <PlaneLanding size={18} />
              </div>
              <input
                type="text"
                placeholder="e.g. DXB (Dubai)"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                maxLength={20}
                className="w-full pl-11 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300/50 transition-all text-sm font-medium uppercase"
              />
            </div>
          </div>

          {/* Date Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 ml-1">
              Departure Date
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                min={today}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-300/50 transition-all text-sm font-medium"
              />
            </div>
          </div>
        </div>

        {/* Error message */}
        {validationError && (
          <div className="text-red-600 text-xs font-medium bg-red-50/50 border border-red-100 px-4 py-2.5 rounded-xl animate-fade-in">
            {validationError}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full md:w-auto px-8 py-4 rounded-full text-white font-medium flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:pointer-events-none cursor-pointer"
            style={{ backgroundColor: '#202A36' }}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#1a2229';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#202A36';
            }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Searching...
              </>
            ) : (
              <>
                <Search size={18} />
                Search Flights
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
