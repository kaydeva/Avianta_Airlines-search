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
    beirut: "BEY",       bey: "BEY",
    // Qatar
    doha: "DOH",         doh: "DOH",
    // UAE
    dubai: "DXB",        dxb: "DXB",
    "abu dhabi": "AUH",  abu_dhabi: "AUH",  abudhabi: "AUH",  auh: "AUH",
    // Saudi Arabia
    riyadh: "RUH",       ruh: "RUH",
    jeddah: "JED",       jed: "JED",
    // Jordan
    amman: "AMM",        amm: "AMM",
    // UK
    london: "LHR",       lhr: "LHR",
    // France
    paris: "CDG",        cdg: "CDG",
    // Germany
    frankfurt: "FRA",    fra: "FRA",
    // Turkey
    istanbul: "IST",     ist: "IST",
    // USA
    "new york": "JFK",   new_york: "JFK",   newyork: "JFK",  jfk: "JFK",
    "los angeles": "LAX", los_angeles: "LAX", losangeles: "LAX", lax: "LAX",
    chicago: "ORD",      ord: "ORD",
    miami: "MIA",        mia: "MIA",
    // Egypt
    cairo: "CAI",        cai: "CAI",
    // Kuwait
    kuwait: "KWI",       kwi: "KWI",
    // Bahrain
    bahrain: "BAH",      manama: "BAH",      bah: "BAH",
    // Oman
    muscat: "MCT",       mct: "MCT",
    // Morocco
    casablanca: "CMN",   cmn: "CMN",
    // India
    mumbai: "BOM",       bom: "BOM",
    delhi: "DEL",        del: "DEL",
    // Singapore
    singapore: "SIN",    sin: "SIN",
    // Thailand
    bangkok: "BKK",      bkk: "BKK",
    // Australia
    sydney: "SYD",       syd: "SYD",
};

/**
 * Normalize a city name or IATA code to a canonical uppercase IATA code.
 * "beirut" | "BeIrUt" | "BEIRUT" | "BEY" → "BEY"
 */
function normalizeAirport(input: string): string {
    const clean = input.toLowerCase().trim().replace(/\s+/g, " ");
    return airportMapping[clean] || input.toUpperCase().trim();
}

// ═══════════════════════════════════════════════════════════════
//  IN-MEMORY CACHE  (10 minutes TTL)
// ═══════════════════════════════════════════════════════════════
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

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

function setCache(key: string, data: unknown): void {
    cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

// ═══════════════════════════════════════════════════════════════
//  CONFIGURATION
// ═══════════════════════════════════════════════════════════════
const app = express();
const PORT = process.env.PORT || 5000;

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY || process.env.VITE_RAPIDAPI_KEY || "";
const RAPIDAPI_HOST = "skyscanner-flights4.p.rapidapi.com";
const BASE_URL = `https://${RAPIDAPI_HOST}`;

if (!RAPIDAPI_KEY) {
    console.warn("⚠️  WARNING: No RAPIDAPI_KEY found in environment. API calls will fail.");
}

// ═══════════════════════════════════════════════════════════════
//  MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
app.use(cors());
app.use(express.json());

const rapidApiHeaders = {
    "x-rapidapi-key": RAPIDAPI_KEY,
    "x-rapidapi-host": RAPIDAPI_HOST,
};

// ═══════════════════════════════════════════════════════════════
//  CRAWLIO ERROR DETECTION
// ═══════════════════════════════════════════════════════════════
/**
 * Detects known Crawlio API error responses and maps them to
 * clean, user-friendly error objects.
 */
function detectCrawlioError(data: any): { error: string; suggestion: string } | null {
    if (!data) return null;

    const msg: string = (data.message || data.error || "").toLowerCase();

    if (msg.includes("api doesn't exist") || msg.includes("api doesn't exists") || msg.includes("not found")) {
        return {
            error: "Route not supported by this API",
            suggestion: "Try a different airport code or check that both airports are supported.",
        };
    }

    if (msg.includes("not subscribed") || msg.includes("unauthorized")) {
        return {
            error: "API subscription required",
            suggestion: "Subscribe to the Crawlio Skyscanner API on RapidAPI.",
        };
    }

    if (msg.includes("quota") || msg.includes("rate limit") || msg.includes("too many requests")) {
        return {
            error: "API rate limit reached",
            suggestion: "Wait a moment and try again.",
        };
    }

    return null;
}

// ═══════════════════════════════════════════════════════════════
//  HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!RAPIDAPI_KEY,
        cacheSize: cache.size,
    });
});

