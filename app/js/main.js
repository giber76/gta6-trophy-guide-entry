(function () {
  var store = window.LeonidaStore;
  var filters = window.LeonidaFilters;
  var views = window.LeonidaViews;

  var state = store.load();
  var data = null;
  var roadmap = null;
  var activeKind = 'all';
  var query = '';

  function $(id) { return document.getElementById(id); }

  function currentList() {
    return filters.apply(data.trophies, activeKind, query);
  }

  function renderHeader() {
    var count = $('earned-count');
    if (count) count.textContent = String(store.earnedTotal(state));
    var total = $('earned-total');
    if (total) total.textContent = '/ ' + data.trophies.length;
    var toggle = $('spoiler-toggle');
    if (toggle) toggle.setAttribute('aria-pressed', state.spoiler ? 'true' : 'false');
  }

  function renderChecklist() {
    var list = currentList();
    var listEl = $('trophy-list');
    if (listEl) listEl.innerHTML = views.renderList(list, state, state.spoiler);
    var line = $('result-line');
    if (line) line.textContent = 'Showing ' + list.length + ' of ' + data.trophies.length + ' trophies';
    var strip = $('roadmap-strip');
    if (strip) strip.innerHTML = views.renderStrip(roadmap.stages, data.trophies, state, state.spoiler);
    renderDetail();
  }

  function renderDetail() {
    var pane = $('detail-pane');
    if (!pane) return;
    var selected = null;
    if (state.selected) {
      selected = data.trophies.filter(function (t) { return t.id === state.selected; })[0] || null;
    }
    pane.innerHTML = views.renderDetail(selected, data, state, state.spoiler);
  }

  function renderRoadmap() {
    var el = $('roadmap-stages');
    if (el) el.innerHTML = views.renderRoadmap(roadmap.stages, data.trophies, state, state.spoiler);
  }

  function renderMissables() {
    var el = $('missables-cards');
    if (el) el.innerHTML = views.renderMissables(data.trophies, state);
  }

  function renderNextUp() {
    var el = $('nextup-list');
    if (el) el.innerHTML = views.renderNextUp(filters.nextUp(data.trophies, state, 8), state, state.spoiler);
  }

  function renderComplete() {
    var el = $('completion-list');
    if (el) el.innerHTML = views.renderComplete(roadmap.completion, state);
  }

  function renderSources() {
    var el = $('sources-body');
    if (el) el.innerHTML = views.renderSources(data);
  }

  function renderAll() {
    renderHeader();
    renderChecklist();
    renderRoadmap();
    renderMissables();
    renderNextUp();
    renderComplete();
    renderSources();
  }

  function selectTrophy(id) {
    store.select(state, id);
    renderChecklist();
    var pane = $('detail-pane');
    if (pane) pane.scrollIntoView({ block: 'nearest' });
  }

  function stepTrophy(id, delta) {
    var list = currentList();
    var at = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) { at = i; break; }
    }
    if (at === -1) return;
    var next = list[(at + delta + list.length) % list.length];
    selectTrophy(next.id);
  }

  function switchView(name) {
    var names = ['checklist', 'roadmap', 'missables', 'nextup', 'complete', 'sources'];
    names.forEach(function (n) {
      var el = $('view-' + n);
      if (el) el.classList.toggle('is-active', n === name);
    });
    document.querySelectorAll('[data-view]').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-view') === name);
    });
  }

  function wireEvents() {
    document.querySelectorAll('[data-view]').forEach(function (btn) {
      btn.addEventListener('click', function () { switchView(btn.getAttribute('data-view')); });
    });
    document.querySelectorAll('[data-kind]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeKind = btn.getAttribute('data-kind');
        document.querySelectorAll('[data-kind]').forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        renderChecklist();
      });
    });
    var search = $('search');
    if (search) {
      search.addEventListener('input', function () {
        query = search.value;
        renderChecklist();
      });
    }
    var toggle = $('spoiler-toggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        store.setSpoiler(state, !state.spoiler);
        renderAll();
      });
    }
    document.addEventListener('click', function (ev) {
      var earnBtn = ev.target.closest('[data-earn]');
      if (earnBtn) {
        var id = earnBtn.getAttribute('data-earn');
        store.toggleEarned(state, id);
        renderAll();
        return;
      }
      var stepBtn = ev.target.closest('[data-step]');
      if (stepBtn) {
        var countId = stepBtn.getAttribute('data-count-id');
        var delta = parseInt(stepBtn.getAttribute('data-step'), 10) || 0;
        store.bumpCount(state, countId, delta);
        renderAll();
        return;
      }
      var navBtn = ev.target.closest('[data-nav]');
      if (navBtn) {
        stepTrophy(state.selected, navBtn.getAttribute('data-nav') === 'prev' ? -1 : 1);
        return;
      }
      var completeBtn = ev.target.closest('[data-complete]');
      if (completeBtn) {
        var idx = parseInt(completeBtn.getAttribute('data-complete'), 10);
        store.toggleComplete(state, idx);
        renderComplete();
        return;
      }
      var row = ev.target.closest('.trophy-row');
      if (row) {
        selectTrophy(row.getAttribute('data-trophy-id'));
        return;
      }
      var nextItem = ev.target.closest('.nextup-item');
      if (nextItem) {
        selectTrophy(nextItem.getAttribute('data-trophy-id'));
        switchView('checklist');
        return;
      }
      var stageTrophy = ev.target.closest('.stage-trophy');
      if (stageTrophy) {
        selectTrophy(stageTrophy.getAttribute('data-trophy-id'));
        switchView('checklist');
        return;
      }
    });
  }

  function init() {
    return Promise.all([
      fetch('./data/trophies.json').then(function (r) { return r.json(); }),
      fetch('./data/roadmap.json').then(function (r) { return r.json(); })
    ]).then(function (results) {
      data = results[0];
      roadmap = results[1];
      if (!state.selected) {
        state.selected = 'positive-mental-attitude';
      }
      wireEvents();
      renderAll();
      switchView('checklist');
    }).catch(function (err) {
      var pane = $('detail-pane');
      if (pane) pane.innerHTML = '<p class="error">Could not load the trophy data. ' + views.esc(err.message) + '</p>';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
