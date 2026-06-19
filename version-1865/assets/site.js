(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    });

    document.querySelectorAll('[data-filter-form]').forEach(function (form) {
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var params = new URLSearchParams(window.location.search);
        var queryInput = form.querySelector('[name="q"]');
        var categoryInput = form.querySelector('[name="category"]');
        var yearInput = form.querySelector('[name="year"]');
        var typeInput = form.querySelector('[name="type"]');

        if (queryInput && params.get('q')) {
            queryInput.value = params.get('q');
        }

        function includesLoose(haystack, needle) {
            return String(haystack || '').toLowerCase().indexOf(String(needle || '').toLowerCase()) !== -1;
        }

        function matchYear(cardYear, selectedYear) {
            if (!selectedYear) {
                return true;
            }
            var numericYear = parseInt(cardYear, 10);
            var numericSelected = parseInt(selectedYear, 10);
            if (selectedYear === '2022') {
                return Number.isFinite(numericYear) && numericYear <= 2022;
            }
            return numericYear === numericSelected;
        }

        function applyFilters() {
            var query = queryInput ? queryInput.value.trim() : '';
            var category = categoryInput ? categoryInput.value : '';
            var year = yearInput ? yearInput.value : '';
            var type = typeInput ? typeInput.value : '';

            cards.forEach(function (card) {
                var title = card.getAttribute('data-title') || '';
                var region = card.getAttribute('data-region') || '';
                var cardType = card.getAttribute('data-type') || '';
                var cardYear = card.getAttribute('data-year') || '';
                var cardCategory = card.getAttribute('data-category') || '';
                var haystack = [title, region, cardType, cardYear, cardCategory, card.textContent].join(' ');
                var visible = true;

                if (query && !includesLoose(haystack, query)) {
                    visible = false;
                }
                if (category && cardCategory !== category) {
                    visible = false;
                }
                if (!matchYear(cardYear, year)) {
                    visible = false;
                }
                if (type && !includesLoose(cardType, type)) {
                    visible = false;
                }

                card.classList.toggle('is-hidden', !visible);
            });
        }

        form.addEventListener('input', applyFilters);
        form.addEventListener('change', applyFilters);
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters();
        });
        applyFilters();
    });
})();
