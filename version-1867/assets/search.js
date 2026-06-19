(function () {
  var params = new URLSearchParams(window.location.search);
  var q = (params.get('q') || '').trim();
  var input = document.getElementById('searchInput');
  var title = document.getElementById('searchTitle');
  var hint = document.getElementById('searchHint');
  var results = document.getElementById('searchResults');
  if (input) {
    input.value = q;
  }
  var escapeText = function (value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  };
  var card = function (item) {
    return '<article class="movie-card">' +
      '<a href="' + escapeText(item.u) + '" class="poster-frame">' +
      '<div class="poster-fallback">' + escapeText(item.t) + '</div>' +
      '<img src="./' + escapeText(item.i) + '" alt="' + escapeText(item.t) + '" loading="lazy" onerror="this.style.opacity=\'0\'">' +
      '<span class="card-badge">' + escapeText(item.y) + '</span>' +
      '</a>' +
      '<div class="card-body">' +
      '<a class="card-title" href="' + escapeText(item.u) + '">' + escapeText(item.t) + '</a>' +
      '<p>' + escapeText(item.d) + '</p>' +
      '<div class="card-meta"><span>' + escapeText(item.r) + '</span><span>' + escapeText(item.y) + '</span></div>' +
      '</div>' +
      '</article>';
  };
  if (!q) {
    if (title) {
      title.textContent = '搜索结果';
    }
    if (hint) {
      hint.textContent = '可通过上方搜索框查找片库。';
    }
    return;
  }
  var lower = q.toLowerCase();
  var matched = (window.SEARCH_ITEMS || []).filter(function (item) {
    return [item.t, item.y, item.r, item.g, item.d, item.k].join(' ').toLowerCase().indexOf(lower) !== -1;
  }).slice(0, 120);
  if (title) {
    title.textContent = '“' + q + '”的搜索结果';
  }
  if (hint) {
    hint.textContent = matched.length ? '以下影片与关键词匹配。' : '暂无匹配影片，可尝试更换关键词。';
  }
  if (results) {
    results.innerHTML = matched.map(card).join('');
  }
})();
