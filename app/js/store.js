// Leonida Platinum — saved progress store.
//
// Everything the player ticks is kept in one small object in localStorage,
// under the key LEONIDA_KEY. The object is versioned so a future shape can
// migrate instead of wiping the player's checklist. Nothing here touches
// the network: the guide works with the network off, and so does saving.

export const LEONIDA_KEY = "leonida-platinum-v1";

export function defaultState() {
  return {
    // Trophy ids the player has marked earned.
    earned: [],
    // Per-trophy counters for the counted trophies, e.g. {"cunning-stunts": 120}.
    counts: {},
    // Roadmap task indexes the player has ticked, e.g. [0, 1, 2].
    completion: [],
    // Spoiler setting: true hides hidden trophy names until they are earned.
    spoiler: false,
    // Currently open trophy in the detail pane, or null.
    selected: null,
    // Checklist controls (not saved per trophy, but kept in the same object).
    sort: "roadmap",
    kind: "all",
    grade: "all",
    stage: "all",
    query: "",
    showEarned: "all",
    view: "checklist",
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(LEONIDA_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultState();
    const state = defaultState();
    for (const key of Object.keys(state)) {
      if (parsed[key] !== undefined) state[key] = parsed[key];
    }
    // Guard the shapes the UI depends on.
    if (!Array.isArray(state.earned)) state.earned = [];
    if (!state.counts || typeof state.counts !== "object") state.counts = {};
    if (!Array.isArray(state.completion)) state.completion = [];
    return state;
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(LEONIDA_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked: the guide still works, it just does not persist.
  }
}

export function isEarned(state, id) {
  return state.earned.includes(id);
}

export function toggleEarned(state, id) {
  const at = state.earned.indexOf(id);
  if (at === -1) state.earned.push(id);
  else state.earned.splice(at, 1);
  saveState(state);
  return state;
}

export function earnedCount(state) {
  return state.earned.length;
}

export function getCount(state, id) {
  const n = state.counts[id];
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function setCount(state, id, n, max) {
  const value = Math.max(0, Math.min(max || 9999, Math.floor(n) || 0));
  if (value === 0) delete state.counts[id];
  else state.counts[id] = value;
  saveState(state);
  return state;
}

export function isTaskDone(state, index) {
  return state.completion.includes(index);
}

export function toggleTask(state, index) {
  const at = state.completion.indexOf(index);
  if (at === -1) state.completion.push(index);
  else state.completion.splice(at, 1);
  saveState(state);
  return state;
}

export function exportState(state) {
  return JSON.stringify(
    { app: "leonida-platinum", version: 1, exportedAt: new Date().toISOString(), state },
    null,
    2,
  );
}

export function importState(text) {
  const parsed = JSON.parse(text);
  const inner = parsed && parsed.state ? parsed.state : parsed;
  if (!inner || typeof inner !== "object") throw new Error("not a Leonida Platinum save");
  const state = defaultState();
  for (const key of Object.keys(state)) {
    if (inner[key] !== undefined) state[key] = inner[key];
  }
  if (!Array.isArray(state.earned)) state.earned = [];
  if (!state.counts || typeof state.counts !== "object") state.counts = {};
  if (!Array.isArray(state.completion)) state.completion = [];
  saveState(state);
  return state;
}

export function resetState() {
  const state = defaultState();
  saveState(state);
  return state;
}
