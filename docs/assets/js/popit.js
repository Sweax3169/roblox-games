// +1 Speed POP IT Escape page: a pop-it tray that adds +1 speed per pop and flips over when it is
// empty, like the toy; and a 15-stage track whose runner speeds up the further it gets.
(function () {
  var M = window.SweaxMotion;
  var T = window.SweaxLang.t;
  var ROWS = ['#ff9cc9', '#f6deb6', '#a35a33', '#ff6fb0', '#6b3520'];
  var tray = document.getElementById('tray');
  var speedEl = document.getElementById('speed');
  var badge = speedEl.parentNode;
  var speed = 0, busy = false;

  function label(b) { b.setAttribute('aria-label', T('Pop-it bubble', 'Pop-it kabarcığı')); }

  for (var i = 0; i < 25; i++) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'bub';
    b.style.setProperty('--c', ROWS[Math.floor(i / 5)]);
    b.setAttribute('aria-pressed', 'false');
    label(b);
    tray.appendChild(b);
  }
  document.addEventListener('langchange', function () { tray.querySelectorAll('.bub').forEach(label); });

  tray.addEventListener('click', function (e) {
    var b = e.target.closest('.bub');
    if (!b || busy || b.getAttribute('aria-pressed') === 'true') return;
    b.setAttribute('aria-pressed', 'true');
    b.classList.remove('squash'); void b.offsetWidth; b.classList.add('squash');
    speed += 1;
    speedEl.textContent = speed;
    badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');

    var r = b.getBoundingClientRect(), tr = tray.getBoundingClientRect();
    var p = document.createElement('span');
    p.className = 'plus1';
    p.textContent = '+1';
    p.style.left = (r.left - tr.left + r.width / 2) + 'px';
    p.style.top = (r.top - tr.top + r.height / 2) + 'px';
    tray.appendChild(p);
    setTimeout(function () { p.remove(); }, 950);

    if (tray.querySelectorAll('.bub[aria-pressed="false"]').length === 0) {
      busy = true;
      setTimeout(function () {
        tray.classList.toggle('flip');
        setTimeout(function () {
          tray.querySelectorAll('.bub').forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
          busy = false;
        }, 450);
      }, 350);
    }
  });

  // stage track
  var track = document.getElementById('track');
  var pips = [];
  for (var s = 1; s <= 15; s++) {
    var d = document.createElement('span');
    d.className = 'pip' + (s === 15 ? ' boss' : '');
    d.textContent = s;
    track.appendChild(d);
    pips.push(d);
  }
  if (M.calm) { pips.forEach(function (x) { x.classList.add('on'); }); return; }
  var at = -1, timer = 0, running = false;
  function step() {
    at += 1;
    if (at >= pips.length) {
      timer = setTimeout(function () { pips.forEach(function (x) { x.classList.remove('on'); }); at = -1; if (running) step(); }, 1600);
      return;
    }
    pips[at].classList.add('on');
    // each stage comes sooner than the last: the runner keeps getting faster
    timer = setTimeout(function () { if (running) step(); }, Math.max(110, 620 - at * 38));
  }
  M.whileVisible(track, function (on) {
    if (on && !running) { running = true; step(); }
    else if (!on) { running = false; clearTimeout(timer); }
  });
})();
