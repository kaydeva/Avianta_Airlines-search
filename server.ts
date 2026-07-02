import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// ═══════════════════════════════════════════════════════════════
//  AIRPORT MAPPING — City Names & IATA Codes → Canonical IATA
// ═══════════════════════════════════════════════════════════════
const airportMapping: Record<string, string> = {
    // Lebanon
    beirut: "BEY", bey: "BEY",
    // Qatar
    doha: "DOH", doh: "DOH",
    // UAE
    dubai: "DXB", dxb: "DXB",
    "abu dhabi": "AUH", abu_dhabi: "AUH", abudhabi: "AUH", auh: "AUH",
    // Saudi Arabia
    riyadh: "RUH", ruh: "RUH",
    jeddah: "JED", jed: "JED",
    // Jordan
    amman: "AMM", amm: "AMM",
    // UK
    london: "LHR", lhr: "LHR",
    // France
    paris: "CDG", cdg: "CDG",
    // Germany
    frankfurt: "FRA", fra: "FRA",
    // Turkey
    istanbul: "IST", ist: "IST",
    // USA
    "new york": "JFK", new_york: "JFK", newyork: "JFK", jfk: "JFK",
    "los angeles": "LAX", los_angeles: "LAX", losangeles: "LAX", lax: "LAX",
    chicago: "ORD", ord: "ORD",
    miami: "MIA", mia: "MIA",
    // Egypt
    cairo: "CAI", cai: "CAI",
    // Kuwait
    kuwait: "KWI", kwi: "KWI",
    // Bahrain
    bahrain: "BAH", manama: "BAH", bah: "BAH",
    // Oman
    muscat: "MCT", mct: "MCT",
    // Morocco
    casablanca: "CMN", cmn: "CMN",
    // India
    mumbai: "BOM", bom: "BOM",
    delhi: "DEL", del: "DEL",
    // Singapore
    singapore: "SIN", sin: "SIN",
    // Thailand
    bangkok: "BKK", bkk: "BKK",
    // Australia
    sydney: "SYD", syd: "SYD",
    // Greece
    athens: "ATH", ath: "ATH",
    // Italy
    rome: "FCO", fco: "FCO",
    milan: "MXP", mxp: "MXP",
    // Spain
    madrid: "MAD", mad: "MAD",
    barcelona: "BCN", bcn: "BCN",
    // Netherlands
    amsterdam: "AMS", ams: "AMS",
    // Switzerland
    zurich: "ZRH", zrh: "ZRH",
    geneva: "GVA", gva: "GVA",
    // Japan
    tokyo: "NRT", nrt: "NRT",
    // South Korea
    seoul: "ICN", icn: "ICN",
    // China
    beijing: "PEK", pek: "PEK",
    shanghai: "PVG", pvg: "PVG",
    // Hong Kong
    "hong kong": "HKG", hongkong: "HKG", hkg: "HKG",
};

function normalizeAirport(input: string): string {
    const clean = input.toLowerCase().trim().replace(/\s+/g, " ");
    return airportMapping[clean] || input.toUpperCase().trim();
}

// ═══════════════════════════════════════════════════════════════
//  IN-MEMORY CACHE  — Tiered TTLs
//  Airport/location data is static → 24 hours
//  Flight search results are live   → 10 minutes
// ═══════════════════════════════════════════════════════════════
const CACHE_TTL_STATIC_MS = 24 * 60 * 60 * 1000; // 24 h — airports, locations
const CACHE_TTL_FLIGHT_MS = 10 * 60 * 1000; // 10 min — flight search results

