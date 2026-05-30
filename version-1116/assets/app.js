(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var next = hero.querySelector('[data-hero-next]');
        var prev = hero.querySelector('[data-hero-prev]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function render(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            clearInterval(timer);
            timer = setInterval(function () {
                render(index + 1);
            }, 5200);
        }

        if (next) {
            next.addEventListener('click', function () {
                render(index + 1);
                start();
            });
        }
        if (prev) {
            prev.addEventListener('click', function () {
                render(index - 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                render(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        render(0);
        start();
    }

    function setupSearch() {
        var input = document.getElementById('site-search');
        if (!input) {
            return;
        }
        var clearButton = document.querySelector('[data-clear-search]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
        var empty = document.querySelector('[data-empty-state]');

        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [
                    card.getAttribute('data-title') || '',
                    card.getAttribute('data-region') || '',
                    card.getAttribute('data-year') || '',
                    card.getAttribute('data-tags') || ''
                ].join(' ').toLowerCase();
                var matched = !keyword || haystack.indexOf(keyword) !== -1;
                card.classList.toggle('is-filtered', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        input.addEventListener('input', apply);
        if (clearButton) {
            clearButton.addEventListener('click', function () {
                input.value = '';
                apply();
                input.focus();
            });
        }
    }

    function setupPlayer() {
        var video = document.getElementById('movie-player');
        if (!video) {
            return;
        }
        var stream = video.getAttribute('data-stream') || '';
        var cover = document.querySelector('[data-player-cover]');
        var button = document.querySelector('[data-play-button]');
        var connected = false;
        var hlsInstance = null;

        function connect() {
            if (connected || !stream) {
                return;
            }
            connected = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    maxBufferLength: 30,
                    enableWorker: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = stream;
        }

        function play() {
            connect();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.setAttribute('controls', 'controls');
            var action = video.play();
            if (action && typeof action.catch === 'function') {
                action.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', play);
        }
        if (cover) {
            cover.addEventListener('click', play);
        }
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayer();
    });
})();
