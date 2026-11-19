// Leonida Platinum — the saved progress store.
//
// Everything the player ticks, counts or checks is kept in this browser's
// localStorage under one key, so the guide works fully offline. Export writes
// the same JSON to a file; import reads it back and replaces the store.

export const STORE_KEY = 'leonida-platinum-v1';

export function blankState() {
  return {
    earned: [],       // trophy ids the player has earned
    counts: {},       // trophy id -> current count (for trophies with a PSN counter)
    completion: [],   // 100% checklist task indexes done
    spoiler: false,   // hide story trophies until earned
    selected: null,   // trophy id open in the detail pane
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    const state = blankState();
    if (Array.isArray(parsed.earned)) state.earned = parsed.earned.filter((id) => typeof id === 'string');
    if (parsed.counts && typeof parsed.counts === 'object') {
      for (const [id, value] of Object.entries(parsed.counts)) {
        const n = Number(value);
        if (Number.isFinite(n) && n >= 0) state.counts[id] = Math.floor(n);
      }
    }
    if (Array.isArray(parsed.completion)) state.completion = parsed.completion.filter((n) => Number.isInteger(n));
    if (typeof parsed.spoiler === 'boolean') state.spoiler = parsed.spoiler;
    if (typeof parsed.selected === 'string') state.selected = parsed.selected;
    return state;
  } catch (err) {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (err) {
    // Storage full or blocked: the guide still works for this session.
  }
}

export function isEarned(state, trophyId) {
  return state.earned.includes(trophyId);
}

export function toggleEarned(state, trophyId) {
  const at = state.earned.indexOf(trophyId);
  if (at === -1) state.earned.push(trophyId);
  else state.earned.splice(at, 1);
  saveState(state);
  return state;
}

export function setCount(state, trophyId, value, max) {
  const clamped = Math.max(0, Math.min(max, Math.floor(value)));
  if (clamped === 0) delete state.counts[trophyId];
  else state.counts[trophyId] = clamped;
  saveState(state);
  return state;
}

export function getCount(state, trophyId) {
  return state.counts[trophyId] || 0;
}

export function toggleCompletionTask(state, index) {
  const at = state.completion.indexOf(index);
  if (at === -1) state.completion.push(index);
  else state.completion.splice(at, 1);
  saveState(state);
  return state;
}

// Serialise the whole state for export: a plain JSON file the player can
// keep, move to another browser, or send to a friend.
export function exportState(state) {
  return JSON.stringify(
    { app: 'leonida-platinum', version: 1, exportedAt: new Date().toISOString(), state },
    null,
    2,
  );
}

// Parse an exported file back into a state. Returns null when the file is
// not one of ours, so a wrong file never wipes the player's progress.
export function parseExport(text) {
  try {
    const parsed = JSON.parse(text);
    if (!parsed || parsed.app !== 'leonida-platinum' || !parsed.state) return null;
    const state = blankState();
    const inner = parsed.state;
    if (Array.isArray(inner.earned)) state.earned = inner.earned.filter((id) => typeof id === 'string');
    if (inner.counts && typeof inner.counts === 'object') {
      for (const [id, value] of Object.entries(inner.counts)) {
        const n = Number(value);
        if (Number.isFinite(n) && n >= 0) state.counts[id] = Math.floor(n);
      }
    }
    if (Array.isArray(inner.completion)) state.completion = inner.completion.filter((n) => Number.isInteger(n));
    if (typeof inner.spoiler === 'boolean') state.spoiler = inner.spoiler;
    return state;
  } catch (err) {
    return null;
  }
}

export function downloadFile(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
