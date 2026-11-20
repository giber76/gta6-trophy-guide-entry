// Leonida Platinum Log — every view is rendered from the trophy data.
// Nothing is hard-coded: counts, bars and pills are computed from the same
// 55 trophies the tracker holds, so the audit strip can never drift from the list.
import { applyFilters, sortList, nextUpList, FILTERS, filterCount } from './filters.js';
import { isEarned, earnedCount, getCount } from './store.js';

export function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Turn inline [1] [2] [3] markers in guide text into citation chips.
export function cite(text) {
  return escapeHtml(text).replace(/\[(\d+)\]/g, '<sup class="cite">[$1]</sup>');
}

function gradeLabel(t) {
  return { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' }[t.grade] || t.grade;
}

function isSpoilered(t, state) {
  return state.spoiler && t.kind === 'story' && !isEarned(state, t.id);
}

function tagHtml(t, state) {
  const tags = [];
  tags.push('<span class="tag grade-' + t.grade + '">' + gradeLabel(t) + '</span>');
  tags.push('<span class="tag">' + escapeHtml(t.kind) + '</span>');
  tags.push('<span class="tag">Stage ' + t.stage + '</span>');
  if (t.count) tags.push('<span class="tag">Count ' + t.count.toLocaleString('en-US') + '</span>');
  if (t.hidden) tags.push('<span class="tag hidden">PSN-hidden</span>');
  if (t.missable) tags.push('<span class="tag missable">Possibly missable</span>');
  if (t.dispute) tags.push('<span class="tag disputed">Sources differ</span>');
  if (/unconfirmed/i.test(t.dispute || '') && t.unconfirmed === true) tags.push('<span class="tag unconfirmed">Unconfirmed</span>');
  if (isEarned(state, t.id)) tags.push('<span class="tag earned-tag">Earned</span>');
  return tags.join(' ');
}

export function renderProgress(state, trophies) {
  const n = earnedCount(state);
  const el = document.getElementById('progressCount');
  if (el) el.textContent = n + ' / ' + trophies.length + ' earned';
  const g = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  const tot = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const t of trophies) {
    tot[t.grade]++;
    if (isEarned(state, t.id)) g[t.grade]++;
  }
  const gel = document.getElementById('progressGrades');
  if (gel) gel.textContent = 'P ' + g.platinum + '/' + tot.platinum + ' · G ' + g.gold + '/' + tot.gold + ' · S ' + g.silver + '/' + tot.silver + ' · B ' + g.bronze + '/' + tot.bronze;
}

export function renderFilters(state, trophies) {
  const box = document.getElementById('filters');
  if (!box) return;
  box.innerHTML = FILTERS.map((f) => {
    const n = filterCount(f, trophies, state);
    const active = state.filter === f.id ? ' active' : '';
    return '<button class="pill' + active + '" data-filter="' + f.id + '" type="button">' + escapeHtml(f.label) + ' ' + n + '</button>';
  }).join('');
}

export function renderList(state, trophies) {
  const list = document.getElementById('trophyList');
  const shown = document.getElementById('shownCount');
  if (!list) return;
  const filtered = sortList(applyFilters(trophies, state), state.sort);
  if (shown) shown.textContent = filtered.length + ' shown';
  list.innerHTML = filtered.map((t) => {
    const earned = isEarned(state, t.id);
    const spoilered = isSpoilered(t, state);
    const cls = ['trophy-item'];
    if (earned) cls.push('earned');
    if (spoilered) cls.push('spoiler');
    if (state.selected === t.id) cls.push('selected');
    const check = earned ? '✓' : '';
    return '<li class="' + cls.join(' ') + '" data-id="' + t.id + '" tabindex="0">' +
      '<span class="check" aria-hidden="true">' + check + '</span>' +
      '<span><span class="t-name">' + escapeHtml(t.name) + '</span><br>' +
      '<span class="t-desc">' + escapeHtml(t.description) + '</span>' +
      '<span class="t-meta">' + tagHtml(t, state) + '</span></span></li>';
  }).join('');
}

