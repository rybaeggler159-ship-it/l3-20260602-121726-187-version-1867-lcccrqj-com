(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    const startTimer = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => showSlide(current + 1), 6200);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', () => {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  const filterPanel = document.querySelector('[data-filter-panel]');

  if (filterPanel) {
    const searchInput = filterPanel.querySelector('[data-search-input]');
    const yearFilter = filterPanel.querySelector('[data-year-filter]');
    const regionFilter = filterPanel.querySelector('[data-region-filter]');
    const categoryFilter = filterPanel.querySelector('[data-category-filter]');
    const countNode = filterPanel.querySelector('[data-result-count]');
    const cards = Array.from(document.querySelectorAll('[data-card-grid] .movie-card'));

    const normalize = (value) => String(value || '').trim().toLowerCase();

    const applyFilters = () => {
      const keyword = normalize(searchInput ? searchInput.value : '');
      const year = normalize(yearFilter ? yearFilter.value : '');
      const region = normalize(regionFilter ? regionFilter.value : '');
      const category = normalize(categoryFilter ? categoryFilter.value : '');
      let visible = 0;

      cards.forEach((card) => {
        const searchText = normalize(card.dataset.search + ' ' + card.dataset.title);
        const cardYear = normalize(card.dataset.year);
        const cardRegion = normalize(card.dataset.region);
        const cardCategory = normalize(card.dataset.category);
        const matched =
          (!keyword || searchText.includes(keyword)) &&
          (!year || cardYear === year) &&
          (!region || cardRegion === region) &&
          (!category || cardCategory === category);

        card.classList.toggle('is-filtered-out', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = String(visible);
      }
    };

    [searchInput, yearFilter, regionFilter, categoryFilter].forEach((control) => {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });

    applyFilters();
  }

  const player = document.querySelector('[data-player]');

  if (player) {
    const overlay = document.querySelector('[data-play-overlay]');
    const message = document.querySelector('[data-player-message]');
    const source = player.dataset.src;
    let hlsInstance = null;

    const setMessage = (text) => {
      if (message) {
        message.textContent = text || '';
      }
    };

    let sourceAttached = false;
    let playbackRequested = false;

    const tryPlay = () => {
      const playPromise = player.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          setMessage('浏览器阻止了自动播放，请再次点击播放器开始播放。');
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    };

    const attachSource = () => {
      if (!source) {
        return false;
      }

      if (sourceAttached) {
        return true;
      }

      sourceAttached = true;
      player.dataset.bound = 'true';

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(player);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, () => {
          if (playbackRequested) {
            tryPlay();
          }
        });
        hlsInstance.on(window.Hls.Events.ERROR, (_, data) => {
          if (data && data.fatal) {
            setMessage('当前播放源暂时无法加载，可点击播放源按钮在新窗口尝试。');
          }
        });
        return false;
      }

      player.src = source;
      return true;
    };

    const startPlayback = () => {
      playbackRequested = true;

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      const canPlayNow = attachSource();

      if (canPlayNow || player.readyState > 0) {
        tryPlay();
      } else {
        setMessage('正在加载播放源，请稍候。');
      }
    };

    if (overlay) {
      overlay.addEventListener('click', startPlayback);
    }

    player.addEventListener('click', () => {
      if (player.paused) {
        startPlayback();
      }
    });

    player.addEventListener('play', () => {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      setMessage('');
    });

    player.addEventListener('pause', () => {
      if (overlay && player.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });

    window.addEventListener('beforeunload', () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