interface CacheEntry {
    data: unknown;
    expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function getCached(key: string): unknown | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

/** Use ttl=CACHE_TTL_STATIC_MS for airport/location lookups, default=flights */
function setCache(key: string, data: unknown, ttl: number = CACHE_TTL_FLIGHT_MS): void {
    cache.set(key, { data, expiresAt: Date.now() + ttl });
}

// ═══════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const app = express();
const PORT = process.env.PORT || 5000;

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = "skyscanner-flights-travel-api.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;

if (!RAPIDAPI_KEY) {
    console.warn("⚠️  WARNING: No RAPIDAPI_KEY found in environment. All API calls will fail.");
}

// ═══════════════════════════════════════════════════════════════
//  MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
app.use(cors());
app.use(express.json());

// Global throttle middleware
app.use((req, res, next) => {
    if (req.path.startsWith("/api/") && !req.path.startsWith("/api/cache/") && req.method !== "OPTIONS") {
        if (!checkClientThrottle(req)) {
            res.status(429).json({ error: "Too many requests. Please slow down." });
            return;
        }
    }
    next();
});

const rapidApiHeaders = () => ({
    "X-RapidAPI-Key": RAPIDAPI_KEY,
    "X-RapidAPI-Host": RAPIDAPI_HOST,
    "Content-Type": "application/json",
});

// ═══════════════════════════════════════════════════════════════
//  LOCAL AUTOCOMPLETE DATABASE
//  Used ONLY for autocomplete suggestions (saves API quota).
//  All flight/hotel/car searches ALWAYS hit the real Skyscanner API.
// ═══════════════════════════════════════════════════════════════
const airportDatabase = [
    { skyId: "BEY", entityId: "128667319", name: "Beirut-Rafic Hariri International Airport", iata: "BEY", city: "Beirut", country: "Lebanon" },
    { skyId: "DXBA", entityId: "27540839", name: "Dubai International Airport", iata: "DXB", city: "Dubai", country: "United Arab Emirates" },
    { skyId: "AUH", entityId: "128668980", name: "Abu Dhabi International Airport", iata: "AUH", city: "Abu Dhabi", country: "United Arab Emirates" },
    { skyId: "DOH", entityId: "95673852", name: "Hamad International Airport", iata: "DOH", city: "Doha", country: "Qatar" },
    { skyId: "RUH", entityId: "128668084", name: "King Khalid International Airport", iata: "RUH", city: "Riyadh", country: "Saudi Arabia" },
    { skyId: "JED", entityId: "128668716", name: "King Abdulaziz International Airport", iata: "JED", city: "Jeddah", country: "Saudi Arabia" },
    { skyId: "AMM", entityId: "128668179", name: "Queen Alia International Airport", iata: "AMM", city: "Amman", country: "Jordan" },
    { skyId: "LHR", entityId: "95565050", name: "London Heathrow Airport", iata: "LHR", city: "London", country: "United Kingdom" },
    { skyId: "CDG", entityId: "95565041", name: "Paris Charles de Gaulle Airport", iata: "CDG", city: "Paris", country: "France" },
    { skyId: "FRA", entityId: "95565049", name: "Frankfurt Airport", iata: "FRA", city: "Frankfurt", country: "Germany" },
    { skyId: "IST", entityId: "128669717", name: "Istanbul Airport", iata: "IST", city: "Istanbul", country: "Turkey" },
    { skyId: "JFK", entityId: "95565059", name: "John F. Kennedy International Airport", iata: "JFK", city: "New York", country: "United States" },
    { skyId: "LAX", entityId: "95565058", name: "Los Angeles International Airport", iata: "LAX", city: "Los Angeles", country: "United States" },
    { skyId: "ORD", entityId: "95565055", name: "O'Hare International Airport", iata: "ORD", city: "Chicago", country: "United States" },
    { skyId: "MIA", entityId: "95565062", name: "Miami International Airport", iata: "MIA", city: "Miami", country: "United States" },
    { skyId: "CAI", entityId: "128669825", name: "Cairo International Airport", iata: "CAI", city: "Cairo", country: "Egypt" },
    { skyId: "KWI", entityId: "128667875", name: "Kuwait International Airport", iata: "KWI", city: "Kuwait", country: "Kuwait" },
    { skyId: "BAH", entityId: "128668428", name: "Bahrain International Airport", iata: "BAH", city: "Manama", country: "Bahrain" },
    { skyId: "MCT", entityId: "128669116", name: "Muscat International Airport", iata: "MCT", city: "Muscat", country: "Oman" },
    { skyId: "CMN", entityId: "128668585", name: "Mohammed V International Airport", iata: "CMN", city: "Casablanca", country: "Morocco" },
    { skyId: "BOM", entityId: "128669042", name: "Chhatrapati Shivaji Maharaj International", iata: "BOM", city: "Mumbai", country: "India" },
    { skyId: "DEL", entityId: "128669043", name: "Indira Gandhi International Airport", iata: "DEL", city: "Delhi", country: "India" },
    { skyId: "SIN", entityId: "128667988", name: "Singapore Changi Airport", iata: "SIN", city: "Singapore", country: "Singapore" },
    { skyId: "BKK", entityId: "128668668", name: "Suvarnabhumi Airport", iata: "BKK", city: "Bangkok", country: "Thailand" },
    { skyId: "SYD", entityId: "128670133", name: "Sydney Airport", iata: "SYD", city: "Sydney", country: "Australia" },
    { skyId: "ATH", entityId: "128668501", name: "Athens International Airport", iata: "ATH", city: "Athens", country: "Greece" },
    { skyId: "FCO", entityId: "95565045", name: "Rome Fiumicino Airport", iata: "FCO", city: "Rome", country: "Italy" },
    { skyId: "MXP", entityId: "95565046", name: "Milan Malpensa Airport", iata: "MXP", city: "Milan", country: "Italy" },
    { skyId: "MAD", entityId: "95565044", name: "Madrid-Barajas Airport", iata: "MAD", city: "Madrid", country: "Spain" },
    { skyId: "BCN", entityId: "95565043", name: "Barcelona-El Prat Airport", iata: "BCN", city: "Barcelona", country: "Spain" },
    { skyId: "AMS", entityId: "95565042", name: "Amsterdam Airport Schiphol", iata: "AMS", city: "Amsterdam", country: "Netherlands" },
    { skyId: "ZRH", entityId: "95565047", name: "Zurich Airport", iata: "ZRH", city: "Zurich", country: "Switzerland" },
    { skyId: "GVA", entityId: "95565048", name: "Geneva Airport", iata: "GVA", city: "Geneva", country: "Switzerland" },
    { skyId: "NRT", entityId: "128668217", name: "Narita International Airport", iata: "NRT", city: "Tokyo", country: "Japan" },
    { skyId: "ICN", entityId: "128668218", name: "Incheon International Airport", iata: "ICN", city: "Seoul", country: "South Korea" },
    { skyId: "PEK", entityId: "128668219", name: "Beijing Capital International Airport", iata: "PEK", city: "Beijing", country: "China" },
    { skyId: "PVG", entityId: "128668220", name: "Shanghai Pudong International Airport", iata: "PVG", city: "Shanghai", country: "China" },
    { skyId: "HKG", entityId: "128668221", name: "Hong Kong International Airport", iata: "HKG", city: "Hong Kong", country: "China" },
];

const hotelDestinations = [
    { entityId: "27540839", name: "Dubai", type: "city", cityName: "Dubai", countryName: "United Arab Emirates", hierarchy: "Dubai|United Arab Emirates" },
    { entityId: "128667319", name: "Beirut", type: "city", cityName: "Beirut", countryName: "Lebanon", hierarchy: "Beirut|Lebanon" },
    { entityId: "95565050", name: "London", type: "city", cityName: "London", countryName: "United Kingdom", hierarchy: "London|United Kingdom" },
    { entityId: "95565041", name: "Paris", type: "city", cityName: "Paris", countryName: "France", hierarchy: "Paris|France" },
    { entityId: "95565059", name: "New York", type: "city", cityName: "New York", countryName: "United States", hierarchy: "New York|United States" },
    { entityId: "95673852", name: "Doha", type: "city", cityName: "Doha", countryName: "Qatar", hierarchy: "Doha|Qatar" },
    { entityId: "128668084", name: "Riyadh", type: "city", cityName: "Riyadh", countryName: "Saudi Arabia", hierarchy: "Riyadh|Saudi Arabia" },
    { entityId: "128669717", name: "Istanbul", type: "city", cityName: "Istanbul", countryName: "Turkey", hierarchy: "Istanbul|Turkey" },
    { entityId: "95565049", name: "Frankfurt", type: "city", cityName: "Frankfurt", countryName: "Germany", hierarchy: "Frankfurt|Germany" },
    { entityId: "128668179", name: "Amman", type: "city", cityName: "Amman", countryName: "Jordan", hierarchy: "Amman|Jordan" },
];

// ═══════════════════════════════════════════════════════════════
//  RAPIDAPI USAGE MONITOR & STATS
// ═══════════════════════════════════════════════════════════════
const monitor = {
    totalRequests: 0,
    apiCalls: 0,
    cacheHits: 0,
    cacheMisses: 0,
    quotaWarnings: 0,
    endpointUsage: {} as Record<string, number>,
    cacheHitRate: 0,
    startTime: Date.now(),
};

function logMonitorStats(label: string, type: "hit" | "miss" | "warning" | "api") {
    if (type === "hit") monitor.cacheHits++;
    if (type === "miss") monitor.cacheMisses++;
    if (type === "warning") monitor.quotaWarnings++;
    if (type === "api") monitor.apiCalls++;

    const total = monitor.cacheHits + monitor.cacheMisses;
    monitor.cacheHitRate = total > 0 ? Math.round((monitor.cacheHits / total) * 100) : 0;

    monitor.endpointUsage[label] = (monitor.endpointUsage[label] || 0) + 1;

    const uptime = Math.floor((Date.now() - monitor.startTime) / 1000);
    console.log(`📊 [MONITOR] Hits: ${monitor.cacheHits} | Misses: ${monitor.cacheMisses} | API Calls: ${monitor.apiCalls} | Warnings: ${monitor.quotaWarnings} | Hit Rate: ${monitor.cacheHitRate}% | Uptime: ${uptime}s`);
}

// ═══════════════════════════════════════════════════════════════
//  FRONTEND THROTTLING — Prevent request spamming
// ═══════════════════════════════════════════════════════════════
const clientRateLimits = new Map<string, { count: number; resetAt: number }>();
function checkClientThrottle(req: express.Request): boolean {
    const ip = req.ip || req.headers["x-forwarded-for"] as string || "global";
    const now = Date.now();
    const entry = clientRateLimits.get(ip);
    if (!entry || now > entry.resetAt) {
        clientRateLimits.set(ip, { count: 1, resetAt: now + 1000 });
        return true;
    }
    entry.count++;
    if (entry.count > 20) {
        console.warn(`🚨 [THROTTLE] Client ${ip} exceeded rate limit (${entry.count} req/s)`);
        return false;
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════
//  IN-FLIGHT REQUEST DEDUPLICATOR (Request Merging)
// ═══════════════════════════════════════════════════════════════
const inFlightRequests = new Map<string, Promise<any>>();

// ═══════════════════════════════════════════════════════════════
//  SHARED PROXY HELPER — Always calls the real Skyscanner API.
//  No mock data. Errors propagate cleanly to the frontend.
// ═══════════════════════════════════════════════════════════════
async function proxyGet(
    res: express.Response,
    path: string,
    params: Record<string, unknown>,
    label: string,
    cacheKey?: string
) {
    monitor.totalRequests++;

    if (cacheKey) {
        const cached = getCached(cacheKey);
        if (cached) {
            console.log(`⚡ [${label}] Cache HIT`);
            logMonitorStats(label, "hit");
            res.json(cached);
            return;
        }
    }

    logMonitorStats(label, "miss");
    const requestKey = `${path}?${JSON.stringify(params)}`;
    console.log(`🌐 [${label}] →`, `${BASE_URL}${path}`, params);

    let data;
    try {
        // Determine if this is a hotel endpoint (slow API — no retries, longer timeout)
        const isHotelPath = path.startsWith("/hotels/");
        const perCallTimeout = isHotelPath ? 22000 : 15000;
        const maxRetries = isHotelPath ? 0 : 2;     // hotels: never retry

        if (inFlightRequests.has(requestKey)) {
            console.log(`🔗 [${label}] Merging concurrent request for: ${requestKey}`);
            data = await inFlightRequests.get(requestKey);
        } else {
            const fetchPromise = (async () => {
                let retries = maxRetries;
                while (retries >= 0) {
                    try {
                        logMonitorStats(label, "api");
                        const response = await axios.get(`${BASE_URL}${path}`, {
                            params,
                            headers: rapidApiHeaders(),
                            timeout: perCallTimeout,
                        });

                        // Check if headers indicate quota limit approaching
                        const limitHeader = response.headers?.["x-ratelimit-requests-remaining"];
                        if (limitHeader && parseInt(limitHeader as string) < 10) {
                            console.warn("⚠️ [MONITOR] RapidAPI request quota warning! Remaining:", limitHeader);
                            logMonitorStats(label, "warning");
                        }

                        return response.data;
                    } catch (err: any) {
                        const status = err.response?.status || 500;
                        if (status === 429 || (err.response?.data && JSON.stringify(err.response.data).includes("quota"))) {
                            logMonitorStats(label, "warning");
                        }

                        if (retries === 0 || status === 400 || status === 404 || status === 429) {
                            throw err;
                        }
                        console.warn(`🔄 [${label}] Retrying API call, attempts left: ${retries}. Error: ${err.message}`);
                        retries--;
                        await new Promise((resolve) => setTimeout(resolve, 200)); // slight backoff
                    }
                }
            })();

            // Wrap in an overall deadline — hotel responses must arrive within 25 s
            const OVERALL_DEADLINE_MS = isHotelPath ? 25000 : 45000;
            const deadlinePromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error(`[${label}] Overall deadline of ${OVERALL_DEADLINE_MS / 1000}s exceeded`)), OVERALL_DEADLINE_MS)
            );

            inFlightRequests.set(requestKey, fetchPromise);
            try {
                data = await Promise.race([fetchPromise, deadlinePromise]);
            } finally {
                inFlightRequests.delete(requestKey);
            }
        }

        // Safe fallback for missing fields in standard properties
        if (data && typeof data === "object") {
            if (path.includes("/flights/searchFlights") && !data.itineraries && !data.data?.itineraries) {
                // Ensure array structures exist to prevent frontend crash
                if (data.data) data.data.itineraries = data.data.itineraries || [];
                else data.itineraries = [];
            }
            if (path.includes("/hotels/searchHotels") && !data.hotels && !data.data?.hotels) {
                if (data.data) data.data.hotels = data.data.hotels || [];
                else data.hotels = [];
            }
            if (path.includes("/cars/searchCars") && !data.cars && !data.data?.cars) {
                if (data.data) data.data.cars = data.data.cars || [];
                else data.cars = [];
            }
        }

        if (cacheKey) setCache(cacheKey, data);
        res.json(data);
    } catch (err: any) {
        const isDeadline = !err.response && typeof err.message === 'string' && err.message.includes('Overall deadline');
        const status = isDeadline ? 200 : (err.response?.status || 500);
        const details = err.response?.data || err.message;

        if (isDeadline) {
            // Hotel API is genuinely slow — return empty set gracefully
            console.warn(`⏱️ [${label}] Deadline reached — returning empty result to frontend.`);
            res.json({
                hotels: [],
                data: { hotels: [] },
                message: 'The hotel search took too long. Please try again or narrow your search.',
            });
        } else {
            console.error(`❌ [${label}] ${status}:`, JSON.stringify(details));
            res.status(status).json({
                error: `${label} failed`,
                message: details?.message || details || "API request failed",
                status,
                data: path.includes("searchFlights") ? { itineraries: [] } : path.includes("searchHotels") ? { hotels: [] } : []
            });
        }
    }
}