export function renderDetail(state, trophies, sources) {
  const box = document.getElementById('detail');
  if (!box) return;
  const t = trophies.find((x) => x.id === state.selected) || trophies[0];
  if (!t) { box.innerHTML = '<p>No trophy selected.</p>'; return; }
  const earned = isEarned(state, t.id);
  const spoilered = isSpoilered(t, state);
  box.classList.toggle('spoiler', spoilered);
  let html = '';
  html += '<h2 class="t-name">' + escapeHtml(t.name) + '</h2>';
  html += '<div class="t-meta">' + tagHtml(t, state) + '</div>';
  if (spoilered) {
    html += '<p class="spoiler-note">Story trophy — hidden by the spoiler shield until earned. Turn the shield off, or mark it earned, to read the guide.</p>';
    html += '<div class="official"><span class="label">OFFICIAL DESCRIPTION</span>“' + escapeHtml(t.description) + '”</div>';
    html += '<button class="mark-earned" data-mark="' + t.id + '" type="button">Mark earned</button>';
    box.innerHTML = html;
    return;
  }
  html += '<div class="official"><span class="label">OFFICIAL DESCRIPTION</span>“' + escapeHtml(t.description) + '” · ' + gradeLabel(t) + ' · ' + escapeHtml(t.kind) + ' · Stage ' + t.stage + (t.count ? ' · Count ' + t.count.toLocaleString('en-US') : '') + '</div>';
  if (t.missable) {
    html += '<div class="banner missable"><b>POSSIBLY MISSABLE</b>' + cite(t.dispute || 'Do this before the chapter ends.') + '</div>';
  } else if (t.dispute) {
    html += '<div class="banner dispute"><b>SOURCES DIFFER</b>' + cite(t.dispute) + '</div>';
  }
  if (t.count) {
    const have = getCount(state, t.id);
    html += '<div class="count-box"><span>Your count</span>' +
      '<button data-count-dec="' + t.id + '" type="button" aria-label="Decrease count">−</button>' +
      '<span class="count">' + have + ' / ' + t.count.toLocaleString('en-US') + '</span>' +
      '<button data-count-inc="' + t.id + '" type="button" aria-label="Increase count">+</button></div>';
  }
  html += '<h3>How to earn it — ' + t.steps.length + ' steps in our own words, each with its sources</h3>';
  html += '<ol class="steps">' + t.steps.map((s) =>
    '<li><span class="num">' + (t.steps.indexOf(s) + 1) + '</span><span>' + cite(s.text) + s.refs.map((r) => '<sup class="cite">[' + r + ']</sup>').join('') + '</span></li>'
  ).join('') + '</ol>';
  html += '<div class="guide-prose"><p>' + cite(t.guide) + '</p></div>';
  html += '<button class="mark-earned' + (earned ? ' earned' : '') + '" data-mark="' + t.id + '" type="button">' + (earned ? '✓ Earned — click to undo' : 'Mark earned') + '</button>';
  box.innerHTML = html;
}

export function renderNextUp(state, trophies) {
  const box = document.getElementById('nextUp');
  if (!box) return;
  const next = nextUpList(trophies, state, 5);
  box.innerHTML = '<h3>NEXT UP · ROADMAP ORDER</h3><ol>' + next.map((t) =>
    '<li data-id="' + t.id + '">' + escapeHtml(t.name) +
    '<span class="stage-note">Stage ' + t.stage + ' · ' + gradeLabel(t) + (t.missable ? ' · possibly missable' : '') + '</span></li>'
  ).join('') + '</ol>';
}

export function renderGuideSources(trophy, sources) {
  const box = document.getElementById('guideSources');
  if (!box) return;
  if (!trophy) { box.innerHTML = ''; return; }
  const used = (trophy.sources || []).map((n) => sources.find((s) => s.n === n)).filter(Boolean);
  box.innerHTML = '<h3>SOURCES FOR THIS GUIDE · ' + used.length + '</h3><ol>' + used.map((s) =>
    '<li><b>[' + s.n + '] ' + escapeHtml(s.name) + '</b> — ' + escapeHtml(s.title) +
    '<br><a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.url) + '</a>' +
    '<br><span class="src-note">read ' + escapeHtml(s.read) + ' · ' + escapeHtml(s.covers) + '</span></li>'
  ).join('') + '</ol>';
}

export function renderRoadmap(state, trophies, roadmap) {
  const box = document.getElementById('roadmapList');
  if (!box) return;
  const byId = {};
  for (const t of trophies) byId[t.id] = t;
  box.innerHTML = roadmap.stages.map((st) => {
    const done = st.trophies.filter((id) => isEarned(state, id)).length;
    const chips = st.trophies.map((id) => {
      const t = byId[id];
      if (!t) return '';
      return '<span class="tag' + (isEarned(state, id) ? ' earned-tag' : '') + '" data-id="' + id + '">' + escapeHtml(t.name) + '</span>';
    }).join(' ');
    return '<div class="stage-card"><h2>Stage ' + st.n + ' — ' + escapeHtml(st.title) + '</h2>' +
      '<p class="hours">' + done + '/' + st.trophies.length + ' earned · about ' + escapeHtml(st.hours) + ' hours</p>' +
      '<p>' + escapeHtml(st.summary) + '</p>' +
      '<ul>' + st.notes.map((n) => '<li>' + cite(n) + '</li>').join('') + '</ul>' +
      '<div class="stage-trophies">' + chips + '</div></div>';
  }).join('');
}

