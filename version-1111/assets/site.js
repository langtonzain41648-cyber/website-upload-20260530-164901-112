(() => {
  const menuButton = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  const bindSearch = input => {
    const panel = input.parentElement.querySelector('[data-search-results]');
    if (!panel) {
      return;
    }

    const render = value => {
      const term = value.trim().toLowerCase();
      if (!term) {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        return;
      }

      const source = Array.isArray(window.SEARCH_INDEX) ? window.SEARCH_INDEX : [];
      const matches = source.filter(item => {
        return [item.title, item.year, item.region, item.type, item.category]
          .join(' ')
          .toLowerCase()
          .includes(term);
      }).slice(0, 12);

      if (matches.length === 0) {
        panel.innerHTML = '<div class="search-empty">暂无匹配内容</div>';
      } else {
        panel.innerHTML = matches.map(item => {
          return `<a href="${item.url}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.region)} · ${escapeHtml(item.type)} · ${escapeHtml(item.year)}</span></a>`;
        }).join('');
      }

      panel.classList.add('is-open');
    };

    input.addEventListener('input', event => render(event.target.value));
    input.addEventListener('focus', event => render(event.target.value));
    document.addEventListener('click', event => {
      if (!input.parentElement.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  };

  document.querySelectorAll('[data-global-search]').forEach(bindSearch);

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    const show = index => {
      if (slides.length === 0) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === active));
      dots.forEach((dot, dotIndex) => dot.classList.toggle('is-active', dotIndex === active));
    };

    const start = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => show(active + 1), 5200);
    };

    if (prev) {
      prev.addEventListener('click', () => {
        show(active - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', () => {
        show(active + 1);
        start();
      });
    }

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        show(index);
        start();
      });
    });

    show(0);
    start();
  }

  const list = document.querySelector('[data-card-list]');
  const filterInput = document.querySelector('[data-card-filter]');
  const typeFilter = document.querySelector('[data-type-filter]');

  if (list && (filterInput || typeFilter)) {
    const cards = Array.from(list.children);
    const applyFilter = () => {
      const term = filterInput ? filterInput.value.trim().toLowerCase() : '';
      const type = typeFilter ? typeFilter.value : '';

      cards.forEach(card => {
        const text = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.type]
          .join(' ')
          .toLowerCase();
        const typeOk = !type || card.dataset.type === type;
        const termOk = !term || text.includes(term);
        card.classList.toggle('is-filtered-out', !(typeOk && termOk));
      });
    };

    if (filterInput) {
      filterInput.addEventListener('input', applyFilter);
    }

    if (typeFilter) {
      typeFilter.addEventListener('change', applyFilter);
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }
})();
