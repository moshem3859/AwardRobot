# AwardRobot v2

A worldwide cash + award self-transfer combination engine.

## What is new

- Accepts airports, metro groups, and broad regions.
- Expands examples such as `NYC`, `LON`, and `EUROPE` into airport lists.
- Supports cash + award, award + cash, award + award, and cash + cash.
- Validates schedule order, seat count, layover windows, airport changes, and overnight rules.
- Ranks results using cash, points value, and connection safety.
- Uses a provider-neutral normalized segment format so live cash and award APIs can be added later.

## Current data status

The engine is functional, but the included provider currently generates clearly labeled demo data. Live cash and award APIs still need to be connected under `src/providers.js`.

## Deploy

Upload the contents of this folder to the root of the existing GitHub repository. Keep the same Render service and URL. Render should redeploy automatically.

```bash
npm test
npm start
```
