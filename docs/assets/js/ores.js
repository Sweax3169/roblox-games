// Merge Ores page: the ore rail, a merge bench that follows the game's rule (three alike → next tier,
// chaining like the anvil does) and the ten-tier value staircase. Tier names, values and colours come
// from window.ORES, which is extracted from the game's Config.lua.
(function () {
  var D = window.ORES, M = window.SweaxMotion, L = window.SweaxLang;
  var IMG = function (t) { return '../assets/img/ores/tier-' + (t < 10 ? '0' + t : t) + '.webp'; };
  var name = function (t) { return D.tiers[t - 1][L.get()]; };
  // same number format as the game (Config.fmt / Config.fmtPara)
  function money(n) {
    if (n < 1000) return '$' + n.toLocaleString('en-US');
    var suf = ['', 'K', 'M', 'B', 'T'], e = Math.floor(Math.log10(n) / 3);
    return '$' + parseFloat((n / Math.pow(10, e * 3)).toFixed(2)) + suf[e];
  }

  // rail
  var rail = document.getElementById('rail'), h = '';
  for (var k = 0; k < 2; k++) for (var i = 1; i <= D.maxTier; i++) h += '<img src="' + IMG(i) + '" alt="" width="34" height="34">';
  rail.innerHTML = h;

  // staircase
  var steps = document.getElementById('steps'), top = Math.log10(D.tiers[D.tiers.length - 1].value);
  function drawSteps() {
    steps.innerHTML = D.tiers.map(function (t, i) {
      var hpx = Math.round(14 + Math.log10(t.value) / top * 190);
      return '<li class="step"><img src="' + IMG(t.tier) + '" alt="" width="70" height="70" loading="lazy">' +
        '<span class="name">' + t[L.get()] + '</span><span class="val">' + money(t.value) + '</span>' +
        '<span class="col" style="--h:' + hpx + 'px;--c:' + t.rgb.join(',') + ';--k:' + i + '"></span></li>';
    }).join('');
  }
  drawSteps();
  if (!M.calm && steps.getBoundingClientRect().top > innerHeight) {
    steps.classList.add('wait');
    M.whileVisible(steps, function (on) { if (on) steps.classList.remove('wait'); });
  }

  // merge bench
  var SLOTS = 12, grid = document.getElementById('slots'), cells = [], bench = new Array(SLOTS).fill(0), busy = false, last = '';
  var add = document.getElementById('add'), anvil = document.getElementById('anvil'), note = document.getElementById('note');
  for (var s = 0; s < SLOTS; s++) {
    var c = document.createElement('div');
    c.className = 'slot';
    c.setAttribute('role', 'listitem');
    grid.appendChild(c);
    cells.push(c);
  }
  function put(i, t, cls) {
    bench[i] = t;
    cells[i].innerHTML = t ? '<img class="' + cls + '" src="' + IMG(t) + '" alt="' + name(t) + '" width="96" height="96">' : '';
    cells[i].setAttribute('aria-label', t ? name(t) : L.t('Empty', 'Boş'));
  }
  function triple() {
    for (var t = 1; t < D.maxTier; t++) {
      var at = [];
      bench.forEach(function (v, i) { if (v === t) at.push(i); });
      if (at.length >= D.mergeCount) return at.slice(0, D.mergeCount);
    }
    return null;
  }
  function refresh(msg) {
    var best = Math.max.apply(null, bench);
    anvil.disabled = busy || !triple();
    add.disabled = busy || bench.indexOf(0) < 0;
    document.getElementById('best-img').src = IMG(best || 1);
    document.getElementById('best-name').textContent = name(best || 1);
    document.getElementById('best-val').textContent = best ? money(D.tiers[best - 1].value) + ' ' + L.t('per ore', 'cevher başına') : '';
    if (msg !== undefined) note.textContent = msg;
    else if (best === D.maxTier) note.textContent = L.t(name(D.maxTier) + ' is the top tier.', name(D.maxTier) + ' en üst kademe.');
    else if (bench.indexOf(0) < 0 && anvil.disabled) note.textContent = L.t('The bench is full.', 'Tezgâh dolu.');
    else if (bench.indexOf(0) < 0) note.textContent = L.t('The bench is full. Merge at the anvil.', 'Tezgâh dolu. Örste birleştir.');
    else note.textContent = '';
  }
  function sparks(cell) {
    if (M.calm) return;
    for (var n = 0; n < 10; n++) {
      var p = document.createElement('i'), a = Math.random() * Math.PI * 2, d = 30 + Math.random() * 40;
      p.className = 'spark';
      p.style.left = cell.offsetLeft + cell.offsetWidth / 2 + 'px';
      p.style.top = cell.offsetTop + cell.offsetHeight / 2 + 'px';
      p.style.setProperty('--dx', Math.cos(a) * d + 'px');
      p.style.setProperty('--dy', Math.sin(a) * d + 'px');
      grid.appendChild(p);
      setTimeout(p.remove.bind(p), 650);
    }
  }
  function mergeOnce() {
    var at = triple();
    if (!at) { busy = false; refresh(last); return; }
    var t = bench[at[0]];
    at.forEach(function (i) { var im = cells[i].querySelector('img'); if (im) im.className = 'out'; });
    setTimeout(function () {
      at.forEach(function (i) { put(i, 0); });
      put(at[0], t + 1, 'born');
      sparks(cells[at[0]]);
      last = '3 × ' + name(t) + ' → ' + name(t + 1);
      refresh(last);
      setTimeout(mergeOnce, M.calm ? 0 : 520);
    }, M.calm ? 0 : 360);
  }
  add.addEventListener('click', function () {
    var i = bench.indexOf(0);
    if (i < 0 || busy) return;
    put(i, 1, 'in');
    refresh();
  });
  anvil.addEventListener('click', function () {
    if (busy || !triple()) return;
    busy = true;
    refresh('');
    mergeOnce();
  });
  document.getElementById('reset').addEventListener('click', function () {
    if (busy) return;
    for (var i = 0; i < SLOTS; i++) put(i, 0);
    [1, 1].forEach(function (t, i) { put(i, t); });
    refresh();
  });
  [1, 1].forEach(function (t, i) { put(i, t); });
  for (var e = 2; e < SLOTS; e++) put(e, 0);
  refresh();

  document.addEventListener('langchange', function () {
    drawSteps();
    bench.forEach(function (t, i) { if (t) { cells[i].querySelector('img').alt = name(t); } cells[i].setAttribute('aria-label', t ? name(t) : L.t('Empty', 'Boş')); });
    refresh();
  });
})();
