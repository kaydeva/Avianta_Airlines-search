import { requestWithCacheAndMerge, normalizeItinerary } from './skyscanner';
import type { FlightResult } from './skyscanner';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("VITE_API_URL is missing");
}

export interface MultiCitySegment {
  origin: string;
  destination: string;
  date: string;
}

export async function searchMulticity(
  segments: MultiCitySegment[],
  adults = 1,
  cabinClass = 'economy'
): Promise<FlightResult[]> {
  if (!segments || segments.length === 0) return [];

  const allResults: FlightResult[] = [];

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    const origin = seg.origin.toUpperCase().trim();
    const destination = seg.destination.toUpperCase().trim();
    const date = seg.date;

    try {
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

      const segResults = itineraries.slice(0, 5).map((it: any, idx: number) =>
        normalizeItinerary(it, origin, destination, date, i * 100 + idx)
      );

      allResults.push(...segResults);
    } catch (err: any) {
      console.warn(`Multi-city leg ${i + 1} (${origin}→${destination}) failed:`, err.message);
    }
  }

  return allResults;
}