// ═══════════════════════════════════════════════════════════════
//  ONE-WAY FLIGHTS  →  GET /api/flights
// ═══════════════════════════════════════════════════════════════
app.get("/api/flights", async (req, res) => {
    let { origin, destination, date } = req.query;

    console.log("\n📥 [/api/flights] Raw input:", { origin, destination, date });

    if (!origin || !destination || !date) {
        res.status(400).json({ error: "Missing required params: origin, destination, date" });
        return;
    }

    origin      = normalizeAirport(origin as string);
    destination = normalizeAirport(destination as string);

    console.log("🔄 [/api/flights] Normalized:", { origin, destination, date });

    // Cache lookup
    const cacheKey = `${origin}-${destination}-${date}-oneway`;
    const cached = getCached(cacheKey);
    if (cached) {
        console.log("⚡ [/api/flights] Cache HIT →", cacheKey);
        res.json(cached);
        return;
    }

    const requestParams = {
        origin,
        destination,
        date,
        adults:   1,
        cabin:    "economy",
        currency: "USD",
        locale:   "en-US",
        market:   "US",
        limit:    20,
    };

    console.log("🌐 [/api/flights] Crawlio request:", requestParams);

    try {
        const response = await axios.get(`${BASE_URL}/api/v1/search`, {
            params:  requestParams,
            headers: rapidApiHeaders,
        });

        const crawlioError = detectCrawlioError(response.data);
        if (crawlioError) {
            console.warn("⚠️  [/api/flights] Crawlio soft error:", crawlioError);
            res.status(422).json(crawlioError);
            return;
        }

        console.log("✅ [/api/flights] Success — caching result");
        setCache(cacheKey, response.data);
        res.json(response.data);
    } catch (err: any) {
        const status  = err.response?.status || 500;
        const details = err.response?.data   || err.message;
        console.error(`❌ [/api/flights] ${status}:`, details);

        const crawlioError = detectCrawlioError(details);
        if (crawlioError) {
            res.status(422).json(crawlioError);
            return;
        }

        res.status(status).json({ error: "Failed to fetch one-way flights", details });
    }
});

// ═══════════════════════════════════════════════════════════════
//  ROUND-TRIP FLIGHTS  →  GET /api/roundtrip
// ═══════════════════════════════════════════════════════════════
app.get("/api/roundtrip", async (req, res) => {
    let { origin, destination, departDate, returnDate } = req.query;

    console.log("\n📥 [/api/roundtrip] Raw input:", { origin, destination, departDate, returnDate });

    if (!origin || !destination || !departDate || !returnDate) {
        res.status(400).json({
            error: "Missing required params: origin, destination, departDate, returnDate",
        });
        return;
    }

    origin      = normalizeAirport(origin as string);
    destination = normalizeAirport(destination as string);

    console.log("🔄 [/api/roundtrip] Normalized:", { origin, destination, departDate, returnDate });

    // Cache lookup
    const cacheKey = `${origin}-${destination}-${departDate}-${returnDate}-roundtrip`;
    const cached = getCached(cacheKey);
    if (cached) {
        console.log("⚡ [/api/roundtrip] Cache HIT →", cacheKey);
        res.json(cached);
        return;
    }

    const requestParams = {
        origin,
        destination,
        date:        departDate,
        return_date: returnDate,
        adults:      1,
        cabin:       "economy",
        currency:    "USD",
        locale:      "en-US",
        market:      "US",
        limit:       20,
    };

    console.log("🌐 [/api/roundtrip] Crawlio request:", requestParams);

    try {
        const response = await axios.get(`${BASE_URL}/api/v1/roundtrip`, {
            params:  requestParams,
            headers: rapidApiHeaders,
        });

        const crawlioError = detectCrawlioError(response.data);
        if (crawlioError) {
            console.warn("⚠️  [/api/roundtrip] Crawlio soft error:", crawlioError);
            res.status(422).json(crawlioError);
            return;
        }

        console.log("✅ [/api/roundtrip] Success — caching result");
        setCache(cacheKey, response.data);
        res.json(response.data);
    } catch (err: any) {
        const status  = err.response?.status || 500;
        const details = err.response?.data   || err.message;
        console.error(`❌ [/api/roundtrip] ${status}:`, details);

        const crawlioError = detectCrawlioError(details);
        if (crawlioError) {
            res.status(422).json(crawlioError);
            return;
        }

        res.status(status).json({ error: "Failed to fetch roundtrip flights", details });
    }
});

