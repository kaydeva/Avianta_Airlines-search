✈️ Avianta — Private Jet Search Engine (MVP Version)
Avianta is a modern, high‑performance MVP flight search engine built with a clean luxury aviation aesthetic.
It delivers fast and reliable access to flight data using the Skyscanner Flights API (Crawlio), supported by a custom backend layer for airport mapping, input normalization, smart caching, and robust error handling.

This MVP is fully functional and ready for deployment, portfolio presentation, and API approval.
Avianta is designed to later integrate with the Real Skyscanner Partner API or any commercial aviation data provider.

🚀 Overview
Avianta is a full‑stack web application engineered to provide a premium flight‑search experience.
It combines:

React + Vite for a fast, elegant frontend

Node.js + Express backend with advanced mapping & caching

RapidAPI (Crawlio Skyscanner) for real‑time flight data

Luxury aviation UI inspired by private jet platforms

The MVP focuses on speed, stability, and clarity, ensuring accurate results even when external APIs return incomplete data or soft errors.

🧠 Key Features
🔍 1. Real‑Time Flight Search
Supports:

One‑way flights

Round‑trip flights

Multi‑city itineraries

All powered by the Skyscanner Flights API (Crawlio).

🗺️ 2. Intelligent Airport Mapping
Avianta includes a custom mapping engine that:

Converts city names → IATA airport codes

Normalizes inconsistent user input

Prevents API failures caused by unsupported routes

Ensures BEIRUT → BEY, DOHA → DOH, etc.

This guarantees stable API calls regardless of how the user types the city.

🛡️ 4. Robust Error Handling
The backend detects Crawlio‑specific soft errors and instead of crashing it returns a clean JSON response.

📡 5. Clean, Modular Backend Architecture
The backend includes:

Centralized mapping utilities

Normalization helpers

Crawlio API wrapper

Unified logging system

Consistent route structure

Full request/response tracing

Designed for clarity, scalability, and future integration with real aviation APIs.

🎨 6. Luxury Aviation UI
The frontend is built with:

React

Vite

TailwindCSS

Smooth animations

A clean luxury aviation theme

Crafted to feel premium, modern, and effortless.

🛫 Future Enhancements (Post‑MVP)
Avianta is designed to evolve into a full production‑grade aviation search engine with:

Real Skyscanner Partner API integration

Live pricing & availability

Airline logos & metadata

Booking links

Seat classes & fare families

Multi‑API fallback

Airport autocomplete

User accounts & saved searches

⚡ 3. 10‑Minute Smart Caching
To reduce API usage and improve performance, Avianta caches results for 10 minutes using structured keys
