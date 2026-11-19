function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

var SOURCE_KEYS = ['exophase', 'gtabase', 'powerpyx', 'psnprofiles'];

function sourceChip(data, key) {
  var index = SOURCE_KEYS.indexOf(key) + 1;
  var info = data.sourceList[key];
  if (!info) return '';
  return '<a class="source-chip" href="' + esc(info.url) + '" target="_blank" rel="noopener">[S' + index + '] ' + esc(info.label) + '</a>';
}

function gradeBadge(grade) {
  return '<span class="grade grade-' + esc(grade) + '">' + esc(grade) + '</span>';
}

function renderRow(trophy, state, spoilerOn) {
  var name = window.LeonidaFilters.displayName(trophy, spoilerOn);
  var earned = state.earned.indexOf(trophy.id) !== -1;
  var prog = window.LeonidaFilters.countProgress(state, trophy);
  var countHtml = '';
  if (prog) {
    countHtml = '<span class="row-count">' + prog.current + ' / ' + prog.target + ' ' + esc(prog.unit) + '</span>';
  }
  var badges = '';
  if (trophy.hidden) badges += '<span class="tag tag-hidden">Hidden</span>';
  if (trophy.missable) badges += '<span class="tag tag-missable">Possibly missable</span>';
  if (trophy.unconfirmed) badges += '<span class="tag tag-unconfirmed">Unconfirmed</span>';
  return '<article class="trophy-row' + (earned ? ' is-earned' : '') + (state.selected === trophy.id ? ' is-selected' : '') + '" data-trophy-id="' + esc(trophy.id) + '">' +
    '<button class="row-earn" data-earn="' + esc(trophy.id) + '" aria-label="Toggle earned">' + (earned ? '✓' : '○') + '</button>' +
    '<div class="row-main">' +
      '<div class="row-head">' + gradeBadge(trophy.grade) + '<h3 class="row-name">' + esc(name) + '</h3>' + badges + '</div>' +
      '<p class="row-desc">' + esc(trophy.description) + '</p>' +
      '<div class="row-meta"><span class="row-kind">' + esc(window.LeonidaFilters.kindLabel(trophy.kind)) + '</span>' + countHtml + '</div>' +
    '</div></article>';
}

function renderList(trophies, state, spoilerOn) {
  return trophies.map(function (t) { return renderRow(t, state, spoilerOn); }).join('');
}

function renderDetail(trophy, data, state, spoilerOn) {
  if (!trophy) {
    return '<div class="detail-empty"><p>Select a trophy from the checklist to see its guide.</p></div>';
  }
  var name = window.LeonidaFilters.displayName(trophy, spoilerOn);
  var earned = state.earned.indexOf(trophy.id) !== -1;
  var chips = trophy.sources.map(function (key) { return sourceChip(data, key); }).join(' ');
  var missableHtml = '';
  if (trophy.missable) {
    missableHtml = '<div class="miss-callout"><strong>Possibly missable.</strong> ' + esc(trophy.missableNote) + '</div>';
  }
  var unconfirmedHtml = '';
  if (trophy.unconfirmed) {
    unconfirmedHtml = '<div class="unconfirmed-callout"><strong>Unconfirmed trigger.</strong> ' + esc(trophy.unconfirmedNote) + '</div>';
  }
  var counterHtml = '';
  var prog = window.LeonidaFilters.countProgress(state, trophy);
  if (prog) {
    counterHtml = '<div class="counter">' +
      '<span class="counter-label">Progress</span>' +
      '<div class="counter-stepper">' +
        '<button class="counter-btn" data-step="-1" data-count-id="' + esc(trophy.id) + '" aria-label="Decrease">−</button>' +
        '<span class="counter-value" data-count-value="' + esc(trophy.id) + '">' + prog.current + '</span>' +
        '<button class="counter-btn" data-step="1" data-count-id="' + esc(trophy.id) + '" aria-label="Increase">+</button>' +
      '</div>' +
      '<span class="counter-target">of ' + prog.target + ' ' + esc(prog.unit) + '</span>' +
      '</div>';
  }
  var sourceListHtml = trophy.sources.map(function (key) {
    var info = data.sourceList[key];
    if (!info) return '';
    return '<li><strong>' + esc(info.label) + '</strong> — ' + esc(info.name) + ': ' + esc(info.role) + ' <a href="' + esc(info.url) + '" target="_blank" rel="noopener">' + esc(info.url) + '</a></li>';
  }).join('');
  return '<div class="detail-card">' +
    '<div class="detail-head">' + gradeBadge(trophy.grade) + '<h2 class="detail-name">' + esc(name) + '</h2></div>' +
    '<p class="detail-desc">' + esc(trophy.description) + '</p>' +
    '<div class="detail-tags">' +
      (trophy.hidden ? '<span class="tag tag-hidden">Hidden trophy</span>' : '') +
      (trophy.missable ? '<span class="tag tag-missable">Possibly missable</span>' : '') +
      (trophy.unconfirmed ? '<span class="tag tag-unconfirmed">Unconfirmed trigger</span>' : '') +
      '<span class="tag tag-kind">' + esc(window.LeonidaFilters.kindLabel(trophy.kind)) + '</span>' +
    '</div>' +
    '<h3 class="detail-label">SOURCES</h3>' +
    '<div class="detail-sources">' + chips + '</div>' +
    '<ul class="detail-source-list">' + sourceListHtml + '</ul>' +
    missableHtml + unconfirmedHtml + counterHtml +
    '<h3 class="detail-label">GUIDE</h3>' +
    '<p class="detail-guide">' + esc(trophy.guide) + '</p>' +
    '<div class="detail-nav">' +
      '<button id="prev-btn" class="nav-btn" data-nav="prev">← Prev</button>' +
      '<button id="earn-btn" class="earn-btn' + (earned ? ' is-earned' : '') + '" data-earn="' + esc(trophy.id) + '">' + (earned ? '✓ Earned — tap to undo' : 'Mark as earned') + '</button>' +
      '<button id="next-btn" class="nav-btn" data-nav="next">Next →</button>' +
    '</div></div>';
}