// ═══════════════════════════════════════════════════════════════
//  KNOWN ENTITY IDs — avoids API calls for common airports
//  skyId = IATA code used by Skyscanner, entityId from their DB
// ═══════════════════════════════════════════════════════════════
const knownEntities: Record<string, { skyId: string; entityId: string }> = {
    BEY: { skyId: "BEY", entityId: "128667319" },
    DXB: { skyId: "DXBA", entityId: "27540839" },
    AUH: { skyId: "AUH", entityId: "128668980" },
    DOH: { skyId: "DOH", entityId: "95673852" },
    RUH: { skyId: "RUH", entityId: "128668084" },
    JED: { skyId: "JED", entityId: "128668716" },
    AMM: { skyId: "AMM", entityId: "128668179" },
    LHR: { skyId: "LHR", entityId: "95565050" },
    CDG: { skyId: "CDG", entityId: "95565041" },
    FRA: { skyId: "FRA", entityId: "95565049" },
    IST: { skyId: "IST", entityId: "128669717" },
    JFK: { skyId: "JFK", entityId: "95565059" },
    LAX: { skyId: "LAX", entityId: "95565058" },
    ORD: { skyId: "ORD", entityId: "95565055" },
    MIA: { skyId: "MIA", entityId: "95565062" },
    CAI: { skyId: "CAI", entityId: "128669825" },
    KWI: { skyId: "KWI", entityId: "128667875" },
    BAH: { skyId: "BAH", entityId: "128668428" },
    MCT: { skyId: "MCT", entityId: "128669116" },
    CMN: { skyId: "CMN", entityId: "128668585" },
    BOM: { skyId: "BOM", entityId: "128669042" },
    DEL: { skyId: "DEL", entityId: "128669043" },
    SIN: { skyId: "SIN", entityId: "128667988" },
    BKK: { skyId: "BKK", entityId: "128668668" },
    SYD: { skyId: "SYD", entityId: "128670133" },
    ATH: { skyId: "ATH", entityId: "128668501" },
    FCO: { skyId: "FCO", entityId: "95565045" },
    MXP: { skyId: "MXP", entityId: "95565046" },
    MAD: { skyId: "MAD", entityId: "95565044" },
    BCN: { skyId: "BCN", entityId: "95565043" },
    AMS: { skyId: "AMS", entityId: "95565042" },
    ZRH: { skyId: "ZRH", entityId: "95565047" },
    GVA: { skyId: "GVA", entityId: "95565048" },
    NRT: { skyId: "NRT", entityId: "128668217" },
    ICN: { skyId: "ICN", entityId: "128668218" },
    PEK: { skyId: "PEK", entityId: "128668219" },
    PVG: { skyId: "PVG", entityId: "128668220" },
    HKG: { skyId: "HKG", entityId: "128668221" },
    // city-level IATA aliases (Skyscanner uses these)
    DXBA: { skyId: "DXBA", entityId: "27540839" },
    PARI: { skyId: "PARI", entityId: "27539733" },
    LOND: { skyId: "LOND", entityId: "27544008" },
    NYCA: { skyId: "NYCA", entityId: "27537542" },
};

