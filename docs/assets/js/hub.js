// Hub: fills the POP IT bubble row and the Merge Ores rail, tilts the windows toward the pointer.
(function () {
  var M = window.SweaxMotion;
  var BUB = ['#ff8cc6', '#8a4a2a', '#f4dcb4', '#ff6fb1', '#5c2f1c', '#fbe9cf'];

  document.querySelectorAll('.bubbles').forEach(function (row) {
    var n = Math.max(8, Math.floor((row.clientWidth - 24) / 33));
    for (var i = 0; i < n; i++) {
      var s = document.createElement('span');
      s.style.setProperty('--b', BUB[i % BUB.length]);
      row.appendChild(s);
    }
    var world = row.closest('.world');
    var wave = function () {
      if (M.calm) return;
      [].forEach.call(row.children, function (s, i) {
        setTimeout(function () { s.classList.add('pop'); }, i * 45);
        setTimeout(function () { s.classList.remove('pop'); }, i * 45 + 420);
      });
    };
    world.addEventListener('pointerenter', wave);
    var timer = 0;
    M.whileVisible(row, function (on) {
      clearInterval(timer);
      if (on) timer = setInterval(wave, 5200);
    });
  });

  document.querySelectorAll('.rail-track').forEach(function (track) {
    var html = '';
    for (var k = 0; k < 2; k++)
      for (var i = 1; i <= 10; i++)
        html += '<img src="assets/img/ores/tier-' + (i < 10 ? '0' + i : i) + '.webp" alt="" width="28" height="28" loading="lazy">';
    track.innerHTML = html;
  });

  document.querySelectorAll('.world').forEach(function (w) { M.tilt(w, 5); });
})();
