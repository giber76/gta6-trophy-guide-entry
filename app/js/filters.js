// Leonida Platinum Log — filters and sorting for the tracker list.
// Counts are computed from the trophy data, never hard-coded, so the pills
// always agree with the list they filter.
export const FILTERS = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'story', label: 'Story', test: (t) => t.kind === 'story' },
  { id: 'missable', label: 'Missable', test: (t) => t.missable === true },
  { id: 'collectibles', label: 'Collectibles', test: (t) => t.kind === 'collectibles' },
  { id: 'activities', label: 'Activities', test: (t) => t.kind === 'activities' },
  { id: 'side', label: 'Side', test: (t) => t.kind === 'side' },
  { id: 'crime', label: 'Crime', test: (t) => t.kind === 'crime' },
  { id: 'world', label: 'World', test: (t) => t.kind === 'world' },
  { id: 'money', label: 'Money', test: (t) => t.kind === 'money' },
  { id: 'misc', label: 'Misc', test: (t) => t.kind === 'misc' },
  { id: 'completion', label: 'Completion', test: (t) => t.kind === 'completion' },
  { id: 'hidden', label: 'PSN-hidden', test: (t) => t.hidden === true },
  { id: 'disputed', label: 'Sources differ', test: (t) => Boolean(t.dispute) },
  { id: 'unconfirmed', label: 'Unconfirmed', test: (t) => t.unconfirmed === true },
  { id: 'not-earned', label: 'Not earned', test: (t, state) => !state.earned[t.id] }
];

export function filterCount(filter, trophies, state) {
  return trophies.filter((t) => filter.test(t, state)).length;
}

export function applyFilters(trophies, state) {
  const filter = FILTERS.find((f) => f.id === state.filter) || FILTERS[0];
  const q = state.search.trim().toLowerCase();
  let list = trophies.filter((t) => filter.test(t, state));
  if (q) {
    list = list.filter((t) => {
      const hay = [t.name, t.description, t.guide, t.kind, (t.steps || []).map((s) => s.text).join(' ')].join(' ').toLowerCase();
      return hay.includes(q);
    });
  }
  return list;
}

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

export function sortList(list, mode) {
  const copy = list.slice();
  if (mode === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else if (mode === 'grade') {
    copy.sort((a, b) => (GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade]) || a.name.localeCompare(b.name));
  } else {
    // Roadmap order: stage, then the order the trophy appears in the data file.
    copy.sort((a, b) => (a.stage - b.stage) || (a._index - b._index));
  }
  return copy;
}

export function nextUpList(trophies, state, n) {
  const unearned = trophies.filter((t) => !state.earned[t.id]);
  unearned.sort((a, b) => (a.stage - b.stage) || (a._index - b._index));
  return unearned.slice(0, n || 5);
}
