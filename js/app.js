// LAVA Dental Studio - Master Interactive Engine
(function () {
  let currentLang = 'en';
  let activeTeamCategory = 'dental';
  let activePricingIndex = 0;

  // 1. Hero & About Video Buttons & Autoplay
  function initVideoButtons() {
    const heroBtn = document.getElementById('btn-hero-video') || document.querySelector('.hero .video-dialog__button');
    if (heroBtn) {
      heroBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.openVideoModal('assets/videos/hero.webm');
      };
    }

    const aboutBtn = document.getElementById('btn-about-video') || document.querySelector('.about-apply-box .video-dialog__button');
    if (aboutBtn) {
      aboutBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.openVideoModal('assets/videos/about.webm');
      };
    }

    // Ensure preview videos are playing
    document.querySelectorAll('.video-dialog__preview').forEach(video => {
      video.muted = true;
      video.play().catch(() => {});
    });
  }

  // 2. Marching Squares Topographic Contour Animation on Canvas
  function initContourCanvas() {
    const canvas = document.querySelector('canvas.lava-bg-illustration');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const I = 1920, R = 1230, T = 200, ae = 1.2;
    const v = Math.round(T * (R / I));
    const S = [-1.8, -0.9, 0, 0.9, 1.8];
    let L = 126;

    const d = (a, e) => {
      const t = Math.sin(L++) * 43758.5453;
      return (t - Math.floor(t)) * (e - a) + a;
    };

    const B = [];
    function C(a, e, t, o) {
      const s = d(a, e), r = d(t, o);
      B.push({
        x: s, y: r,
        freqBase: d(55e-7, 75e-7),
        scaleX: d(0.55, 1.2), scaleY: d(0.65, 1.2),
        angle: d(-0.5, 0.5), speed: d(-0.2, 0.5), amp: d(0.55, 1.1)
      });
    }
    [[0.1, 0.25, 0.18, 0.38], [0.3, 0.45, 0.18, 0.38], [0.55, 0.7, 0.18, 0.38], [0.3, 0.45, 0.55, 0.75], [0.55, 0.7, 0.55, 0.75], [0.75, 0.9, 0.55, 0.75]].forEach(a => C(...a));

    function Y(a, e, t) {
      const o = Math.cos(t), s = Math.sin(t);
      return { x: o * a - s * e, y: s * a + o * e };
    }

    function $(a, e, t) {
      let o = 0.15 * Math.sin(a * 5e-4 + t * 0.04) * Math.cos(e * 5e-4 - t * 0.03);
      for (const s of B) {
        const r = a - s.x * I, i = e - s.y * R, n = Y(r, i, s.angle);
        n.x /= s.scaleX; n.y /= s.scaleY;
        const l = n.x * n.x + n.y * n.y;
        o += s.amp * Math.sin(l * s.freqBase * ae + t * s.speed);
      }
      return o;
    }

    function z(a) {
      const e = Array.from({ length: v + 1 }, () => new Float32Array(T + 1));
      for (let t = 0; t <= v; t++) {
        const o = (t / v) * R;
        for (let s = 0; s <= T; s++) {
          const r = (s / T) * I;
          e[t][s] = $(r, o, a);
        }
      }
      return e;
    }

    function c(a, e, t, o, s) {
      const r = (s - t) / (o - t || 1e-9);
      return { x: a.x + (e.x - a.x) * r, y: a.y + (e.y - a.y) * r };
    }

    function O(a, e) {
      const t = [], o = I / T, s = R / v;
      for (let r = 0; r < v; r++) {
        for (let i = 0; i < T; i++) {
          const n = a[r][i], l = a[r][i + 1], _ = a[r + 1][i + 1], m = a[r + 1][i];
          const w = i * o, H = r * s;
          const f = { x: w, y: H }, k = { x: w + o, y: H }, b = { x: w + o, y: H + s }, y = { x: w, y: H + s };
          let M = 0;
          if (n >= e) M |= 1;
          if (l >= e) M |= 2;
          if (_ >= e) M |= 4;
          if (m >= e) M |= 8;
          switch (M) {
            case 0: case 15: break;
            case 1: case 14: t.push([c(f, k, n, l, e), c(f, y, n, m, e)]); break;
            case 2: case 13: t.push([c(f, k, n, l, e), c(k, b, l, _, e)]); break;
            case 3: case 12: t.push([c(k, b, l, _, e), c(f, y, n, m, e)]); break;
            case 4: case 11: t.push([c(k, b, l, _, e), c(b, y, _, m, e)]); break;
            case 5: t.push([c(f, k, n, l, e), c(f, y, n, m, e)]), t.push([c(k, b, l, _, e), c(b, y, _, m, e)]); break;
            case 6: case 9: t.push([c(f, k, n, l, e), c(b, y, _, m, e)]); break;
            case 7: case 8: t.push([c(f, y, n, m, e), c(b, y, _, m, e)]); break;
            case 10: t.push([c(f, k, n, l, e), c(k, b, l, _, e)]), t.push([c(f, y, n, m, e), c(b, y, _, m, e)]); break;
          }
        }
      }
      return t;
    }

    let animFrame = null;
    function render() {
      const t = performance.now() * 0.001;
      const grid = z(t);
      ctx.clearRect(0, 0, I, R);
      ctx.strokeStyle = '#2b4642';
      for (let o = 0; o < S.length; o++) {
        const s = S[o];
        const segs = O(grid, s);
        ctx.lineWidth = (o === 0 || o === 2) ? 4 : 2;
        for (const [p1, p2] of segs) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
      animFrame = requestAnimationFrame(render);
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!animFrame) animFrame = requestAnimationFrame(render);
        } else {
          if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
        }
      });
    }, { threshold: 0.05 });
    observer.observe(canvas);
  }

  // 3. Wheel Block Interactive Rotation & Steps
  function initWheelBlock() {
    const wheelSvg = document.querySelector('.wheel-block-wheel__svg');
    const steps = document.querySelectorAll('.wheel-step');
    const items = document.querySelectorAll('.wheel-block-wheel__item');
    const triggers = document.querySelectorAll('.wheel-block__trigger');
    if (!wheelSvg || !steps.length || !items.length) return;

    function setStep(nr) {
      const deg = (nr - 1) * -60;
      wheelSvg.style.transform = `rotate(${deg}deg)`;
      wheelSvg.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

      steps.forEach((step, idx) => {
        if (idx + 1 === nr) {
          step.classList.add('wheel-step--active');
        } else {
          step.classList.remove('wheel-step--active');
        }
      });

      items.forEach((item, idx) => {
        const title = item.querySelector('.wheel-block-wheel__item-title');
        const desc = item.querySelector('.wheel-block-wheel__item-description');
        if (idx + 1 === nr) {
          item.classList.add('wheel-block-wheel__item--active');
          item.style.opacity = '1';
          item.style.visibility = 'visible';
          item.style.pointerEvents = 'auto';
          if (title) {
            title.style.opacity = '1';
            title.style.visibility = 'visible';
          }
          if (desc) {
            desc.style.opacity = '1';
            desc.style.visibility = 'visible';
          }
        } else {
          item.classList.remove('wheel-block-wheel__item--active');
          item.style.opacity = '0';
          item.style.visibility = 'hidden';
          item.style.pointerEvents = 'none';
          if (title) {
            title.style.opacity = '0';
            title.style.visibility = 'hidden';
          }
          if (desc) {
            desc.style.opacity = '0';
            desc.style.visibility = 'hidden';
          }
        }
      });
    }

    // Set Step 1 visible immediately on load
    setStep(1);

    steps.forEach((step, idx) => {
      step.style.cursor = 'pointer';
      step.addEventListener('click', () => setStep(idx + 1));
    });

    if (triggers.length) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const nr = parseInt(entry.target.dataset.nr, 10);
            if (nr) setStep(nr);
          }
        });
      }, { threshold: 0, rootMargin: '-40% 0px -40% 0px' });

      triggers.forEach(t => observer.observe(t));
    }
  }

  // 4. Manifest Image Carousel
  function initManifestCarousel() {
    const carousel = document.querySelector('.about-manifest .image-carousel');
    if (!carousel) return;

    const images = carousel.querySelectorAll('.image-carousel__image');
    const dots = carousel.querySelectorAll('.carousel-autoplay__dot');
    const playBtn = carousel.querySelector('.carousel-autoplay__button');
    if (!images.length || !dots.length) return;

    let currentIndex = 0;
    let isPlaying = true;
    let timer = null;

    function showSlide(idx) {
      currentIndex = (idx + images.length) % images.length;
      images.forEach((img, i) => {
        img.style.display = i === currentIndex ? 'block' : 'none';
      });
      dots.forEach((dot, i) => {
        if (i === currentIndex) {
          dot.classList.add('carousel-autoplay__dot--active');
        } else {
          dot.classList.remove('carousel-autoplay__dot--active');
        }
      });
    }

    function nextSlide() {
      showSlide(currentIndex + 1);
    }

    function startAutoplay() {
      stopAutoplay();
      isPlaying = true;
      timer = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
      isPlaying = false;
      if (timer) { clearInterval(timer); timer = null; }
    }

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        showSlide(i);
        startAutoplay();
      });
    });

    if (playBtn) {
      playBtn.addEventListener('click', () => {
        if (isPlaying) {
          stopAutoplay();
        } else {
          startAutoplay();
        }
      });
    }

    showSlide(0);
    startAutoplay();
  }

  // 4b. Process Carousel Scroll Animation Fallback (if native CSS animation-timeline is not active)
  function initProcessCarouselFallback() {
    const items = document.querySelector('.about-process-carousel__items');
    const spacer = document.querySelector('.about-process-carousel-spacer');
    if (!items || !spacer) return;

    // In modern browsers supporting CSS animation-timeline, CSS handles it directly with zero JS overhead
    if (window.CSS && CSS.supports && (CSS.supports('animation-timeline', 'scroll()') || CSS.supports('animation-timeline', '--test'))) {
      return;
    }

    function onScroll() {
      const rect = spacer.getBoundingClientRect();
      const spacerTop = rect.top;
      const spacerHeight = rect.height;
      const windowHeight = window.innerHeight;

      const scrollDist = -spacerTop;
      const totalDist = spacerHeight - windowHeight;
      if (totalDist <= 0) return;

      const progress = Math.max(0, Math.min(1, scrollDist / totalDist));
      const translateVW = -400 * progress;
      items.style.transform = `translateX(${translateVW}vw)`;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 5. Portfolio Section
  function initPortfolio() {
    const data = window.LAVA_DATA[currentLang] || window.LAVA_DATA.en;
    const portfolioGrid = document.querySelector('.showcase-portfolio-grid');
    if (!portfolioGrid) return;

    // Bind existing buttons
    const buttons = portfolioGrid.querySelectorAll('.showcase-portfolio-box__button');
    buttons.forEach((btn, idx) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const item = data.portfolioData[idx];
        if (item) window.openPortfolioModal(item.id);
      };
    });

    // "Show more" button
    const moreBtn = document.querySelector('.showcase-portfolio__actions button');
    if (moreBtn) {
      moreBtn.onclick = (e) => {
        e.preventDefault();
        const remaining = data.portfolioData.slice(10);
        remaining.forEach((item, rIdx) => {
          const actualIdx = 10 + rIdx;
          const isTall = actualIdx === 10 || actualIdx === 17;
          const box = document.createElement('div');
          box.className = `showcase-portfolio-grid__item showcase-portfolio-box ${isTall ? 'showcase-portfolio-grid__item--tall' : ''}`;
          box.innerHTML = `
            <button class="showcase-portfolio-box__button" aria-label="Open portfolio item">
              <div class="media-item showcase-portfolio-box__media">
                <img class="media-item__asset" src="${item.preview || item.after || item.before}" alt="Patient smile ${actualIdx + 1}" loading="lazy" style="width:100%;height:100%;object-fit:cover;">
              </div>
              ${item.services && item.services.length ? `
                <div class="showcase-portfolio-box__tags">
                  ${item.services.map(s => `<span class="u-text-body-xsmall showcase-portfolio-box__tag u-bg-secondary">${s.title}</span>`).join('')}
                </div>
              ` : ''}
            </button>
          `;
          const btn = box.querySelector('.showcase-portfolio-box__button');
          btn.onclick = (ev) => {
            ev.preventDefault();
            window.openPortfolioModal(item.id);
          };
          portfolioGrid.appendChild(box);
        });

        const actionsContainer = document.querySelector('.showcase-portfolio__actions');
        if (actionsContainer) actionsContainer.style.display = 'none';
      };
    }
  }

  // 6. Services Section
  function initServices() {
    const data = window.LAVA_DATA[currentLang] || window.LAVA_DATA.en;
    const cards = document.querySelectorAll('.service-card');
    cards.forEach((card, idx) => {
      card.style.cursor = 'pointer';
      card.onclick = (e) => {
        e.preventDefault();
        const service = data.servicesData[idx];
        if (service) window.openServiceModal(service.id);
      };
    });

    const listItems = document.querySelectorAll('.service-list-item');
    listItems.forEach((item, idx) => {
      item.style.cursor = 'pointer';
      item.onclick = (e) => {
        e.preventDefault();
        const service = data.servicesData[idx + 5];
        if (service) window.openServiceModal(service.id);
      };
    });
  }

  // 7. Team Section
  function renderTeamCards() {
    const data = window.LAVA_DATA[currentLang] || window.LAVA_DATA.en;
    const teamGrid = document.querySelector('.team-member-grid');
    if (!teamGrid) return;

    const filtered = data.teamData.filter(m => m.category === activeTeamCategory);

    teamGrid.innerHTML = filtered.map(m => `
      <div class="team-member-grid__item team-member" data-id="${m.id}" style="cursor:pointer;">
        <div class="team-member__header" style="position:relative; aspect-ratio:3/4; overflow:hidden; border-radius:var(--space-size-2xs);">
          <img class="team-member__image image--loaded" src="${m.image}" alt="${m.name}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
          <div class="team-member__link">
            <div class="icon-button icon-button--type-secondary icon-button--size-small" style="width:36px; height:36px; border-radius:50%; background:var(--color-primary); color:var(--color-cream); display:flex; align-items:center; justify-content:center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.004 9.414 7.397 18.02l-1.414-1.414 8.606-8.607H6.004V6h12v12h-2V9.414Z"/>
              </svg>
            </div>
          </div>
        </div>
        <div class="team-member__info" style="margin-top:var(--space-size-s);">
          <h3 class="team-member__name u-text-body-large">${m.name}</h3>
          <p class="team-member__role u-text-body-xsmall" style="color:var(--color-primary-transparent-50);">${m.role}</p>
        </div>
      </div>
    `).join('');

    teamGrid.innerHTML += `
      <div class="team-member-grid__item team-member-grid__item--footer">
        <div class="vacancy-box u-bg-primary" style="background-color:var(--color-primary); color:var(--color-cream); border-radius:var(--space-size-2xs); padding:var(--space-size-l); display:flex; flex-direction:column; justify-content:space-between; height:100%;">
          <div>
            <h3 class="u-text-headings-small" style="color:var(--color-cream);">${data.team.careerTitle}</h3>
            <p class="u-text-body-small" style="margin-top:var(--space-size-s); color:var(--color-cream-transparent-80);">${data.team.careerSubtitle}</p>
          </div>
          <div style="margin-top:var(--space-size-l);">
            <a class="button button--primary" href="mailto:${data.contacts.email}?subject=Job Application">${data.team.careerCta}</a>
          </div>
        </div>
      </div>
    `;

    teamGrid.querySelectorAll('.team-member').forEach(card => {
      card.onclick = () => {
        const id = card.getAttribute('data-id');
        window.openTeamMemberModal(id);
      };
    });
  }

  function initTeam() {
    const tabs = document.querySelectorAll('.team-members__tabs .tabs__label');
    if (tabs.length >= 2) {
      tabs[0].onclick = (e) => {
        e.preventDefault();
        tabs[0].classList.add('tabs__label--active');
        tabs[1].classList.remove('tabs__label--active');
        activeTeamCategory = 'dental';
        renderTeamCards();
      };
      tabs[1].onclick = (e) => {
        e.preventDefault();
        tabs[1].classList.add('tabs__label--active');
        tabs[0].classList.remove('tabs__label--active');
        activeTeamCategory = 'admin';
        renderTeamCards();
      };
    }

    renderTeamCards();
  }

  // 8. Pricing Section
  function renderPricingContent() {
    const data = window.LAVA_DATA[currentLang] || window.LAVA_DATA.en;
    const categories = data.pricingData;
    const cat = categories[activePricingIndex];
    if (!cat) return;

    const contentContainer = document.querySelector('.pricing__items .tabs__content') || document.getElementById('pricing-items-content');
    if (!contentContainer) return;

    contentContainer.innerHTML = `
      <div class="pricing-items" style="display:grid; gap:var(--space-size-l);">
        ${cat.items.map(it => `
          <div class="pricing-item" style="border-bottom:1px solid var(--color-primary-transparent-20); padding-bottom:var(--space-size-l);">
            <div class="pricing-item__header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:var(--space-size-s);">
              <h3 class="pricing-item__title u-text-headings-medium" style="display:flex; align-items:center; gap:12px;">
                <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--color-accent); flex-shrink:0;"></span>
                ${it.title}
              </h3>
              <p class="pricing-item__price u-text-headings-medium" style="font-weight:600;">${it.price}€</p>
            </div>
            ${it.descriptionHtml ? `<div class="pricing-item__body u-wysiwyg" style="margin-top:var(--space-size-s);">${it.descriptionHtml}</div>` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  function initPricing() {
    const tabs = document.querySelectorAll('.pricing-items__tabs .tabs__labels .tabs__label');
    tabs.forEach((tab, idx) => {
      tab.onclick = (e) => {
        e.preventDefault();
        tabs.forEach(t => t.classList.remove('tabs__label--active'));
        tab.classList.add('tabs__label--active');
        activePricingIndex = idx;
        renderPricingContent();
      };
    });

    renderPricingContent();
  }

  // 9. FAQ Section & Accordion
  function initFaqAccordion() {
    const categories = document.querySelectorAll('.faq-category');
    categories.forEach(cat => {
      const catSummary = cat.querySelector(':scope > summary');
      if (catSummary && !catSummary.dataset.bound) {
        catSummary.dataset.bound = '1';
        catSummary.addEventListener('click', (e) => {
          e.preventDefault();
          const isOpen = cat.hasAttribute('open');
          if (isOpen) {
            cat.removeAttribute('open');
          } else {
            cat.setAttribute('open', '');
          }
        });
      }

      const items = cat.querySelectorAll('.faq-item');
      items.forEach(item => {
        const itemSummary = item.querySelector(':scope > summary');
        if (itemSummary && !itemSummary.dataset.bound) {
          itemSummary.dataset.bound = '1';
          itemSummary.addEventListener('click', (e) => {
            e.preventDefault();
            const isItemOpen = item.hasAttribute('open');
            if (isItemOpen) {
              item.removeAttribute('open');
            } else {
              item.setAttribute('open', '');
            }
          });
        }
      });
    });
  }

  function renderFaqContent(categories) {
    if (!categories || !categories.length) return;
    const container = document.querySelector('.faq-categories');
    if (!container) return;

    container.innerHTML = categories.map((cat, cIdx) => `
      <details class="details details--size-large faq-category" ${cIdx === 0 ? 'open' : ''} style="--delay:${(cIdx * 0.1).toFixed(1)}s;">
        <summary class="details__header">
          <div class="u-text-headings-small details__title">${cat.title}</div>
          <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" class="details__marker">
            <path class="details__marker-line-plus" fill="currentColor" d="M16.5 5h3v24h-3V5Z"></path>
            <path class="details__marker-line-minus" fill="currentColor" d="M30 15.5v3H6v-3h24Z"></path>
          </svg>
        </summary>
        <div class="details__body">
          <div class="faq-items">
            ${cat.items.map((item, iIdx) => `
              <details class="details details--size-small faq-item" ${cIdx === 0 && iIdx === 0 ? 'open' : ''} style="--delay:${(iIdx * 0.1).toFixed(1)}s;">
                <summary class="details__header">
                  <div class="u-text-body-large details__title">${item.question}</div>
                  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" class="details__marker">
                    <path class="details__marker-line-plus" fill="currentColor" d="M16.5 5h3v24h-3V5Z"></path>
                    <path class="details__marker-line-minus" fill="currentColor" d="M30 15.5v3H6v-3h24Z"></path>
                  </svg>
                </summary>
                <div class="details__body">
                  <div class="u-wysiwyg">
                    ${item.answerHtml}
                  </div>
                </div>
              </details>
            `).join('')}
          </div>
        </div>
      </details>
    `).join('');

    initFaqAccordion();
  }

  // 10. Language Switcher & Complete Translation
  function initLocaleSwitcher() {
    const localeNav = document.querySelector('.locale-navigation');
    const currentLocaleBtn = document.querySelector('.locale-navigation__current-locale');
    const availableLocales = document.querySelector('.locale-navigation__available-locales');

    if (currentLocaleBtn && localeNav) {
      currentLocaleBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        localeNav.classList.toggle('locale-navigation--open');
        if (availableLocales) {
          availableLocales.style.display = localeNav.classList.contains('locale-navigation--open') ? 'flex' : 'none';
        }
      };
    }

    if (availableLocales) {
      availableLocales.innerHTML = ['en', 'lv', 'ru'].filter(l => l !== currentLang).map(l => `
        <a class="header-navigation__link locale-navigation__link" href="javascript:void(0)" data-lang="${l}">${l.toUpperCase()}</a>
      `).join('');

      availableLocales.querySelectorAll('a').forEach(link => {
        link.onclick = (e) => {
          e.preventDefault();
          const l = link.getAttribute('data-lang');
          window.switchLanguage(l);
        };
      });
    }

    document.addEventListener('click', (e) => {
      if (localeNav && !localeNav.contains(e.target)) {
        localeNav.classList.remove('locale-navigation--open');
        if (availableLocales) availableLocales.style.display = 'none';
      }
    });
  }

  function updatePageLanguage(lang) {
    if (!window.LAVA_DATA || !window.LAVA_DATA[lang]) return;
    currentLang = lang;
    window.currentLanguage = lang;
    document.documentElement.lang = lang === 'en' ? 'en-US' : (lang === 'lv' ? 'lv-LV' : 'ru-RU');

    const data = window.LAVA_DATA[lang];

    // Document title
    document.title = lang === 'en'
      ? 'LAVA dental studio – Dentistry that will make you smile'
      : (lang === 'lv' ? 'LAVA dental studio – Zobārstniecība, kas liek smaidīt' : 'LAVA dental studio – Стоматология, которая заставит улыбнуться');

    // Current locale label
    const currentLabel = document.querySelector('.locale-navigation__current-locale span');
    if (currentLabel) currentLabel.textContent = lang.toUpperCase();

    // Nav items
    if (data.nav && Array.isArray(data.nav)) {
      data.nav.forEach(item => {
        const link = document.querySelector(`.site-navigation__link[href="#${item.id}"]`);
        if (link) link.textContent = item.label;
      });
    }

    // Hero section
    const heroTitle = document.querySelector('.hero__title');
    if (heroTitle && data.hero) heroTitle.textContent = data.hero.title;
    const heroBody = document.querySelector('.hero__body p');
    if (heroBody && data.hero) heroBody.textContent = data.hero.tagline || data.hero.body || '';
    const heroCta = document.querySelector('.hero__cta .button__text');
    if (heroCta && data.hero) heroCta.textContent = data.hero.ctaText || data.hero.cta || '';
    const heroLink = document.querySelector('.hero__cta');
    if (heroLink && data.hero && data.hero.ctaUrl) heroLink.href = data.hero.ctaUrl;
    const heroVideoText = document.querySelector('.hero__video-button .button__text');
    if (heroVideoText && data.hero && data.hero.playVideo) heroVideoText.textContent = data.hero.playVideo;

    // About Section
    if (data.about) {
      const processTitle = document.querySelector('.about-process__title');
      if (processTitle) processTitle.textContent = data.about.title;
      const slogan = document.querySelector('.about-process-carousel__slogan');
      if (slogan) slogan.textContent = data.about.subtitle || '';
      const expTitle = document.querySelector('.about-experience .section-title');
      if (expTitle) expTitle.textContent = data.about.featuresHeading || '';
      const applyTitles = document.querySelectorAll('.reveal-block__title');
      applyTitles.forEach(t => t.textContent = data.about.applyTitle || '');
      const applyDesc = document.querySelector('.about-apply-box__body .u-text-headings-small');
      if (applyDesc) applyDesc.textContent = data.about.applySubtitle || '';
      const applyBtn = document.querySelector('.about-apply-box__cta-button .button__text');
      if (applyBtn) applyBtn.textContent = data.about.applyCta || '';
      const applyLink = document.querySelector('.about-apply-box__cta-button');
      if (applyLink && data.hero && data.hero.ctaUrl) applyLink.href = data.hero.ctaUrl;

      // Wheel items
      if (data.about.features && Array.isArray(data.about.features)) {
        const wheelTitles = document.querySelectorAll('.wheel-block-wheel__item-title');
        const wheelDescs = document.querySelectorAll('.wheel-block-wheel__item-description');
        data.about.features.forEach((item, idx) => {
          if (wheelTitles[idx]) wheelTitles[idx].textContent = item.title;
          if (wheelDescs[idx]) wheelDescs[idx].textContent = item.desc || item.description || '';
        });
      }
    }

    // Services Titles
    if (data.services) {
      const servTitle = document.querySelector('.services__header h2');
      if (servTitle) servTitle.textContent = data.services.title;
    }
    if (data.servicesData && Array.isArray(data.servicesData)) {
      const cardTitles = document.querySelectorAll('.service-card__title');
      const listTitles = document.querySelectorAll('.service-list-item__title');
      data.servicesData.slice(0, 5).forEach((s, idx) => {
        if (cardTitles[idx]) cardTitles[idx].textContent = s.title;
      });
      data.servicesData.slice(5).forEach((s, idx) => {
        if (listTitles[idx]) listTitles[idx].textContent = s.title;
      });
    }

    // Showcase / Portfolio
    if (data.portfolio) {
      const portTitle = document.querySelector('.showcase-portfolio__header h2');
      if (portTitle) portTitle.textContent = data.portfolio.title;
      const moreBtnText = document.querySelector('.showcase-portfolio__actions button .button__text');
      if (moreBtnText) moreBtnText.textContent = data.portfolio.showMore;
    }

    // Team
    if (data.team) {
      const teamTitle = document.querySelector('.team__header h2');
      if (teamTitle) teamTitle.textContent = data.team.title;
      const teamSubs = document.querySelectorAll('.team .section-title, .team__header p');
      if (teamSubs[0] && data.team.subtitle1) teamSubs[0].textContent = data.team.subtitle1;
      const teamTabs = document.querySelectorAll('.team-members__tabs .tabs__label');
      if (teamTabs.length >= 2) {
        teamTabs[0].textContent = data.team.tabDental || data.team.dentalTeam;
        teamTabs[1].textContent = data.team.tabAdmin || data.team.adminTeam;
      }
    }
    renderTeamCards();

    // Pricing
    if (data.pricing) {
      const priceTitle = document.querySelector('.pricing__header h2');
      if (priceTitle) priceTitle.textContent = data.pricing.title;
      const priceNotice = document.querySelector('.pricing__notice');
      if (priceNotice) priceNotice.textContent = data.pricing.notice;
    }
    if (data.pricingData && Array.isArray(data.pricingData)) {
      const priceTabs = document.querySelectorAll('.pricing-items__tabs .tabs__labels .tabs__label');
      data.pricingData.forEach((cat, idx) => {
        if (priceTabs[idx]) priceTabs[idx].textContent = cat.title;
      });
    }
    renderPricingContent();

    // FAQ
    if (data.faq) {
      const faqTitle = document.querySelector('.faq__header h2');
      if (faqTitle) faqTitle.textContent = data.faq.title;
    }
    if (data.faqData) {
      renderFaqContent(data.faqData);
    }

    // Contacts
    if (data.contacts) {
      const contTitle = document.querySelector('.contacts-section__title, .contacts__header h2');
      if (contTitle) contTitle.textContent = data.contacts.title;
    }

    // Re-init locale switcher
    initLocaleSwitcher();
  }

  window.switchLanguage = function (lang) {
    updatePageLanguage(lang);
  };

  // 10. Mobile Menu
  function initMobileMenu() {
    const toggleBtn = document.querySelector('.menu-toggle-button');
    const header = document.querySelector('.header');
    if (!toggleBtn || !header) return;

    function openMenu() {
      header.classList.add('header--navigation-open');
      toggleBtn.classList.add('menu-toggle-button--active');
      document.body.style.overflow = 'hidden';
      if (window.lenis) window.lenis.stop();
    }

    function closeMenu() {
      header.classList.remove('header--navigation-open');
      toggleBtn.classList.remove('menu-toggle-button--active');
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    }

    toggleBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (header.classList.contains('header--navigation-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    const navLinks = header.querySelectorAll('.site-navigation__link, .header-navigation__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMenu();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('header--navigation-open')) {
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (header.classList.contains('header--navigation-open') && !header.contains(e.target)) {
        closeMenu();
      }
    });
  }

  // 11. Reading Progress Bar & Header Shadow
  function initScrollProgress() {
    const progressBar = document.querySelector('.header-progress-bar');
    const header = document.querySelector('.header');
    const sections = ['about', 'showcase', 'services', 'team', 'pricing', 'faq', 'contacts'];
    const navItems = document.querySelectorAll('.site-navigation__list-item');

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0 && progressBar) {
        progressBar.style.width = `${(scrollY / docHeight) * 100}%`;
      }

      if (header) {
        if (scrollY > 50) {
          header.classList.add('header--scrolled');
        } else {
          header.classList.remove('header--scrolled');
        }
      }

      let cur = '';
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            cur = id;
            break;
          }
        }
      }

      navItems.forEach(item => {
        const link = item.querySelector('a');
        if (link && link.getAttribute('href') === `#${cur}`) {
          item.classList.add('site-navigation__list-item--active');
        } else {
          item.classList.remove('site-navigation__list-item--active');
        }
      });
    }, { passive: true });
  }

  // 12. Lenis Smooth Scrolling Engine
  function initLenis() {
    if (typeof window.Lenis === 'undefined') return;

    const lenis = new window.Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
      autoRaf: false
    });
    window.lenis = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Smooth gliding for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href && href.length > 1) {
          const target = document.querySelector(href);
          if (target) {
            e.preventDefault();
            lenis.scrollTo(target, { offset: -60, duration: 1.25 });
          }
        }
      });
    });
  }

  // 13. Interactive Luxury Appointment Booking Flow
  function initBookingTriggers() {
    const bookingLinks = document.querySelectorAll('.hero__cta, .about-apply-box__cta-button, a[href="#booking"]');
    bookingLinks.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openBookingModal('Complex diagnostics');
      });
    });
  }

  // 14. Footer Vacancies Interaction
  function initVacanciesButton() {
    const vacBtns = document.querySelectorAll('.vacancies-button');
    vacBtns.forEach(vacBtn => {
      vacBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const teamSec = document.getElementById('team');
        if (teamSec) {
          if (window.lenis) {
            window.lenis.scrollTo(teamSec, { offset: -40, duration: 1.4 });
          } else {
            teamSec.scrollIntoView({ behavior: 'smooth' });
          }
          setTimeout(() => {
            const vacBox = document.querySelector('.vacancy-box');
            if (vacBox) {
              vacBox.classList.add('vacancy-box--highlight');
              setTimeout(() => vacBox.classList.remove('vacancy-box--highlight'), 3200);
            }
          }, 800);
        }
      });
    });
  }

  // 15. Contact Feedback Toasts
  function initContactToasts() {
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
      link.addEventListener('click', () => {
        const num = link.textContent.trim() || link.getAttribute('href').replace('tel:', '');
        if (window.showToast) window.showToast(`Clinic: ${num}`);
      });
    });

    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
      link.addEventListener('click', () => {
        const email = link.textContent.trim() || link.getAttribute('href').replace('mailto:', '');
        if (window.showToast) window.showToast(`Email: ${email}`);
      });
    });
  }

  // 16. Magnetic Micro-Interactions on CTA Buttons
  function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('.hero__cta, .hero__video-button, .about-apply-box__cta-button, .showcase-portfolio__actions button, .vacancies-button');
    magneticElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = '';
      });
    });
  }

  // 17. Staggered Scroll Reveal System
  function initScrollReveal() {
    const targets = document.querySelectorAll('.service-card, .service-list-item, .showcase-portfolio-grid__item, .team-member, .pricing-item, .faq-category, .section-title');
    targets.forEach(t => t.classList.add('reveal-on-scroll'));

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

      targets.forEach(t => observer.observe(t));
    } else {
      targets.forEach(t => t.classList.add('is-revealed'));
    }
  }

  // 18. Preloader Cleanup
  function initPreloader() {
    const preloader = document.getElementById('luxury-preloader');
    if (preloader) preloader.remove();
  }

  // 19. Concierge Search Triggers & Shortcuts
  function initSearchTriggers() {
    const headerSearchBtn = document.getElementById('header-search-btn');
    if (headerSearchBtn) {
      headerSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.openSearchModal) window.openSearchModal();
      });
    }

    const mobileSearchBtn = document.getElementById('mobile-search-btn');
    if (mobileSearchBtn) {
      mobileSearchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (window.openSearchModal) window.openSearchModal();
      });
    }

    // Global keyboard shortcut: Cmd+K / Ctrl+K / '/'
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (window.openSearchModal) window.openSearchModal();
      } else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        if (window.openSearchModal) window.openSearchModal();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    initLenis();
    initPreloader();
    initFaqAccordion();
    initSearchTriggers();
    initVideoButtons();
    initContourCanvas();
    initWheelBlock();
    initManifestCarousel();
    initProcessCarouselFallback();
    initPortfolio();
    initServices();
    initTeam();
    initPricing();
    initLocaleSwitcher();
    initMobileMenu();
    initScrollProgress();
    initBookingTriggers();
    initVacanciesButton();
    initContactToasts();
    initMagneticButtons();
    initScrollReveal();

    // Ensure all images are flagged as loaded
    document.querySelectorAll('img').forEach(img => {
      img.classList.add('image--loaded');
    });
  });
})();
