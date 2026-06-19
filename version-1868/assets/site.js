(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function text(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initNav() {
    var button = document.querySelector("[data-nav-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    show(0);
    start();
  }

  function initCardFilter() {
    var form = document.querySelector("[data-card-filter]");
    if (!form) {
      return;
    }
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var keyword = form.querySelector("input[name='keyword']");
    var year = form.querySelector("select[name='year']");

    function apply() {
      var q = text(keyword && keyword.value);
      var y = year && year.value;
      cards.forEach(function (card) {
        var haystack = text([
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
          card.getAttribute("data-year")
        ].join(" "));
        var okKeyword = !q || haystack.indexOf(q) !== -1;
        var okYear = !y || card.getAttribute("data-year") === y;
        card.style.display = okKeyword && okYear ? "" : "none";
      });
    }

    form.addEventListener("input", apply);
    form.addEventListener("change", apply);
    form.addEventListener("reset", function () {
      setTimeout(apply, 0);
    });
    apply();
  }

  function cardTemplate(movie) {
    return [
      "<article class=\"movie-card\">",
      "<a href=\"" + escapeHtml(movie.url) + "\" class=\"card-link\">",
      "<div class=\"poster-wrap\">",
      "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
      "<span class=\"year-badge\">" + escapeHtml(movie.yearText) + "</span>",
      "</div>",
      "<div class=\"card-body\">",
      "<div class=\"card-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.categoryName) + "</span></div>",
      "<h2>" + escapeHtml(movie.title) + "</h2>",
      "<p>" + escapeHtml(movie.oneLine) + "</p>",
      "<div class=\"mini-tags\"><span>" + escapeHtml(movie.type) + "</span><span>" + escapeHtml(movie.genre) + "</span></div>",
      "</div>",
      "</a>",
      "</article>"
    ].join("");
  }

  function initSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    if (!form || !results || !summary || !window.MOVIE_SEARCH_INDEX) {
      return;
    }
    var query = form.querySelector("[data-search-query]");
    var year = form.querySelector("[data-search-year]");
    var type = form.querySelector("[data-search-type]");
    var params = new URLSearchParams(window.location.search);
    if (params.get("q")) {
      query.value = params.get("q");
    }

    function render() {
      var q = text(query.value);
      var y = year.value;
      var t = type.value;
      var list = window.MOVIE_SEARCH_INDEX.filter(function (movie) {
        var haystack = text([
          movie.title,
          movie.region,
          movie.type,
          movie.genre,
          movie.tags,
          movie.yearText,
          movie.oneLine
        ].join(" "));
        return (!q || haystack.indexOf(q) !== -1) && (!y || movie.yearText === y) && (!t || movie.type === t);
      }).slice(0, 120);
      summary.textContent = list.length ? "找到 " + list.length + " 部相关影片" : "未找到匹配影片";
      results.innerHTML = list.map(cardTemplate).join("");
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      render();
    });
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    render();
  }

  ready(function () {
    initNav();
    initHero();
    initCardFilter();
    initSearchPage();
  });
})();
