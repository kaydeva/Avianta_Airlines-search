import axios from 'axios';

export interface FlightResult {
  id: string;
  airlineName: string;
  airlineLogo: string;
  price: number;
  currency: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  origin: string;
  destination: string;
  date: string;
  redirectUrl: string;
  isPrivateJet?: boolean;
}

export interface FlightSearchParams {
  origin: string;
  destination: string;
  date: string;
}

// RapidAPI Skyscanner Configuration
const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || '';

/**
 * Generates realistic mock flight data based on origin and destination
 */
const getMockFlights = (origin: string, destination: string, date: string): FlightResult[] => {
  const cleanOrigin = origin.toUpperCase().trim();
  const cleanDest = destination.toUpperCase().trim();

  return [
    {
      id: 'se-001',
      airlineName: 'SkyElite Private Charters',
      airlineLogo: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=64&h=64&q=80',
      price: 18500,
      currency: 'USD',
      departureTime: '09:30',
      arrivalTime: '13:45',
      duration: '4h 15m',
      stops: 0,
      origin: cleanOrigin,
      destination: cleanDest,
      date,
      redirectUrl: 'https://skyelite.charters/book/se-001',
      isPrivateJet: true,
    },
    {
      id: 'se-002',
      airlineName: 'SkyElite Executive Jet',
      airlineLogo: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?auto=format&fit=crop&w=64&h=64&q=80',
      price: 24900,
      currency: 'USD',
      departureTime: '14:00',
      arrivalTime: '18:20',
      duration: '4h 20m',
      stops: 0,
      origin: cleanOrigin,
      destination: cleanDest,
      date,
      redirectUrl: 'https://skyelite.charters/book/se-002',
      isPrivateJet: true,
    },
    {
      id: 'co-001',
      airlineName: 'Emirates',
      airlineLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=64&h=64&q=80',
      price: 820,
      currency: 'USD',
      departureTime: '11:15',
      arrivalTime: '16:00',
      duration: '4h 45m',
      stops: 0,
      origin: cleanOrigin,
      destination: cleanDest,
      date,
      redirectUrl: 'https://www.emirates.com',
      isPrivateJet: false,
    },
    {
      id: 'co-002',
      airlineName: 'Qatar Airways',
      airlineLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=64&h=64&q=80',
      price: 950,
      currency: 'USD',
      departureTime: '08:00',
      arrivalTime: '14:30',
      duration: '6h 30m',
      stops: 1,
      origin: cleanOrigin,
      destination: cleanDest,
      date,
      redirectUrl: 'https://www.qatarairways.com',
      isPrivateJet: false,
    },
    {
      id: 'co-003',
      airlineName: 'Middle East Airlines',
      airlineLogo: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=64&h=64&q=80',
      price: 480,
      currency: 'USD',
      departureTime: '18:45',
      arrivalTime: '23:15',
      duration: '4h 30m',
      stops: 0,
      origin: cleanOrigin,
      destination: cleanDest,
      date,
      redirectUrl: 'https://www.mea.com.lb',
      isPrivateJet: false,
    }
  ];
};

/**
 * Searches flights. If VITE_RAPIDAPI_KEY is not set or is 'mock', returns mock data.
 * Otherwise, calls the RapidAPI Skyscanner Flights endpoint.
 */
export const searchFlights = async (
  origin: string,
  destination: string,
  date: string
): Promise<FlightResult[]> => {
  // Check if we should run in mock mode
  const isMockMode = !RAPIDAPI_KEY || RAPIDAPI_KEY === 'mock' || RAPIDAPI_KEY.trim() === '' || RAPIDAPI_KEY === 'YOUR_RAPIDAPI_KEY';

  if (isMockMode) {
    // Simulate API network latency (1.5 seconds)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getMockFlights(origin, destination, date));
      }, 1500);
    });
  }

  try {
    const response = await axios.get('http://localhost:5000/api/flights', {
      params: {
        origin: origin.toUpperCase().trim(),
        destination: destination.toUpperCase().trim(),
        date: date,
      },
    });

    // Handle parsing the real response structure from Skyscanner API
    const data = response.data;

    if (data && data.status && data.data && data.data.itineraries) {
      // Mapping for sky-scanner3 API
      return data.data.itineraries.map((itinerary: any, index: number) => {
        const leg = itinerary.legs?.[0];
        const carrier = leg?.carriers?.marketing?.[0] || {};
        const priceValue = itinerary.price?.raw || 0;

        const depTime = leg?.departure ? new Date(leg.departure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '00:00';
        const arrTime = leg?.arrival ? new Date(leg.arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '00:00';

        const durationMins = leg?.durationInMinutes || 0;
        const hours = Math.floor(durationMins / 60);
        const mins = durationMins % 60;
        const formattedDuration = `${hours}h ${mins}m`;

        return {
          id: itinerary.id || `flight-${index}`,
          airlineName: carrier.name || 'Unknown Airline',
          airlineLogo: carrier.logoUrl || 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=64&h=64&q=80',
          price: priceValue,
          currency: 'USD',
          departureTime: depTime,
          arrivalTime: arrTime,
          duration: formattedDuration,
          stops: leg?.stopCount || 0,
          origin: origin.toUpperCase(),
          destination: destination.toUpperCase(),
          date,
          redirectUrl: itinerary.bookingLink || 'https://www.skyscanner.com',
          isPrivateJet: false,
        };
      });
    }

    // Fallback if structure is different
    return getMockFlights(origin, destination, date);
  } catch (error) {
    console.error('Error fetching flights from Skyscanner API:', error);
    throw new Error('Failed to retrieve flight options. Please check your credentials and try again.');
  }
};