// ═══════════════════════════════════════════════════════════════
//  AIRPORT RESOLUTION HELPER
//  Priority: knownEntities → resolve cache → autocomplete cache → API
// ═══════════════════════════════════════════════════════════════
async function resolveAirportEntity(query: string) {
    if (!query) return { skyId: "", entityId: "" };

    const upperQuery = query.toUpperCase().trim();
    const lowerQuery = query.toLowerCase().trim();
    const cacheKey = `resolve-${lowerQuery}`;

    // 1. Check built-in entity table first — zero API cost
    if (knownEntities[upperQuery]) {
        console.log(`📋 [resolveAirportEntity] Local hit for ${upperQuery}`);
        return knownEntities[upperQuery];
    }

    // 2. Check resolve cache (previously resolved via API)
    const cached = getCached(cacheKey) as { skyId: string; entityId: string } | null;
    if (cached) return cached;

    // 3. Check airportDatabase by IATA code (catches any edge cases)
    const dbByIata = airportDatabase.find(a => a.iata.toUpperCase() === upperQuery);
    if (dbByIata) {
        const result = { skyId: dbByIata.skyId, entityId: dbByIata.entityId };
        console.log(`📋 [resolveAirportEntity] DB hit for ${upperQuery}`);
        setCache(cacheKey, result, CACHE_TTL_STATIC_MS);
        return result;
    }

    // 4. Check autocomplete proxy cache (populated when user typed in the search box)
    const proxyCacheKey = `airport-${lowerQuery}-en-US`;
    const proxyCached = getCached(proxyCacheKey) as any;
    if (proxyCached) {
        const places: any[] = proxyCached.places || proxyCached.data || [];
        if (places.length > 0) {
            const result = {
                skyId: places[0].skyId || places[0].iataCode || upperQuery,
                entityId: places[0].entityId || "",
            };
            setCache(cacheKey, result, CACHE_TTL_STATIC_MS);
            return result;
        }
    }

    // 4. Last resort — one API call; cache for 24 h so it never repeats
    console.log(`🔍 [resolveAirportEntity] API lookup for "${query}"`);
    try {
        const response = await axios.get(`${BASE_URL}/flights/searchAirport`, {
            params: { query, locale: "en-US", market: "US" },
            headers: rapidApiHeaders(),
            timeout: 12000,
        });
        const places: any[] = response.data?.places || response.data?.data || [];
        if (places.length > 0) {
            const result = {
                skyId: places[0].skyId || places[0].iataCode || upperQuery,
                entityId: places[0].entityId || "",
            };
            setCache(cacheKey, result, CACHE_TTL_STATIC_MS); // 24 h
            return result;
        }
    } catch (e: any) {
        console.error(`❌ [resolveAirportEntity] Failed for "${query}":`, e.response?.status, e.response?.data || e.message);
    }
    return { skyId: upperQuery, entityId: "" };
}

// ═══════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
app.get("/health", (_req, res) => {
    const uptime = Math.floor((Date.now() - monitor.startTime) / 1000);
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        host: RAPIDAPI_HOST,
        apiKeyConfigured: !!RAPIDAPI_KEY,
        cacheSize: cache.size,
        uptime: `${uptime}s`,
        monitor: {
            totalRequests: monitor.totalRequests,
            apiCalls: monitor.apiCalls,
            cacheHits: monitor.cacheHits,
            cacheMisses: monitor.cacheMisses,
            cacheHitRate: `${monitor.cacheHitRate}%`,
            quotaWarnings: monitor.quotaWarnings,
        },
    });
});

// ═══════════════════════════════════════════════════════════════
//  CACHE STATS ENDPOINT
// ═══════════════════════════════════════════════════════════════
app.get("/api/cache/stats", (_req, res) => {
    const entries: Record<string, number> = {};
    cache.forEach((entry, key) => {
        const group = key.split("-")[0];
        entries[group] = (entries[group] || 0) + 1;
    });

    const uptime = Math.floor((Date.now() - monitor.startTime) / 1000);
    res.json({
        totalEntries: cache.size,
        groups: entries,
        expiresIn: `${Math.max(0, Math.round((CACHE_TTL_FLIGHT_MS - (Date.now() % CACHE_TTL_FLIGHT_MS)) / 1000))}s`,
        monitor: {
            totalRequests: monitor.totalRequests,
            apiCalls: monitor.apiCalls,
            cacheHits: monitor.cacheHits,
            cacheMisses: monitor.cacheMisses,
            cacheHitRate: `${monitor.cacheHitRate}%`,
            quotaWarnings: monitor.quotaWarnings,
            endpointUsage: monitor.endpointUsage,
            uptime: `${uptime}s`,
        },
    });
});

