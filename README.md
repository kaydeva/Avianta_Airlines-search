#✈️ Avianta — Private Jet Search Engine
A modern, high‑performance flight search engine built with a clean luxury aviation aesthetic. Avianta provides fast, reliable access to real‑time flight data using the Skyscanner Flights API (Crawlio), supported by a custom backend layer for mapping, normalization, caching, and error‑safe API communication.

##🚀 Overview
Avianta is a full‑stack web application designed to deliver a premium flight‑search experience.
It combines:

React + Vite for a fast, elegant frontend

Node.js + Express backend with advanced mapping & caching

RapidAPI (Crawlio Skyscanner) for real‑time flight data

Clean luxury UI inspired by private aviation platforms

The system is optimized for speed, stability, and clarity, ensuring users receive accurate flight results even when external APIs fail or return incomplete data.

###🧠 Key Features
🔍 1. Real‑Time Flight Search
Supports:

One‑way flights

Round‑trip flights

Multi‑city itineraries

All powered by the Skyscanner Flights API.

🗺️ 2. Intelligent Airport Mapping
Avianta includes a custom mapping engine that:

Converts city names → IATA airport codes

Normalizes inconsistent user input

Prevents API failures caused by unsupported routes

Ensures BEIRUT → BEY, DOHA → DOH, etc.

This layer guarantees stable API calls regardless of how the user types the city.

🛡️ 4. Robust Error Handling
The backend detects and handles Crawlio‑specific soft errors.
Instead of crashing, Avianta returns a clean JSON response.

📡 5. Clean, Modular Backend Architecture
The backend includes:

Centralized mapping utilities

Normalization helpers

Crawlio API wrapper

Unified logging system

Consistent route structure

Full request/response tracing

Everything is organized for clarity, scalability, and future expansion.

🎨 6. Luxury Aviation UI
The frontend is built with:

React

Vite

TailwindCSS

Smooth animations

Clean luxury aviation theme

Designed to feel premium, modern, and effortless.

🏗️ Tech Stack
Frontend
React

Vite

TypeScript

TailwindCSS

Backend
Node.js

Express

Axios

Custom mapping + caching engine

External Services
RapidAPI — Skyscanner Flights (Crawlio)


⚡ 3. 10‑Minute Smart Caching
To reduce API usage and improve performance, Avianta caches results for 10 minutes using a structured key system:
