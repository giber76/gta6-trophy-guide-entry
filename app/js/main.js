// Leonida Platinum — boot and wiring.
//
// Loads the two data files, renders the shell, and wires every control.
// The app is plain static files: fetch the JSON once, render from state,
// and re-render the changed part on every click. No framework, no network
// after the first load.

import {
  loadState,
  saveState,
  toggleEarned,
  setCount,
  toggleTask,
  exportState,
  importState,
  resetState,
  isEarned,
} from "./store.js";
import {
  visibleTrophies,
  nextUp,
  hoursLeft,
  KIND_LABELS,
  STAGE_LABELS,
} from "./filters.js";
import {
  renderChecklist,
  renderDetail,
  renderStrip,
  renderNextUp,
  renderRoadmap,
  renderRoute,
  renderStats,
  renderMissables,
  renderCompletion,
  renderSources,
} from "./views.js";

const VIEWS = ["checklist", "nextup", "route", "roadmap", "stats", "missables", "complete", "sources"];
const VIEW_TITLES = {
  checklist: "Checklist",
  nextup: "Next up",
  route: "Route",
  roadmap: "Roadmap",
  stats: "Stats",
  missables: "Missables",
  complete: "100% checklist",
  sources: "Sources",
};

let trophies = [];
let roadmap = null;
let meta = null;
let state = loadState();

function $(sel) {
  return document.querySelector(sel);
}

function selectedTrophy() {
  return trophies.find((t) => t.id === state.selected) || null;
}

function renderHeader() {
  const earned = state.earned.length;
  $("#earned-count").textContent = String(earned);
  $("#earned-total").textContent = `/ ${trophies.length}`;
  $("#progress-fill").style.width = `${Math.round((earned / trophies.length) * 100)}%`;
  $("#hours-left").textContent = `~${hoursLeft(trophies, state, roadmap)}h left`;
}

function paintStrip() {
  $("#roadmap-strip").innerHTML = renderStrip(roadmap, trophies, state);
}

function renderList() {
  const rows = visibleTrophies(trophies, state);
  $("#trophy-list").innerHTML = renderChecklist(rows, state);
  const shown = rows.length;
  $("#result-line").textContent =
    `Showing ${shown} of ${trophies.length} trophies` +
    (state.query ? ` for “${state.query}”` : "") +
    (state.kind !== "all" ? ` · ${KIND_LABELS[state.kind]}` : "") +
    (state.showEarned !== "all" ? ` · ${state.showEarned === "earned" ? "earned only" : "not earned"}` : "");
}

function renderDetailPane() {
  $("#detail-pane").innerHTML = renderDetail(selectedTrophy(), state, meta.sources);
}

