(function () {
    function onReady(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupNavigation() {
        var toggle = document.querySelector("[data-nav-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        var search = document.querySelector("[data-header-search]");

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
            if (search) {
                search.classList.toggle("is-open");
            }
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero-carousel]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function activate(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                activate(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                activate(current - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                activate(current + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        activate(0);
        start();
    }

    function normalizeText(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var input = document.querySelector("[data-page-search]");
        var typeSelect = document.querySelector("[data-type-select]");
        var yearSelect = document.querySelector("[data-year-select]");
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
        var noResults = document.querySelector("[data-no-results]");
        var activeCategory = "";

        if (!cards.length) {
            return;
        }

        function apply() {
            var keyword = normalizeText(input ? input.value : "");
            var typeValue = normalizeText(typeSelect ? typeSelect.value : "");
            var yearValue = normalizeText(yearSelect ? yearSelect.value : "");
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalizeText([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-category"),
                    card.getAttribute("data-year")
                ].join(" "));

                var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var matchType = !typeValue || normalizeText(card.getAttribute("data-type")) === typeValue;
                var matchYear = !yearValue || normalizeText(card.getAttribute("data-year")) === yearValue;
                var matchCategory = !activeCategory || normalizeText(card.getAttribute("data-category")) === activeCategory;
                var shouldShow = matchKeyword && matchType && matchYear && matchCategory;

                card.classList.toggle("is-hidden", !shouldShow);

                if (shouldShow) {
                    visible += 1;
                }
            });

            if (noResults) {
                noResults.classList.toggle("is-visible", visible === 0);
            }
        }

        if (input) {
            var params = new URLSearchParams(window.location.search);
            var query = params.get("q");

            if (query) {
                input.value = query;
            }

            input.addEventListener("input", apply);
        }

        if (typeSelect) {
            typeSelect.addEventListener("change", apply);
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", apply);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                var value = normalizeText(chip.getAttribute("data-filter-chip"));

                chips.forEach(function (item) {
                    item.classList.remove("is-active");
                });

                chip.classList.add("is-active");
                activeCategory = value;
                apply();
            });
        });

        apply();
    }

    function setupPlayer() {
        var video = document.querySelector("[data-hls-player]");

        if (!video) {
            return;
        }

        var source = video.getAttribute("data-src");
        var startButton = document.querySelector("[data-player-start]");
        var hlsInstance = null;
        var initialized = false;

        function initialize() {
            if (initialized || !source) {
                return;
            }

            initialized = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            }
        }

        function playVideo() {
            initialize();
            var playPromise = video.play();

            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        initialize();

        if (startButton) {
            startButton.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            initialize();
        });

        video.addEventListener("play", function () {
            if (startButton) {
                startButton.classList.add("is-hidden");
            }
        });

        video.addEventListener("ended", function () {
            if (startButton) {
                startButton.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    onReady(function () {
        setupNavigation();
        setupHero();
        setupFilters();
        setupPlayer();
    });
})();
