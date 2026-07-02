import { requestWithCacheAndMerge } from './skyscanner';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("VITE_API_URL is missing");
}

export interface CarLocation {
  entityId: string;
  name: string;
  type: string;
  city?: string;
  country?: string;
}

export async function searchCarLocation(query: string): Promise<CarLocation[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/cars/searchLocation`,
    {
      params: { query },
    },
    'airport'
  );

  const locations = data?.locations || data?.data || data || [];
  if (!Array.isArray(locations)) return [];

  return locations.map((loc: any) => ({
    entityId: loc.locationId || loc.entityId || loc.id || '',
    name:     loc.name || '',
    type:     loc.type || 'LOCATION',
    city:     loc.city || loc.cityName || '',
    country:  loc.country || loc.countryName || '',
  }));
}
