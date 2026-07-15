# Locus Location Intelligence — Airtable Base

Relational commercial real estate and business-expansion intelligence database for franchises, retailers, developers, investors, and expanding businesses.

## What's included

| Path | Purpose |
|------|---------|
| `schema/base-schema.json` | 9 tables, field types, linked-record relationships, view definitions |
| `seed/*.json` | Sample Irvine-forward dataset (centers, tenants, demographics, competitors, developments, franchise criteria, opportunities, clients, reports) |
| `../scripts/provision-airtable.mjs` | Creates the base via Airtable Meta API, adds links, seeds records |
| `VIEWS.md` (this doc + generated copy) | Filtered views to create in the Airtable UI |

## Core tables

1. **Retail Centers** — shopping centers / commercial developments (score 0–100)
2. **Businesses / Tenants** — operators inside centers
3. **Demographics** — city / ZIP / trade-area socioeconomic profiles
4. **Competitors** — competing brands near target sites
5. **Development Projects** — residential & commercial growth pipeline
6. **Franchise Requirements** — brand expansion criteria
7. **Opportunities** — scored brand ↔ location matches
8. **Clients** — CRM for intelligence customers
9. **Reports** — delivered market packages

## Relationships

```
Retail Centers 1──* Businesses / Tenants
Retail Centers 1──* Opportunities
Retail Centers 1──* Competitors
Retail Centers *──* Development Projects
Retail Centers *──1 Demographics
Clients 1──* Reports
Clients 1──* Opportunities
Franchise Requirements 1──* Opportunities
Reports *──* Retail Centers
Reports *──* Opportunities
```

## Provision a live Airtable base

1. Create an Airtable [personal access token](https://airtable.com/create/tokens) with:
   - `schema.bases:write`
   - `data.records:write`
   - `schema.bases:read` (recommended)
2. Copy your workspace ID (`wsp…`) from the Airtable URL or API.
3. Run:

```bash
export AIRTABLE_TOKEN="pat…"
export AIRTABLE_WORKSPACE_ID="wsp…"
npm run airtable:provision
```

Schema only (no seed data):

```bash
SKIP_SEED=1 npm run airtable:provision
```

Generated metadata lands in `airtable/generated/` (gitignored).

## Filtered views (create in Airtable UI)

| View | Table | Filter logic |
|------|-------|--------------|
| Vacant Retail Centers | Retail Centers | Vacancies > 0 **or** Available SF > 0 |
| High Traffic Locations | Retail Centers | AADT ≥ 35,000 |
| Drive-Thru Opportunities | Retail Centers | Drive-Thru checked **and** Available SF > 0 |
| Top 100 Highest Scoring Locations | Retail Centers | Sort Overall Location Score ↓ (limit 100) |
| New Developments | Development Projects | Planned / Entitled / Under Construction |
| High Income Markets | Demographics | Median HH Income ≥ $100,000 |
| Active Clients | Clients | Active **or** Proposal Sent |
| Reports Sent | Reports | Status = Sent |

## Dashboard / search dimensions

Filter and search across:

- City, Retail Center, Franchise Brand
- Traffic Count (AADT), Household Income, Population Growth
- Square Footage, Vacancies, Drive-Thru Availability
- Competition density, Overall Location Score

The in-app **Intelligence** workspace (`/intelligence`) mirrors this schema with the same views and filters for demos without Airtable credentials.
