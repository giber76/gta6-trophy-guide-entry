// Leonida Platinum — the views: checklist, detail pane, roadmap, missables,
// 100% list and sources. Each renderer takes the data, the saved state and a
// small set of callbacks, and rebuilds its section from scratch, so the whole
// guide stays in sync after every tick, count or filter change.

import { getCount, isEarned } from './store.js';
import { isSpoilerHidden, KIND_LABELS, visibleTrophies } from './filters.js';

const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

export function gradeCounts(trophies, state) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const totals = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    totals[trophy.grade] += 1;
    if (isEarned(state, trophy.id)) counts[trophy.grade] += 1;
  }
  return { counts, totals };
}

export function updateProgress(trophies, roadmap, state) {
  const earned = state.earned.length;
  const total = trophies.length;
  const pct = total ? Math.round((earned / total) * 100) : 0;
  const ring = document.getElementById('ring-fill');
  if (ring) ring.style.strokeDashoffset = String(326.7 * (1 - earned / Math.max(total, 1)));
  const countEl = document.getElementById('earned-count');
  if (countEl) countEl.textContent = String(earned);
  const pctEl = document.getElementById('earned-pct');
  if (pctEl) pctEl.textContent = pct + '% to the Platinum';
  const { counts, totals } = gradeCounts(trophies, state);
  const gradeEl = document.getElementById('grade-line');
  if (gradeEl) {
    gradeEl.textContent = 'Platinum ' + counts.platinum + '/' + totals.platinum
      + ' · Gold ' + counts.gold + '/' + totals.gold
      + ' · Silver ' + counts.silver + '/' + totals.silver
      + ' · Bronze ' + counts.bronze + '/' + totals.bronze;
  }
  const nextEl = document.getElementById('next-line');
  if (nextEl) {
    if (earned >= total) {
      nextEl.textContent = 'Platinum earned — you are a Leonida Legend.';
    } else {
      const order = [];
      for (const stage of roadmap.stages) order.push(...stage.trophyIds);
      const nextId = order.find((id) => !state.earned.includes(id));
      const next = trophies.find((trophy) => trophy.id === nextId);
      nextEl.textContent = next ? 'Next up: ' + next.name + '.' : 'Start with the story — Chapter 1.';
    }
  }
  const badge = document.getElementById('missable-badge');
  if (badge) {
    const open = trophies.filter(
      (trophy) => (trophy.missable === 'yes' || trophy.missable === 'risk') && !isEarned(state, trophy.id),
    ).length;
    badge.textContent = String(open);
  }
}

function missableTag(trophy) {
  if (trophy.missable === 'yes') return '<span class="tag missable">Missable</span>';
  if (trophy.missable === 'risk') return '<span class="tag risk">At risk</span>';
  return '';
}

function countBarHtml(trophy, state) {
  if (!trophy.count) return '';
  const current = getCount(state, trophy.id);
  const pct = Math.min(100, Math.round((current / trophy.count) * 100));
  const label = trophy.countLabel ? trophy.countLabel : 'progress';
  return '<div class="count-bar"><div class="bar"><span style="width:' + pct + '%"></span></div>'
    + '<span class="count-text">' + current.toLocaleString() + ' / ' + trophy.count.toLocaleString() + ' ' + label + '</span></div>';
}

export function renderChecklist(trophies, filters, state, onSelect, onToggle) {
  const list = document.getElementById('trophy-list');
  const line = document.getElementById('result-line');
  const visible = visibleTrophies(trophies, filters, state);
  if (line) line.textContent = 'Showing ' + visible.length + ' of ' + trophies.length + ' trophies.';
  list.innerHTML = '';
  if (visible.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-note';
    empty.textContent = 'No trophy matches those filters. Clear the search or pick another kind.';
    list.appendChild(empty);
    return;
  }
  for (const trophy of visible) {
    const hidden = isSpoilerHidden(trophy, state);
    const earned = isEarned(state, trophy.id);
    const item = document.createElement('li');
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'trophy-row' + (earned ? ' earned' : '') + (state.selected === trophy.id ? ' selected' : '');
    row.dataset.trophyId = trophy.id;
    const name = hidden ? 'Hidden story trophy' : trophy.name;
    const desc = hidden
      ? 'Complete the story to reveal this trophy.'
      : trophy.description;
    row.innerHTML =
      '<span class="check" aria-hidden="true">' + (earned ? '✓' : '') + '</span>'
      + '<span class="medal ' + trophy.grade + '" aria-hidden="true"></span>'
      + '<span class="row-body">'
      + '<span class="row-name">' + escapeHtml(name)
      + (trophy.hidden && !hidden ? '<span class="hidden-mark">Hidden</span>' : '')
      + '</span>'
      + '<span class="row-desc">' + escapeHtml(desc) + '</span>'
      + '<span class="row-tags">'
      + '<span class="tag grade-' + trophy.grade + '">' + trophy.grade + '</span>'
      + '<span class="tag ' + trophy.kind + '">' + KIND_LABELS[trophy.kind] + '</span>'
      + missableTag(trophy)
      + '</span>'
      + countBarHtml(trophy, state)
      + '</span>';
    row.addEventListener('click', (event) => {
      if (event.target.closest('.check')) {
        onToggle(trophy.id);
      } else {
        onSelect(trophy.id);
      }
    });
    item.appendChild(row);
    list.appendChild(item);
  }
}

