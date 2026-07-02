import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

// ─── Backend base URL ────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("VITE_API_URL is missing");
}

// ─── Frontend caches ─────────────────────────────────────────
export const airportCache: Record<string, { data: any; timestamp: number }> = {};
export const flightCache: Record<string, { data: any; timestamp: number }> = {};
const inFlightRequests = new Map<string, Promise<any>>();
const activeAbortControllers = new Map<string, AbortController>();

// Throttle requests: 1 request per 300ms
let lastRequestTime = 0;
async function throttle() {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < 300) {
    await new Promise((resolve) => setTimeout(resolve, 300 - timeSinceLast));
  }
  lastRequestTime = Date.now();
}

/**
 * requestWithCacheAndMerge
 * A unified wrapper for axios requests supporting caching, deduplication/merging, throttling,
 * stale request cancellation (abort), and fast timeout response.
 */
export async function requestWithCacheAndMerge(
  url: string,
  config: AxiosRequestConfig = {},
  cacheType?: 'airport' | 'flight' | 'entity'
): Promise<any> {
  const cacheKey = `${url}?${JSON.stringify(config.params || {})}`;

  // 1. Check Frontend Cache
  const now = Date.now();
  if (cacheType === 'airport' || cacheType === 'entity') {
    const cached = airportCache[cacheKey];
    if (cached && now - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
      return cached.data;
    }
  } else if (cacheType === 'flight') {
    const cached = flightCache[cacheKey];
    if (cached && now - cached.timestamp < 5 * 60 * 1000) { // 5 minutes
      return cached.data;
    }
  }

  // 2. Abort Controller for stale requests
  if (cacheType === 'airport') {
    const prevController = activeAbortControllers.get('airport-autocomplete');
    if (prevController) {
      prevController.abort();
    }
    const newController = new AbortController();
    activeAbortControllers.set('airport-autocomplete', newController);
    config.signal = newController.signal;
  }

  // 3. Request Merging (Deduplication)
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  // 4. Throttle
  await throttle();

  const promise = (async () => {
    try {
      // 5. Timeout protection (fail fast)
      const res = await axios({
        ...config,
        url,
        timeout: 35000,
      });

      const responseData = res.data;

      // 6. Cache Response
      if (cacheType === 'airport' || cacheType === 'entity') {
        airportCache[cacheKey] = { data: responseData, timestamp: Date.now() };
      } else if (cacheType === 'flight') {
        flightCache[cacheKey] = { data: responseData, timestamp: Date.now() };
      }

      return responseData;
    } catch (err: any) {
      if (axios.isCancel(err)) {
        return [];
      }
      throw err;
    } finally {
      inFlightRequests.delete(cacheKey);
      if (cacheType === 'airport') {
        activeAbortControllers.delete('airport-autocomplete');
      }
    }
  })();

  inFlightRequests.set(cacheKey, promise);
  return promise;
}

// ─── Types ───────────────────────────────────────────────────
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

export interface AirportSuggestion {
  entityId: string;
  name: string;
  iata: string;
  type: string;
  city?: string;
  country?: string;
}

// ─── Normalize a raw itinerary into FlightResult ─────────────
export function normalizeItinerary(itinerary: any, origin: string, destination: string, date: string, index: number): FlightResult {
  const leg = itinerary.legs?.[0] || itinerary.leg || {};
  const segments = leg.segments || [];
  const segment = segments?.[0] || {};

  const carrier =
    leg.carriers?.[0] ||
    segment.marketingCarrier ||
    segment.operatingCarrier ||
    (Array.isArray(leg.marketingCarrier) ? leg.marketingCarrier[0] : leg.marketingCarrier) ||
    leg.carrier ||
    leg.airline ||
    {};

  const price = itinerary.price?.raw ?? itinerary.price?.amount ?? itinerary.minPrice?.amount ?? itinerary.price ?? itinerary.minPrice ?? 0;

  const formatTime = (dateStr: string, fallback: string) => {
    if (!dateStr) return fallback;
    try {
      return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return fallback;
    }
  };

  const depTime = formatTime(leg.departure, itinerary.departureTime || '00:00');
  const arrTime = formatTime(leg.arrival, itinerary.arrivalTime || '00:00');

  const durationMins = leg.durationInMinutes || itinerary.duration || 0;
  const hours = Math.floor(durationMins / 60);
  const mins = durationMins % 60;

  return {
    id: itinerary.id || itinerary.itineraryId || `flight-${index}`,
    airlineName: carrier.name || carrier.caption || segment?.marketingCarrier?.name || itinerary.airline || 'Unknown Airline',
    airlineLogo: carrier.logoUrl || carrier.logo || carrier.image || segment?.marketingCarrier?.logoUrl || '',
    price: typeof price === 'number' ? price : parseFloat(price) || 0,
    currency: itinerary.price?.currency || itinerary.pricingOptions?.[0]?.price?.currency || 'USD',
    departureTime: depTime,
    arrivalTime: arrTime,
    duration: durationMins ? `${hours}h ${mins}m` : itinerary.duration || '—',
    stops: leg.stopCount ?? leg.segmentCount ?? itinerary.stops ?? 0,
    origin: (leg.origin?.displayCode || leg.origin?.code || segment?.origin?.code || origin).toUpperCase(),
    destination: (leg.destination?.displayCode || leg.destination?.code || segment?.destination?.code || destination).toUpperCase(),
    date,
    redirectUrl: itinerary.deeplink || itinerary.deepLink || itinerary.bookingUrl || itinerary.url || segment?.deeplink || 'https://www.skyscanner.com',
    isPrivateJet: false,
  };
}

