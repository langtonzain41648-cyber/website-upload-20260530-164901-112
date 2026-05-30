(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-menu]');

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

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

    function next() {
      show(current + 1);
    }

    function startTimer() {
      timer = window.setInterval(next, 5000);
    }

    function resetTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      startTimer();
    }

    var prevButton = hero.querySelector('[data-hero-prev]');
    var nextButton = hero.querySelector('[data-hero-next]');

    if (prevButton) {
      prevButton.addEventListener('click', function () {
        show(current - 1);
        resetTimer();
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', function () {
        show(current + 1);
        resetTimer();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        resetTimer();
      });
    });

    show(0);
    startTimer();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var select = scope.querySelector('[data-year-filter]');
    var list = document.querySelector('[data-card-list]');

    if (!list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var year = select ? select.value : '';

      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var yearMatched = !year || card.getAttribute('data-year') === year;
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        card.classList.toggle('is-hidden', !(yearMatched && keywordMatched));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });

  document.querySelectorAll('.js-player').forEach(function (panel) {
    var video = panel.querySelector('video');
    var overlay = panel.querySelector('.player-overlay');
    var stream = panel.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function attachStream() {
      if (ready || !video || !stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls();
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function begin() {
      attachStream();
      panel.classList.add('is-playing');
      var attempt = video.play();

      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', begin);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          begin();
        }
      });
      video.addEventListener('play', function () {
        panel.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        if (hls && typeof hls.destroy === 'function') {
          hls.destroy();
          hls = null;
          ready = false;
        }
      });
    }
  });
})();