export function renderDetail(trophies, sources, state, onToggle, onCount) {
  const pane = document.getElementById('detail-pane');
  const trophy = trophies.find((item) => item.id === state.selected);
  if (!trophy) {
    pane.innerHTML = '<p class="detail-empty">Pick a trophy from the list to see its guide, its sources, and when it can be missed.</p>';
    return;
  }
  const hidden = isSpoilerHidden(trophy, state);
  const earned = isEarned(state, trophy.id);
  let html = '<p class="row-tags">'
    + '<span class="tag grade-' + trophy.grade + '">' + trophy.grade + '</span>'
    + '<span class="tag ' + trophy.kind + '">' + KIND_LABELS[trophy.kind] + '</span>'
    + missableTag(trophy)
    + '</p>';
  html += '<h2>' + escapeHtml(hidden ? 'Hidden story trophy' : trophy.name) + '</h2>';
  if (hidden) {
    html += '<p class="detail-official">Hidden on PlayStation until earned.</p>'
      + '<div class="miss-box safe">Spoilers are hidden. Earn this trophy in the game to reveal its name, description and guide — or switch the spoiler setting off above.</div>';
  } else {
    html += '<p class="detail-official">“' + escapeHtml(trophy.description) + '”</p>';
    if (trophy.missable === 'yes') {
      html += '<div class="miss-box"><strong>Missable.</strong> ' + escapeHtml(trophy.missableNote) + '</div>';
    } else if (trophy.missable === 'risk') {
      html += '<div class="miss-box risk"><strong>At risk.</strong> ' + escapeHtml(trophy.missableNote) + '</div>';
    } else if (trophy.missableNote) {
      html += '<div class="miss-box safe">' + escapeHtml(trophy.missableNote) + '</div>';
    }
    html += '<h3>Guide</h3><div class="detail-guide">';
    for (const paragraph of trophy.guide.split('\n')) {
      if (paragraph.trim()) html += '<p>' + escapeHtml(paragraph.trim()) + '</p>';
    }
    html += '</div>';
    if (trophy.count) {
      const current = getCount(state, trophy.id);
      html += '<h3>Your count</h3>'
        + '<div class="stepper" data-stepper="' + trophy.id + '">'
        + '<button type="button" data-step="-10" aria-label="Minus 10">−10</button>'
        + '<button type="button" data-step="-1" aria-label="Minus 1">−1</button>'
        + '<span class="step-value">' + current.toLocaleString() + ' / ' + trophy.count.toLocaleString() + ' ' + escapeHtml(trophy.countLabel) + '</span>'
        + '<button type="button" data-step="1" aria-label="Plus 1">+1</button>'
        + '<button type="button" data-step="10" aria-label="Plus 10">+10</button>'
        + '</div>';
    }
    html += '<h3>Sources</h3><ul class="source-list">';
    for (const key of trophy.sourceKeys) {
      const source = sources[key];
      if (!source) continue;
      if (source.url) {
        html += '<li><a href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener">' + escapeHtml(source.label) + '</a></li>';
      } else {
        html += '<li>' + escapeHtml(source.label) + '</li>';
      }
    }
    html += '</ul>';
    html += '<p class="detail-stage">Roadmap stage ' + trophy.stage + ' — see the Roadmap tab for the order to earn them in.</p>';
  }
  html += '<button class="earn-btn' + (earned ? ' earned' : '') + '" type="button" id="earn-btn">'
    + (earned ? '✓ Earned — tap to unmark' : 'Mark as earned') + '</button>';
  pane.innerHTML = html;
  const earnBtn = pane.querySelector('#earn-btn');
  if (earnBtn) earnBtn.addEventListener('click', () => onToggle(trophy.id));
  const stepper = pane.querySelector('[data-stepper]');
  if (stepper) {
    stepper.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-step]');
      if (!button) return;
      onCount(trophy.id, getCount(state, trophy.id) + Number(button.dataset.step), trophy.count);
    });
  }
}

export function renderRoadmap(trophies, roadmap, state) {
  const byId = new Map(trophies.map((trophy) => [trophy.id, trophy]));
  const callout = document.getElementById('save-callout');
  if (callout) {
    callout.innerHTML = '<strong>Save strategy.</strong> ' + escapeHtml(roadmap.saveStrategy);
  }
  const wrap = document.getElementById('roadmap-stages');
  wrap.innerHTML = '';
  for (const stage of roadmap.stages) {
    const done = stage.trophyIds.filter((id) => isEarned(state, id)).length;
    const section = document.createElement('section');
    section.className = 'stage';
    let chips = '';
    for (const id of stage.trophyIds) {
      const trophy = byId.get(id);
      if (!trophy) continue;
      const cls = 'stage-trophy'
        + (isEarned(state, id) ? ' done' : '')
        + ((trophy.missable === 'yes' || trophy.missable === 'risk') ? ' miss' : '');
      chips += '<span class="' + cls + '">' + escapeHtml(trophy.name)
        + (trophy.missable === 'yes' ? ' — missable' : trophy.missable === 'risk' ? ' — at risk' : '')
        + '</span>';
    }
    section.innerHTML = '<div class="stage-head"><span class="stage-num">' + stage.n + '</span>'
      + '<h3>' + escapeHtml(stage.title) + '</h3>'
      + '<span class="stage-count">' + done + ' / ' + stage.trophyIds.length + ' earned</span></div>'
      + '<p class="stage-note">' + escapeHtml(stage.note) + '</p>'
      + '<div class="stage-trophies">' + chips + '</div>';
    wrap.appendChild(section);
  }
}

