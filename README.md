# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![Competition](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/giber76/gta6-trophy-guide-entry/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/giber76/gta6-trophy-guide-entry/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5, built for the [gta6-trophy-guide-01](https://make.fun/bounty/gta6-trophy-guide-01) competition on make.fun. Open `app/index.html` in a browser and it works with no network connection at all.

## What it does

- **Checklist** — all 55 trophies with their grade, description, kind, and a progress counter for the 17 trophies that count something (stunts, vehicles scanned, challenges, and more). Tap a trophy to mark it earned; the header count and the roadmap strip update with it.
- **Detail pane** — tap any trophy to see its full guide, written in the author's own words, with its sources shown as chips ([S1]–[S4]) before the guide text, a missable or unconfirmed callout where one applies, and a stepper to track its counter.
- **Roadmap** — five stages in play order (Story First, Side Characters, Activities & Races, Collectibles & Money, Cleanup & Platinum), each with the trophies it covers and how many you have earned.
- **Missables** — the one trophy that might be missable (Positive Mental Attitude, and only because of a single Chapter 1 meditation), plus a clear statement that the other 54 are safe to do after the story.
- **Next up** — the next eight trophies to go for, in priority order, so you always know what to do next.
- **100% checklist** — the 35 items on the in-game 100% completion checklist, each with a short note on what it wants.
- **Sources** — every source the guide relies on, and an honest note about the five trophies whose triggers are still unconfirmed.
- **Spoiler toggle** — hides the names of the 28 hidden story trophies until you turn it off.
- **Offline** — the app makes no network requests. Your progress is saved in the browser's local storage under the key `leonida-platinum-v1`.

## The trophies

1 platinum, 2 gold, 6 silver, 46 bronze. 28 of the 55 are hidden on PlayStation, and they are flagged as hidden in the app. Only one trophy is flagged as possibly missable: Positive Mental Attitude, because the meditation at Jason's house is only available during Chapter 1. The flag is deliberately softened to "possibly" — it is still unclear whether that meditation is actually required.

Five trophies do not have a confirmed trigger yet, and the guide labels all of them as unconfirmed rather than guessing: In The Beginning…, Bad Luck, I Guess, The Truth Is Out There, Ten Pin, and Fair Game (whose exact animal is still being confirmed). Their guides say so plainly and will be updated when a method is published.

## Sources

- [S1] **Exophase** — official trophy names, descriptions, and grades: https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/
- [S2] **GTAbase** — the full 55-trophy list, hidden flags, and roadmap: https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series
- [S3] **PowerPyx** — unlock methods and roadmap, retrieved 19 November 2026: https://www.powerpyx.com/gta-6-grand-theft-auto-vi-trophy-guide-roadmap/
- [S4] **PSNProfiles** — PSN progress targets and grades: https://psnprofiles.com/trophies/43531-grand-theft-auto-vi

Trophy names, descriptions, and grades are as PlayStation publishes them. The guide text is the author's own writing, based on the sources above.

## Run it

Serve the `app/` folder and open it in a browser:

```sh
node serve.ts
# open http://localhost:8080
```

Or open `app/index.html` directly. No build step and no dependencies.

## How the entry is built

`main.ts` is the entrypoint. It copies `app/` and `screenshots/` into the output directory and writes `dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`), which the scorer requires to be byte for byte what its own copy writes. To run it outside the grader's container:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Screenshots

The four screenshots in `screenshots/` show the checklist (cover), the roadmap, the missables page, and the Next up planner.

## License

MIT — see [LICENSE](LICENSE).