// ═══════════════════════════════════════════════════════════════
//  FLIGHTS — searchAirport
// Rate Limiting Throttling for /searchAirport
const airportRateLimits = new Map<string, number[]>();
function throttleAirportSearch(ip: string): boolean {
    const now = Date.now();
    const windowMs = 5000;
    const maxRequests = 10; // 10 requests in 5 seconds

    let timestamps = airportRateLimits.get(ip) || [];
    timestamps = timestamps.filter(t => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
        return false;
    }

    timestamps.push(now);
    airportRateLimits.set(ip, timestamps);
    return true;
}

// ═══════════════════════════════════════════════════════════════
//  FLIGHTS — searchAirport
//  GET /api/flights/searchAirport?query=Dubai
// ═══════════════════════════════════════════════════════════════
app.get("/api/flights/searchAirport", async (req, res) => {
    const ip = req.ip || "global";
    if (!throttleAirportSearch(ip)) {
        console.warn(`🚨 [THROTTLE] Rate limit reached for searchAirport from IP: ${ip}`);
        res.status(429).json({ error: "Too many requests. Please wait a moment." });
        return;
    }

    const { query, locale = "en-US" } = req.query;
    if (!query) { res.status(400).json({ error: "Missing: query" }); return; }

    const queryStr = String(query).trim().toLowerCase();
    // Block single-character queries — they waste quota and return useless results
    if (queryStr.length < 2) {
        res.json({ data: [], places: [] });
        return;
    }

    // 1. Try local database lookup first to save quota
    const localMatches = airportDatabase.filter(a =>
        a.iata.toLowerCase().includes(queryStr) ||
        a.city.toLowerCase().includes(queryStr) ||
        a.name.toLowerCase().includes(queryStr) ||
        a.country.toLowerCase().includes(queryStr)
    ).map(a => ({
        entityId: a.entityId,
        skyId: a.skyId,
        iataCode: a.iata,
        iata: a.iata,
        name: a.name,
        cityName: a.city,
        countryName: a.country,
        type: "AIRPORT"
    }));

    if (localMatches.length > 0) {
        console.log(`📋 [searchAirport] Local DB matches found: ${localMatches.length}`);
        res.json({ status: true, data: localMatches, places: localMatches });
        return;
    }

    // 2. Cache check
    const cacheKey = `airport-${queryStr}-${locale}`;
    const cached = getCached(cacheKey);
    if (cached) {
        console.log(`⚡ [searchAirport] Cache HIT for "${query}"`);
        res.json(cached);
        return;
    }

    // 3. Fallback proxy
    console.log(`🌐 [searchAirport] →`, `${BASE_URL}/flights/searchAirport`, { query, locale, market: "US" });
    try {
        const response = await axios.get(`${BASE_URL}/flights/searchAirport`, {
            params: { query, locale, market: "US" },
            headers: rapidApiHeaders(),
            timeout: 12000,
        });
        setCache(cacheKey, response.data, CACHE_TTL_STATIC_MS); // 24 h
        res.json(response.data);
    } catch (err: any) {
        const status = err.response?.status || 500;
        const details = err.response?.data || err.message;
        console.error(`❌ [searchAirport] ${status}:`, JSON.stringify(details));

        // Return whatever localMatches we can instead of failing
        res.json({ status: true, data: localMatches, places: localMatches });
    }
});

// ═══════════════════════════════════════════════════════════════
//  FLIGHTS — searchFlights (one-way)
//  GET /api/flights/searchFlights?origin=BEY&destination=DXB&date=2025-08-01
// ═══════════════════════════════════════════════════════════════
app.get("/api/flights/searchFlights", async (req, res) => {
    let { origin, destination, date, returnDate, adults = "1", cabinClass = "economy",
        currency = "USD", market = "US", locale = "en-US" } = req.query;

    if (!origin || !destination || !date) {
        res.status(400).json({ error: "Missing: origin, destination, date" });
        return;
    }

    origin = normalizeAirport(String(origin));
    destination = normalizeAirport(String(destination));

    const origRes = await resolveAirportEntity(origin);
    const destRes = await resolveAirportEntity(destination);

    console.log(`📥 [searchFlights] ${origin} → ${destination} on ${date} (Return: ${returnDate || 'N/A'})`);
    console.log(`DEBUG: origRes=${JSON.stringify(origRes)}, destRes=${JSON.stringify(destRes)}`);

    const proxyParams: any = {
        originSkyId: origRes.skyId,
        destinationSkyId: destRes.skyId,
        originEntityId: origRes.entityId,
        destinationEntityId: destRes.entityId,
        date, adults, cabinClass, currency, market, locale,
    };
    if (returnDate) proxyParams.returnDate = returnDate;

    await proxyGet(res, "/flights/searchFlights", proxyParams, "searchFlights", `flights-${origin}-${destination}-${date}-${returnDate || 'oneway'}-${adults}-${cabinClass}`);
});

// ═══════════════════════════════════════════════════════════════
//  FLIGHTS — searchIncomplete (poll for more results)
//  GET /api/flights/searchIncomplete?sessionId=xxx
// ═══════════════════════════════════════════════════════════════
app.get("/api/flights/searchIncomplete", async (req, res) => {
    const { sessionId } = req.query;
    if (!sessionId) { res.status(400).json({ error: "Missing: sessionId" }); return; }

    await proxyGet(res, "/flights/searchIncomplete", { sessionId }, "searchIncomplete");
});

// ═══════════════════════════════════════════════════════════════
//  FLIGHTS — getFlightDetails
//  GET /api/flights/getFlightDetails?itineraryId=xxx&sessionId=xxx
// ═══════════════════════════════════════════════════════════════
app.get("/api/flights/getFlightDetails", async (req, res) => {
    const { itineraryId, sessionId, legs, adults = "1", cabinClass = "economy",
        currency = "USD", market = "US", locale = "en-US" } = req.query;

    if (!itineraryId || !sessionId) {
        res.status(400).json({ error: "Missing: itineraryId, sessionId" });
        return;
    }

    await proxyGet(res, "/flights/getFlightDetails", {
        itineraryId, sessionId, legs, adults, cabinClass, currency, market, locale,
    }, "getFlightDetails");
});

// ═══════════════════════════════════════════════════════════════
//  FLIGHTS — searchFlightEverywhere
//  GET /api/flights/searchFlightEverywhere?origin=BEY&date=2025-08-01
// ═══════════════════════════════════════════════════════════════
app.get("/api/flights/searchFlightEverywhere", async (req, res) => {
    let { origin, date, currency = "USD", market = "US", locale = "en-US" } = req.query;

    if (!origin || !date) {
        res.status(400).json({ error: "Missing: origin, date" });
        return;
    }
    origin = normalizeAirport(String(origin));

    await proxyGet(res, "/flights/searchFlightEverywhere", {
        origin, date, currency, market, locale,
    }, "searchFlightEverywhere", `everywhere-${origin}-${date}`);
});

