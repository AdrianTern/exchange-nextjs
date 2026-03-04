# 💱 Exchange — Currency Intelligence

A premium, high-performance currency converter and trend analysis dashboard built with **Next.js 14**, **TypeScript**, and **TanStack Query**.

![App Screenshot](file:///c:/Users/yoeth/Documents/exchange-next/exchange/public/screenshot.png) *(Note: Ensure a screenshot is available at this path)*

## 🚀 Key Features

- **Real-time Conversion**: Instant currency calculations with 500ms debounce for optimal performance.
- **7-Day Trends**: Premium SVG-based sparklines visualizing historical rate movements.
- **Dynamic Rate Alerts**: Set thresholds and get notified when rates hit your target (polls every 30s).
- **Intelligent Offline Mode**: Detects network instability, transitions to static skeletons, and provides a centralized retry mechanism.
- **Smart Default Detection**: Automatically detects user's local currency based on IP address (fallbacks to USD).
- **Zero-Flicker Hydration**: Seamless synchronization between `localStorage` and React state.

## 🛠️ Tech Stack

- **Framework**: [Next.js 14 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State & Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Persistence**: Custom `useLocalStorage` with hydration guarding.
- **API Source**: [Frankfurter API](https://www.frankfurter.app/)

## 📂 Project Structure

```text
├── app/
│   ├── api/                # Internal API Route Handlers
│   │   ├── convert/        # Currency conversion logic + caching
│   │   ├── currencies/     # Supported currency list
│   │   ├── health/         # Selection-aware system status pings
│   │   ├── location/       # IP-to-Currency geolocation
│   │   └── rates/compare/  # Historical trend data processing
│   ├── layout.tsx          # Global providers and metadata
│   ├── page.tsx            # Main Dashboard Orchestrator
│   └── providers.tsx       # TanStack Query & Toast configuration
├── components/             # Atomic & Composite UI Components
│   ├── AlertSettingsCard   # Rate alert configuration UI
│   ├── CurrencySelector    # Searchable dropdown with flags
│   ├── ExchangeCard        # Primary conversion interface
│   ├── TrendGraph          # Memoized SVG data visualization
│   └── ...
├── hooks/                  # Custom React Hooks
│   ├── useLocalStorage     # Reactive persistence layer
│   ├── useConversion       # Conversion data orchestrator
│   ├── useComparison       # Historical data orchestrator
│   └── useRateAlert        # Background monitoring logic
├── utils/                  # Utility Functions
│   ├── fetcher.ts          # Robust fetch with timeouts/retries
│   ├── cache.ts            # Server-side in-memory TTL cache
│   └── formatters.ts       # Currency and date formatting
└── types/                  # Global TypeScript Interfaces
```

## 🧠 Design Patterns & Architecture

### 1. Higher-Order Orchestrator
The `Home` component (`app/page.tsx`) acts as the single source of truth, managing shared state (`from`, `to`, `amount`) and distributing it to specialized child components.

### 2. Selection-Aware Health System
The application doesn't just check if the internet is "on"—it checks if the specific currency pair you've selected is reachable via the upstream API, ensuring the "Online" status is honest.

### 3. Progressive Loading (Skeletons)
Uses state-aware skeletons. If the system is offline, skeletons are static to reduce CPU usage. Upon clicking "Retry", they transition to an animated pulse state to provide active feedback.

### 4. Robust Fetching
All API calls go through a centralized `robustFetch` utility that enforces strict timeouts (10s), preventing the UI from hanging on slow connections.

### 5. Server-Side Caching
Internal API routes utilize an in-memory TTL (Time-To-Live) cache to minimize upstream hits and provide sub-50ms response times for repeated requests.

## 🎨 Styling & Aesthetic
- **Glassmorphism**: Subtle backdrops with `backdrop-blur` and low-opacity borders.
- **Premium Dark Mode**: Deep slate and obsidian palette with indigo/accent highlights.
- **Micro-animations**: Smooth transitions, hover scaling, and float animations for a premium feel.

## 🏁 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Open the App**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

&copy; 2026 Exchange • Built for the modern economy.