// ═══════════════════════════════════════════════════════════════
//  MULTI-CITY FLIGHTS  →  POST /api/multicity
// ═══════════════════════════════════════════════════════════════
app.post("/api/multicity", async (req, res) => {
    const { segments, adults = 1, cabin = "economy" } = req.body;

    console.log("\n📥 [/api/multicity] Raw input:", { segments, adults, cabin });

    if (!segments || !Array.isArray(segments) || segments.length < 2) {
        res.status(400).json({ error: "Missing or invalid 'segments' (must be at least 2)" });
        return;
    }

    // Normalize each segment
    const mappedSegments = segments.map((seg: any) => ({
        origin:      normalizeAirport(seg.origin),
        destination: normalizeAirport(seg.destination),
        date:        seg.date,
    }));

    console.log("🔄 [/api/multicity] Normalized segments:", mappedSegments);

    // Cache key based on all segment routes
    const segKey   = mappedSegments.map(s => `${s.origin}-${s.destination}-${s.date}`).join("|");
    const cacheKey = `${segKey}-multicity`;
    const cached   = getCached(cacheKey);
    if (cached) {
        console.log("⚡ [/api/multicity] Cache HIT →", cacheKey);
        res.json(cached);
        return;
    }

    const requestBody = {
        segments: mappedSegments,
        adults,
        cabin,
        limit:    20,
        market:   "US",
        locale:   "en-US",
        currency: "USD",
    };

    console.log("🌐 [/api/multicity] Crawlio request:", requestBody);

    try {
        const response = await axios.post(
            `${BASE_URL}/api/v1/multicity`,
            requestBody,
            {
                headers: {
                    ...rapidApiHeaders,
                    "Content-Type": "application/json",
                },
            }
        );

        const crawlioError = detectCrawlioError(response.data);
        if (crawlioError) {
            console.warn("⚠️  [/api/multicity] Crawlio soft error:", crawlioError);
            res.status(422).json(crawlioError);
            return;
        }

        console.log("✅ [/api/multicity] Success — caching result");
        setCache(cacheKey, response.data);
        res.json(response.data);
    } catch (err: any) {
        const status  = err.response?.status || 500;
        const details = err.response?.data   || err.message;
        console.error(`❌ [/api/multicity] ${status}:`, details);

        const crawlioError = detectCrawlioError(details);
        if (crawlioError) {
            res.status(422).json(crawlioError);
            return;
        }

        res.status(status).json({ error: "Failed to fetch multicity flights", details });
    }
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
    console.log(`\n✅ Avianta backend running on http://localhost:${PORT}`);
    console.log(`   RapidAPI Host : ${RAPIDAPI_HOST}`);
    console.log(`   API Key       : ${RAPIDAPI_KEY ? "✅ Configured" : "❌ MISSING"}`);
    console.log(`   Cache TTL     : 10 minutes`);
    console.log(`\n   Routes:`);
    console.log(`     GET  /health`);
    console.log(`     GET  /api/flights      (one-way)`);
    console.log(`     GET  /api/roundtrip    (round-trip)`);
    console.log(`     POST /api/multicity    (multi-city)`);
    console.log("");
});
