// English is written in the HTML; Turkish sits next to it in data-tr (data-tr-alt, data-tr-aria, data-tr-title).
// The choice comes from ?lang=, then the last choice, then the browser language.
(function () {
  var root = document.documentElement;
  var KEY = 'sweax-roblox-lang';

  function stored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function pick() {
    var q = new URLSearchParams(location.search).get('lang');
    if (q === 'tr' || q === 'en') return q;
    var s = stored();
    if (s === 'tr' || s === 'en') return s;
    return (navigator.language || '').toLowerCase().indexOf('tr') === 0 ? 'tr' : 'en';
  }

  var ATTRS = [['data-tr-alt', 'alt'], ['data-tr-aria', 'aria-label'], ['data-tr-title', 'title'], ['data-tr-ph', 'placeholder']];

  function apply(lang) {
    root.lang = lang;
    root.classList.toggle('is-tr', lang === 'tr');
    document.querySelectorAll('[data-tr]').forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
      el.innerHTML = lang === 'tr' ? el.dataset.tr : el.dataset.en;
    });
    ATTRS.forEach(function (pair) {
      document.querySelectorAll('[' + pair[0] + ']').forEach(function (el) {
        var keep = 'data-en-' + pair[1];
        if (!el.hasAttribute(keep)) el.setAttribute(keep, el.getAttribute(pair[1]) || '');
        el.setAttribute(pair[1], lang === 'tr' ? el.getAttribute(pair[0]) : el.getAttribute(keep));
      });
    });
    var t = root.getAttribute('data-title-' + lang);
    if (t) document.title = t;
    // keep the language when moving between pages, even where storage is blocked
    document.querySelectorAll('a[data-int]').forEach(function (a) {
      var base = a.getAttribute('href').split('?')[0];
      a.setAttribute('href', lang === 'tr' ? base + '?lang=tr' : base);
    });
    document.querySelectorAll('[data-lang-btn]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.langBtn === lang));
    });
    document.dispatchEvent(new CustomEvent('langchange', { detail: lang }));
  }

  window.SweaxLang = {
    get: function () { return root.lang === 'tr' ? 'tr' : 'en'; },
    t: function (en, tr) { return root.lang === 'tr' ? tr : en; }
  };

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-lang-btn]');
    if (!b) return;
    var lang = b.dataset.langBtn;
    store(lang);
    var url = new URL(location.href);
    if (lang === 'tr') url.searchParams.set('lang', 'tr'); else url.searchParams.delete('lang');
    history.replaceState(null, '', url);
    apply(lang);
  });

  apply(pick());
  root.classList.remove('i18n-wait');
})();
