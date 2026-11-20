// Leonida Platinum Log — state: earned trophies, per-trophy counters, spoiler shield.
// Progress is saved in this browser only (localStorage). Nothing leaves the device.
const KEY = 'leonida-platinum-v5';

function blankState() {
  return {
    earned: {},
    counts: {},
    spoiler: true,
    filter: 'all',
    sort: 'roadmap',
    search: '',
    selected: 'positive-mental-attitude',
    view: 'tracker'
  };
}

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    const state = blankState();
    if (parsed && typeof parsed === 'object') {
      if (parsed.earned && typeof parsed.earned === 'object') state.earned = parsed.earned;
      if (parsed.counts && typeof parsed.counts === 'object') state.counts = parsed.counts;
      if (typeof parsed.spoiler === 'boolean') state.spoiler = parsed.spoiler;
      if (typeof parsed.filter === 'string') state.filter = parsed.filter;
      if (typeof parsed.sort === 'string') state.sort = parsed.sort;
      if (typeof parsed.selected === 'string') state.selected = parsed.selected;
      if (typeof parsed.view === 'string') state.view = parsed.view;
    }
    return state;
  } catch (err) {
    return blankState();
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      earned: state.earned,
      counts: state.counts,
      spoiler: state.spoiler,
      filter: state.filter,
      sort: state.sort,
      selected: state.selected,
      view: state.view
    }));
  } catch (err) {
    // Storage may be unavailable (private mode); the tracker still works in memory.
  }
}

export function isEarned(state, id) {
  return Boolean(state.earned[id]);
}

export function toggleEarned(state, id) {
  if (state.earned[id]) delete state.earned[id];
  else state.earned[id] = true;
  saveState(state);
  return Boolean(state.earned[id]);
}

export function earnedCount(state) {
  return Object.keys(state.earned).length;
}

export function getCount(state, id) {
  const n = state.counts[id];
  return typeof n === 'number' && n >= 0 ? n : 0;
}

export function setCount(state, id, n) {
  const v = Math.max(0, Math.floor(n));
  if (v === 0) delete state.counts[id];
  else state.counts[id] = v;
  saveState(state);
  return v;
}

export function exportState(state) {
  return JSON.stringify({
    app: 'leonida-platinum-log',
    version: 5,
    exported: new Date().toISOString(),
    earned: Object.keys(state.earned).sort(),
    counts: state.counts
  }, null, 2);
}

export function importState(state, text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object') throw new Error('Not a Leonida Platinum export file.');
  const earned = {};
  const list = Array.isArray(parsed.earned) ? parsed.earned : [];
  for (const id of list) {
    if (typeof id === 'string') earned[id] = true;
  }
  state.earned = earned;
  state.counts = (parsed.counts && typeof parsed.counts === 'object') ? parsed.counts : {};
  saveState(state);
  return Object.keys(earned).length;
}

export function download(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
