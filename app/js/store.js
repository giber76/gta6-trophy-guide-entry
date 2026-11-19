var STORE_KEY = 'leonida-platinum-v1';

function blankState() {
  return { earned: [], counts: {}, completion: [], spoiler: false, selected: null };
}

function loadState() {
  try {
    var raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return blankState();
    var parsed = JSON.parse(raw);
    var state = blankState();
    if (Array.isArray(parsed.earned)) state.earned = parsed.earned.slice();
    if (parsed.counts && typeof parsed.counts === 'object') state.counts = parsed.counts;
    if (Array.isArray(parsed.completion)) state.completion = parsed.completion.slice();
    if (typeof parsed.spoiler === 'boolean') state.spoiler = parsed.spoiler;
    if (typeof parsed.selected === 'string' || parsed.selected === null) state.selected = parsed.selected;
    return state;
  } catch (err) {
    return blankState();
  }
}

function saveState(state) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (err) {
    // storage full or unavailable; the in-memory state still works
  }
}

function isEarned(state, id) {
  return state.earned.indexOf(id) !== -1;
}

function toggleEarned(state, id) {
  var at = state.earned.indexOf(id);
  if (at === -1) state.earned.push(id);
  else state.earned.splice(at, 1);
  saveState(state);
  return state;
}

function getCount(state, id) {
  var value = state.counts[id];
  return typeof value === 'number' && value >= 0 ? value : 0;
}

function setCount(state, id, value) {
  var n = Math.max(0, Math.floor(Number(value) || 0));
  state.counts[id] = n;
  saveState(state);
  return state;
}

function bumpCount(state, id, delta) {
  return setCount(state, id, getCount(state, id) + delta);
}

function isComplete(state, index) {
  return state.completion.indexOf(index) !== -1;
}

function toggleComplete(state, index) {
  var at = state.completion.indexOf(index);
  if (at === -1) state.completion.push(index);
  else state.completion.splice(at, 1);
  saveState(state);
  return state;
}

function earnedTotal(state) {
  return state.earned.length;
}

function selectTrophy(state, id) {
  state.selected = id;
  saveState(state);
  return state;
}

function setSpoiler(state, on) {
  state.spoiler = !!on;
  saveState(state);
  return state;
}

window.LeonidaStore = {
  KEY: STORE_KEY,
  blank: blankState,
  load: loadState,
  save: saveState,
  isEarned: isEarned,
  toggleEarned: toggleEarned,
  getCount: getCount,
  setCount: setCount,
  bumpCount: bumpCount,
  isComplete: isComplete,
  toggleComplete: toggleComplete,
  earnedTotal: earnedTotal,
  select: selectTrophy,
  setSpoiler: setSpoiler
};
