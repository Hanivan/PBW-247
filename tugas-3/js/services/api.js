var api = (function () {
  var TEMPLATE_PATHS = [
    { id: 'tpl-stok-badge',   path: 'templates/stok-badge.html' },
    { id: 'tpl-stat-card',    path: 'templates/stat-card.html' },
    { id: 'tpl-stock-table',  path: 'templates/stock-table.html' },
    { id: 'tpl-do-tracking',  path: 'templates/do-tracking.html' },
    { id: 'tpl-order-form',   path: 'templates/order-form.html' },
    { id: 'tpl-stok-detail',  path: 'templates/stok-detail.html' }
  ];

  function injectTemplate(id, html) {
    var s = document.createElement('script');
    s.type = 'text/x-template';
    s.id = id;
    s.textContent = html;
    document.head.appendChild(s);
  }

  function loadApp() {
    var fetches = [fetch('data/dataBahanAjar.json').then(function (r) { return r.json(); })];
    TEMPLATE_PATHS.forEach(function (t) {
      fetches.push(fetch(t.path).then(function (r) { return r.text(); }));
    });

    return Promise.all(fetches).then(function (results) {
      var data = results[0];
      window.AppData = data;

      for (var i = 0; i < TEMPLATE_PATHS.length; i++) {
        injectTemplate(TEMPLATE_PATHS[i].id, results[i + 1]);
      }
    });
  }

  return { loadApp: loadApp };
})();