// ─── searchFlights (one-way) ─────────────────────────────────
export async function searchFlights(
  origin: string,
  destination: string,
  date: string,
  adults = 1,
  cabinClass = 'economy'
): Promise<FlightResult[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/flights/searchFlights`,
    {
      params: { origin, destination, date, adults, cabinClass },
    },
    'flight'
  );

  const itineraries: any[] =
    data?.data?.itineraries ||
    data?.itineraries ||
    data?.data?.flights ||
    data?.flights ||
    data?.data?.results ||
    data?.results ||
    [];

  if (!Array.isArray(itineraries) || !itineraries.length) return [];
  return itineraries.map((it, i) => normalizeItinerary(it, origin, destination, date, i));
}

// ─── searchAirport (autocomplete) ────────────────────────────
export async function searchAirport(query: string): Promise<AirportSuggestion[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/flights/searchAirport`,
    {
      params: { query, locale: "en-US", market: "US" },
    },
    'airport'
  );

  const places: any[] = data?.data || data?.places || data || [];
  if (!Array.isArray(places)) return [];

  return places.map((p: any) => ({
    entityId: p.entityId || p.id || '',
    name: p.name || p.airportName || '',
    iata: p.iata || p.displayCode || p.code || p.iataCode || p.skyId || '',
    type: p.type || 'AIRPORT',
    city: p.cityName || p.city || '',
    country: p.countryName || p.country || '',
  }));
}

// ─── searchFlightEverywhere ───────────────────────────────────
export async function searchFlightEverywhere(origin: string, date: string): Promise<any[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/flights/searchFlightEverywhere`,
    {
      params: { origin, date },
    },
    'flight'
  );
  return data?.data || data || [];
}

// ─── getCheapestOneway ────────────────────────────────────────
export async function getCheapestOneway(origin: string, destination: string): Promise<any> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/flights/getCheapestOneway`,
    {
      params: { origin, destination },
    },
    'flight'
  );
  return data;
}

// ─── getPriceCalendar ─────────────────────────────────────────
export async function getPriceCalendar(
  origin: string,
  destination: string,
  yearMonth: string
): Promise<any[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/flights/getPriceCalendar`,
    {
      params: { origin, destination, yearMonth },
    },
    'flight'
  );
  return data?.data || data || [];
}

// ─── getPriceCalendarReturn ───────────────────────────────────
export async function getPriceCalendarReturn(
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string
): Promise<any[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/flights/getPriceCalendarReturn`,
    {
      params: { origin, destination, departDate, returnDate },
    },
    'flight'
  );
  return data?.data || data || [];
}


export async function searchHotels(
  destination: string,
  checkIn: string,
  checkOut: string,
  adults = 1,
  rooms = 1
): Promise<any[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/hotels/searchHotels`,
    {
      params: { destination, checkIn, checkOut, adults, rooms },
      timeout: 15000,
    },
    'flight' // ← FIXED
  );

  const results: any[] =
    data?.data?.hotels ||
    data?.hotels ||
    data?.data?.results ||
    data?.results ||
    [];

  if (!Array.isArray(results) || !results.length) return [];

  return results.map((hotel, i) => ({
    hotelId: hotel.hotelId || hotel.id || `hotel-${i}`,
    name: hotel.name || hotel.hotelName || 'Unknown Hotel',
    stars: hotel.stars ?? hotel.starRating ?? 0,
    reviewScore: hotel.reviewScore ?? hotel.rating ?? 0,
    reviewCount: hotel.reviewCount ?? hotel.totalReviews ?? 0,
    price: hotel.price?.amount ?? hotel.price?.raw ?? hotel.minPrice ?? 0,
    currency: hotel.price?.currency ?? 'USD',
    imageUrl: hotel.images?.[0] || hotel.heroImage || hotel.imageUrl || hotel.image || '',
    address: hotel.address ?? hotel.location ?? hotel.distance ?? '',
    url: hotel.deeplink ?? hotel.bookingUrl ?? hotel.url ?? 'https://www.skyscanner.com/hotels',
    amenities: hotel.amenities ?? [],
  }));
}
