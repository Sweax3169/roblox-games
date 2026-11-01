// Layout check, run inside a page (pasted into the browser console or injected by a test runner).
// Reports: horizontal page overflow, text that spills out of its box, text runs that collide with
// each other, and multi-line headings whose line height is smaller than the real glyph extent of
// Turkish capitals with dots (İ Ü Ö Ğ) plus letters with tails (ç ş ğ y), measured with canvas.
(async function () {
  await document.fonts.ready;
  var out = { url: location.pathname + location.search, w: innerWidth, problems: [] };
  var de = document.documentElement;
  if (de.scrollWidth > de.clientWidth + 1) out.problems.push('page overflows sideways by ' + (de.scrollWidth - de.clientWidth) + 'px');

  function scroller(el) {
    for (var p = el.parentElement; p; p = p.parentElement) {
      var o = getComputedStyle(p).overflowX;
      if (o === 'auto' || o === 'scroll') return true;
    }
    return false;
  }
  function visible(el) {
    var cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }
  function name(el) { return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : ''); }

  // 1. text spilling out of its own box
  document.querySelectorAll('h1,h2,h3,p,a,button,span,b,em,li,label,figcaption').forEach(function (el) {
    if (!visible(el) || scroller(el) || el.closest('.sr,.skip,.floaters,.rail,dialog')) return;
    if (el.scrollWidth > el.clientWidth + 2 && getComputedStyle(el).overflowX !== 'visible')
      out.problems.push('clipped text in ' + name(el) + ': "' + el.textContent.trim().slice(0, 40) + '"');
  });

  // 2. line height against real glyph extents
  var cv = document.createElement('canvas').getContext('2d');
  document.querySelectorAll('h1,h2,h3,.world-name,.sign b,.facts b,.r-name,.best b,.bosses span').forEach(function (el) {
    if (!visible(el)) return;
    var cs = getComputedStyle(el);
    cv.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
    var up = Math.max.apply(null, ['İ', 'Ü', 'Ö', 'Ğ', 'Ç', 'Ş'].map(function (c) { return cv.measureText(c).actualBoundingBoxAscent; }));
    var down = Math.max.apply(null, ['ç', 'ş', 'ğ', 'y', 'Ç', 'Ş', 'j'].map(function (c) { return cv.measureText(c).actualBoundingBoxDescent; }));
    var lh = parseFloat(cs.lineHeight);
    if (isNaN(lh)) lh = parseFloat(cs.fontSize) * 1.2;
    var lines = Math.round(el.getBoundingClientRect().height / lh);
    if (lines > 1 && up + down > lh + .5)
      out.problems.push('line height ' + lh.toFixed(1) + 'px < glyph extent ' + (up + down).toFixed(1) + 'px in ' + name(el) + ' (' + lines + ' lines)');
    // dots or tails cut by an ancestor that clips
    var r = el.getBoundingClientRect();
    for (var p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      var pc = getComputedStyle(p);
      if (pc.overflow === 'visible' && pc.clipPath === 'none') continue;
      var pr = p.getBoundingClientRect(), half = (lh - parseFloat(cs.fontSize)) / 2;
      var top = r.top + half + parseFloat(cs.fontSize) * .8 - up, bottom = r.bottom - half + down - parseFloat(cs.fontSize) * .2;
      if (top < pr.top - .5 || bottom > pr.bottom + .5) out.problems.push('glyphs may be cut by ' + name(p) + ' around ' + name(el));
      break;
    }
  });

  // 3. text runs that overlap other text runs
  var runs = [];
  var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    var n = walker.currentNode;
    if (!n.textContent.trim() || !n.parentElement || !visible(n.parentElement) || n.parentElement.closest('.sr,.skip,.floaters,dialog,script')) continue;
    var rg = document.createRange();
    rg.selectNodeContents(n);
    [].forEach.call(rg.getClientRects(), function (rc) { if (rc.width > 1 && rc.height > 1) runs.push({ n: n, r: rc }); });
  }
  for (var i = 0; i < runs.length; i++) for (var j = i + 1; j < runs.length; j++) {
    var a = runs[i], b = runs[j];
    if (a.n === b.n) continue;
    var ox = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), oy = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    // line boxes of a big display font are taller than its line height, so neighbouring lines always touch
    // a little; a real collision covers a good part of the shorter run
    if (ox > 2 && oy > .35 * Math.min(a.r.height, b.r.height)) out.problems.push('text overlaps: "' + a.n.textContent.trim().slice(0, 24) + '" × "' + b.n.textContent.trim().slice(0, 24) + '"');
  }
  out.runs = runs.length;
  return out;
})();
