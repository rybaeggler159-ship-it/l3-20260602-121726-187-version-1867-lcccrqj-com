(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
  scopes.forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-card-list]');
    if (!list) {
      return;
    }
    var items = Array.prototype.slice.call(list.children);
    var activeGenre = '';
    var activeYear = '';
    var apply = function () {
      var q = input ? input.value.trim().toLowerCase() : '';
      items.forEach(function (item) {
        var haystack = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-year') || '',
          item.getAttribute('data-region') || '',
          item.getAttribute('data-genre') || '',
          item.textContent || ''
        ].join(' ').toLowerCase();
        var ok = true;
        if (q && haystack.indexOf(q) === -1) {
          ok = false;
        }
        if (activeGenre && haystack.indexOf(activeGenre.toLowerCase()) === -1) {
          ok = false;
        }
        if (activeYear && haystack.indexOf(activeYear.toLowerCase()) === -1) {
          ok = false;
        }
        item.setAttribute('data-hidden', ok ? 'false' : 'true');
      });
    };
    if (input) {
      input.addEventListener('input', apply);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
        apply();
      }
    }
    scope.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || target.tagName !== 'BUTTON') {
        return;
      }
      if (target.hasAttribute('data-filter-all')) {
        activeGenre = '';
        activeYear = '';
      }
      if (target.hasAttribute('data-filter-genre')) {
        activeGenre = target.getAttribute('data-filter-genre') || '';
      }
      if (target.hasAttribute('data-filter-year')) {
        activeYear = target.getAttribute('data-filter-year') || '';
      }
      apply();
    });
  });

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
  players.forEach(function (shell) {
    var video = shell.querySelector('video[data-hls-src]');
    var button = shell.querySelector('[data-play-button]');
    if (!video) {
      return;
    }
    var src = video.getAttribute('data-hls-src');
    var ready = false;
    var prepare = function () {
      if (ready || !src) {
        return;
      }
      ready = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
      } else {
        video.src = src;
      }
    };
    var play = function () {
      prepare();
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    };
    if (button) {
      button.addEventListener('click', play);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });
  });
})();
