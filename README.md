# Locus — Franchise Location Intelligence

B2B service that scouts the best markets for franchise expansion. Each trade area is scored across population, demographics, income, traffic, competition, developments, and more — every metric on a **50-point scale**.

## Features

- **Landing overview** — brand-forward pitch and metric explanations
- **Partner Top 10** — concept-profile scoring for a partnered business, ranked shortlist
- **Scout workspace** — search/filter markets, map pins, ranked shortlist
- **Location reports** — full /50 scores, demographics, development pipeline
- **Scoring engine** — normalizes raw signals to 0–50 with weighted overall fit

## Partner engagement (demo)

Hypothetical partnership: **Locus × Northwind Coffee Co.** (via Apex Growth Partners).

1. Load the brand’s concept profile (demographics, income band, competition tolerance, metric weights)
2. Rescore every trade area against that profile
3. Deliver the **Top 10** markets by business-specific overall fit

Open `/partner` after starting the app.

## Metrics scored (0–50)

| Metric | What it captures |
|--------|------------------|
| Population Density | Trade-area residents |
| Median Income | Household purchasing power |
| Traffic & Footfall | Daytime pop + walk/transit |
| Demographic Fit | Age, education, household mix |
| Competition | Nearby similar concepts |
| Developments | Planned / recent projects |
| Workforce | Labor market health |
| Accessibility | Walk + transit scores |
| Commercial Rent | Est. NNN economics |
| Growth Trajectory | 5-year trend |

## Quick start

```bash
npm install
npm run dev
```

Open the local Vite URL (usually `http://localhost:5173`).

```bash
npm run build   # production build
npm run preview # preview production build
```

## Stack

- React 19 + TypeScript
- Vite
- React Router

Sample market data includes 14 U.S. trade areas (Austin Mueller, Nashville Gulch, Denver RiNo, Charlotte South End, Seattle Ballard, Atlanta Midtown, and more).
