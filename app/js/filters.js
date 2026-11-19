var PRIORITY_ORDER = [
  'just-like-paradise', 'paradise-lost', 'ts-ass-drug-money', 'positive-mental-attitude',
  'vice-city-baby', 'top-of-the-world-ma', 'you-gotta-know-when-to-get-off', 'trust',
  'break-the-bank', 'family-matters', 'dwnfall', 'hi-jacked', 'snow-storm',
  'road-to-rehabilitation', 'this-was-no-boat-accident', 'the-lone-rider', 'supply-demand',
  'spin-on-this', 'master-of-none', 'whip-it-good', 'baited-my-tackle', 'stick-fiddler',
  'cunning-stunts', 'one-last-thing', 'the-shootist', 'top-fun', 'earn-cash-not-kudos',
  'strangers-freaks', 'dont-touch-my-deck', 'you-wainker', 'hot-together', 'retail-therapy',
  'gunslinger', 'sneakthief', 'maximum-withdrawal', 'a-classic-blitz-play', 'the-goodtime-state',
  'pest-control', 'dime-on-the-dollar', 'treat-yo-self', 'little-boxes', 'on-the-spot',
  'catch-me-if-you-can', 'challenging-tank', 'capital-offense', 'lets-go-bowling',
  'personal-best', 'actions-speak-louder', 'fair-game', 'bad-luck-i-guess',
  'the-truth-is-out-there', 'in-the-beginning', 'ten-pin', 'a-long-road', 'vice-got-a-price'
];

function kindLabel(kind) {
  var labels = {
    all: 'All trophies',
    platinum: 'Platinum',
    story: 'Story',
    activities: 'Activities',
    collectibles: 'Collectibles',
    combat: 'Combat',
    robberies: 'Robberies',
    exploration: 'Exploration',
    money: 'Money'
  };
  return labels[kind] || kind;
}

function filterByKind(trophies, kind) {
  if (!kind || kind === 'all') return trophies.slice();
  return trophies.filter(function (t) { return t.kind === kind; });
}

function searchTrophies(trophies, query) {
  var q = (query || '').trim().toLowerCase();
  if (!q) return trophies.slice();
  return trophies.filter(function (t) {
    return t.name.toLowerCase().indexOf(q) !== -1 ||
      t.description.toLowerCase().indexOf(q) !== -1 ||
      t.id.toLowerCase().indexOf(q) !== -1;
  });
}

function applyFilters(trophies, kind, query) {
  return searchTrophies(filterByKind(trophies, kind), query);
}

function displayName(trophy, spoilerOn) {
  if (spoilerOn && trophy.hidden && trophy.kind === 'story') return 'Hidden story trophy';
  return trophy.name;
}

function isNameMasked(trophy, spoilerOn) {
  return !!(spoilerOn && trophy.hidden && trophy.kind === 'story');
}

function nextUp(trophies, state, limit) {
  var byId = {};
  trophies.forEach(function (t) { byId[t.id] = t; });
  var ordered = [];
  PRIORITY_ORDER.forEach(function (id) {
    if (byId[id]) ordered.push(byId[id]);
  });
  trophies.forEach(function (t) {
    if (PRIORITY_ORDER.indexOf(t.id) === -1) ordered.push(t);
  });
  var open = ordered.filter(function (t) { return state.earned.indexOf(t.id) === -1; });
  return open.slice(0, limit || 8);
}

function countProgress(state, trophy) {
  if (!trophy.count) return null;
  var current = state.counts[trophy.id] || 0;
  return { current: current, target: trophy.count.target, unit: trophy.count.unit, done: current >= trophy.count.target };
}

window.LeonidaFilters = {
  PRIORITY: PRIORITY_ORDER,
  kindLabel: kindLabel,
  filterByKind: filterByKind,
  search: searchTrophies,
  apply: applyFilters,
  displayName: displayName,
  isMasked: isNameMasked,
  nextUp: nextUp,
  countProgress: countProgress
};
