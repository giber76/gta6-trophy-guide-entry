// Leonida Platinum — filtering, sorting and planning over the trophy list.
//
// These are pure functions: give them the trophy list and the saved state
// and they hand back the rows to show. Nothing here reads the DOM, so the
// same rules drive the checklist, the planner and the stats page.

export const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export const KIND_LABELS = {
  all: "All kinds",
  story: "Story",
  quest: "Questlines",
  activity: "Activities",
  collectible: "Collectibles",
  robbery: "Robberies",
  misc: "Miscellaneous",
  completion: "Completion",
};

export const STAGE_LABELS = {
  1: "Stage 1 · Prep & Ch. 1",
  2: "Stage 2 · Story Ch. 2–4",
  3: "Stage 3 · Finale & 100%",
  4: "Stage 4 · Robberies & counts",
  5: "Stage 5 · Cleanup & platinum",
};

// A hidden trophy is masked while the spoiler setting is on and the player
// has not earned it yet. Earned hidden trophies always show their names.
export function isMasked(trophy, state) {
  return Boolean(state.spoiler && trophy.hidden && !state.earned.includes(trophy.id));
}

export function displayName(trophy, state) {
  if (isMasked(trophy, state)) return "Hidden story trophy";
  return trophy.name;
}

export function matchesQuery(trophy, query) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [trophy.name, trophy.desc, trophy.kind, trophy.chapter || "", trophy.id]
    .join(" ")
    .toLowerCase();
  return q.split(/\s+/).every((word) => hay.includes(word));
}

export function visibleTrophies(trophies, state) {
  let rows = trophies.filter((t) => {
    if (state.kind !== "all" && t.kind !== state.kind) return false;
    if (state.grade !== "all" && t.grade !== state.grade) return false;
    if (state.stage !== "all" && String(t.stage) !== String(state.stage)) return false;
    if (state.showEarned === "earned" && !state.earned.includes(t.id)) return false;
    if (state.showEarned === "todo" && state.earned.includes(t.id)) return false;
    if (!matchesQuery(t, state.query)) return false;
    return true;
  });
  if (state.sort === "grade") {
    rows = [...rows].sort(
      (a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.name.localeCompare(b.name),
    );
  } else if (state.sort === "name") {
    rows = [...rows].sort((a, b) => a.name.localeCompare(b.name));
  } else if (state.sort === "kind") {
    rows = [...rows].sort(
      (a, b) => a.kind.localeCompare(b.kind) || GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade],
    );
  }
  // "roadmap" order is the list order: the trophies.json order is the
  // order a player should meet them in.
  return rows;
}

// The next unearned trophies in roadmap order, each with the reason it is
// next. The planner shows the first ten.
export function nextUp(trophies, state, n = 10) {
  const reasons = {
    "positive-mental-attitude": "Do it in Chapter 1 — the balcony meditation is the only step in the game that can go away.",
    "just-like-paradise": "First mission of the game. It pops on its own.",
    "baited-my-tackle": "Cal's strand opens in Chapter 1. Take it when his text arrives.",
    "stick-fiddler": "Do it at home tonight — any one arcade game, finished once.",
    "whip-it-good": "Scan as you drive. It fills itself in if you start now.",
    "this-was-no-boat-accident": "Kenton's strand opens in Chapter 1. Dive while you are near Key Lento.",
  };
  const todo = trophies.filter((t) => !state.earned.includes(t.id));
  return todo.slice(0, n).map((t) => ({
    trophy: t,
    why:
      reasons[t.id] ||
      (t.kind === "story"
        ? "Story trophy — keep playing the main missions and it pops."
        : t.stage === 1
          ? "Early trophy — knock it out while you are in this part of the game."
          : t.missable === "possibly"
            ? "Possibly missable — protect it before moving on."
            : t.unconfirmed
              ? "Method still unconfirmed — check the Sources page before grinding it."
              : "Next in roadmap order."),
  }));
}

export function gradeCounts(trophies, state) {
  const out = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const t of trophies) {
    out[t.grade][1] += 1;
    if (state.earned.includes(t.id)) out[t.grade][0] += 1;
  }
  return out;
}

export function kindCounts(trophies, state) {
  const out = {};
  for (const t of trophies) {
    if (!out[t.kind]) out[t.kind] = [0, 0];
    out[t.kind][1] += 1;
    if (state.earned.includes(t.id)) out[t.kind][0] += 1;
  }
  return out;
}

export function stageCounts(trophies, state) {
  const out = {};
  for (const t of trophies) {
    if (!out[t.stage]) out[t.stage] = [0, 0];
    out[t.stage][1] += 1;
    if (state.earned.includes(t.id)) out[t.stage][0] += 1;
  }
  return out;
}

// Rough hours left, from the roadmap stage hours and what is already done.
// The story stages are the big blocks; cleanup is the long tail.
export function hoursLeft(trophies, state, roadmap) {
  const stageHours = { 1: 10, 2: 70, 3: 20, 4: 60, 5: 10 };
  let total = 0;
  for (const t of trophies) {
    if (state.earned.includes(t.id)) continue;
    // A trophy's share of its stage, spread across the stage's trophies.
    const inStage = trophies.filter((x) => x.stage === t.stage).length;
    total += (stageHours[t.stage] || 10) / Math.max(1, inStage);
  }
  const doneTasks = roadmap
    ? roadmap.stages.reduce((n, s) => n + s.tasks.length, 0)
    : 0;
  const ticked = state.completion.length;
  const taskHours = doneTasks ? Math.max(0, (doneTasks - ticked) * 2) : 0;
  return Math.round(total * 0.6 + taskHours * 0.4);
}
