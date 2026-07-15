# Airtable Views Checklist

Create these filtered/sorted views after provisioning. The Meta API only creates a default Grid view per table.

## Retail Centers

### Vacant Retail Centers
- **Filter:** `Current Vacancies > 0` OR `Available Square Footage > 0`
- **Sort:** Available Square Footage (descending)

### High Traffic Locations
- **Filter:** `Traffic Count (AADT) >= 35000`
- **Sort:** Traffic Count (AADT) (descending)

### Drive-Thru Opportunities
- **Filter:** `Drive-Thru Availability` is checked AND `Available Square Footage > 0`
- **Sort:** Overall Location Score (descending)

### Top 100 Highest Scoring Locations
- **Filter:** `Overall Location Score` is not empty
- **Sort:** Overall Location Score (descending)
- **Limit:** first 100 records (or use Interfaces Top records)

## Development Projects

### New Developments
- **Filter:** Status is any of `Planned`, `Entitled`, `Under Construction`
- **Sort:** Expected Completion Date (ascending)

## Demographics

### High Income Markets
- **Filter:** `Median Household Income >= 100000`
- **Sort:** Median Household Income (descending)

## Clients

### Active Clients
- **Filter:** Status is any of `Active`, `Proposal Sent`
- **Sort:** Company Name (ascending)

## Reports

### Reports Sent
- **Filter:** Status is `Sent`
- **Sort:** Date (descending)
