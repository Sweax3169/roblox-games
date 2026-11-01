// Opens a screenshot large in a <dialog>; any [data-full] button works.
(function () {
  var dlg = document.getElementById('viewer');
  if (!dlg || !dlg.showModal) return;
  var img = dlg.querySelector('img');
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-full]');
    if (b) {
      img.src = b.dataset.full;
      img.alt = (b.querySelector('img') || {}).alt || '';
      dlg.showModal();
      return;
    }
    if (e.target === dlg || e.target.closest('.close')) dlg.close();
  });
})();