// ═══════════════════════════════════════════════════════════════
//  FLIGHTS — getCheapestOneway
//  GET /api/flights/getCheapestOneway?origin=BEY&destination=DXB
// ═══════════════════════════════════════════════════════════════
app.get("/api/flights/getCheapestOneway", async (req, res) => {
    let { origin, destination, currency = "USD", market = "US", locale = "en-US" } = req.query;

    if (!origin || !destination) {
        res.status(400).json({ error: "Missing: origin, destination" });
        return;
    }
    origin = normalizeAirport(String(origin));
    destination = normalizeAirport(String(destination));

    await proxyGet(res, "/flights/getCheapestOneway", {
        origin, destination, currency, market, locale,
    }, "getCheapestOneway", `cheapest-${origin}-${destination}`);
});

// ═══════════════════════════════════════════════════════════════
//  FLIGHTS — searchFlightsMultiStop
//  POST /api/flights/searchFlightsMultiStop
// ═══════════════════════════════════════════════════════════════
app.post("/api/flights/searchFlightsMultiStop", async (req, res) => {
    const { segments, adults = 1, cabinClass = "economy",
        currency = "USD", market = "US", locale = "en-US" } = req.body;

    if (!segments || !Array.isArray(segments) || segments.length < 2) {
        res.status(400).json({ error: "Missing or invalid segments (min 2)" });
        return;
    }

    const mappedSegments = await Promise.all(segments.map(async (seg: any) => {
        const origRes = await resolveAirportEntity(normalizeAirport(seg.origin));
        const destRes = await resolveAirportEntity(normalizeAirport(seg.destination));
        return {
            originSkyId: origRes.skyId,
            destinationSkyId: destRes.skyId,
            originEntityId: origRes.entityId,
            destinationEntityId: destRes.entityId,
            date: seg.date,
        };
    }));

    console.log("📥 [searchFlightsMultiStop] Segments:", mappedSegments);

    try {
        const response = await axios.post(`${BASE_URL}/flights/searchFlightsMultiStop`, {
            segments: mappedSegments, adults, cabinClass, currency, market, locale,
        }, { headers: rapidApiHeaders(), timeout: 30000 });

        res.json(response.data);
    } catch (err: any) {
        const status = err.response?.status || 500;
        const details = err.response?.data || err.message;
        console.error("❌ [searchFlightsMultiStop]", status, details);
        res.status(status).json({
            error: "searchFlightsMultiStop failed",
            message: details?.message || details,
            status,
        });
    }
});

// ═══════════════════════════════════════════════════════════════
//  FLIGHTS — getPriceCalendar
//  GET /api/flights/getPriceCalendar?origin=BEY&destination=DXB&yearMonth=2025-08
// ═══════════════════════════════════════════════════════════════
app.get("/api/flights/getPriceCalendar", async (req, res) => {
    let { origin, destination, yearMonth, currency = "USD", market = "US", locale = "en-US" } = req.query;

    if (!origin || !destination || !yearMonth) {
        res.status(400).json({ error: "Missing: origin, destination, yearMonth" });
        return;
    }
    origin = normalizeAirport(String(origin));
    destination = normalizeAirport(String(destination));

    await proxyGet(res, "/flights/getPriceCalendar", {
        origin, destination, yearMonth, currency, market, locale,
    }, "getPriceCalendar", `calendar-${origin}-${destination}-${yearMonth}`);
});

// ═══════════════════════════════════════════════════════════════
//  FLIGHTS — getPriceCalendarReturn
//  GET /api/flights/getPriceCalendarReturn?origin=BEY&destination=DXB&departDate=2025-08-01&returnDate=2025-08-10
// ═══════════════════════════════════════════════════════════════
app.get("/api/flights/getPriceCalendarReturn", async (req, res) => {
    let { origin, destination, departDate, returnDate,
        currency = "USD", market = "US", locale = "en-US" } = req.query;

    if (!origin || !destination || !departDate || !returnDate) {
        res.status(400).json({ error: "Missing: origin, destination, departDate, returnDate" });
        return;
    }
    origin = normalizeAirport(String(origin));
    destination = normalizeAirport(String(destination));

    await proxyGet(res, "/flights/getPriceCalendarReturn", {
        origin, destination, departDate, returnDate, currency, market, locale,
    }, "getPriceCalendarReturn",
        `calreturn-${origin}-${destination}-${departDate}-${returnDate}`);
});

// ═══════════════════════════════════════════════════════════════
//  LEGACY — ONE-WAY  (backward compat)
//  GET /api/flights → proxies to searchFlights
// ═══════════════════════════════════════════════════════════════
app.get("/api/flights", async (req, res) => {
    let { origin, destination, date, adults = "1", cabin = "economy",
        currency = "USD", market = "US", locale = "en-US" } = req.query;

    if (!origin || !destination || !date) {
        res.status(400).json({ error: "Missing: origin, destination, date" });
        return;
    }
    origin = normalizeAirport(String(origin));
    destination = normalizeAirport(String(destination));

    await proxyGet(res, "/flights/searchFlights", {
        origin, destination, date, adults, cabinClass: cabin, currency, market, locale,
    }, "legacyFlights", `legacy-flights-${origin}-${destination}-${date}`);
});

// ═══════════════════════════════════════════════════════════════
//  LEGACY — ROUNDTRIP  (backward compat)
//  GET /api/roundtrip → proxies to searchFlights with returnDate
// ═══════════════════════════════════════════════════════════════
app.get("/api/roundtrip", async (req, res) => {
    let { origin, destination, departDate, returnDate, adults = "1",
        cabin = "economy", currency = "USD", market = "US", locale = "en-US" } = req.query;

    if (!origin || !destination || !departDate || !returnDate) {
        res.status(400).json({ error: "Missing: origin, destination, departDate, returnDate" });
        return;
    }
    origin = normalizeAirport(String(origin));
    destination = normalizeAirport(String(destination));

    await proxyGet(res, "/flights/searchFlights", {
        origin, destination, date: departDate, returnDate, adults,
        cabinClass: cabin, currency, market, locale,
    }, "legacyRoundtrip",
        `legacy-rt-${origin}-${destination}-${departDate}-${returnDate}`);
});

