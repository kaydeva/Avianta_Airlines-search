import { requestWithCacheAndMerge } from './skyscanner';

const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("VITE_API_URL is missing");
}

// ─── Types ───────────────────────────────────────────────────
export interface HotelDestination {
  entityId: string;
  name: string;
  type: string;
  city?: string;
  country?: string;
}

export interface Hotel {
  hotelId: string;
  name: string;
  stars: number;
  reviewScore: number;
  reviewCount: number;
  price: number;
  currency: string;
  imageUrl: string;
  address: string;
  url: string;
  amenities: string[];
}

// ─── searchHotelDestination ───────────────────────────────────
export async function searchHotelDestination(query: string): Promise<HotelDestination[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/hotels/searchDestination`,
    {
      params: { query },
    },
    'airport'
  );
  const places = data?.places || data?.data || data || [];
  if (!Array.isArray(places)) return [];
  return places.map((p: any) => {
    const parts = (p.hierarchy || '').split('|');
    return {
      entityId: p.entityId || p.id || '',
      name: p.name || '',
      type: p.type || 'PLACE',
      city: p.cityName || p.city || parts[0] || '',
      country: p.countryName || p.country || parts[parts.length - 1] || '',
    };
  });
}

// ─── searchHotels ─────────────────────────────────────────────
export async function searchHotels(
  entityId: string,
  checkIn: string,
  checkOut: string,
  adults = 2,
  rooms = 1
): Promise<Hotel[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/hotels/searchHotels`,
    {
      params: { entityId, checkIn, checkOut, adults, rooms },
      timeout: 30000, // allow backend's 25 s deadline + round-trip
    },
    'flight'
  );

  // If backend returned a graceful deadline-timeout response, surface the message
  if (data?.message && (data?.hotels?.length === 0 || data?.data?.hotels?.length === 0)) {
    const hotels: Hotel[] = [];
    return hotels; // empty — UI will show the generic empty state
  }

  const hotels: any[] = data?.data?.hotels || data?.hotels || data?.data || data || [];
  if (!Array.isArray(hotels)) return [];

  return hotels.map((h: any, i: number) => ({
    hotelId: h.hotelId || h.id || `hotel-${i}`,
    name: h.name || h.hotelName || 'Unknown Hotel',
    stars: h.stars ?? h.starRating ?? 0,
    reviewScore: h.reviewScore ?? h.rating ?? 0,
    reviewCount: h.reviewCount ?? h.totalReviews ?? 0,
    price: h.price?.amount ?? h.price?.raw ?? h.minPrice ?? 0,
    currency: h.price?.currency ?? 'USD',
    imageUrl: h.images?.[0] || h.heroImage || h.imageUrl || h.image || '',
    address: h.address ?? h.location ?? h.distance ?? '',
    url: h.deeplink ?? h.bookingUrl ?? h.url ?? 'https://www.skyscanner.com/hotels',
    amenities: h.amenities ?? [],
  }));
}

// ─── getHotelDetails ─────────────────────────────────────────
export async function getHotelDetails(hotelId: string): Promise<any> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/hotels/getHotelDetails`,
    {
      params: { hotelId },
    },
    'flight'
  );
  return data?.data || data;
}

// ─── getHotelReviews ─────────────────────────────────────────
export async function getHotelReviews(hotelId: string): Promise<any[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/hotels/getHotelReviews`,
    {
      params: { hotelId },
    },
    'flight'
  );
  return data?.data || data || [];
}

// ─── getHotelPrices ───────────────────────────────────────────
export async function getHotelPrices(
  hotelId: string,
  checkIn: string,
  checkOut: string,
  adults = 2
): Promise<any[]> {
  const data = await requestWithCacheAndMerge(
    `${API_URL}/api/hotels/getHotelPrices`,
    {
      params: { hotelId, checkIn, checkOut, adults },
    },
    'flight'
  );
  return data?.data || data || [];
}
