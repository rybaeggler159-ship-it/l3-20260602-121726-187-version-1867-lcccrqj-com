(function () {
  "use strict";

  function getText(value) {
    return (value || "").toString().toLowerCase();
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      toggle.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

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
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
    forms.forEach(function (panel) {
      var container = panel.parentElement;
      var list = container ? container.querySelector("[data-card-list]") : null;
      var cards = list ? Array.prototype.slice.call(list.querySelectorAll("[data-card]")) : [];
      var keyword = panel.querySelector("input[name='keyword']");
      var year = panel.querySelector("select[name='year']");
      var genre = panel.querySelector("select[name='genre']");
      var count = panel.querySelector("[data-result-count]");
      if (!cards.length) {
        return;
      }

      function apply() {
        var keywordValue = getText(keyword && keyword.value);
        var yearValue = getText(year && year.value);
        var genreValue = getText(genre && genre.value);
        var visible = 0;
        cards.forEach(function (card) {
          var text = getText(card.getAttribute("data-text"));
          var cardYear = getText(card.getAttribute("data-year"));
          var cardGenre = getText(card.getAttribute("data-genre"));
          var matched = true;
          if (keywordValue && text.indexOf(keywordValue) === -1) {
            matched = false;
          }
          if (yearValue && cardYear.indexOf(yearValue) === -1) {
            matched = false;
          }
          if (genreValue && cardGenre.indexOf(genreValue) === -1) {
            matched = false;
          }
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (count) {
          count.textContent = "当前显示 " + visible + " 部作品";
        }
      }

      [keyword, year, genre].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      if (container && container.hasAttribute("data-search-page")) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (keyword && query) {
          keyword.value = query;
        }
      }
      apply();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
    players.forEach(function (video) {
      var shell = video.closest(".player-shell");
      if (!shell) {
        return;
      }
      var overlay = shell.querySelector("[data-player-play]");
      var message = shell.querySelector("[data-player-message]");
      var streamUrl = video.getAttribute("data-hls");
      var initialized = false;
      var hlsInstance = null;

      function showMessage(text) {
        if (!message) {
          return;
        }
        message.textContent = text;
        message.classList.add("is-visible");
        window.setTimeout(function () {
          message.classList.remove("is-visible");
        }, 2600);
      }

      function bindStream() {
        if (initialized || !streamUrl) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = streamUrl;
          initialized = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              showMessage("暂时无法播放，请稍后再试");
              if (hlsInstance) {
                hlsInstance.destroy();
              }
              initialized = false;
            }
          });
          initialized = true;
          return;
        }
        video.src = streamUrl;
        initialized = true;
      }

      function startPlayback() {
        bindStream();
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        video.setAttribute("controls", "controls");
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
            showMessage("点击画面即可开始播放");
          });
        }
      }

      if (overlay) {
        overlay.addEventListener("click", startPlayback);
      }
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
