// Shared motion helpers: reveal-on-scroll for things below the first screen, pointer tilt,
// and "run only while visible" for the small looping demos.
(function () {
  var wide = matchMedia('(min-width: 900px)').matches;
  var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.SweaxMotion = {
    calm: calm,
    // calls cb(true/false) as el enters or leaves the screen
    whileVisible: function (el, cb) {
      if (!('IntersectionObserver' in window)) { cb(true); return; }
      new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.isIntersecting); }); }, { rootMargin: '80px' }).observe(el);
    },
    tilt: function (el, strength) {
      if (calm || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
      var s = strength || 6, raf = 0;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.setProperty('--tx', x.toFixed(3));
          el.style.setProperty('--ty', y.toFixed(3));
          el.style.transform = 'perspective(1100px) rotateY(' + (x * s) + 'deg) rotateX(' + (-y * s) + 'deg)';
        });
      });
      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(raf);
        el.style.transform = '';
        el.style.setProperty('--tx', 0);
        el.style.setProperty('--ty', 0);
      });
    }
  };

  if (!wide || calm || !('IntersectionObserver' in window)) return;
  var items = [].slice.call(document.querySelectorAll('[data-rv]')).filter(function (el) {
    return el.getBoundingClientRect().top > innerHeight * .92;
  });
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('rv-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  items.forEach(function (el) { el.classList.add('rv-pre'); io.observe(el); });
  // nothing may stay hidden: a fast jump to the end still shows everything
  addEventListener('scroll', function done() {
    if (innerHeight + scrollY >= document.body.scrollHeight - 4) {
      items.forEach(function (el) { el.classList.add('rv-in'); });
      removeEventListener('scroll', done);
    }
  }, { passive: true });
})();
