(function () {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  });

  document.querySelectorAll('[data-filter-list]').forEach(function (list) {
    var scope = list.closest('section') || document;
    var searchInput = scope.querySelector('[data-search-input]');
    var genreSelect = scope.querySelector('[data-filter-genre]');
    var yearSelect = scope.querySelector('[data-filter-year]');
    var emptyState = scope.querySelector('[data-empty-state]');
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-title]'));

    function textOf(card) {
      return [
        card.getAttribute('data-title'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-region'),
        card.getAttribute('data-year')
      ].join(' ').toLowerCase();
    }

    function applyFilter() {
      var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var genre = genreSelect ? genreSelect.value.trim() : '';
      var year = yearSelect ? yearSelect.value.trim() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = textOf(card);
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesGenre = !genre || (card.getAttribute('data-genre') || '').indexOf(genre) !== -1;
        var matchesYear = !year || (card.getAttribute('data-year') || '') === year;
        var shouldShow = matchesQuery && matchesGenre && matchesYear;

        card.classList.toggle('is-hidden-by-filter', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('show', visible === 0);
      }
    }

    [searchInput, genreSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });
  });

  function loadHlsLibrary(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');

    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function onceReady(video, callback) {
    if (video.readyState >= 1) {
      callback();
      return;
    }

    video.addEventListener('loadedmetadata', callback, { once: true });
    video.addEventListener('canplay', callback, { once: true });
  }

  function attachSource(video, source, callback) {
    if (!source) {
      callback();
      return;
    }

    if (video.dataset.loaded === 'true') {
      callback();
      return;
    }

    video.dataset.loaded = 'true';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      onceReady(video, callback);
      return;
    }

    loadHlsLibrary(function () {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });

        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          callback();
        });

        hls.on(window.Hls.Events.ERROR, function () {
          if (!video.src) {
            video.src = source;
            onceReady(video, callback);
          }
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        video._hlsInstance = hls;
      } else {
        video.src = source;
        onceReady(video, callback);
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video[data-src]');
    var button = player.querySelector('[data-play-button]');
    var playRequested = false;

    if (!video) {
      return;
    }

    function requestPlay() {
      if (playRequested && video.dataset.loaded === 'true') {
        var currentPromise = video.play();

        if (currentPromise && typeof currentPromise.catch === 'function') {
          currentPromise.catch(function () {});
        }

        return;
      }

      playRequested = true;

      attachSource(video, video.getAttribute('data-src'), function () {
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }

        if (button) {
          button.classList.add('is-hidden');
        }
      });
    }

    if (button) {
      button.addEventListener('click', requestPlay);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        requestPlay();
      }
    });

    video.addEventListener('play', function () {
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('ended', function () {
      if (button) {
        button.classList.remove('is-hidden');
      }
    });
  });
})();
