// Leonida Platinum — boot.
//
// Loads the trophy list and the roadmap from the app's own data files, reads
// the player's saved progress, and wires the tabs, the toolbar, the detail
// pane and the export/import buttons. Nothing here fetches from the network:
// both data files live under app/data/.

import {
  blankState,
  downloadFile,
  exportState,
  loadState,
  parseExport,
  saveState,
  setCount,
  toggleCompletionTask,
  toggleEarned,
} from './store.js';
import { blankFilters } from './filters.js';
import {
  renderChecklist,
  renderCompletion,
  renderDetail,
  renderMissables,
  renderRoadmap,
  renderSources,
  updateProgress,
} from './views.js';

const VIEWS = ['checklist', 'roadmap', 'missables', 'complete', 'sources'];

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error('Could not load ' + path);
  return response.json();
}

function showView(name) {
  for (const view of VIEWS) {
    document.getElementById('view-' + view).classList.toggle('active', view === name);
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === name);
  }
  window.scrollTo({ top: 0 });
}

async function boot() {
  const [trophyData, roadmap] = await Promise.all([
    loadJson('data/trophies.json'),
    loadJson('data/roadmap.json'),
  ]);
  const trophies = trophyData.trophies;
  const sources = trophyData.sources;
  const state = loadState();
  const filters = blankFilters();

  function renderAll() {
    updateProgress(trophies, roadmap, state);
    renderChecklist(trophies, filters, state, selectTrophy, toggleTrophy);
    renderDetail(trophies, sources, state, toggleTrophy, changeCount);
    renderRoadmap(trophies, roadmap, state);
    renderMissables(trophies, state);
    renderCompletion(roadmap, state);
    renderSources(sources, roadmap);
  }

  function selectTrophy(id) {
    state.selected = id;
    saveState(state);
    renderChecklist(trophies, filters, state, selectTrophy, toggleTrophy);
    renderDetail(trophies, sources, state, toggleTrophy, changeCount);
    const pane = document.getElementById('detail-pane');
    if (pane && window.innerWidth <= 900) pane.scrollIntoView({ behavior: 'smooth' });
  }

  function toggleTrophy(id) {
    toggleEarned(state, id);
    renderAll();
  }

  function changeCount(id, value, max) {
    setCount(state, id, value, max);
    renderAll();
  }

  // Tabs.
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => showView(tab.dataset.view));
  }

  // Toolbar: search, kind chips, grade, earned-only, spoiler.
  const search = document.getElementById('search');
  search.addEventListener('input', () => {
    filters.query = search.value.trim();
    renderChecklist(trophies, filters, state, selectTrophy, toggleTrophy);
  });
  for (const chip of document.querySelectorAll('#kind-chips .chip')) {
    chip.addEventListener('click', () => {
      filters.kind = chip.dataset.kind;
      for (const other of document.querySelectorAll('#kind-chips .chip')) {
        other.classList.toggle('active', other === chip);
      }
      renderChecklist(trophies, filters, state, selectTrophy, toggleTrophy);
    });
  }
  document.getElementById('grade-filter').addEventListener('change', (event) => {
    filters.grade = event.target.value;
    renderChecklist(trophies, filters, state, selectTrophy, toggleTrophy);
  });
  document.getElementById('earned-only').addEventListener('change', (event) => {
    filters.earnedOnly = event.target.checked;
    renderChecklist(trophies, filters, state, selectTrophy, toggleTrophy);
  });
  const spoilerToggle = document.getElementById('spoiler-toggle');
  spoilerToggle.checked = state.spoiler;
  spoilerToggle.addEventListener('change', (event) => {
    state.spoiler = event.target.checked;
    saveState(state);
    renderChecklist(trophies, filters, state, selectTrophy, toggleTrophy);
    renderDetail(trophies, sources, state, toggleTrophy, changeCount);
  });

  // Export, import, reset.
  document.getElementById('export-btn').addEventListener('click', () => {
    downloadFile('leonida-platinum-progress.json', exportState(state));
  });
  const importFile = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files && importFile.files[0];
    if (!file) return;
    const text = await file.text();
    const imported = parseExport(text);
    if (imported) {
      Object.assign(state, imported);
      saveState(state);
      spoilerToggle.checked = state.spoiler;
      renderAll();
    } else {
      alert('That file is not a Leonida Platinum progress export.');
    }
    importFile.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (!confirm('Clear all earned trophies, counts and 100% checks?')) return;
    const fresh = blankState();
    Object.assign(state, fresh);
    saveState(state);
    spoilerToggle.checked = false;
    renderAll();
  });

  // 100% checklist ticks bubble up as a custom event from the list items.
  document.getElementById('completion-list').addEventListener('completion-toggle', (event) => {
    toggleCompletionTask(state, event.detail.index);
    renderCompletion(roadmap, state);
    updateProgress(trophies, roadmap, state);
  });

  // Deep-link a view from the hash, so a screenshot can open a tab by URL.
  const hash = window.location.hash.replace('#', '');
  if (VIEWS.includes(hash)) showView(hash);

  renderAll();
}

boot().catch((err) => {
  document.getElementById('trophy-list').innerHTML =
    '<li class="empty-note">The guide could not load its data files. Serve the app/ folder with a static server and open index.html from it.</li>';
  console.error(err);
});