export function renderMissables(trophies, state) {
  const wrap = document.getElementById('missables-list');
  wrap.innerHTML = '';
  const flagged = trophies.filter((trophy) => trophy.missable === 'yes' || trophy.missable === 'risk');
  flagged.sort((a, b) => {
    if (a.missable === b.missable) return a.name.localeCompare(b.name);
    return a.missable === 'yes' ? -1 : 1;
  });
  for (const trophy of flagged) {
    const card = document.createElement('article');
    card.className = 'miss-card' + (trophy.missable === 'risk' ? ' risk' : '');
    card.innerHTML = '<p class="miss-verdict">' + (trophy.missable === 'yes' ? 'Confirmed missable' : 'At risk — not confirmed') + '</p>'
      + '<h3>' + escapeHtml(trophy.name) + ' <span class="tag grade-' + trophy.grade + '">' + trophy.grade + '</span></h3>'
      + '<p class="miss-note">' + escapeHtml(trophy.missableNote) + '</p>'
      + '<p>Official description: “' + escapeHtml(trophy.description) + '”</p>';
    wrap.appendChild(card);
  }
  const safe = document.createElement('p');
  safe.className = 'page-intro';
  safe.innerHTML = '<strong>' + (trophies.length - flagged.length) + ' trophies are safe.</strong> '
    + 'Story progression trophies unlock by finishing the mission or chapter, and everything else is repeatable in free roam — the game never locks you out of them.';
  wrap.appendChild(safe);
}

export function renderCompletion(roadmap, state) {
  const list = document.getElementById('completion-list');
  const countEl = document.getElementById('completion-count');
  const bar = document.getElementById('completion-bar');
  const done = state.completion.length;
  const total = roadmap.completion.tasks.length;
  if (countEl) countEl.textContent = done + ' / ' + total;
  if (bar) bar.style.width = (total ? Math.round((done / total) * 100) : 0) + '%';
  list.innerHTML = '';
  roadmap.completion.tasks.forEach((task, index) => {
    const item = document.createElement('li');
    item.className = state.completion.includes(index) ? 'done' : '';
    item.innerHTML = '<span class="box" aria-hidden="true">' + (state.completion.includes(index) ? '✓' : '') + '</span>'
      + '<span class="task">' + escapeHtml(task.task) + '</span>'
      + '<span class="target">' + escapeHtml(task.target) + '</span>';
    item.addEventListener('click', () => {
      const event = new CustomEvent('completion-toggle', { detail: { index }, bubbles: true });
      item.dispatchEvent(event);
    });
    list.appendChild(item);
  });
}

export function renderSources(sources, roadmap) {
  const wrap = document.getElementById('sources-list');
  wrap.innerHTML = '';
  for (const [key, source] of Object.entries(sources)) {
    if (key === 'own') continue;
    const card = document.createElement('article');
    card.className = 'source-card';
    card.innerHTML = '<h3>' + escapeHtml(source.label) + '</h3>'
      + (source.url ? '<p><a href="' + escapeHtml(source.url) + '" target="_blank" rel="noopener">' + escapeHtml(source.url) + '</a></p>' : '');
    wrap.appendChild(card);
  }
  const notes = document.createElement('article');
  notes.className = 'source-card';
  notes.innerHTML = '<h3>What this guide does not yet know</h3><ul class="note-list">'
    + '<li><strong>Five triggers are still unconfirmed.</strong> Challenging Tank, Personal Best, Bad Luck, I Guess, The Truth Is Out There and the exact trigger for the hint-only trophies: their official descriptions are hints, and no public guide had pinned the trigger down when this guide was written. Each of those trophies says so in its guide instead of guessing.</li>'
    + '<li><strong>Hidden trophies.</strong> PlayStation hides 28 of the 55 until earned. This guide flags the 22 it can confirm from public sources — the 17 story trophies and the 5 hint-only trophies. The other 6 hidden trophies are not named by any source this guide could check.</li>'
    + '<li><strong>The 100% list.</strong> ' + escapeHtml(roadmap.completion.source) + '</li>'
    + '<li><strong>Nothing here was played to verify it.</strong> The game launched the day this guide was written. Every guide is worked out from the official description and the sources above, and each trophy\'s guide names its sources so a reader can check them.</li>'
    + '</ul>';
  wrap.appendChild(notes);
}

export function escapeHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
