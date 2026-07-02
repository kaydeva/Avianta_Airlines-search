import { requestWithCacheAndMerge, normalizeItinerary } from './skyscanner';
import type { FlightResult } from './skyscanner';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("VITE_API_URL is missing");
}

export async function searchRoundtrip(
  origin: string,
  destination: string,
  departDate: string,
  returnDate: string,
  adults = 1,
  cabinClass = 'economy'
): Promise<FlightResult[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/flights/searchFlights`,
    {
      params: {
        origin:      origin.toUpperCase().trim(),
        destination: destination.toUpperCase().trim(),
        date: departDate,
        returnDate,
        adults,
        cabinClass,
      },
    },
    'flight'
  );

  const itineraries: any[] =
    data?.data?.itineraries ||
    data?.itineraries        ||
    data?.data?.flights      ||
    data?.flights            ||
    data?.data?.results      ||
    data?.results            ||
    [];

  if (!Array.isArray(itineraries) || !itineraries.length) return [];
  return itineraries.map((it: any, i: number) =>
    normalizeItinerary(it, origin, destination, departDate, i)
  );
}