function renderStrip(stages, trophies, state, spoilerOn) {
  var byId = {};
  trophies.forEach(function (t) { byId[t.id] = t; });
  return stages.map(function (stage) {
    var stageTrophies = stage.trophyIds.map(function (id) { return byId[id]; }).filter(Boolean);
    var done = stageTrophies.filter(function (t) { return state.earned.indexOf(t.id) !== -1; }).length;
    var next = stageTrophies.filter(function (t) { return state.earned.indexOf(t.id) === -1; })[0];
    var nextName = next ? window.LeonidaFilters.displayName(next, spoilerOn) : 'Stage complete';
    return '<div class="strip-stage" data-stage="' + esc(stage.id) + '">' +
      '<span class="strip-title">' + esc(stage.title) + '</span>' +
      '<span class="strip-count">' + done + '/' + stageTrophies.length + '</span>' +
      '<span class="strip-next">Next: ' + esc(nextName) + '</span></div>';
  }).join('');
}

function renderRoadmap(stages, trophies, state, spoilerOn) {
  var byId = {};
  trophies.forEach(function (t) { byId[t.id] = t; });
  return stages.map(function (stage) {
    var stageTrophies = stage.trophyIds.map(function (id) { return byId[id]; }).filter(Boolean);
    var done = stageTrophies.filter(function (t) { return state.earned.indexOf(t.id) !== -1; }).length;
    var items = stageTrophies.map(function (t) {
      var earned = state.earned.indexOf(t.id) !== -1;
      return '<li class="stage-trophy' + (earned ? ' is-earned' : '') + '" data-trophy-id="' + esc(t.id) + '">' +
        (earned ? '✓ ' : '○ ') + esc(window.LeonidaFilters.displayName(t, spoilerOn)) + '</li>';
    }).join('');
    return '<section class="stage" data-stage="' + esc(stage.id) + '">' +
      '<h3 class="stage-title">' + esc(stage.title) + ' <span class="stage-count">' + done + '/' + stageTrophies.length + '</span></h3>' +
      '<p class="stage-blurb">' + esc(stage.blurb) + '</p>' +
      '<ul class="stage-trophies">' + items + '</ul></section>';
  }).join('');
}

