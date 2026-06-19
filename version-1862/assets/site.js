(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.type,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags,
            card.textContent
        ].join(" "));
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("active", idx === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll(".filter-panel"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector("[data-search-input]");
            var buttons = Array.prototype.slice.call(panel.querySelectorAll("[data-filter]"));
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
            var activeFilter = "all";

            function apply() {
                var query = normalize(input ? input.value : "");
                cards.forEach(function (card) {
                    var text = cardText(card);
                    var typeText = normalize([card.dataset.type, card.dataset.genre, card.dataset.tags].join(" "));
                    var matchesQuery = !query || text.indexOf(query) !== -1;
                    var matchesFilter = activeFilter === "all" || typeText.indexOf(normalize(activeFilter)) !== -1;
                    card.classList.toggle("hidden", !(matchesQuery && matchesFilter));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
                var params = new URLSearchParams(window.location.search);
                var tag = params.get("tag");
                if (tag) {
                    input.value = tag;
                }
            }

            buttons.forEach(function (button) {
                button.addEventListener("click", function () {
                    activeFilter = button.dataset.filter || "all";
                    buttons.forEach(function (item) {
                        item.classList.toggle("active", item === button);
                    });
                    apply();
                });
            });
            apply();
        });
    }

    window.initMoviePlayer = function (videoId, coverId, source) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        if (!video || !source) {
            return;
        }
        var loaded = false;
        var hls = null;
        var shouldPlay = false;

        function requestPlay() {
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        function load() {
            if (loaded) {
                return;
            }
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    if (shouldPlay) {
                        requestPlay();
                    }
                });
            } else {
                video.src = source;
            }
        }

        function play() {
            shouldPlay = true;
            load();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            requestPlay();
        }

        if (cover) {
            cover.addEventListener("click", play);
        }
        Array.prototype.slice.call(document.querySelectorAll("[data-play-trigger='" + coverId + "']")).forEach(function (trigger) {
            trigger.addEventListener("click", function () {
                video.scrollIntoView({ behavior: "smooth", block: "center" });
                play();
            });
        });
        video.addEventListener("click", function () {
            if (!loaded || video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };

    ready(function () {
        initMenu();
        initHero();
        initFilters();
    });
})();
