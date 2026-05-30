(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }
    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }
    var menuButton = qs('[data-menu-toggle]');
    var menu = qs('[data-mobile-menu]');
    if (menuButton && menu) {
        menuButton.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
        qsa('[data-mobile-link]', menu).forEach(function (link) {
            link.addEventListener('click', function () {
                menu.classList.remove('is-open');
            });
        });
    }
    var hero = qs('[data-hero]');
    if (hero) {
        var slides = qsa('[data-hero-slide]', hero);
        var dots = qsa('[data-hero-dot]', hero);
        var index = 0;
        function show(next) {
            if (!slides.length) return;
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
            });
        }
        var nextButton = qs('[data-hero-next]', hero);
        var prevButton = qs('[data-hero-prev]', hero);
        if (nextButton) nextButton.addEventListener('click', function (event) {
            event.preventDefault();
            show(index + 1);
        });
        if (prevButton) prevButton.addEventListener('click', function (event) {
            event.preventDefault();
            show(index - 1);
        });
        dots.forEach(function (dot) {
            dot.addEventListener('click', function (event) {
                event.preventDefault();
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            show(index + 1);
        }, 5000);
    }
    qsa('[data-filter-panel]').forEach(function (panel) {
        var scope = panel.parentElement || document;
        var list = qs('[data-filter-list]', scope);
        if (!list) return;
        var cards = qsa('.movie-card', list);
        var query = qs('[data-filter-query]', panel);
        var type = qs('[data-filter-type]', panel);
        var year = qs('[data-filter-year]', panel);
        var empty = qs('[data-filter-empty]', scope);
        function yearMatch(value, decade) {
            if (!decade) return true;
            var match = String(value || '').match(/\d{4}/);
            if (!match) return false;
            var y = Number(match[0]);
            if (decade === '1990') return y < 2000;
            return y >= Number(decade) && y < Number(decade) + 10;
        }
        function apply() {
            var text = (query && query.value || '').trim().toLowerCase();
            var selectedType = type && type.value || '';
            var selectedYear = year && year.value || '';
            var visible = 0;
            cards.forEach(function (card) {
                var haystack = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.tags, card.dataset.type, card.dataset.year].join(' ').toLowerCase();
                var ok = (!text || haystack.indexOf(text) !== -1) && (!selectedType || (card.dataset.type || '').indexOf(selectedType) !== -1) && yearMatch(card.dataset.year, selectedYear);
                card.classList.toggle('hidden', !ok);
                if (ok) visible += 1;
            });
            if (empty) empty.classList.toggle('hidden', visible !== 0);
        }
        [query, type, year].forEach(function (node) {
            if (node) node.addEventListener('input', apply);
            if (node) node.addEventListener('change', apply);
        });
    });
})();
function initMoviePlayer(video, layer, streamUrl) {
    if (!video || !layer || !streamUrl) return;
    var loaded = false;
    var hlsInstance = null;
    function attach() {
        if (loaded) return;
        loaded = true;
        video.setAttribute('controls', 'controls');
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({ enableWorker: true, lowLatencyMode: true });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
        layer.classList.add('is-hidden');
        var playing = video.play();
        if (playing && typeof playing.catch === 'function') {
            playing.catch(function () {});
        }
    }
    layer.addEventListener('click', attach);
    video.addEventListener('click', function () {
        if (!loaded) attach();
    });
    window.addEventListener('pagehide', function () {
        if (hlsInstance) hlsInstance.destroy();
    });
}