function renderMissables(trophies, state) {
  var missable = trophies.filter(function (t) { return t.missable; })[0];
  var card1 = '<article class="miss-card">' +
    '<h3>Possibly missable: ' + esc(missable ? missable.name : 'Positive Mental Attitude') + '</h3>' +
    '<p>' + esc(missable ? missable.missableNote : '') + '</p>' +
    '<p>There are 18 meditation spots across 10 locations, and you can meditate with both Lucia and Jason at each one. Track them under Progress, then Collections, then Exploration, then Meditations. After the Chapter 1 mission Down to Earth, talk to Lucia in the kitchen in the morning, follow her to the balcony when she says she is going to meditate, and choose Accept. That meditation only exists during Chapter 1. For the 100% checklist you only need 15 of the 18 spots, but this trophy wants all of them, so do the Chapter 1 one to be safe.</p>' +
    '<p><strong>Softened on purpose:</strong> it is still unclear whether the Chapter 1 meditation is actually required for the trophy, so this guide flags it as possibly missable rather than definitely missable.</p></article>';
  var card2 = '<article class="miss-card">' +
    '<h3>Everything else is safe</h3>' +
    '<p>The other 54 trophies are not missable. The story trophies unlock as you play the five chapters, the character questlines (Andy, Kenton, Billy, Randy, Tyrone) all stay available after the credits, and every collectible, activity, race, and robbery can still be done in free-roam once the story ends. Nothing is locked behind a single playthrough choice, and there is no mission replay to worry about, so you can clean up everything after the story. The only thing to do during the story is the Chapter 1 meditation above, and even that is only possibly required. Keep cheats off the whole run, because turning one on disables trophies and saving for that session.</p>' +
    '<p><strong>Unconfirmed triggers:</strong> five trophies do not have a confirmed trigger yet (In The Beginning…, Bad Luck, I Guess, The Truth Is Out There, Ten Pin, and Fair Game\u2019s exact animal). They are labelled as unconfirmed in this guide, never presented as confirmed.</p></article>';
  return card1 + card2;
}

function renderNextUp(items, state, spoilerOn) {
  return items.map(function (t, i) {
    return '<li class="nextup-item" data-trophy-id="' + esc(t.id) + '">' +
      '<span class="nextup-rank">' + (i + 1) + '</span>' +
      '<div class="nextup-main"><strong class="nextup-name">' + esc(window.LeonidaFilters.displayName(t, spoilerOn)) + '</strong>' +
      '<span class="nextup-desc">' + esc(t.description) + '</span></div>' +
      gradeBadge(t.grade) + '</li>';
  }).join('');
}

function renderComplete(completion, state) {
  return completion.map(function (task, i) {
    var done = state.completion.indexOf(i) !== -1;
    return '<li class="completion-item' + (done ? ' is-done' : '') + '" data-completion="' + i + '">' +
      '<button class="completion-toggle" data-complete="' + i + '" aria-label="Toggle complete">' + (done ? '✓' : '○') + '</button>' +
      '<div class="completion-main"><strong>' + esc(task.label) + '</strong><span>' + esc(task.detail) + '</span></div></li>';
  }).join('');
}

function renderSources(data) {
  var keys = Object.keys(data.sourceList);
  var list = keys.map(function (key, i) {
    var info = data.sourceList[key];
    return '<li class="source-item"><strong>[S' + (i + 1) + '] ' + esc(info.label) + '</strong> — ' + esc(info.name) + ': ' + esc(info.role) + ' <a href="' + esc(info.url) + '" target="_blank" rel="noopener">' + esc(info.url) + '</a></li>';
  }).join('');
  return '<div class="sources-intro">' +
    '<p>Every trophy in this guide cites its sources. The chips [S1]–[S4] in each detail pane point to the source that confirms the trigger. PlayStation hides 28 of the 55 trophies, so this guide hides 28 of the 55 names behind the spoiler toggle until you turn it off.</p>' +
    '<p>This guide does not yet know the triggers for five trophies: In The Beginning…, Bad Luck, I Guess, The Truth Is Out There, Ten Pin, and Fair Game\u2019s exact animal. Those five are labelled as unconfirmed in the app, and their guides say so plainly instead of guessing. The guide will be updated when a confirmed trigger is published.</p></div>' +
    '<ul class="source-list">' + list + '</ul>' +
    '<p class="sources-note">Trophy names, descriptions, and grades are as PlayStation publishes them. The guide text is the author\u2019s own writing, based on the sources above and retrieved on 19 November 2026.</p>';
}

window.LeonidaViews = {
  esc: esc,
  renderList: renderList,
  renderDetail: renderDetail,
  renderStrip: renderStrip,
  renderRoadmap: renderRoadmap,
  renderMissables: renderMissables,
  renderNextUp: renderNextUp,
  renderComplete: renderComplete,
  renderSources: renderSources
};