// ═══════════════════════════════════════════════════════════════
//  LEGACY — MULTICITY  (backward compat)
//  POST /api/multicity
// ═══════════════════════════════════════════════════════════════
app.post("/api/multicity", async (req, res) => {
    const { segments, adults = 1, cabin = "economy" } = req.body;

    if (!segments || !Array.isArray(segments) || segments.length < 2) {
        res.status(400).json({ error: "Missing or invalid segments (min 2)" });
        return;
    }

    const mappedSegments = await Promise.all(segments.map(async (seg: any) => {
        const origin = normalizeAirport(seg.origin);
        const destination = normalizeAirport(seg.destination);
        const origRes = await resolveAirportEntity(origin);
        const destRes = await resolveAirportEntity(destination);
        return {
            originSkyId: origRes.skyId,
            destinationSkyId: destRes.skyId,
            originEntityId: origRes.entityId,
            destinationEntityId: destRes.entityId,
            date: seg.date,
        };
    }));

    try {
        const response = await axios.post(`${BASE_URL}/flights/searchFlightsMultiStop`, {
            segments: mappedSegments, adults, cabinClass: cabin,
            currency: "USD", market: "US", locale: "en-US",
        }, { headers: rapidApiHeaders(), timeout: 30000 });

        res.json(response.data);
    } catch (err: any) {
        const status = err.response?.status || 500;
        const details = err.response?.data || err.message;
        console.error("❌ [legacyMulticity]", status, details);
        res.status(status).json({
            error: "legacyMulticity failed",
            message: details?.message || details,
            status,
        });
    }
});

// ═══════════════════════════════════════════════════════════════
//  HOTELS — searchDestination
//  GET /api/hotels/searchDestination?query=Dubai
// ═══════════════════════════════════════════════════════════════
app.get("/api/hotels/searchDestination", async (req, res) => {
    const { query, locale = "en-US" } = req.query;
    if (!query) { res.status(400).json({ error: "Missing: query" }); return; }

    const queryStr = String(query).trim().toLowerCase();
    // Block single-character queries
    if (queryStr.length < 2) {
        res.json({ data: [], sr: [] });
        return;
    }

    // 1. Try local match first
    const matched = hotelDestinations.filter(h =>
        h.name.toLowerCase().includes(queryStr) ||
        h.cityName.toLowerCase().includes(queryStr) ||
        h.countryName.toLowerCase().includes(queryStr)
    );

    if (matched.length > 0) {
        console.log(`📋 [hotels/searchDestination] Local matches found: ${matched.length}`);
        res.json({ status: true, data: matched, places: matched, sr: matched });
        return;
    }

    // 2. Cache check
    const cacheKey = `hotel-dest-${queryStr}`;
    const cached = getCached(cacheKey);
    if (cached) {
        console.log(`⚡ [hotels/searchDestination] Cache HIT for "${query}"`);
        res.json(cached);
        return;
    }

    // 3. Call API
    console.log(`🌐 [hotels/searchDestination] →`, `${BASE_URL}/hotels/searchDestination`, { query, locale });
    try {
        const response = await axios.get(`${BASE_URL}/hotels/searchDestination`, {
            params: { query, locale },
            headers: rapidApiHeaders(),
            timeout: 12000,
        });
        setCache(cacheKey, response.data, CACHE_TTL_STATIC_MS); // 24 h
        res.json(response.data);
    } catch (err: any) {
        const status = err.response?.status || 500;
        const details = err.response?.data || err.message;
        console.error(`❌ [hotels/searchDestination] ${status}:`, JSON.stringify(details));
        res.status(status).json({ error: "searchDestination failed", message: details?.message || details, status });
    }
});

// ═══════════════════════════════════════════════════════════════
//  HOTELS — searchHotels
//  GET /api/hotels/searchHotels?entityId=xxx&checkIn=2025-08-01&checkOut=2025-08-05
// ═══════════════════════════════════════════════════════════════
app.get("/api/hotels/searchHotels", async (req, res) => {
    const { entityId, checkIn, checkOut, adults = "2", rooms = "1",
        currency = "USD", market = "US", locale = "en-US" } = req.query;

    if (!entityId || !checkIn || !checkOut) {
        res.status(400).json({ error: "Missing: entityId, checkIn, checkOut" });
        return;
    }

    await proxyGet(res, "/hotels/searchHotels", {
        entityId, checkIn, checkOut, adults, rooms, currency, market, locale,
    }, "hotels/searchHotels", `hotels-${entityId}-${checkIn}-${checkOut}-${adults}-${rooms}`);
});

// ═══════════════════════════════════════════════════════════════
//  HOTELS — getHotelPrices
//  GET /api/hotels/getHotelPrices?hotelId=xxx&checkIn=...&checkOut=...
// ═══════════════════════════════════════════════════════════════
app.get("/api/hotels/getHotelPrices", async (req, res) => {
    const { hotelId, checkIn, checkOut, adults = "2", rooms = "1",
        currency = "USD", market = "US", locale = "en-US" } = req.query;

    if (!hotelId || !checkIn || !checkOut) {
        res.status(400).json({ error: "Missing: hotelId, checkIn, checkOut" });
        return;
    }

    await proxyGet(res, "/hotels/getHotelPrices", {
        hotelId, checkIn, checkOut, adults, rooms, currency, market, locale,
    }, "hotels/getHotelPrices", `hotel-prices-${hotelId}-${checkIn}-${checkOut}`);
});

// ═══════════════════════════════════════════════════════════════
//  HOTELS — getHotelDetails
//  GET /api/hotels/getHotelDetails?hotelId=xxx
// ═══════════════════════════════════════════════════════════════
app.get("/api/hotels/getHotelDetails", async (req, res) => {
    const { hotelId, locale = "en-US" } = req.query;
    if (!hotelId) { res.status(400).json({ error: "Missing: hotelId" }); return; }

    await proxyGet(res, "/hotels/getHotelDetails", { hotelId, locale }, "hotels/getHotelDetails",
        `hotel-details-${hotelId}`);
});

// ═══════════════════════════════════════════════════════════════
//  HOTELS — getHotelReviews
//  GET /api/hotels/getHotelReviews?hotelId=xxx
// ═══════════════════════════════════════════════════════════════
app.get("/api/hotels/getHotelReviews", async (req, res) => {
    const { hotelId, locale = "en-US" } = req.query;
    if (!hotelId) { res.status(400).json({ error: "Missing: hotelId" }); return; }

    await proxyGet(res, "/hotels/getHotelReviews", { hotelId, locale }, "hotels/getHotelReviews",
        `hotel-reviews-${hotelId}`);
});

// ═══════════════════════════════════════════════════════════════
//  HOTELS — getSimilarHotels
//  GET /api/hotels/getSimilarHotels?hotelId=xxx
// ═══════════════════════════════════════════════════════════════
app.get("/api/hotels/getSimilarHotels", async (req, res) => {
    const { hotelId, currency = "USD", locale = "en-US" } = req.query;
    if (!hotelId) { res.status(400).json({ error: "Missing: hotelId" }); return; }

    await proxyGet(res, "/hotels/getSimilarHotels", { hotelId, currency, locale },
        "hotels/getSimilarHotels", `hotel-similar-${hotelId}`);
});

// ═══════════════════════════════════════════════════════════════
//  HOTELS — getNearbyMap
//  GET /api/hotels/getNearbyMap?hotelId=xxx
// ═══════════════════════════════════════════════════════════════
app.get("/api/hotels/getNearbyMap", async (req, res) => {
    const { hotelId, locale = "en-US" } = req.query;
    if (!hotelId) { res.status(400).json({ error: "Missing: hotelId" }); return; }

    await proxyGet(res, "/hotels/getNearbyMap", { hotelId, locale },
        "hotels/getNearbyMap", `hotel-map-${hotelId}`);
});

