# Leonida Platinum Log

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/giber76/gta6-trophy-guide-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/giber76/gta6-trophy-guide-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 Grand Theft Auto VI trophies** on PlayStation 5 — every guide written in our own words, every step citing its sources.

## What it is

- **Tracker** — a checklist of all 55 trophies with official names, descriptions and grades (1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden on PlayStation). Progress is saved in the browser (localStorage) and can be exported to a file and imported back.
- **Guides** — each trophy has a numbered, step-by-step guide in our own words. Every step cites its source by number; a cited guide beats an uncited one, however detailed. 55/55 guides cite sources.
- **Roadmap** — the road to the platinum in 7 stages, with hours and the trophies in each stage.
- **Missables** — the one possibly missable trophy (Positive Mental Attitude, and whether the Chapter 1 balcony meditation is required), the five unconfirmed hidden trophies whose triggers are still unknown, and three disputes where the sources disagree — both versions shown.
- **Spoiler shield** — hides story trophies until they are earned.
- **Offline** — static files under `app/`, no build step, no network requests at run time.

## Sources (read 20 Nov 2026)

1. **Push Square** — GTA 6 Trophy Guide & Roadmap (WIP)
2. **GameTrek** — GTA 6 Trophy Guide: All 55 Achievements and Platinum Roadmap (official list, 19 Nov 2026)
3. **GameMapa** — All 55 GTA 6 Trophies: Full List, Gamerscore and Platinum Roadmap
4. **PowerPyx** — GTA 6 Trophy Guide & Roadmap (via GameMapa)
5. **GamesRadar+** — GTA 6 Trophy and Achievement list (via GameMapa)

## Run it

Serve `app/` with any static HTTP server and open `app/index.html` in desktop Chrome. It works with the network off.

```sh
python3 -m http.server 8000 --directory app
```

## Hand it in

`main.ts` copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's `buildDossier` from `vendor/makefun-frontend.ts`.

## Notes

- Unofficial fan guide. Grand Theft Auto VI is © Rockstar Games; no Rockstar logo, artwork or game screenshot is used here.
- Trophy names and descriptions are shown as PlayStation publishes them.
- Chapter numbering is disputed between the sources (Push Square / GameMapa / GTA BOOM say Chapters 1–4; GameTrek says 2–5). The trophy order is identical either way, and the guide shows both versions.
- Maximum Withdrawal's grade is disputed (Silver on the official list; Bronze on Push Square). This guide follows the official-list grade.
