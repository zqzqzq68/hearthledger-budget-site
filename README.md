# hearthledger-budget-site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/zqzqzq68/hearthledger-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/zqzqzq68/hearthledger-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

HearthLedger is a household budget site for the Alvarez family of four: a dashboard with real November 2026 figures, a working transaction ledger, category budgets, savings goals, bills and reports — every control doing what it says, all running offline from static files with no network request.

## Run it

```sh
node serve.ts app 8080
```

Then open http://127.0.0.1:8080/ in a browser, on a desktop or a phone. Add a transaction, change a budget, pay a bill, add to a goal — everything is stored in the browser's local storage.

## Layout

- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `buildDossier`.
- `app/` — the site itself: `index.html`, `style.css`, `data.js` (seed data + store), `charts.js` (hand-rolled SVG charts), `views.js` (the six pages), `main.js` (router + actions).
- `screenshots/` — four real renders of the running site.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?ref=daring-condor-23&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
