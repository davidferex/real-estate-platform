# EstateHub — Smart Real Estate Listings Platform

A full-stack real estate listings platform built with Node.js, TypeScript, React, and MySQL. Browse, search, and filter real Polish apartment listings sourced from a public Kaggle dataset of real Otodom.pl offers.

---

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Frontend**: React + Vite + TypeScript
- **Database**: MySQL 8
- **Data**: Kaggle — [Apartment Prices in Poland](https://www.kaggle.com/datasets/krzysztofjamroz/apartment-prices-in-poland)

---

## Features

- Browse 100 real Polish apartment listings (sale + rent)
- Filter by city, listing type, rooms, price range, and area
- Full-text search across titles and descriptions
- Pagination
- Listing detail page with amenities, floor info, and condition
- AI-generated summaries for select listings (pre-generated, no runtime API cost)
- Data normalisation pipeline: city name standardisation, price validation, outlier rejection

---

## Project Structure
real-estate-platform/
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── services/
│   │   └── db/
│   └── src/seed.ts
├── frontend/
│   └── src/
│       ├── pages/
│       └── components/
└── docs/
└── reasoning.md

## Setup

### Prerequisites
- Node.js 18+
- MySQL 8

### 1. Database
```bash
mysql -u root -p -e "CREATE DATABASE real_estate;"
mysql -u root -p real_estate < backend/src/db/schema.sql
```

### 2. Environment variables

Create `backend/.env`:
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=real_estate
ANTHROPIC_API_KEY=your_key_here
PORT=3001

### 3. Kaggle data

Download from [Kaggle](https://www.kaggle.com/datasets/krzysztofjamroz/apartment-prices-in-poland), unzip, and place CSV files in `backend/data/`.

The seed uses:
- `apartments_pl_2024_06.csv`
- `apartments_rent_pl_2024_06.csv`

### 4. Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 5. Seed the database
```bash
cd backend && npm run seed
```

### 6. Start the app

Terminal 1:
```bash
cd backend && npm run dev
```

Terminal 2:
```bash
cd frontend && npm run dev
```

Open http://localhost:3000

---

## Example User Journeys

**Example A — Filtered search**
1. Open the platform
2. Set city = Kraków, listing type = For Sale, min area = 40, max area = 80
3. Browse results filtered to Kraków apartments in range
4. Click a listing to see full details

**Example B — Text search**
1. Type "2-pokojowe Warszawa" in the search box
2. Results show 2-room Warsaw apartments ranked by relevance
3. Open a listing to see floor, condition, amenities, and price per m²

---

## Reasoning Document

Check the `docs/` directory for the full technical reasoning — data decisions, normalisation approach, AI usage, assumptions, success metrics, and limitations.
