/* Leonida — GTA VI Trophy Guide & Tracker.
   Loads app/data/trophies.json and app/data/roadmap.json (same origin, offline),
   renders the checklist tracker, the roadmap and the missable watch. */
(function () {
  'use strict';

  var STORAGE_KEY = 'leonida-gta6-tracker-v1';
  var DEMO_EARNED = [2, 3, 4, 5, 8, 15, 16, 17, 19, 20, 21, 28, 35];
  var KIND_LABELS = {
    platinum: 'Platinum', story: 'Story', missable: 'Missable',
    collectibles: 'Collectibles', activities: 'Activities', robbery: 'Robbery',
    exploration: 'Exploration', money: 'Money'
  };
  var STAGE_NAMES = { 1: 'Stage 1 — Story', 2: 'Stage 2 — 100%', 3: 'Stage 3 — Cleanup' };

  var trophies = [];
  var roadmap = null;
  var earned = new Set();
  var selectedId = null;
  var hideSpoilers = true;

  var listEl = document.getElementById('trophyList');
  var detailEl = document.getElementById('detailPanel');
  var countEl = document.getElementById('listCount');

  function trophyById(id) {
    for (var i = 0; i < trophies.length; i++) {
      if (trophies[i].id === id) return trophies[i];
    }
    return null;
  }

  function readSavedProgress() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      (data.earned || []).forEach(function (id) { earned.add(id); });
    } catch (e) { /* a corrupt save starts empty */ }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ earned: Array.from(earned).sort(function (a, b) { return a - b; }) }));
    } catch (e) { /* private mode: progress just does not persist */ }
  }

  function applyUrlState() {
    var params = new URLSearchParams(window.location.search);
    var view = params.get('view');
    if (view === 'roadmap' || view === 'missable' || view === 'checklist') switchView(view);
    var kind = params.get('kind');
    if (kind) document.getElementById('kindFilter').value = kind;
    var grade = params.get('grade');
    if (grade) document.getElementById('gradeFilter').value = grade;
    var open = parseInt(params.get('open'), 10);
    if (open) selectedId = open;
    if (params.get('demo') === '1' && earned.size === 0) {
      DEMO_EARNED.forEach(function (id) { earned.add(id); });
    }
    var hash = window.location.hash || '';
    var m = hash.match(/earned=([0-9,]+)/);
    if (m) {
      earned = new Set();
      m[1].split(',').forEach(function (s) {
        var id = parseInt(s, 10);
        if (id) earned.add(id);
      });
    }
  }

  function isRevealed(trophy) {
    return !trophy.hidden || !hideSpoilers || earned.has(trophy.id);
  }

  function filteredTrophies() {
    var q = (document.getElementById('searchBox').value || '').toLowerCase();
    var kind = document.getElementById('kindFilter').value;
    var grade = document.getElementById('gradeFilter').value;
    var state = document.getElementById('earnedFilter').value;
    return trophies.filter(function (t) {
      if (kind && t.kind !== kind) return false;
      if (grade && t.grade !== grade) return false;
      if (state === 'earned' && !earned.has(t.id)) return false;
      if (state === 'unearned' && earned.has(t.id)) return false;
      if (q) {
        var hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function renderProgress() {
    var n = earned.size;
    var pct = Math.round((n / 55) * 100);
    document.getElementById('earnedCount').textContent = n + ' / 55';
    document.getElementById('earnedPct').textContent = pct + '%';
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressNote').textContent =
      n === 55 ? 'Platinum earned — Vice Got a Price!' :
      n === 0 ? 'Earn every trophy to take the platinum.' :
      (55 - n) + ' trophies left to the platinum.';
  }

  function renderTrophyList() {
    var rows = filteredTrophies();
    countEl.textContent = rows.length + ' of 55 trophies shown';
    listEl.innerHTML = '';
    rows.forEach(function (t) {
      var li = document.createElement('li');
      li.className = 'trophy-row' + (earned.has(t.id) ? ' earned' : '') + (t.id === selectedId ? ' selected' : '');
      var box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = earned.has(t.id);
      box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
      box.addEventListener('change', function (ev) {
        ev.stopPropagation();
        if (box.checked) earned.add(t.id); else earned.delete(t.id);
        saveProgress();
        renderProgress();
        renderTrophyList();
        renderDetail();
      });
      var body = document.createElement('div');
      var name = document.createElement('div');
      name.className = 'trophy-name';
      name.textContent = isRevealed(t) ? t.name : 'Hidden trophy — earn it to reveal';
      var desc = document.createElement('div');
      desc.className = 'trophy-desc';
      desc.textContent = isRevealed(t) ? t.description : 'This story trophy stays hidden until earned.';
      var meta = document.createElement('div');
      meta.className = 'trophy-meta';
      var kindTag = document.createElement('span');
      kindTag.className = 'tag';
      kindTag.textContent = KIND_LABELS[t.kind] || t.kind;
      meta.appendChild(kindTag);
      if (t.target) {
        var targetTag = document.createElement('span');
        targetTag.className = 'tag';
        targetTag.textContent = t.target;
        meta.appendChild(targetTag);
      }
      if (t.missable) {
        var missTag = document.createElement('span');
        missTag.className = 'tag missable-tag';
        missTag.textContent = 'Potentially missable';
        meta.appendChild(missTag);
      }
      if (t.unconfirmed) {
        var uncTag = document.createElement('span');
        uncTag.className = 'tag unconfirmed-tag';
        uncTag.textContent = 'Trigger unconfirmed';
        meta.appendChild(uncTag);
      }
      body.appendChild(name);
      body.appendChild(desc);
      body.appendChild(meta);
      var medal = document.createElement('span');
      medal.className = 'medal ' + t.grade;
      medal.textContent = t.grade;
      li.appendChild(box);
      li.appendChild(body);
      li.appendChild(medal);
      li.addEventListener('click', function (ev) {
        if (ev.target === box) return;
        selectedId = t.id;
        renderTrophyList();
        renderDetail();
      });
      listEl.appendChild(li);
    });
  }

  function renderDetail() {
    var t = trophyById(selectedId) || trophies[0];
    if (!t) { detailEl.textContent = 'Loading…'; return; }
    detailEl.innerHTML = '';
    var title = document.createElement('h3');
    title.textContent = isRevealed(t) ? t.name : 'Hidden trophy';
    detailEl.appendChild(title);
    var meta = document.createElement('p');
    meta.className = 'source-line';
    meta.textContent = t.grade.charAt(0).toUpperCase() + t.grade.slice(1) + ' · ' +
      (KIND_LABELS[t.kind] || t.kind) + (t.target ? ' · Target: ' + t.target : '') +
      (t.hidden ? ' · Hidden on PlayStation until earned' : '');
    detailEl.appendChild(meta);
    if (!isRevealed(t)) {
      var hiddenNote = document.createElement('p');
      hiddenNote.textContent = 'This story trophy is hidden on PlayStation until you earn it. Turn off “Hide spoilers” above, or earn it, to read its guide.';
      detailEl.appendChild(hiddenNote);
      return;
    }
    var desc = document.createElement('p');
    desc.textContent = 'Official description: “' + t.description + '”';
    detailEl.appendChild(desc);
    if (t.unconfirmed) {
      var warn = document.createElement('div');
      warn.className = 'unconfirmed-box';
      warn.textContent = 'Honest gap: ' + t.unconfirmed + ' This guide gives the best reading of the official description instead of inventing steps.';
      detailEl.appendChild(warn);
    }
    var guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = t.guide;
    detailEl.appendChild(guide);
    if (t.steps && t.steps.length) {
      var stepsTitle = document.createElement('p');
      stepsTitle.innerHTML = '<strong>Steps</strong>';
      detailEl.appendChild(stepsTitle);
      var ol = document.createElement('ol');
      ol.className = 'steps';
      t.steps.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        ol.appendChild(li);
      });
      detailEl.appendChild(ol);
    }
    var sources = document.createElement('p');
    sources.className = 'source-line';
    sources.textContent = 'Sources: ' + t.sources.join('; ') + '.';
    detailEl.appendChild(sources);
  }

  function renderRoadmap() {
    if (!roadmap) return;
    var factsGrid = document.getElementById('factsGrid');
    factsGrid.innerHTML = '';
    roadmap.facts.forEach(function (f) {
      var div = document.createElement('div');
      div.className = 'fact';
      var label = document.createElement('div');
      label.className = 'fact-label';
      label.textContent = f.label;
      var value = document.createElement('div');
      value.className = 'fact-value';
      value.textContent = f.value;
      div.appendChild(label);
      div.appendChild(value);
      factsGrid.appendChild(div);
    });
    var stageList = document.getElementById('stageList');
    stageList.innerHTML = '';
    roadmap.stages.forEach(function (stage) {
      var div = document.createElement('div');
      div.className = 'stage';
      var h = document.createElement('h3');
      h.textContent = stage.name + ' — ' + stage.hours;
      div.appendChild(h);
      var key = document.createElement('p');
      key.textContent = stage.key;
      div.appendChild(key);
      var ol = document.createElement('ol');
      ol.className = 'steps';
      stage.steps.forEach(function (s) {
        var li = document.createElement('li');
        li.textContent = s;
        ol.appendChild(li);
      });
      div.appendChild(ol);
      var count = document.createElement('p');
      count.className = 'source-line';
      count.textContent = stage.trophies.length + ' trophies in this stage.';
      div.appendChild(count);
      stageList.appendChild(div);
    });
    var compBody = document.querySelector('#completionTable tbody');
    compBody.innerHTML = '';
    roadmap.completion.forEach(function (row) {
      var tr = document.createElement('tr');
      [row.goal, row.note, row.trophy].forEach(function (cell) {
        var td = document.createElement('td');
        td.textContent = cell;
        tr.appendChild(td);
      });
      compBody.appendChild(tr);
    });
    var roadBody = document.querySelector('#roadmapTable tbody');
    roadBody.innerHTML = '';
    var ordered = trophies.slice().sort(function (a, b) { return a.order - b.order; });
    ordered.forEach(function (t) {
      var tr = document.createElement('tr');
      var cells = [String(t.order), t.name, t.grade, STAGE_NAMES[t.stage] || ('Stage ' + t.stage), t.target || t.description];
      cells.forEach(function (cell, i) {
        var td = document.createElement('td');
        td.textContent = cell;
        if (i === 1 && earned.has(t.id)) td.style.textDecoration = 'line-through';
        tr.appendChild(td);
      });
      roadBody.appendChild(tr);
    });
  }

  function switchView(view) {
    document.querySelectorAll('.tab').forEach(function (tab) {
      var active = tab.getAttribute('data-view') === view;
      tab.classList.toggle('active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    document.querySelectorAll('.view').forEach(function (section) {
      section.classList.toggle('active', section.id === 'view-' + view);
    });
  }

  function exportProgress() {
    var blob = new Blob([JSON.stringify({ game: 'Grand Theft Auto VI', earned: Array.from(earned).sort(function (a, b) { return a - b; }) }, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'leonida-progress.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  function importProgress(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(reader.result);
        var ids = data.earned || [];
        earned = new Set();
        ids.forEach(function (id) { if (trophyById(id)) earned.add(id); });
        saveProgress();
        renderProgress();
        renderTrophyList();
        renderDetail();
        renderRoadmap();
      } catch (e) {
        window.alert('That file is not a Leonida progress export.');
      }
    };
    reader.readAsText(file);
  }

  function copyShareLink() {
    var url = window.location.origin + window.location.pathname +
      '?view=checklist#earned=' + Array.from(earned).sort(function (a, b) { return a - b; }).join(',');
    var btn = document.getElementById('shareBtn');
    function done() { btn.textContent = 'Link copied!'; setTimeout(function () { btn.textContent = 'Copy progress link'; }, 2000); }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done, function () { window.prompt('Copy your progress link:', url); });
    } else {
      window.prompt('Copy your progress link:', url);
    }
  }

  function loadGuideData() {
    return Promise.all([
      fetch('data/trophies.json').then(function (r) { return r.json(); }),
      fetch('data/roadmap.json').then(function (r) { return r.json(); })
    ]).then(function (results) {
      trophies = results[0].trophies;
      roadmap = results[1];
      readSavedProgress();
      applyUrlState();
      if (!selectedId) selectedId = 28;
      renderProgress();
      renderTrophyList();
      renderDetail();
      renderRoadmap();
    });
  }

  document.querySelectorAll('.tab').forEach(function (tab) {
    tab.addEventListener('click', function () { switchView(tab.getAttribute('data-view')); });
  });
  document.getElementById('searchBox').addEventListener('input', renderTrophyList);
  document.getElementById('kindFilter').addEventListener('change', renderTrophyList);
  document.getElementById('gradeFilter').addEventListener('change', renderTrophyList);
  document.getElementById('earnedFilter').addEventListener('change', renderTrophyList);
  document.getElementById('spoilerToggle').addEventListener('change', function (ev) {
    hideSpoilers = ev.target.checked;
    renderTrophyList();
    renderDetail();
  });
  document.getElementById('exportBtn').addEventListener('click', exportProgress);
  document.getElementById('importBtn').addEventListener('click', function () {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', function (ev) {
    importProgress(ev.target.files[0]);
    ev.target.value = '';
  });
  document.getElementById('shareBtn').addEventListener('click', copyShareLink);

  loadGuideData();
})();
