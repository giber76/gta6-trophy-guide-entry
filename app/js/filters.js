// Leonida Platinum — filters, search and the spoiler rule.
//
// The filters are the ones the trophy list asks for: kind (story, missable,
// collectibles, activities, crime, completion), grade, earned-only, and a
// free-text search over name, description, mission and guide. The spoiler
// rule hides a story trophy's name, description and guide until it is earned.

export const KIND_LABELS = {
  story: 'Story',
  missable: 'Missable',
  collectible: 'Collectible',
  activity: 'Activity',
  crime: 'Crime',
  completion: 'Completion',
};

export function blankFilters() {
  return { kind: 'all', grade: 'all', query: '', earnedOnly: false };
}

// A story trophy is hidden while the spoiler setting is on and it is not
// earned yet. Everything else is always shown.
export function isSpoilerHidden(trophy, state) {
  if (!state.spoiler) return false;
  if (trophy.kind !== 'story') return false;
  return !state.earned.includes(trophy.id);
}

export function trophyMatches(trophy, filters, state) {
  if (filters.kind !== 'all') {
    if (filters.kind === 'missable') {
      if (trophy.missable !== 'yes' && trophy.missable !== 'risk') return false;
    } else if (trophy.kind !== filters.kind) {
      return false;
    }
  }
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.earnedOnly && !state.earned.includes(trophy.id)) return false;
  if (filters.query) {
    const haystack = [trophy.name, trophy.description, trophy.guide, trophy.kind, trophy.grade]
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(filters.query.toLowerCase())) return false;
  }
  return true;
}

export function visibleTrophies(trophies, filters, state) {
  return trophies.filter((trophy) => trophyMatches(trophy, filters, state));
}

// The next trophy to chase: the earliest un-earned trophy in the roadmap's
// order (story first, then strangers, activities, crime, completion).
export function nextTrophy(trophies, roadmap, state) {
  const order = [];
  for (const stage of roadmap.stages) order.push(...stage.trophyIds);
  for (const id of order) {
    if (!state.earned.includes(id)) return trophies.find((trophy) => trophy.id === id) || null;
  }
  return null;
}
