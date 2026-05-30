(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-hidden', slideIndex !== current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var panel = document.querySelector('[data-search-panel]');
  var searchInput = document.querySelector('[data-global-search]');
  var results = document.querySelector('[data-search-results]');
  var openButtons = document.querySelectorAll('[data-search-open]');
  var closeButton = document.querySelector('[data-search-close]');

  function openSearch() {
    if (!panel) {
      return;
    }

    panel.classList.add('is-open');
    document.body.classList.add('is-locked');

    if (searchInput) {
      window.setTimeout(function () {
        searchInput.focus();
      }, 30);
    }
  }

  function closeSearch() {
    if (!panel) {
      return;
    }

    panel.classList.remove('is-open');
    document.body.classList.remove('is-locked');
  }

  openButtons.forEach(function (button) {
    button.addEventListener('click', openSearch);
  });

  if (closeButton) {
    closeButton.addEventListener('click', closeSearch);
  }

  if (panel) {
    panel.addEventListener('click', function (event) {
      if (event.target === panel) {
        closeSearch();
      }
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeSearch();
    }
  });

  function renderSearch(items, query) {
    if (!results) {
      return;
    }

    if (!query) {
      results.innerHTML = '';
      return;
    }

    var matched = items.filter(function (item) {
      var haystack = [item.title, item.year, item.region, item.type, item.genre, item.tags].join(' ').toLowerCase();
      return haystack.indexOf(query) > -1;
    }).slice(0, 24);

    if (!matched.length) {
      results.innerHTML = '<div class="empty-state is-visible">没有匹配的影片</div>';
      return;
    }

    var prefix = currentPagePrefix();

    results.innerHTML = matched.map(function (item) {
      return [
        '<a class="search-result" href="' + prefix + item.url + '">',
        '<img src="' + prefix + item.cover + '" alt="' + escapeHtml(item.title) + '">',
        '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.genre) + '</span></span>',
        '</a>'
      ].join('');
    }).join('');
  }

  if (searchInput && results && window.siteMovieIndex) {
    searchInput.addEventListener('input', function () {
      renderSearch(window.siteMovieIndex, searchInput.value.trim().toLowerCase());
    });
  }

  var localInput = document.querySelector('[data-local-filter]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function applyLocalFilter() {
    var keyword = localInput ? localInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category')
      ].join(' ').toLowerCase();
      var yearMatch = !year || card.getAttribute('data-year') === year;
      var keywordMatch = !keyword || haystack.indexOf(keyword) > -1;
      var show = yearMatch && keywordMatch;

      card.classList.toggle('is-hidden', !show);

      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', visible === 0);
    }
  }

  if (localInput) {
    localInput.addEventListener('input', applyLocalFilter);
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', applyLocalFilter);
  }

  var players = document.querySelectorAll('[data-player]');

  players.forEach(function (player) {
    var button = player.querySelector('[data-play-button]');
    var video = player.querySelector('video');
    var stream = player.getAttribute('data-stream');
    var prepared = false;

    function prepareVideo() {
      if (prepared || !video || !stream) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      video.controls = true;
      prepared = true;
    }

    function playVideo() {
      prepareVideo();
      player.classList.add('is-playing');

      if (video) {
        var playPromise = video.play();

        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            video.controls = true;
          });
        }
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!prepared) {
          playVideo();
        }
      });
    }
  });

  function currentPagePrefix() {
    var path = window.location.pathname.replace(/\\/g, '/');

    if (path.indexOf('/details/') > -1 || path.indexOf('/categories/') > -1) {
      return '../';
    }

    return '';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (character) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[character];
    });
  }
})();
