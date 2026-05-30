(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        showSlide(i);
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5000);
    }

    var searchInput = document.querySelector('[data-card-search]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title][data-meta]'));
    var empty = document.querySelector('[data-empty-result]');

    if (searchInput && cards.length) {
      searchInput.addEventListener('input', function () {
        var query = searchInput.value.trim().toLowerCase();
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
          var matched = !query || haystack.indexOf(query) !== -1;
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.style.display = visible ? 'none' : 'block';
        }
      });
    }

    var video = document.querySelector('video[data-hls]');
    if (!video) {
      return;
    }

    var source = video.getAttribute('data-hls');
    var overlay = document.querySelector('[data-video-overlay]');
    var playButton = document.querySelector('[data-video-play]');

    function loadVideo() {
      if (!source) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.src !== source) {
          video.src = source;
        }
      } else if (window.Hls && window.Hls.isSupported()) {
        if (!video._hlsReady) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hlsReady = true;
        }
      } else {
        video.src = source;
      }
    }

    function playVideo() {
      loadVideo();
      var promise = video.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          if (overlay) {
            overlay.classList.add('hidden');
          }
        }).catch(function () {
          if (overlay) {
            overlay.classList.remove('hidden');
          }
        });
      }
    }

    loadVideo();

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('hidden');
      }
    });
  });
})();
