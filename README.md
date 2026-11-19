# Leonida Platinum — the GTA VI trophy guide & tracker

[![GTA 6 trophy guide](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/giber76/gta6-trophy-guide-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/giber76/gta6-trophy-guide-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that guides and tracks all **55 PlayStation 5 trophies** of Grand Theft Auto VI: the official list with saved progress, filters and a spoiler setting, a roadmap to the platinum, and a guide to each trophy that cites its sources.

## What it does

- **Checklist** — all 55 trophies with grade, kind, chapter and a live counter for the counted ones (250 stunts, 18 meditations, 100 WAiNK scans…). Tick trophies off; progress is saved in the browser and can be exported, imported or printed.
- **Next up planner** — the next 10 unearned trophies in roadmap order, each with the reason it is next.
- **Route** — what to do in each chapter, in play order, so you never backtrack.
- **Roadmap** — 5 stages, 40 tasks, from prep to platinum, with a save plan for a game with no mission replay.
- **Stats** — completion by grade and by kind, hours left, and the missable guard.
- **Missables** — the one trophy that may be missable, plus a watch list for the methods still unconfirmed.
- **100% checklist** — the exact thresholds for A Long Road (200 of 277 vehicles, 100 of 255 animals, 70 of 80 challenges…).
- **Sources** — every guide cites PowerPyx and GTAbase, cross-checked against Exophase and PSNProfiles. Methods still unconfirmed are labelled, never guessed.

## The facts that shape the run

- 55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze. All offline, single-player. Difficulty 4/10, about 200 hours.
- 5 chapters, story 60–80 hours. No mission replay, no difficulty settings, no mission gold medals.
- Cheats disable trophies and stop the game saving — keep them off.
- **Possibly missable: 1** — Positive Mental Attitude. Do Lucia's balcony meditation in Chapter 1 (the morning after Down to Earth) or it is gone.
- **Newly confirmed since launch:** In The Beginning… (Apple Martini at the Ocean View Rooftop Bar), Capital Offense (the blue Banshee through the south Vice City showroom window) and The Truth Is Out There (the UFO north-west of Starlet Motel after 2AM).
- **Still unconfirmed:** Fair Game's exact animal, Bad Luck, I Guess and Ten Pin. They are labelled in-app.

## Use it offline

Open `app/index.html` in a desktop browser. No build step, no network: the app is plain HTML, CSS and ES modules, and its data is two JSON files (`app/data/trophies.json`, `app/data/roadmap.json`).

## Hand it in

`main.ts` (Node 22) copies `app/` and `screenshots/` to the output directory and writes `dossier.json`:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

- [S1] PowerPyx — GTA 6 Trophy Guide & Roadmap: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- [S2] GTAbase — GTA 6 Trophy Guide: https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series
- [S3] Exophase — GTA VI trophy list: https://www.exophase.com/game/grand-theft-auto-vi-ps5/trophies/
- [S4] PSNProfiles — GTA VI trophy list: https://psnprofiles.com/trophies/grand-theft-auto-vi

Built for the [make.fun bounty](https://make.fun/bounty/gta6-trophy-guide-01). Not affiliated with Rockstar Games.

## License

MIT — see [LICENSE](LICENSE).