// ═══════════════════════════════════════════════════════════════
//  CARS — searchLocation
//  GET /api/cars/searchLocation?query=Dubai
// ═══════════════════════════════════════════════════════════════
app.get("/api/cars/searchLocation", async (req, res) => {
    const { query, locale = "en-US" } = req.query;
    if (!query) { res.status(400).json({ error: "Missing: query" }); return; }

    const rawQuery = String(query).trim();
    // Clean query: Extract content inside parentheses if present (like IATA codes "DXB")
    const parenMatch = rawQuery.match(/\(([^)]+)\)/);
    const cleanedQuery = parenMatch ? parenMatch[1] : rawQuery;
    const queryStr = cleanedQuery.trim().toLowerCase();

    // Block single-character queries
    if (queryStr.length < 2) {
        res.json({ data: [], locations: [] });
        return;
    }

    // 1. Local matching first
    const matched = airportDatabase.filter(a =>
        a.city.toLowerCase().includes(queryStr) ||
        a.iata.toLowerCase().includes(queryStr) ||
        a.name.toLowerCase().includes(queryStr)
    ).map(a => ({
        locationId: `car-loc-${a.iata}`,
        entityId: a.entityId,
        name: `${a.city} Airport (${a.iata})`,
        type: "AIRPORT",
        city: a.city,
        country: a.country
    }));

    if (matched.length > 0) {
        console.log(`📋 [cars/searchLocation] Local matches found: ${matched.length} for cleaned query: "${queryStr}"`);
        res.json({ status: true, data: matched, locations: matched });
        return;
    }

    // 2. Cache check
    const cacheKey = `cars-loc-${queryStr}`;
    const cached = getCached(cacheKey);
    if (cached) {
        console.log(`⚡ [cars/searchLocation] Cache HIT for "${query}"`);
        res.json(cached);
        return;
    }

    // 3. Call API
    console.log(`🌐 [cars/searchLocation] →`, `${BASE_URL}/cars/searchLocation`, { query: queryStr, locale });
    try {
        const response = await axios.get(`${BASE_URL}/cars/searchLocation`, {
            params: { query: queryStr, locale },
            headers: rapidApiHeaders(),
            timeout: 15000, // Upgraded timeout to 15s as requested
        });
        setCache(cacheKey, response.data, CACHE_TTL_STATIC_MS); // 24 h
        res.json(response.data);
    } catch (err: any) {
        const status = err.response?.status || 500;
        const details = err.response?.data || err.message;
        console.error(`❌ [cars/searchLocation] ${status}:`, JSON.stringify(details));
        res.status(status).json({ error: "searchLocation failed", message: details?.message || details, status });
    }
});

// ═══════════════════════════════════════════════════════════════
//  CARS — searchCars
//  GET /api/cars/searchCars
// ═══════════════════════════════════════════════════════════════
app.get("/api/cars/searchCars", async (req, res) => {
    const { pickUpEntityId, dropOffEntityId, pickUpDate, dropOffDate,
        pickUpTime = "10:00", dropOffTime = "10:00",
        currency = "USD", market = "US", locale = "en-US",
        driverAge = "30", sortBy = "PRICE_ASCENDING" } = req.query;

    if (!pickUpEntityId || !pickUpDate || !dropOffDate) {
        res.status(400).json({ error: "Missing: pickUpEntityId, pickUpDate, dropOffDate" });
        return;
    }

    await proxyGet(res, "/cars/searchCars", {
        pickUpEntityId,
        dropOffEntityId: dropOffEntityId || pickUpEntityId,
        pickUpDate, dropOffDate,
        pickUpTime, dropOffTime,
        currency, market, locale,
        driverAge, sortBy,
    }, "cars/searchCars", `cars-${pickUpEntityId}-${pickUpDate}-${dropOffDate}`);
});

// ═══════════════════════════════════════════════════════════════
//  CONFIG — getExchangeRates
//  GET /api/config/getExchangeRates?baseCurrency=USD
// ═══════════════════════════════════════════════════════════════
app.get("/api/config/getExchangeRates", async (req, res) => {
    const { baseCurrency = "USD" } = req.query;

    await proxyGet(res, "/config/getExchangeRates", { baseCurrency },
        "config/getExchangeRates", `rates-${baseCurrency}`);
});

// ═══════════════════════════════════════════════════════════════
//  CONFIG — getLocale
//  GET /api/config/getLocale
// ═══════════════════════════════════════════════════════════════
app.get("/api/config/getLocale", async (_req, res) => {
    await proxyGet(res, "/config/getLocale", {}, "config/getLocale", "locale-config");
});

// ═══════════════════════════════════════════════════════════════
//  404 FALLBACK
// ═══════════════════════════════════════════════════════════════
app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ═══════════════════════════════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════════════════════════════
app.listen(PORT, () => {
    console.log(`\n✅ Avianta backend running on port ${PORT}`);
    console.log(`   RapidAPI Host : ${RAPIDAPI_HOST}`);
    console.log(`   API Key       : ${RAPIDAPI_KEY ? "✅ Configured" : "❌ MISSING"}`);
    console.log(`   Cache TTL     : 10 minutes\n`);
    console.log(`   Monitoring:`);
    console.log(`     GET  /health`);
    console.log(`     GET  /api/cache/stats\n`);
    console.log(`   Flights:`);
    console.log(`     GET  /api/flights/searchAirport`);
    console.log(`     GET  /api/flights/searchFlights`);
    console.log(`     GET  /api/flights/searchIncomplete`);
    console.log(`     GET  /api/flights/getFlightDetails`);
    console.log(`     GET  /api/flights/searchFlightEverywhere`);
    console.log(`     GET  /api/flights/getCheapestOneway`);
    console.log(`     POST /api/flights/searchFlightsMultiStop`);
    console.log(`     GET  /api/flights/getPriceCalendar`);
    console.log(`     GET  /api/flights/getPriceCalendarReturn`);
    console.log(`\n   Hotels:`);
    console.log(`     GET  /api/hotels/searchDestination`);
    console.log(`     GET  /api/hotels/searchHotels`);
    console.log(`     GET  /api/hotels/getHotelPrices`);
    console.log(`     GET  /api/hotels/getHotelDetails`);
    console.log(`     GET  /api/hotels/getHotelReviews`);
    console.log(`     GET  /api/hotels/getSimilarHotels`);
    console.log(`     GET  /api/hotels/getNearbyMap`);
    console.log(`\n   Cars:`);
    console.log(`     GET  /api/cars/searchLocation`);
    console.log(`     GET  /api/cars/searchCars`);
    console.log(`\n   Config:`);
    console.log(`     GET  /api/config/getExchangeRates`);
    console.log(`     GET  /api/config/getLocale\n`);
});
