# Award Transfer Robot — Live MVP

A deployable Node.js MVP that searches provider adapters, normalizes cash/award segments, and builds ranked self-transfer combinations.

## Run

```bash
cp .env.example .env
# load the variables in your shell or hosting dashboard
npm test
npm start
```

Open http://localhost:3000.

## Live data

- **Amadeus:** add `AMADEUS_CLIENT_ID` and `AMADEUS_CLIENT_SECRET`. The included adapter uses Flight Offers Search.
- **Seats.aero:** add `SEATSAERO_API_KEY`, then adapt `searchSeatsAero()` to the exact Partner API endpoint and response fields in your commercial agreement.
- Without live credentials the app intentionally returns clearly labeled demo data.

## Important limitations

This is a functional engineering MVP, not yet a comprehensive commercial metasearch product. Live award coverage depends on licensed API access. Results must be revalidated before points transfers or purchases.

## Deploy

Deploy to Render, Railway, Fly.io, or another Node host. Set environment variables in the host dashboard. Do not put API keys in `public/` files.
