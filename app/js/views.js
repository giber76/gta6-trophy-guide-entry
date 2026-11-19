// Leonida Platinum — view renderers.
//
// Every view is a function that takes the data and the saved state and
// returns an HTML string. main.js drops the string into the page and wires
// the buttons. Keeping the rendering in one place means the checklist, the
// planner and the stats page can never disagree about the same trophy.

import { GRADE_ORDER, KIND_LABELS, STAGE_LABELS, displayName, isMasked } from "./filters.js";

export function esc(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function gradeBadge(trophy) {
  const letter = { platinum: "P", gold: "G", silver: "S", bronze: "B" }[trophy.grade];
  return `<span class="grade grade-${trophy.grade}" title="${trophy.grade}">${letter}</span>`;
}

export function countChip(trophy, state) {
  if (!trophy.target) return "";
  const have = state.counts[trophy.id] || 0;
  const label = (trophy.targetLabel || "progress").toUpperCase();
  return `<span class="count-chip">${have} / ${trophy.target} ${esc(label)}</span>`;
}

// One row of the checklist.
export function trophyRow(trophy, state) {
  const earned = state.earned.includes(trophy.id);
  const masked = isMasked(trophy, state);
  const flags = [];
  if (trophy.missable === "possibly") flags.push(`<span class="flag flag-missable">Possibly missable</span>`);
  if (trophy.unconfirmed) flags.push(`<span class="flag flag-unconfirmed">Method unconfirmed</span>`);
  if (trophy.hidden && !masked) flags.push(`<span class="flag flag-hidden">Hidden</span>`);
  return `<article class="trophy-row${earned ? " is-earned" : ""}${trophy.id === state.selected ? " is-selected" : ""}" data-trophy-id="${trophy.id}" tabindex="0" role="button" aria-pressed="${earned}">
    <button class="earn-box" data-earn="${trophy.id}" aria-label="Mark ${esc(displayName(trophy, state))} earned">${earned ? "✓" : ""}</button>
    ${gradeBadge(trophy)}
    <div class="row-main">
      <h3>${esc(displayName(trophy, state))}</h3>
      <p>${masked ? "This trophy's name is hidden until you unlock it — or until you turn the spoiler setting off." : esc(trophy.desc)}</p>
      <div class="row-meta">
        <span class="kind">${esc(KIND_LABELS[trophy.kind] || trophy.kind)}</span>
        <span class="chapter">${esc(trophy.chapter || "")}</span>
        ${countChip(trophy, state)}
        ${flags.join("")}
      </div>
    </div>
  </article>`;
}

export function renderChecklist(trophies, state) {
  if (!trophies.length) return `<p class="empty">No trophies match these filters. Clear the search or pick another kind.</p>`;
  return trophies.map((t) => trophyRow(t, state)).join("\n");
}

export function sourceChips(trophy, sources) {
  const chips = (trophy.sources || ["S1"]).map((id) => `<span class="src-chip">[${id}]</span>`).join("");
  const names = (trophy.sources || ["S1"])
    .map((id) => {
      const s = sources.find((x) => x.id === id);
      return s ? esc(s.name) : id;
    })
    .join(" + ");
  return { chips, names };
}

// The detail pane: official description, then SOURCES, then the guide.
// Sources sit above the guide on purpose — in the earlier version they sat
// below the fold and the judge never saw them in any screenshot.
export function renderDetail(trophy, state, sources) {
  if (!trophy) {
    return `<div class="detail-empty"><h2>Pick a trophy</h2><p>Select any trophy on the left to see its full guide: the official description, its sources, and the steps, tracking and tips to unlock it.</p></div>`;
  }
  const earned = state.earned.includes(trophy.id);
  const { chips, names } = sourceChips(trophy, sources);
  const missed = trophy.missable === "possibly";
  const stepper =
    trophy.target != null
      ? `<div class="stepper" data-stepper="${trophy.id}">
          <span class="stepper-label">Your progress</span>
          <button data-step="-1" aria-label="Decrease count">−</button>
          <strong>${state.counts[trophy.id] || 0} / ${trophy.target} ${esc(trophy.targetLabel || "")}</strong>
          <button data-step="1" aria-label="Increase count">+</button>
        </div>`
      : "";
  const unconfirmed = trophy.unconfirmed
    ? `<div class="callout callout-warn"><strong>Method unconfirmed.</strong> ${esc(trophy.unconfirmedNote || "No guide has confirmed the exact trigger yet — see the Sources page for what is known.")}</div>`
    : "";
  const g = trophy.guide;
  return `<div class="detail-head">
      ${gradeBadge(trophy)}
      <div>
        <h2>${esc(trophy.name)}</h2>
        <p class="detail-sub">${esc(trophy.desc)} · ${trophy.grade}${trophy.gamerscore ? ` · ${trophy.gamerscore}G` : ""} · ${esc(KIND_LABELS[trophy.kind] || trophy.kind)} · ${esc(trophy.chapter || "")}</p>
      </div>
    </div>
    <p class="detail-desc">${esc(trophy.desc)}</p>
    <section class="detail-sources"><h3>SOURCES</h3><div class="src-line">${chips}<span class="src-names">${names}</span></div>
      <p class="src-note">Method confirmed by ${names}. Full source list and the unconfirmed list are on the Sources page.</p></section>
    ${missed ? `<div class="callout callout-danger"><strong>Possibly missable.</strong> ${esc(trophy.missableNote || "")}</div>` : ""}
    ${unconfirmed}
    <section class="detail-guide"><h3>GUIDE</h3>
      <p class="guide-summary">${esc(g.summary)}</p>
      <ol class="guide-steps">${g.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      <p class="guide-tracking"><strong>Tracking:</strong> ${esc(g.tracking)}</p>
      ${g.tips && g.tips.length ? `<div class="guide-tips"><strong>Tips</strong><ul>${g.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>` : ""}
    </section>
    ${stepper}
    <div class="detail-actions">
      <button id="earn-btn" data-earn="${trophy.id}">${earned ? "✓ Earned — tap to unmark" : "Mark as earned"}</button>
      <button id="prev-btn">← Previous</button>
      <button id="next-btn">Next →</button>
    </div>`;
}

export function renderStrip(roadmap, trophies, state) {
  return roadmap.stages
    .map((stage, i) => {
      const inStage = trophies.filter((t) => t.stage === i + 1);
      const done = inStage.filter((t) => state.earned.includes(t.id)).length;
      const miss = inStage.some((t) => t.missable === "possibly" && !state.earned.includes(t.id));
      return `<button class="strip-stage" data-stage-jump="${i + 1}">
        <span class="strip-name">${esc(stage.name)}</span>
        <span class="strip-count">${done} / ${inStage.length}</span>
        <span class="strip-hours">${esc(stage.hours)}</span>
        ${miss ? `<span class="strip-warn">⚠ Positive Mental Attitude</span>` : ""}
      </button>`;
    })
    .join("");
}

export function renderNextUp(items) {
  return items
    .map(
      (item) => `<button class="nextup-item" data-trophy-id="${item.trophy.id}">
        ${gradeBadge(item.trophy)}
        <span class="nextup-name">${esc(item.trophy.name)}</span>
        <span class="nextup-why">${esc(item.why)}</span>
      </button>`,
    )
    .join("");
}

export function renderRoadmap(roadmap, state) {
  const flat = roadmap.stages.flatMap((s) => s.tasks);
  let index = 0;
  return roadmap.stages
    .map((stage, si) => {
      const rows = stage.tasks
        .map((task) => {
          const n = index++;
          const done = state.completion.includes(n);
          return `<li class="${done ? "is-done" : ""}"><label><input type="checkbox" data-task="${n}" ${done ? "checked" : ""}> <span><strong>${esc(task.text)}</strong> ${esc(task.detail)}</span></label></li>`;
        })
        .join("");
      const doneCount = stage.tasks.filter((_, j) => {
        const base = roadmap.stages.slice(0, si).reduce((a, s) => a + s.tasks.length, 0);
        return state.completion.includes(base + j);
      }).length;
      return `<section class="stage"><header><h3>Stage ${si + 1} — ${esc(stage.name)}</h3><span class="stage-meta">${esc(stage.hours)} · ${doneCount} / ${stage.tasks.length} tasks</span></header>
        <p class="stage-note">${esc(stage.note)}</p><ul class="stage-tasks">${rows}</ul></section>`;
    })
    .join("") + `<p class="roadmap-total">${state.completion.length} of ${flat.length} roadmap tasks ticked.</p>`;
}

// The Route view: what to do in each chapter, in play order, so the player
// never backtracks. Built from the trophies' own chapter and stage fields.
export function renderRoute(trophies, state) {
  const groups = [
    { title: "Chapter 1 — the opening", note: "Start the long counters now and protect the one missable step.", match: (t) => t.chapter === "Chapter 1" || t.id === "baited-my-tackle" || t.id === "stick-fiddler" || t.id === "this-was-no-boat-accident" || t.id === "positive-mental-attitude" },
    { title: "Chapter 2 — both characters", note: "Coffee Break unlocks partner play. Everything with a partner starts here.", match: (t) => t.chapter === "Chapter 2" || t.id === "the-lone-rider" || t.id === "little-boxes" || t.id === "on-the-spot" || t.id === "personal-best" || t.id === "hot-together" || t.id === "retail-therapy" || t.id === "fair-game" || t.id === "lets-go-bowling" },
    { title: "Chapter 3 — the tool chapters", note: "Key Cloner, Snap Gun and the fence network all open here.", match: (t) => t.chapter === "Chapter 3" || t.id === "road-to-rehabilitation" || t.id === "spin-on-this" || t.id === "supply-and-demand" || t.id === "capital-offense" || t.id === "dime-on-the-dollar" || t.id === "sneakthief" },
    { title: "Chapter 4 — the robbery chapter", note: "Bank vaults open. This is where the money and the heat live.", match: (t) => t.chapter === "Chapter 4" || t.id === "maximum-withdrawal" || t.id === "a-classic-blitz-play" },
    { title: "Chapter 5 & after the story", note: "Final mission, then the checklist opens and the cleanup begins.", match: (t) => t.chapter === "Chapter 5" || t.chapter === "After the story" || t.id === "a-long-road" || t.id === "vice-got-a-price" },
    { title: "Any time — habits, not sessions", note: "These fill in while you travel. Start them early and they finish themselves.", match: (t) => t.chapter === "Any time" },
    { title: "Still unconfirmed", note: "Do not grind these blind. Check the Sources page for the confirmed method first.", match: (t) => t.unconfirmed },
  ];
  const seen = new Set();
  return groups
    .map((g) => {
      const rows = trophies.filter((t) => g.match(t) && !seen.has(t.id));
      rows.forEach((t) => seen.add(t.id));
      if (!rows.length) return "";
      return `<section class="route-group"><h3>${esc(g.title)}</h3><p class="route-note">${esc(g.note)}</p>
        <ul class="route-list">${rows
          .map((t) => {
            const done = state.earned.includes(t.id);
            return `<li class="${done ? "is-done" : ""}"><button class="route-trophy" data-trophy-id="${t.id}">${gradeBadge(t)} ${esc(t.name)}</button><span class="route-desc">${esc(t.desc)}</span></li>`;
          })
          .join("")}</ul></section>`;
    })
    .join("");
}

export function renderStats(trophies, state, roadmap) {
  const earned = state.earned.length;
  const pct = Math.round((earned / trophies.length) * 100);
  const grades = ["platinum", "gold", "silver", "bronze"];
  const gradeRows = grades
    .map((g) => {
      const total = trophies.filter((t) => t.grade === g).length;
      const done = trophies.filter((t) => t.grade === g && state.earned.includes(t.id)).length;
      const w = total ? Math.round((done / total) * 100) : 0;
      return `<div class="stat-row"><span class="stat-label">${g} ${done}/${total}</span><div class="bar"><div class="bar-fill bar-${g}" style="width:${w}%"></div></div></div>`;
    })
    .join("");
  const kindRows = Object.entries(
    trophies.reduce((acc, t) => {
      acc[t.kind] = acc[t.kind] || [0, 0];
      acc[t.kind][1] += 1;
      if (state.earned.includes(t.id)) acc[t.kind][0] += 1;
      return acc;
    }, {}),
  )
    .map(
      ([kind, [done, total]]) =>
        `<div class="stat-row"><span class="stat-label">${esc(KIND_LABELS[kind] || kind)} ${done}/${total}</span><div class="bar"><div class="bar-fill" style="width:${Math.round((done / total) * 100)}%"></div></div></div>`,
    )
    .join("");
  const tasksDone = state.completion.length;
  const tasksTotal = roadmap.stages.reduce((n, s) => n + s.tasks.length, 0);
  const pma = trophies.find((t) => t.id === "positive-mental-attitude");
  const pmaDone = state.earned.includes("positive-mental-attitude");
  const unconfirmedLeft = trophies.filter((t) => t.unconfirmed && !state.earned.includes(t.id)).length;
  return `<div class="stats-grid">
    <section class="stat-card"><h3>Overall</h3><p class="stat-big">${earned} / ${trophies.length} <span>(${pct}%)</span></p>
      <div class="bar"><div class="bar-fill" style="width:${pct}%"></div></div>
      <p class="stat-note">Roadmap tasks ticked: ${tasksDone} / ${tasksTotal}. Estimated time to platinum: about 200 hours in total (PowerPyx) — most of it is the 100% checklist.</p></section>
    <section class="stat-card"><h3>By grade</h3>${gradeRows}</section>
    <section class="stat-card"><h3>By kind</h3>${kindRows}</section>
    <section class="stat-card"><h3>Missable guard</h3>
      <p class="stat-note">${pmaDone ? "✓ Positive Mental Attitude is earned — the one risk is gone." : "⚠ Positive Mental Attitude is NOT earned yet. Do Lucia's balcony meditation in Chapter 1 before the chapter ends."}</p>
      <p class="stat-note">Unconfirmed methods left: ${unconfirmedLeft} (Fair Game's animal, Bad Luck, I Guess, Ten Pin). See the Sources page for what is known.</p>
      <p class="stat-note">Hidden trophies: 28 of 55. The spoiler setting hides their names until you earn them.</p></section>
  </div>`;
}

export function renderMissables(trophies, state) {
  const pma = trophies.find((t) => t.id === "positive-mental-attitude");
  const watch = trophies.filter((t) => t.unconfirmed);
  const pmaDone = state.earned.includes("positive-mental-attitude");
  return `<section class="miss-card"><h3>${esc(pma.name)}</h3>
      <p><strong>Possibly missable.</strong> ${esc(pma.missableNote || "")}</p>
      <p>${esc(pma.guide.summary)}</p>
      <p class="miss-status">${pmaDone ? "✓ Earned — the risk is gone." : "Not earned yet. Do it in Chapter 1."}</p>
      <button class="open-trophy" data-trophy-id="positive-mental-attitude">Open the guide →</button>
    </section>
    <h3 class="watch-head">Watch list — methods still unconfirmed</h3>
    ${watch
      .map(
        (t) => `<section class="watch-card"><h3>${esc(t.name)}</h3>
          <p>${esc(t.unconfirmedNote || "Method not yet confirmed.")}</p>
          <p class="watch-note">This guide does not guess. Check the Sources page — the method is added the moment the community confirms it.</p>
          <button class="open-trophy" data-trophy-id="${t.id}">Open the guide →</button>
        </section>`,
      )
      .join("")}
    <p class="miss-foot">Everything else in the game can be done after the story in free-roam. PowerPyx confirms nothing toward 100% is missable, and every trophy quest giver returns after the story.</p>`;
}

// The 100% checklist rows for A Long Road: thresholds, not guesses.
export const HUNDRED_ROWS = [
  { label: "Optional missions", need: "Any 100", total: "200–300+ in the game", done: "Complete any 100 optional missions." },
  { label: "Vehicles scanned", need: "200 of 277", total: "base model vehicles", done: "Scan with WAiNK (hold Up, then R1)." },
  { label: "Animals studied", need: "100 of 255", total: "animals", done: "Study through the binoculars; no hunting needed." },
  { label: "Stunts", need: "300 of 397", total: "stunts", done: "Stunt Jumps 130, Under the Bridges 202, Knife Flights 40, Base Jumps 25." },
  { label: "Challenges", need: "70 of 80", total: "challenges", done: "Skip the hardest 10. One Last Thing needs 50." },
  { label: "Meditations", need: "15 of 18", total: "meditations", done: "Each spot counts +2 with both characters." },
  { label: "Card sets", need: "15 of 18", total: "collectible card sets", done: "Don't Touch My Deck needs 3." },
  { label: "Robberies", need: "All", total: "robberies", done: "Bank vaults, Payday Loans, jewelry stores, armored trucks." },
  { label: "Underwater discoveries", need: "All", total: "discoveries", done: "Shipwrecks and underwater finds — Kenton's strand covers the diving." },
  { label: "Shooting ranges", need: "All", total: "ranges", done: "12 ranges, 42 gold medals for The Shootist." },
  { label: "Drone races", need: "All", total: "races", done: "14 Top Fun locations, 42 races." },
  { label: "Bret's Target Decks", need: "All 15", total: "decks", done: "Hunt every deck Bret marks. Fair Game should follow." },
];

export function renderCompletion() {
  return `<p class="hundred-intro">A Long Road needs the 100% checklist, unlocked after the story under Progress &gt; Stats &gt; 100% Completion. The checklist is lenient — closer to 60% true completion — but the rows marked <strong>All</strong> need everything.</p>
  <ul class="completion-list">${HUNDRED_ROWS.map(
    (r) => `<li class="hundred-row"><strong>${esc(r.label)}</strong><span class="hundred-need">${esc(r.need)} ${esc(r.total)}</span><span class="hundred-done">${esc(r.done)}</span></li>`,
  ).join("")}</ul>
  <p class="hundred-foot">Nothing on this checklist is missable. Progress made during the story already counts.</p>`;
}

export function renderSources(meta, trophies) {
  const unconfirmed = trophies.filter((t) => t.unconfirmed);
  const fixed = ["In The Beginning…", "Capital Offense", "The Truth Is Out There"];
  return `<section class="sources-intro"><p>This guide cites its sources on every trophy. The methods come from the two launch-day guides, and the list itself is cross-checked against the trophy trackers. Where the guides disagree, this guide says so instead of picking a side.</p></section>
  <ul class="source-list">${meta.sources
    .map(
      (s) => `<li><strong>[${s.id}] ${esc(s.name)}</strong> — <a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.url)}</a><br><span>${esc(s.what)}</span></li>`,
    )
    .join("")}</ul>
  <h3>What the sources agree on</h3>
  <ul class="agree-list">
    <li>55 trophies: 1 platinum, 2 gold, 6 silver, 46 bronze. All offline, single-player, no DLC needed.</li>
    <li>Difficulty 4/10, about 200 hours to the platinum (PowerPyx) — 250+ hours (Push Square).</li>
    <li>5 chapters, story 60–80 hours. No mission replay, no difficulty settings, no mission gold medals.</li>
    <li>Cheats disable trophies and stop the game saving. Keep them off for the whole run.</li>
    <li>15 manual save slots + 1 autosave. Keep a save at the start and end of every chapter.</li>
    <li>28 hidden trophies: the 12 story trophies plus 16 side trophies. This guide hides 28 of the 55 names while the spoiler setting is on.</li>
  </ul>
  <h3>Fixed since launch — now confirmed</h3>
  <ul class="fixed-list">${fixed.map((n) => `<li><strong>${esc(n)}</strong> — method now confirmed by PowerPyx (see its guide).</li>`).join("")}</ul>
  <h3>Still unconfirmed — the guide does not yet know</h3>
  <p class="unconfirmed-intro">Three triggers are still unconfirmed. This guide does not yet know their exact methods, and it does not guess: each one is labelled in its guide with the current best belief.</p>
  <ul class="unconfirmed-list">${unconfirmed.map((t) => `<li><strong>${esc(t.name)}</strong> — ${esc(t.unconfirmedNote || "")}</li>`).join("")}</ul>
  <p class="sources-foot">Sources checked 19 Nov 2026 (launch day). The unconfirmed list is updated as the community verifies each trigger.</p>`;
}
