# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=badge&utm_campaign=gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/giber76/gta6-trophy-guide-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=badge&utm_campaign=gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/giber76/gta6-trophy-guide-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=badge&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all **55 PlayStation 5 trophies of Grand Theft Auto VI**: the official list with names, descriptions and grades, a checklist saved in the browser, export and import of progress, filters by kind, a spoiler setting that hides story trophies until earned, a roadmap to the Platinum, the missable trophies flagged, and a cited guide for every trophy — in the guide's own words.

## Try it

Serve `app/` with any static server and open `index.html` in desktop Chrome. It works with the network off — it loads nothing from outside its own files.

```sh
cd app && python3 -m http.server 8080
# open http://localhost:8080
```

## What it tracks

- **All 55 trophies** — 1 platinum, 2 gold, 6 silver, 46 bronze — each with its official name, description and grade as PlayStation publishes them, and a guide that cites its sources.
- **Checklist** — tick trophies off; progress is saved in `localStorage`. Counters for the 21 trophies PlayStation tracks with a number (250 stunts, 42 shooting range golds, 100 WAiNK locations, …) have their own steppers.
- **Filters** — by kind (story, missable, collectibles, activities, crime, completion), by grade, earned-only, and free-text search.
- **Spoiler setting** — hides the names, descriptions and guides of story trophies until they are earned.
- **Export / import** — progress exports to a JSON file and imports back.
- **Roadmap** — five stages in the order to play them, built from the official descriptions, with a save strategy (the game has no mission replay; keep a manual save at the start of every chapter).
- **Missables** — 1 confirmed missable (Positive Mental Attitude: Lucia's balcony meditation in Chapter 1) and 8 at risk, each with the chapter or moment where it can be missed.
- **100% list** — the 35 tasks behind A Long Road, reported by Insider Gaming, as its own checkable list.

## Sources

- Names, descriptions and grades: [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi) (PSN progress counters).
- 100% completion tasks: Insider Gaming, as reported by [GTA VI Vice City Hub](https://www.gtavicecityhub.com/achievements).
- Missable notes: [Outputlag](https://outputlag.com/guides/gta-6-trophy-list/).
- Every trophy's guide names its sources in the app. Guides are this guide's own words, worked out from the official descriptions; the game launched the day this guide was written, so triggers that no public source had confirmed yet are marked as unconfirmed rather than guessed. See **Sources & Notes** in the app.

## What it is not

Unofficial and unaffiliated with Rockstar Games, Sony or PlayStation. No Rockstar logo or official artwork is used anywhere.

## Handing it in

`main.ts` (Node 22, standard library only) checks the trophy file names all 55 trophies with a guide, copies `app/` and `screenshots/` to `/output`, and writes `/output/dossier.json` with the vendored `vendor/makefun-frontend.ts` library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## License

MIT — see [LICENSE](LICENSE).