function renderView() {
  const view = VIEWS.includes(state.view) ? state.view : "checklist";
  document.querySelectorAll("[data-view]").forEach((b) => {
    b.classList.toggle("is-active", b.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((el) => {
    el.hidden = el.id !== `view-${view}`;
  });
  if (view === "checklist") {
    renderList();
    renderDetailPane();
  } else if (view === "nextup") {
    $("#nextup-list").innerHTML = renderNextUp(nextUp(trophies, state, 10));
    $("#nextup-note").textContent = `${trophies.length - state.earned.length} trophies left — these ten are next in roadmap order.`;
  } else if (view === "route") {
    $("#route-body").innerHTML = renderRoute(trophies, state);
  } else if (view === "roadmap") {
    $("#roadmap-body").innerHTML = renderRoadmap(roadmap, state);
  } else if (view === "stats") {
    $("#stats-body").innerHTML = renderStats(trophies, state, roadmap);
  } else if (view === "missables") {
    $("#missables-body").innerHTML = renderMissables(trophies, state);
  } else if (view === "complete") {
    $("#complete-body").innerHTML = renderCompletion();
  } else if (view === "sources") {
    $("#view-sources").innerHTML = renderSources(meta, trophies);
  }
  renderHeader();
  paintStrip();
}

function setView(view) {
  if (!VIEWS.includes(view)) return;
  state.view = view;
  saveState(state);
  renderView();
  window.scrollTo(0, 0);
}

function selectTrophy(id, keepView) {
  const t = trophies.find((x) => x.id === id);
  if (!t) return;
  state.selected = id;
  saveState(state);
  if (!keepView) setView("checklist");
  renderDetailPane();
  renderList();
  const row = document.querySelector(`[data-trophy-id="${id}"]`);
  if (row) row.scrollIntoView({ block: "nearest" });
}

function selectNeighbour(dir) {
  const rows = visibleTrophies(trophies, state);
  if (!rows.length) return;
  const i = rows.findIndex((t) => t.id === state.selected);
  const next = rows[(i + dir + rows.length) % rows.length];
  selectTrophy(next.id, true);
}

function download(filename, text) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function wire() {
  // Tabs.
  document.querySelectorAll("[data-view]").forEach((b) => {
    b.addEventListener("click", () => setView(b.dataset.view));
  });
  // Toolbar.
  $("#search").addEventListener("input", (e) => {
    state.query = e.target.value;
    saveState(state);
    renderList();
  });
  $("#kind-filter").addEventListener("change", (e) => {
    state.kind = e.target.value;
    saveState(state);
    renderList();
  });
  $("#grade-filter").addEventListener("change", (e) => {
    state.grade = e.target.value;
    saveState(state);
    renderList();
  });
  $("#stage-filter").addEventListener("change", (e) => {
    state.stage = e.target.value;
    saveState(state);
    renderList();
  });
  $("#sort-select").addEventListener("change", (e) => {
    state.sort = e.target.value;
    saveState(state);
    renderList();
  });
  $("#earned-filter").addEventListener("change", (e) => {
    state.showEarned = e.target.value;
    saveState(state);
    renderList();
  });
  $("#spoiler-toggle").addEventListener("click", () => {
    state.spoiler = !state.spoiler;
    saveState(state);
    $("#spoiler-toggle").textContent = state.spoiler ? "Spoilers: hidden" : "Spoilers: shown";
    $("#spoiler-toggle").setAttribute("aria-pressed", String(state.spoiler));
    renderView();
  });
  // Roadmap strip jumps to a stage filter.
  $("#roadmap-strip").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-stage-jump]");
    if (!btn) return;
    state.stage = btn.dataset.stageJump;
    $("#stage-filter").value = state.stage;
    saveState(state);
    setView("checklist");
  });
  // Checklist clicks: earn boxes, rows, steppers, task checkboxes.
  document.addEventListener("click", (e) => {
    const earnBtn = e.target.closest("[data-earn]");
    if (earnBtn) {
      e.stopPropagation();
      toggleEarned(state, earnBtn.dataset.earn);
      renderView();
      return;
    }
    const stepBtn = e.target.closest("[data-step]");
    if (stepBtn) {
      const wrap = stepBtn.closest("[data-stepper]");
      const id = wrap.dataset.stepper;
      const t = trophies.find((x) => x.id === id);
      const cur = state.counts[id] || 0;
      setCount(state, id, cur + Number(stepBtn.dataset.step), t ? t.target : 9999);
      renderDetailPane();
      renderList();
      return;
    }
    const openBtn = e.target.closest("[data-trophy-id]");
    if (openBtn && openBtn.dataset.trophyId) {
      selectTrophy(openBtn.dataset.trophyId);
      return;
    }
    if (e.target.id === "prev-btn") selectNeighbour(-1);
    if (e.target.id === "next-btn") selectNeighbour(1);
  });
  document.addEventListener("change", (e) => {
    const box = e.target.closest("[data-task]");
    if (box) {
      toggleTask(state, Number(box.dataset.task));
      renderRoadmap(roadmap, state);
      renderHeader();
      paintStrip();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.matches && e.target.matches(".trophy-row")) {
      selectTrophy(e.target.dataset.trophyId);
    }
  });
  // Export / import / reset / print.
  $("#export-btn").addEventListener("click", () => download("leonida-platinum-progress.json", exportState(state)));
  $("#import-btn").addEventListener("click", () => $("#import-file").click());
  $("#import-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      state = importState(await file.text());
      syncToolbar();
      renderView();
    } catch {
      alert("That file is not a Leonida Platinum save.");
    }
    e.target.value = "";
  });
  $("#reset-btn").addEventListener("click", () => {
    if (confirm("Clear all earned trophies, counters and roadmap ticks?")) {
      state = resetState();
      syncToolbar();
      renderView();
    }
  });
  $("#print-btn").addEventListener("click", () => window.print());
}

function syncToolbar() {
  $("#search").value = state.query || "";
  $("#kind-filter").value = state.kind;
  $("#grade-filter").value = state.grade;
  $("#stage-filter").value = state.stage;
  $("#sort-select").value = state.sort;
  $("#earned-filter").value = state.showEarned;
  $("#spoiler-toggle").textContent = state.spoiler ? "Spoilers: hidden" : "Spoilers: shown";
  $("#spoiler-toggle").setAttribute("aria-pressed", String(state.spoiler));
}

async function boot() {
  const [tData, rData] = await Promise.all([
    fetch("data/trophies.json").then((r) => r.json()),
    fetch("data/roadmap.json").then((r) => r.json()),
  ]);
  trophies = tData.trophies;
  meta = tData.meta;
  roadmap = rData;
  // Deep-link a view: #view=roadmap etc.
  const hash = new URLSearchParams(location.hash.slice(1));
  if (VIEWS.includes(hash.get("view"))) state.view = hash.get("view");
  syncToolbar();
  wire();
  renderView();
}

boot().catch((err) => {
  document.body.innerHTML = `<main class="load-error"><h1>Leonida Platinum could not load</h1><p>The guide needs its data files (data/trophies.json and data/roadmap.json) next to index.html. ${err.message}</p></main>`;
});
