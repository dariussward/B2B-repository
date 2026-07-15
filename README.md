# Locus — Franchise Location Intelligence

B2B service that scouts the best markets for franchise expansion and maintains a relational **Location Intelligence Database** for commercial real estate analysis. Trade areas are scored across population, demographics, income, traffic, competition, developments, and more — every metric on a **50-point scale**. Retail centers carry an overall **0–100** location score.

## Features

- **Landing overview** — brand-forward pitch and metric explanations
- **Scout workspace** — search/filter markets, map pins, ranked shortlist
- **Location reports** — full /50 scores, demographics, development pipeline
- **Scoring engine** — normalizes raw signals to 0–50 with weighted overall fit
- **Intelligence Database** (`/intelligence`) — relational CRE workspace mirroring Airtable (9 tables, saved views, center dossiers)

## Location Intelligence Database

Nine linked tables for expansion intelligence:

1. Retail Centers  
2. Businesses / Tenants  
3. Demographics  
4. Competitors  
5. Development Projects  
6. Franchise Requirements  
7. Opportunities  
8. Clients  
9. Reports  

Saved views: Vacant Centers, High Traffic, Drive-Thru Opportunities, Top Scoring Locations, New Developments, High Income Markets, Active Clients, Reports Sent.

### Airtable provisioning

Schema + Irvine-forward seed data live under `airtable/`. Create a live base with:

```bash
export AIRTABLE_TOKEN="pat…"
export AIRTABLE_WORKSPACE_ID="wsp…"
npm run airtable:provision
```

See [`airtable/README.md`](airtable/README.md) and [`airtable/VIEWS.md`](airtable/VIEWS.md).

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
- Optional: Airtable Meta API provisioning

Sample market data includes Austin Mueller, Nashville Gulch, Denver RiNo, Charlotte South End, Irvine Spectrum / Woodbury / Great Park, and more. Use `getTopLocationsInCity('Irvine')` for the ranked Irvine shortlist.
