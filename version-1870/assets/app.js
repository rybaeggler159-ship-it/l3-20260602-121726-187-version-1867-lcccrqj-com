(function () {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");

  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let active = 0;

    const setActive = function (index) {
      active = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        setActive(dotIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setActive((active + 1) % slides.length);
      }, 6200);
    }

    setActive(0);
  }

  const globalSearchForms = Array.from(document.querySelectorAll("[data-global-search]"));
  globalSearchForms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const input = form.querySelector("[name='q']");
      const value = input ? input.value.trim() : "";
      const target = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
      window.location.href = target;
    });
  });

  const filterForms = Array.from(document.querySelectorAll(".filter-bar:not([data-global-search])"));
  filterForms.forEach(function (form) {
    const scope = form.closest(".page-shell") || document;
    const input = form.querySelector("[data-filter-input]");
    const yearSelect = form.querySelector("[data-year-filter]");
    const cards = Array.from(scope.querySelectorAll(".filter-card"));
    const empty = scope.querySelector("[data-filter-empty]");

    const applyFilter = function () {
      const query = input ? input.value.trim().toLowerCase() : "";
      const year = yearSelect ? yearSelect.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const text = (card.getAttribute("data-filter") || "").toLowerCase();
        const cardYear = card.getAttribute("data-year") || "";
        const matchQuery = !query || text.indexOf(query) !== -1;
        const matchYear = !year || cardYear === year;
        const show = matchQuery && matchYear;

        card.style.display = show ? "" : "none";
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      applyFilter();
    });

    if (input) {
      input.addEventListener("input", applyFilter);
    }

    if (yearSelect) {
      yearSelect.addEventListener("change", applyFilter);
    }

    const params = new URLSearchParams(window.location.search);
    const queryParam = params.get("q");
    if (queryParam && input) {
      input.value = queryParam;
      applyFilter();
    }
  });
})();
