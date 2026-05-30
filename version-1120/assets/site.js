(function () {
  const menuButton = document.querySelector(".menu-toggle");
  const mobileNav = document.querySelector(".mobile-nav");
  if (menuButton && mobileNav) {
    menuButton.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  const sliders = document.querySelectorAll(".hero-slider");
  sliders.forEach(function (slider) {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    let current = 0;
    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });
    setInterval(function () {
      showSlide(current + 1);
    }, 5600);
  });

  const filterInput = document.querySelector(".filter-input");
  const sortSelect = document.querySelector(".sort-select");
  const grid = document.querySelector(".filter-grid");
  function applyFilter() {
    if (!grid) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll(".movie-card, .library-list > a"));
    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title || "",
        card.dataset.region || "",
        card.dataset.type || "",
        card.dataset.genre || ""
      ].join(" ").toLowerCase();
      card.style.display = haystack.includes(keyword) ? "" : "none";
    });
  }
  function applySort() {
    if (!grid || !sortSelect) {
      return;
    }
    const cards = Array.from(grid.querySelectorAll(".movie-card, .library-list > a"));
    const mode = sortSelect.value;
    cards.sort(function (a, b) {
      if (mode === "old") {
        return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
      }
      if (mode === "title") {
        return (a.dataset.title || "").localeCompare(b.dataset.title || "", "zh-Hans-CN");
      }
      return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
    });
    cards.forEach(function (card) {
      grid.appendChild(card);
    });
    applyFilter();
  }
  if (filterInput) {
    filterInput.addEventListener("input", applyFilter);
  }
  if (sortSelect) {
    sortSelect.addEventListener("change", applySort);
  }

  const searchBox = document.querySelector("#site-search-input");
  const searchResults = document.querySelector("#site-search-results");
  const searchForm = document.querySelector("#site-search-form");
  function renderSearch(keyword) {
    if (!searchResults || !Array.isArray(window.SEARCH_MOVIES)) {
      return;
    }
    const q = (keyword || "").trim().toLowerCase();
    if (!q) {
      searchResults.innerHTML = '<div class="empty-note">输入片名、地区、类型或年份即可浏览匹配影片。</div>';
      return;
    }
    const items = window.SEARCH_MOVIES.filter(function (item) {
      return [item.title, item.region, item.type, item.genre, String(item.year)].join(" ").toLowerCase().includes(q);
    }).slice(0, 80);
    if (!items.length) {
      searchResults.innerHTML = '<div class="empty-note">暂未匹配到相关影片。</div>';
      return;
    }
    searchResults.innerHTML = items.map(function (item) {
      return '<a class="rank-item" href="./' + item.url + '">' +
        '<span class="rank-num">' + item.year + '</span>' +
        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
        '<span class="rank-info"><strong>' + escapeHtml(item.title) + '</strong><small>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.genre) + '</small></span>' +
        '</a>';
    }).join("");
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }
  if (searchBox && searchResults) {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q") || "";
    searchBox.value = q;
    renderSearch(q);
    searchBox.addEventListener("input", function () {
      renderSearch(searchBox.value);
    });
  }
  if (searchForm) {
    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      renderSearch(searchBox.value);
    });
  }
}());