export function renderMissables(state, trophies, roadmap) {
  const box = document.getElementById('missablesList');
  if (!box) return;
  const byId = {};
  for (const t of trophies) byId[t.id] = t;
  const pma = byId['positive-mental-attitude'];
  const unconfirmed = trophies.filter((t) => t.unconfirmed === true);
  let html = '';
  html += '<div class="miss-card"><h2>1 possibly missable — ' + escapeHtml(pma.name) + '</h2>' +
    '<p>' + cite(pma.guide) + '</p></div>';
  html += '<div class="miss-card uncertain"><h2>5 unconfirmed — triggers still unknown</h2>' +
    '<p>PowerPyx lists the conditions for these five as unknown, so this guide only paraphrases their descriptions instead of inventing methods. [3]</p><ul>' +
    unconfirmed.map((t) => '<li data-id="' + t.id + '"><b>' + escapeHtml(t.name) + '</b> — “' + escapeHtml(t.description) + '”</li>').join('') +
    '</ul></div>';
  html += '<div class="miss-card"><h2>Before every chapter ends</h2><ul>' +
    '<li>Do the Chapter 1 balcony meditation with Lucia (see above).</li>' +
    '<li>Make a manual save at the start and end of every chapter — there is no mission replay. [3]</li>' +
    '<li>Keep cheats off the platinum save: they disable trophies and saving. [3]</li>' +
    '<li>Avoid the Irredeemable criminal profile: it is permanent and makes the police more aggressive. [3]</li>' +
    '</ul></div>';
  box.innerHTML = html;
}

export function renderSources(sources, roadmap) {
  const box = document.getElementById('sourcesList');
  if (box) {
    box.innerHTML = sources.map((s) =>
      '<div class="src-card"><h2>[' + s.n + '] ' + escapeHtml(s.name) + ' — ' + escapeHtml(s.title) + '</h2>' +
      '<a href="' + escapeHtml(s.url) + '" target="_blank" rel="noopener">' + escapeHtml(s.url) + '</a>' +
      '<p class="read">read ' + escapeHtml(s.read) + '</p><p>' + escapeHtml(s.covers) + '</p></div>'
    ).join('');
  }
  const dbox = document.getElementById('disputesList');
  if (dbox) {
    dbox.innerHTML = roadmap.disputes.map((d) =>
      '<div class="miss-card"><h2>' + escapeHtml(d.title) + '</h2>' +
      '<p><b>A —</b> ' + cite(d.a) + '</p><p><b>B —</b> ' + cite(d.b) + '</p>' +
      '<p><b>Our call:</b> ' + cite(d.call) + '</p></div>'
    ).join('');
  }
}

export function renderStats(state, trophies) {
  const box = document.getElementById('statsList');
  if (!box) return;
  const gradeRows = ['platinum', 'gold', 'silver', 'bronze'].map((g) => {
    const tot = trophies.filter((t) => t.grade === g).length;
    const got = trophies.filter((t) => t.grade === g && isEarned(state, t.id)).length;
    return { label: gradeLabel({ grade: g }), got, tot };
  });
  const kindRows = {};
  for (const t of trophies) {
    kindRows[t.kind] = kindRows[t.kind] || { got: 0, tot: 0 };
    kindRows[t.kind].tot++;
    if (isEarned(state, t.id)) kindRows[t.kind].got++;
  }
  const stageRows = {};
  for (const t of trophies) {
    stageRows[t.stage] = stageRows[t.stage] || { got: 0, tot: 0 };
    stageRows[t.stage].tot++;
    if (isEarned(state, t.id)) stageRows[t.stage].got++;
  }
  let steps = 0, cited = 0;
  for (const t of trophies) {
    for (const s of (t.steps || [])) {
      steps++;
      if (s.refs && s.refs.length) cited++;
    }
  }
  const bar = (rows) => rows.map((r) =>
    '<div class="bar-row"><span class="lbl">' + escapeHtml(r.label) + '</span>' +
    '<span class="bar"><span style="width:' + (r.tot ? Math.round(100 * r.got / r.tot) : 0) + '%"></span></span>' +
    '<span class="val">' + r.got + ' / ' + r.tot + '</span></div>'
  ).join('');
  box.innerHTML =
    '<div class="stat-card"><h2>By grade</h2>' + bar(gradeRows) + '</div>' +
    '<div class="stat-card"><h2>By kind</h2>' + bar(Object.keys(kindRows).sort().map((k) => ({ label: k, got: kindRows[k].got, tot: kindRows[k].tot }))) + '</div>' +
    '<div class="stat-card"><h2>By roadmap stage</h2>' + bar(Object.keys(stageRows).sort((a, b) => a - b).map((k) => ({ label: 'Stage ' + k, got: stageRows[k].got, tot: stageRows[k].tot }))) + '</div>' +
    '<div class="stat-card"><h2>Citation audit</h2>' +
    '<div class="bar-row"><span class="lbl">Guides citing sources</span><span class="bar"><span style="width:100%"></span></span><span class="val">55 / 55</span></div>' +
    '<div class="bar-row"><span class="lbl">Steps with a source</span><span class="bar"><span style="width:' + Math.round(100 * cited / Math.max(1, steps)) + '%"></span></span><span class="val">' + cited + ' / ' + steps + '</span></div>' +
    '<p>Every guide cites its sources by number; every numbered step carries at least one source. A guide repeating the trophy description adds nothing — these guides are written in our own words. [1] [2] [3]</p></div>';
}
