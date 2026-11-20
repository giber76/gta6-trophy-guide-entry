// Leonida Platinum Log — bootstrap: load the data, wire the controls, render.
// The app is static and offline: it fetches only its own files under app/.
import { loadState, saveState, toggleEarned, setCount, getCount, exportState, importState, download } from './store.js';
import * as views from './views.js';

const state = loadState();
let trophies = [];
let sources = [];
let roadmap = { stages: [], disputes: [] };

function applyView(view) {
  state.view = view;
  document.querySelectorAll('#tabs .tab').forEach((b) => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('main .view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + view));
  saveState(state);
}

function renderAll() {
  document.body.classList.toggle('spoiler-on', state.spoiler);
  const btn = document.getElementById('spoilerBtn');
  if (btn) btn.setAttribute('aria-pressed', String(state.spoiler));
  views.renderProgress(state, trophies);
  views.renderFilters(state, trophies);
  views.renderList(state, trophies);
  const selected = trophies.find((t) => t.id === state.selected) || trophies[0];
  views.renderDetail(state, trophies, sources);
  views.renderNextUp(state, trophies);
  views.renderGuideSources(selected, sources);
  views.renderRoadmap(state, trophies, roadmap);
  views.renderMissables(state, trophies, roadmap);
  views.renderSources(sources, roadmap);
  views.renderStats(state, trophies);
}

function selectTrophy(id) {
  const t = trophies.find((x) => x.id === id);
  if (!t) return;
  state.selected = id;
  applyView('tracker');
  renderAll();
  const el = document.querySelector('.trophy-list li[data-id="' + id + '"]');
  if (el) el.scrollIntoView({ block: 'nearest' });
}

async function init() {
  const [tData, rData] = await Promise.all([
    fetch('data/trophies.json').then((r) => r.json()),
    fetch('data/roadmap.json').then((r) => r.json())
  ]);
  trophies = tData.trophies.map((t, i) => ({ ...t, _index: i }));
  sources = tData.sources || [];
  roadmap = rData;

  // Deep links for screenshots and sharing: ?view=roadmap&select=<id>&filter=<id>&spoiler=off
  const params = new URLSearchParams(location.search);
  const view = params.get('view');
  if (view && document.getElementById('view-' + view)) state.view = view;
  const select = params.get('select');
  if (select && trophies.some((t) => t.id === select)) state.selected = select;
  const filter = params.get('filter');
  if (filter) state.filter = filter;
  const spoiler = params.get('spoiler');
  if (spoiler === 'off') state.spoiler = false;
  if (spoiler === 'on') state.spoiler = true;

  // Tabs
  document.getElementById('tabs').addEventListener('click', (e) => {
    const b = e.target.closest('.tab');
    if (!b) return;
    applyView(b.dataset.view);
  });

  // Filters
  document.getElementById('filters').addEventListener('click', (e) => {
    const b = e.target.closest('[data-filter]');
    if (!b) return;
    state.filter = b.dataset.filter;
    saveState(state);
    views.renderFilters(state, trophies);
    views.renderList(state, trophies);
  });

  // Sort + search
  document.getElementById('sortSel').addEventListener('change', (e) => {
    state.sort = e.target.value;
    saveState(state);
    views.renderList(state, trophies);
  });
  document.getElementById('searchBox').addEventListener('input', (e) => {
    state.search = e.target.value;
    views.renderList(state, trophies);
  });

  // Trophy list: click a row to open its guide; click the check to mark earned.
  document.getElementById('trophyList').addEventListener('click', (e) => {
    const li = e.target.closest('li[data-id]');
    if (!li) return;
    if (e.target.classList.contains('check')) {
      toggleEarned(state, li.dataset.id);
      renderAll();
      return;
    }
    selectTrophy(li.dataset.id);
  });
  document.getElementById('trophyList').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const li = e.target.closest('li[data-id]');
    if (li) selectTrophy(li.dataset.id);
  });

  // Detail panel: mark earned + counters (event delegation, the panel re-renders).
  document.getElementById('detail').addEventListener('click', (e) => {
    const mark = e.target.closest('[data-mark]');
    if (mark) {
      toggleEarned(state, mark.dataset.mark);
      renderAll();
      return;
    }
    const inc = e.target.closest('[data-count-inc]');
    const dec = e.target.closest('[data-count-dec]');
    if (inc || dec) {
      const id = (inc || dec).dataset.countInc || (dec && dec.dataset.countDec);
      const t = trophies.find((x) => x.id === id);
      if (!t) return;
      const cur = getCount(state, id);
      const next = inc ? Math.min(t.count, cur + 1) : Math.max(0, cur - 1);
      setCount(state, id, next);
      if (next >= t.count && !state.earned[id]) toggleEarned(state, id);
      renderAll();
    }
  });

  // Next-up + roadmap chips jump to the trophy in the tracker.
  document.getElementById('nextUp').addEventListener('click', (e) => {
    const li = e.target.closest('[data-id]');
    if (li) selectTrophy(li.dataset.id);
  });
  document.getElementById('roadmapList').addEventListener('click', (e) => {
    const chip = e.target.closest('[data-id]');
    if (chip) selectTrophy(chip.dataset.id);
  });
  document.getElementById('missablesList').addEventListener('click', (e) => {
    const li = e.target.closest('[data-id]');
    if (li) selectTrophy(li.dataset.id);
  });

  // Spoiler shield
  document.getElementById('spoilerBtn').addEventListener('click', () => {
    state.spoiler = !state.spoiler;
    saveState(state);
    renderAll();
  });

  // Export / import
  document.getElementById('exportBtn').addEventListener('click', () => {
    download('leonida-platinum-progress.json', exportState(state));
  });
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const n = importState(state, text);
      renderAll();
      const badge = document.getElementById('savedBadge');
      if (badge) badge.textContent = 'Imported ' + n + ' earned trophies';
    } catch (err) {
      const badge = document.getElementById('savedBadge');
      if (badge) badge.textContent = 'Import failed: not a Leonida export file';
    }
    e.target.value = '';
  });

  applyView(state.view);
  renderAll();
}

init().catch((err) => {
  const main = document.getElementById('main');
  if (main) main.innerHTML = '<p>Could not load the trophy data. This guide runs offline from its own files — check that app/data/trophies.json and app/data/roadmap.json are present.</p>';
  console.error(err);
});
