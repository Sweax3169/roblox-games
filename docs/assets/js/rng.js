// RNG Zombie Defense page. Everything is drawn from window.RNG, which is extracted from the game's source:
// the roll uses the same odds formula as RngConfig.GetTierOdds / GetOdds, the wave bar is the game's own
// 40-wave table (event per wave, boss every fifth), and the arsenal lists are the shop pools.
(function () {
  var D = window.RNG, M = window.SweaxMotion, L = window.SweaxLang, root = document.documentElement;
  var lang = function () { return L.get(); };
  var rgb = function (a) { return a.join(','); };
  var wImg = function (id) { return '../assets/img/rng/w-' + id.split('_')[1].toLowerCase() + '.webp'; };
  var tImg = function (id) { return '../assets/img/rng/t-' + id.toLowerCase() + '.webp'; };
  var EV = {}; D.events.forEach(function (e) { EV[e.id] = e; });
  var BOSS = {}; D.bosses.forEach(function (b) { BOSS[b.id] = b; });

  // ---------- odds: a port of RngConfig.GetTierOdds / GetOdds ----------
  function level(v, max) { v = Math.floor(v); return Math.min(Math.max(isFinite(v) ? v : 1, 1), max); }
  function unlocked(tier, luck, wave) { var g = D.unlocks[tier - 1]; return !!g && luck >= g.luck && wave >= g.wave; }
  function tierOdds(luck, wave) {
    luck = level(luck, D.maxLuck); wave = level(wave, 60);
    var beta = .8 * (luck - 1) / (D.maxLuck - 1), out = [], total = 0;
    D.rarities.forEach(function (r, i) {
      var tier = i + 1, w = 0;
      if (unlocked(tier, luck, wave)) {
        var entry = tier === 1 ? 1 : Math.min(Math.max(.12 + (luck - D.unlocks[i].luck) * .088, .12), 1);
        w = r.weight * Math.exp(beta * (tier - 1)) * entry;
      }
      out.push(w); total += w;
    });
    return out.map(function (w) { return w / total; });
  }
  var pools = [[], [], [], [], [], []];
  D.weapons.forEach(function (w) { if (w.tier > 0) pools[w.tier - 1].push(w); });
  function itemOdds(luck, wave) {
    luck = level(luck, D.maxLuck); wave = level(wave, 60);
    var tiers = tierOdds(luck, wave), out = [];
    pools.forEach(function (pool, t) {
      var ws = pool.map(function (_, i) { return D.itemWeights[t][i] * Math.exp((luck - 1) / 49 * .85 * i); });
      var total = ws.reduce(function (a, b) { return a + b; }, 0);
      pool.forEach(function (w, i) { out.push({ w: w, tier: t + 1, p: tiers[t] * ws[i] / total }); });
    });
    return out;
  }
  function roll(luck, wave) {
    var r = Math.random(), sum = 0, last = null, list = itemOdds(luck, wave);
    for (var i = 0; i < list.length; i++) {
      if (list[i].p <= 0) continue;
      last = list[i]; sum += list[i].p;
      if (r < sum) return list[i];
    }
    return last;
  }
  var pct = function (p) { return (p * 100).toFixed(p >= .1 ? 1 : p >= .01 ? 2 : 3) + '%'; };

  // ---------- the machine ----------
  var luckEl = document.getElementById('luck'), waveEl = document.getElementById('wave'), oddsEl = document.getElementById('odds');
  var reel = document.querySelector('.reel'), img = document.getElementById('reel-img'), btn = document.getElementById('roll');
  var last = null;
  function drawOdds() {
    var luck = +luckEl.value, wave = +waveEl.value, t = tierOdds(luck, wave);
    document.getElementById('luck-v').textContent = luck;
    document.getElementById('wave-v').textContent = wave;
    oddsEl.innerHTML = D.rarities.map(function (r, i) {
      var open = unlocked(i + 1, level(luck, D.maxLuck), level(wave, 60)), g = D.unlocks[i];
      var right = open ? pct(t[i]) : '—';
      var title = open ? '' : ' title="' + L.t('Opens at luck ' + g.luck + ', wave ' + g.wave, 'Şans ' + g.luck + ', dalga ' + g.wave + ' ile açılır') + '"';
      return '<li class="' + (open ? '' : 'locked') + '" style="--c:' + rgb(r.rgb) + '"' + title + '><span>' + r[lang()] + '</span><span class="bar"><i style="--p:' + (t[i] * 100).toFixed(2) + '%"></i></span><em>' + right + '</em></li>';
    }).join('');
  }
  function show(hit) {
    var r = D.rarities[hit.tier - 1];
    document.getElementById('r-rarity').textContent = r[lang()];
    document.getElementById('r-name').textContent = hit.w[lang()];
    document.getElementById('r-odds').textContent = L.t('Chance of this weapon: ', 'Bu silahın çıkma olasılığı: ') + pct(hit.p);
    root.style.setProperty('--rc', 'rgb(' + rgb(r.rgb) + ')');
  }
  var preload = D.weapons.map(function (w) { var i = new Image(); i.src = wImg(w.id); return i; });
  btn.addEventListener('click', function () {
    var hit = roll(+luckEl.value, +waveEl.value);
    if (!hit) return;
    last = hit;
    if (M.calm) { img.src = wImg(hit.w.id); show(hit); return; }
    btn.disabled = true;
    reel.classList.add('spin');
    var pool = itemOdds(+luckEl.value, +waveEl.value).filter(function (x) { return x.p > 0; });
    var n = 0, steps = 16;
    (function tick() {
      if (n < steps) {
        var x = pool[Math.floor(Math.random() * pool.length)];
        img.src = wImg(x.w.id);
        root.style.setProperty('--rc', 'rgb(' + rgb(D.rarities[x.tier - 1].rgb) + ')');
        n++;
        setTimeout(tick, 40 + n * n * .7);
        return;
      }
      img.src = wImg(hit.w.id);
      (img.decode ? img.decode() : Promise.resolve()).catch(function () {}).then(function () {
        reel.classList.remove('spin');
        reel.classList.remove('hit'); void reel.offsetWidth; reel.classList.add('hit');
        show(hit);
        btn.disabled = false;
      });
    })();
  });
  luckEl.addEventListener('input', drawOdds);
  waveEl.addEventListener('input', drawOdds);
  drawOdds();

  // ---------- waves ----------
  var bar = document.getElementById('wavebar'), cells = [];
  D.waves.forEach(function (w) {
    var c = document.createElement('span');
    c.className = 'wv' + (w.boss ? ' boss' : '');
    if (w.boss) c.dataset.n = w.wave;
    else if (w.event) c.style.setProperty('--c', 'rgb(' + rgb(EV[w.event].rgb) + ')');
    bar.appendChild(c);
    cells.push(c);
  });
  var bossList = document.getElementById('bosses');
  function drawBosses() {
    bossList.innerHTML = D.bosses.map(function (b) { return '<li data-w="' + b.wave + '"><b>' + b.wave + '</b><span>' + b[lang()] + '</span></li>'; }).join('');
  }
  function titleCells() {
    D.waves.forEach(function (w, i) {
      cells[i].title = L.t('Wave ', 'Dalga ') + w.wave + (w.boss ? ' · BOSS ' + BOSS[w.boss][lang()] : w.event ? ' · ' + EV[w.event][lang()] : '');
    });
  }
  drawBosses(); titleCells();
  if (!M.calm) {
    var at = 0, timer = 0;
    var tick = function () {
      cells.forEach(function (c) { c.classList.remove('now'); });
      bossList.querySelectorAll('li').forEach(function (li) { li.classList.toggle('now', +li.dataset.w === at + 1); });
      cells[at].classList.add('now');
      at = (at + 1) % cells.length;
    };
    M.whileVisible(bar, function (on) { clearInterval(timer); if (on) timer = setInterval(tick, 260); });
  }

  // ---------- events ----------
  var evList = document.getElementById('events');
  function drawEvents() {
    evList.innerHTML = D.events.map(function (e) {
      var ws = D.waves.filter(function (w) { return w.event === e.id; }).map(function (w) { return w.wave; });
      return '<li class="ev" style="--c:' + rgb(e.rgb) + '"><h3>' + e[lang()] + '</h3><p>' + (lang() === 'tr' ? e.lineTr : e.lineEn) + '</p>' +
        '<p class="waves-of">' + L.t('Waves ', 'Dalgalar: ') + ws.join(', ') + '</p></li>';
    }).join('');
  }
  drawEvents();

  // ---------- arsenal ----------
  var tiersEl = document.getElementById('tiers');
  function drawTiers() {
    var cols = [{ name: L.t('Starter', 'Başlangıç'), c: '233,236,239', list: D.weapons.filter(function (w) { return w.tier === 0; }) }];
    D.rarities.forEach(function (r, i) { cols.push({ name: r[lang()], c: rgb(r.rgb), list: pools[i] }); });
    tiersEl.innerHTML = cols.map(function (col) {
      return '<div class="tier" style="--c:' + col.c + '"><h3>' + col.name + '</h3><ul>' + col.list.map(function (w) {
        return '<li class="wpn"><img src="' + wImg(w.id) + '" alt="" width="420" height="280" loading="lazy"><span>' + w[lang()] + '</span></li>';
      }).join('') + '</ul></div>';
    }).join('');
  }
  drawTiers();

  // ---------- traps ----------
  var trapsEl = document.getElementById('traps');
  function drawTraps() {
    trapsEl.innerHTML = D.traps.map(function (t) {
      return '<li class="trp"><img src="' + tImg(t.id) + '" alt="" width="360" height="270" loading="lazy"><h3>' + t[lang()] + '</h3><p>' + (lang() === 'tr' ? t.descTr : t.descEn) + '</p></li>';
    }).join('');
  }
  drawTraps();

  // ---------- chest ----------
  var chest = document.querySelector('.chest');
  if (!M.calm) {
    var ct = 0;
    M.whileVisible(chest, function (on) { clearInterval(ct); if (on) ct = setInterval(function () { chest.classList.toggle('is-open'); }, 2600); });
  }

  document.addEventListener('langchange', function () {
    drawOdds(); drawBosses(); titleCells(); drawEvents(); drawTiers(); drawTraps();
    if (last) show(last);
  });
})();
