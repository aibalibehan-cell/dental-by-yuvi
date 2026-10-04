// LAVA Dental Studio - Comprehensive Modal Management
(function () {
  let activeModal = null;
  let closingTimer = null;

  function closeModal() {
    if (!activeModal) return;
    const modalToClose = activeModal;
    modalToClose.classList.remove('is-active');

    // If video was playing, pause it
    const video = modalToClose.querySelector('video');
    if (video) {
      video.pause();
      video.currentTime = 0;
    }

    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();

    if (closingTimer) clearTimeout(closingTimer);
    closingTimer = setTimeout(() => {
      if (modalToClose && modalToClose.parentNode) {
        modalToClose.remove();
      }
      if (activeModal === modalToClose) {
        activeModal = null;
      }
      closingTimer = null;
    }, 400);
  }

  function createModalContainer(extraClass = '') {
    if (closingTimer) {
      clearTimeout(closingTimer);
      closingTimer = null;
    }
    if (activeModal && activeModal.parentNode) {
      activeModal.remove();
    }
    activeModal = null;
    if (window.lenis) window.lenis.stop();

    const overlay = document.createElement('div');
    overlay.className = `dialog-overlay ${extraClass}`;

    const closeBtnSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 76 76" fill="none">
        <path stroke="currentColor" stroke-width="2" d="m30 46 2.104-2.103 2.977-2.978L46 30.001"></path>
        <path stroke="currentColor" stroke-width="2" d="M46.004 46 43.9 43.898l-2.977-2.978L30.005 30"></path>
      </svg>
    `;

    overlay.innerHTML = `
      <div class="dialog-content-wrapper">
        <button class="dialog-close-btn" aria-label="Close">${closeBtnSvg}</button>
        <div class="dialog-inner-content"></div>
      </div>
    `;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });

    overlay.querySelector('.dialog-close-btn').addEventListener('click', closeModal);

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Trigger enter animation
    requestAnimationFrame(() => {
      overlay.classList.add('is-active');
    });

    activeModal = overlay;
    return overlay;
  }

  // 1. Video Modal
  window.openVideoModal = function (src) {
    const overlay = createModalContainer('dialog-overlay--video');
    const wrapper = overlay.querySelector('.dialog-content-wrapper');
    wrapper.classList.add('dialog-content-wrapper--video');

    const inner = overlay.querySelector('.dialog-inner-content');
    inner.innerHTML = `
      <video class="video-dialog__full" controls autoplay playsinline style="width:100%; max-height:85vh; display:block; background:#000; border-radius:var(--space-size-2xs);">
        <source src="${src}" type="video/webm">
        <source src="${src}" type="video/mp4">
        Your browser does not support the video tag.
      </video>
    `;
  };

  // 2. Portfolio Case Modal
  window.openPortfolioModal = function (caseId) {
    const lang = window.currentLanguage || 'en';
    const data = window.LAVA_DATA[lang] || window.LAVA_DATA.en;
    const item = data.portfolioData.find(p => p.id === caseId);
    if (!item) return;

    const overlay = createModalContainer();
    const inner = overlay.querySelector('.dialog-inner-content');

    let mediaHtml = '';
    if (item.video && (!item.before || item.type === 'video')) {
      mediaHtml = `
        <div style="position:relative; border-radius:var(--space-size-2xs); overflow:hidden; aspect-ratio:16/9; background:#000;">
          <video src="${item.video}" controls autoplay playsinline loop style="width:100%; height:100%; object-fit:contain; display:block;"></video>
        </div>
      `;
    } else if (item.before && item.after) {
      mediaHtml = `
        <div class="image-compare-container">
          <img class="image-compare__image image-compare__image--after" src="${item.after}" alt="After treatment">
          <img class="image-compare__image image-compare__image--before" src="${item.before}" alt="Before treatment">
          <div class="image-compare__label image-compare__label--before">BEFORE</div>
          <div class="image-compare__label image-compare__label--after">AFTER</div>
          <div class="image-compare__line"></div>
          <div class="image-compare__handle">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="29.5" fill="#031C14" stroke="#031C14"/>
              <path fill="none" stroke="#DDEFDE" stroke-width="2" d="M17 30.5h26m-26 0 4.645-4.5M17 30.5l4.645 4.5M43 30.5 38.355 26M43 30.5 38.355 35"/>
            </svg>
          </div>
        </div>
        ${item.video ? `
          <div style="margin-top:var(--space-size-m); text-align:center;">
            <button class="button button--secondary" onclick="window.openVideoModal('${item.video}')" style="display:inline-flex; align-items:center; gap:8px;">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Watch Video
            </button>
          </div>
        ` : ''}
      `;
    } else {
      mediaHtml = `<img src="${item.preview || item.after || item.before}" alt="Treatment Result" style="width:100%; border-radius:var(--space-size-2xs); aspect-ratio:428/284; object-fit:cover;">`;
    }

    let servicesHtml = '';
    if (item.services && item.services.length) {
      servicesHtml = `
        <div class="open-portfolio-item__services" style="margin-top:var(--space-size-l);">
          <h3 class="u-text-headings-small" style="margin-bottom:var(--space-size-s);">${data.portfolio.aboutService}</h3>
          <div class="open-portfolio-item-services">
            ${item.services.map(s => `
              <div class="open-portfolio-item-services__item" style="border-bottom:1px solid var(--color-primary-transparent-20); padding:var(--space-size-xs) 0;">
                <button class="open-portfolio-item-service u-text-body-medium" onclick="window.openServiceModal('${s.id}')" style="display:flex; justify-content:space-between; align-items:center; width:100%; border:none; background:none; cursor:pointer; color:inherit; text-align:left;">
                  <span>${s.title}</span>
                  <span class="open-portfolio-item-service-button" style="display:inline-flex; align-items:center; gap:8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M18.53 10.53a.75.75 0 0 0 0-1.06l-4.773-4.773a.75.75 0 0 0-1.06 1.06L16.939 10l-4.242 4.243a.75.75 0 0 0 1.06 1.06zM2 10v.75h16v-1.5H2z"/>
                    </svg>
                  </span>
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    inner.innerHTML = `
      <div class="open-portfolio-item">
        <div class="open-portfolio-item__header">
          ${mediaHtml}
        </div>
        ${item.descriptionHtml ? `<div class="u-wysiwyg" style="margin-top:var(--space-size-m);">${item.descriptionHtml}</div>` : ''}
        ${servicesHtml}
        <div class="open-portfolio-item__actions" style="margin-top:var(--space-size-xl); text-align:center;">
          <button type="button" class="button button--secondary" onclick="window.openBookingModal()">${data.portfolio.applyCta}</button>
        </div>
      </div>
    `;

    if (item.before && item.after) {
      window.initComparisonSliders(inner);
    }
  };

  // 3. Service Detail Modal
  window.openServiceModal = function (serviceId) {
    const lang = window.currentLanguage || 'en';
    const data = window.LAVA_DATA[lang] || window.LAVA_DATA.en;
    const service = data.servicesData.find(s => s.id === serviceId);
    if (!service) return;

    const overlay = createModalContainer();
    const inner = overlay.querySelector('.dialog-inner-content');

    let pricingHtml = '';
    if (service.pricing && service.pricing.length) {
      pricingHtml = `
        <div class="open-service__pricing" style="margin-top:var(--space-size-l); border-top:1px solid var(--color-primary-transparent-20); padding-top:var(--space-size-m);">
          <h4 class="u-text-headings-small" style="margin-bottom:var(--space-size-m);">Pricing</h4>
          <div style="display:grid; gap:var(--space-size-s);">
            ${service.pricing.map(p => `
              <div class="open-service-pricing-item" style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px dashed var(--color-primary-transparent-20); padding-bottom:var(--space-size-2xs);">
                <h3 class="u-text-body-medium" style="margin:0; font-weight:500;">${p.title}</h3>
                <p class="u-text-body-medium" style="margin:0; font-weight:600;">${p.price}€</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    inner.innerHTML = `
      <div class="open-service">
        <div class="open-service__header" style="margin-bottom:var(--space-size-m);">
          <span class="u-text-body-small-accent" style="color:var(--color-primary-transparent-50);">${service.number}</span>
          <h2 class="u-text-headings-large" style="margin-top:var(--space-size-2xs);">${service.title}</h2>
        </div>
        ${service.image ? `
          <div style="margin-bottom:var(--space-size-m); overflow:hidden; border-radius:var(--space-size-2xs); aspect-ratio:16/9;">
            <img src="${service.image}" alt="${service.title}" style="width:100%; height:100%; object-fit:cover;">
          </div>
        ` : ''}
        ${service.descriptionHtml ? `<div class="u-wysiwyg">${service.descriptionHtml}</div>` : ''}
        ${pricingHtml}
        <div class="open-service__actions" style="margin-top:var(--space-size-xl); display:flex; gap:var(--space-size-s); align-items:center; justify-content:center; flex-wrap:wrap;">
          <button type="button" class="button button--secondary" onclick="window.openBookingModal('${service.title}')">${data.services.applyCta}</button>
          ${service.link ? `<a class="button button--outline" href="${service.link}" target="_blank" rel="noopener">${data.services.moreCta}</a>` : ''}
        </div>
      </div>
    `;
  };

  // 4. Team Member Modal
  window.openTeamMemberModal = function (memberId) {
    const lang = window.currentLanguage || 'en';
    const data = window.LAVA_DATA[lang] || window.LAVA_DATA.en;
    const member = data.teamData.find(m => m.id === memberId);
    if (!member) return;

    const overlay = createModalContainer('dialog-overlay--large');
    const inner = overlay.querySelector('.dialog-inner-content');

    inner.innerHTML = `
      <div class="open-team-member" style="display:grid; grid-template-columns:1fr; gap:var(--space-size-l);">
        <div class="open-team-member__aside" style="text-align:center;">
          <div class="open-team-member__image-container" style="max-width:320px; margin:0 auto; aspect-ratio:3/4; overflow:hidden; border-radius:var(--space-size-2xs);">
            <img class="open-team-member__image" src="${member.image}" alt="${member.name}" style="width:100%; height:100%; object-fit:cover;">
          </div>
          <h3 class="open-team-member__name u-text-headings-medium" style="margin-top:var(--space-size-m);">${member.name}</h3>
          <p class="open-team-member__role u-text-body-small-accent" style="color:var(--color-primary-transparent-50); margin-top:var(--space-size-3xs);">${member.role}</p>
        </div>
        <div class="open-team-member__body">
          <div class="u-wysiwyg">${member.descriptionHtml || `<p>${member.role}</p>`}</div>
        </div>
      </div>
    `;
  };

  // 5. Luxury Interactive Appointment Booking Drawer
  window.openBookingModal = function (preselectedService = '', preselectedDoctor = '') {
    const lang = window.currentLanguage || 'en';
    const data = window.LAVA_DATA[lang] || window.LAVA_DATA.en;

    const overlay = createModalContainer('dialog-overlay--booking');
    const inner = overlay.querySelector('.dialog-inner-content');

    const i18n = {
      en: {
        title: 'Schedule Your Visit',
        subtitle: 'Experience world-class digital dentistry at LAVA Dental Studio',
        step1: '1. Select Treatment',
        step2: '2. Select Specialist',
        step3: '3. Details & Time',
        anyDoctor: 'Any Available Specialist',
        namePlaceholder: 'Your full name',
        phonePlaceholder: 'Your phone number (+371...)',
        emailPlaceholder: 'Your email address',
        dateLabel: 'Preferred Date',
        timeLabel: 'Preferred Time Slot',
        nextBtn: 'Continue',
        backBtn: 'Back',
        confirmBtn: 'Confirm Appointment',
        successTitle: 'Appointment Request Received',
        successDesc: 'Thank you! Your private consultation request has been registered. Our patient concierge will contact you within 15 minutes to finalize your time slot.',
        refCode: 'Ref. No: LAVA-',
        closeBtn: 'Close',
        openPortalBtn: 'Open Online Portal'
      },
      lv: {
        title: 'Pieteikt vizīti',
        subtitle: 'Augstākā līmeņa digitālā zobārstniecība LAVA Dental Studio',
        step1: '1. Izvēlieties pakalpojumu',
        step2: '2. Izvēlieties speciālistu',
        step3: '3. Dati un laiks',
        anyDoctor: 'Jebkurš pieejamais ārsts',
        namePlaceholder: 'Vārds, uzvārds',
        phonePlaceholder: 'Tālruņa numurs (+371...)',
        emailPlaceholder: 'E-pasta adrese',
        dateLabel: 'Vēlamais datums',
        timeLabel: 'Vēlamais laiks',
        nextBtn: 'Turpināt',
        backBtn: 'Atpakaļ',
        confirmBtn: 'Apstiprināt vizīti',
        successTitle: 'Vizītes pieteikums saņemts',
        successDesc: 'Paldies! Jūsu pieteikums ir reģistrēts. Mūsu koordinators sazināsies ar jums 15 minūšu laikā, lai saskaņotu precīzu laiku.',
        refCode: 'Pieteikuma Nr: LAVA-',
        closeBtn: 'Aizvērt',
        openPortalBtn: 'Atvērt tiešsaistes portālu'
      },
      ru: {
        title: 'Записаться на прием',
        subtitle: 'Цифровая стоматология мирового уровня в LAVA Dental Studio',
        step1: '1. Выберите услугу',
        step2: '2. Выберите специалиста',
        step3: '3. Данные и время',
        anyDoctor: 'Любой свободный специалист',
        namePlaceholder: 'Ваше имя и фамилия',
        phonePlaceholder: 'Номер телефона (+371...)',
        emailPlaceholder: 'Электронная почта',
        dateLabel: 'Желаемая дата',
        timeLabel: 'Желаемое время',
        nextBtn: 'Продолжить',
        backBtn: 'Назад',
        confirmBtn: 'Подтвердить запись',
        successTitle: 'Заявка на прием принята',
        successDesc: 'Спасибо! Ваша заявка успешно зарегистрирована. Наш координатор свяжется с вами в течение 15 минут для подтверждения времени.',
        refCode: 'Номер записи: LAVA-',
        closeBtn: 'Закрыть',
        openPortalBtn: 'Перейти в онлайн-портал'
      }
    }[lang] || {};

    const treatments = data.servicesData.map(s => s.title);
    const doctors = data.teamData.filter(m => m.category === 'dental');

    let currentStep = 1;
    let selectedTreatment = preselectedService || treatments[0] || 'Complex diagnostics';
    let selectedDoctor = preselectedDoctor || i18n.anyDoctor;
    let appointmentRef = 'LAVA-' + Math.floor(100000 + Math.random() * 900000);

    inner.innerHTML = `
      <div class="booking-drawer">
        <div class="booking-drawer__header" style="text-align:center; margin-bottom:var(--space-size-m);">
          <span class="u-text-body-xsmall" style="color:var(--color-primary-transparent-50); letter-spacing:0.1em;">LAVA DENTAL STUDIO</span>
          <h2 class="u-text-headings-medium" style="margin-top:4px;">${i18n.title}</h2>
          <p class="u-text-body-small" style="color:var(--color-primary-transparent-80); margin-top:4px;">${i18n.subtitle}</p>
        </div>

        <div class="booking-progress-dots">
          <div class="booking-progress-dot is-active" data-dot="1"></div>
          <div class="booking-progress-dot" data-dot="2"></div>
          <div class="booking-progress-dot" data-dot="3"></div>
        </div>

        <!-- Step 1: Treatment -->
        <div class="booking-step is-active" data-step="1">
          <h3 class="u-text-headings-small" style="margin-bottom:var(--space-size-xs);">${i18n.step1}</h3>
          <div class="booking-options-grid">
            ${treatments.map((t, idx) => `
              <button type="button" class="booking-option-pill ${idx === 0 || t === preselectedService ? 'is-selected' : ''}" data-treatment="${t}">
                ${t}
              </button>
            `).join('')}
          </div>
          <div style="display:flex; justify-content:flex-end; margin-top:var(--space-size-l);">
            <button type="button" class="button button--secondary" id="booking-next-1">${i18n.nextBtn}</button>
          </div>
        </div>

        <!-- Step 2: Specialist -->
        <div class="booking-step" data-step="2">
          <h3 class="u-text-headings-small" style="margin-bottom:var(--space-size-xs);">${i18n.step2}</h3>
          <div class="booking-options-grid" style="grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));">
            <button type="button" class="booking-option-pill is-selected" data-doctor="${i18n.anyDoctor}">
              ★ ${i18n.anyDoctor}
            </button>
            ${doctors.map(d => `
              <button type="button" class="booking-option-pill ${d.name === preselectedDoctor ? 'is-selected' : ''}" data-doctor="${d.name}">
                ${d.name}
              </button>
            `).join('')}
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:var(--space-size-l);">
            <button type="button" class="button button--outline" id="booking-back-2">${i18n.backBtn}</button>
            <button type="button" class="button button--secondary" id="booking-next-2">${i18n.nextBtn}</button>
          </div>
        </div>

        <!-- Step 3: Date, Time & Patient Info -->
        <div class="booking-step" data-step="3">
          <h3 class="u-text-headings-small" style="margin-bottom:var(--space-size-xs);">${i18n.step3}</h3>
          <form id="booking-form" style="display:grid; gap:12px; margin-top:var(--space-size-s);">
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div>
                <label class="u-text-body-xsmall" style="display:block; margin-bottom:4px;">${i18n.dateLabel}</label>
                <input type="date" class="booking-input" id="booking-date" required value="${new Date(Date.now() + 86400000).toISOString().split('T')[0]}">
              </div>
              <div>
                <label class="u-text-body-xsmall" style="display:block; margin-bottom:4px;">${i18n.timeLabel}</label>
                <select class="booking-input" id="booking-time">
                  <option>10:00 - 11:00</option>
                  <option selected>11:30 - 12:30</option>
                  <option>14:00 - 15:00</option>
                  <option>16:00 - 17:00</option>
                  <option>17:30 - 18:30</option>
                </select>
              </div>
            </div>
            <div>
              <input type="text" class="booking-input" id="booking-name" placeholder="${i18n.namePlaceholder}" required>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <input type="tel" class="booking-input" id="booking-phone" placeholder="${i18n.phonePlaceholder}" required>
              <input type="email" class="booking-input" id="booking-email" placeholder="${i18n.emailPlaceholder}">
            </div>
            <div style="display:flex; justify-content:space-between; margin-top:var(--space-size-m);">
              <button type="button" class="button button--outline" id="booking-back-3">${i18n.backBtn}</button>
              <button type="submit" class="button button--secondary">${i18n.confirmBtn}</button>
            </div>
          </form>
        </div>

        <!-- Success Confirmation -->
        <div class="booking-step" data-step="4" style="text-align:center;">
          <div style="width:64px; height:64px; border-radius:50%; background:var(--color-primary); color:var(--color-cream); display:flex; align-items:center; justify-content:center; margin:0 auto var(--space-size-m);">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h3 class="u-text-headings-small">${i18n.successTitle}</h3>
          <p class="u-text-body-small" style="margin-top:8px; color:var(--color-primary-transparent-80);">${i18n.successDesc}</p>
          <div style="display:inline-block; margin:var(--space-size-m) 0; padding:8px 16px; border-radius:6px; background:var(--color-primary-transparent-20); font-family:monospace; font-weight:600;">
            ${i18n.refCode}${appointmentRef}
          </div>
          <div style="display:flex; justify-content:center; gap:12px; margin-top:var(--space-size-s);">
            <button type="button" class="button button--outline" onclick="window.closeModal()">${i18n.closeBtn}</button>
            <a href="${data.hero.ctaUrl}" target="_blank" rel="noopener" class="button button--secondary">${i18n.openPortalBtn}</a>
          </div>
        </div>
      </div>
    `;

    // Step navigation wiring
    const setStep = (step) => {
      currentStep = step;
      inner.querySelectorAll('.booking-step').forEach(el => el.classList.remove('is-active'));
      const activeEl = inner.querySelector(`.booking-step[data-step="${step}"]`);
      if (activeEl) activeEl.classList.add('is-active');

      inner.querySelectorAll('.booking-progress-dot').forEach((dot, idx) => {
        dot.classList.toggle('is-active', idx + 1 <= step);
      });
    };

    // Treatment selector
    inner.querySelectorAll('[data-treatment]').forEach(btn => {
      btn.onclick = () => {
        inner.querySelectorAll('[data-treatment]').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selectedTreatment = btn.getAttribute('data-treatment');
      };
    });

    // Doctor selector
    inner.querySelectorAll('[data-doctor]').forEach(btn => {
      btn.onclick = () => {
        inner.querySelectorAll('[data-doctor]').forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selectedDoctor = btn.getAttribute('data-doctor');
      };
    });

    // Nav buttons
    const next1 = inner.querySelector('#booking-next-1');
    if (next1) next1.onclick = () => setStep(2);

    const back2 = inner.querySelector('#booking-back-2');
    if (back2) back2.onclick = () => setStep(1);

    const next2 = inner.querySelector('#booking-next-2');
    if (next2) next2.onclick = () => setStep(3);

    const back3 = inner.querySelector('#booking-back-3');
    if (back3) back3.onclick = () => setStep(2);

    // Form submit
    const form = inner.querySelector('#booking-form');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        setStep(4);
        window.showToast(i18n.successTitle);
      };
    }
  };

  // 6. Concierge Search Engine
  window.openSearchModal = function () {
    const lang = window.currentLanguage || 'en';
    const data = window.LAVA_DATA[lang] || window.LAVA_DATA.en;

    const overlay = createModalContainer('dialog-overlay--search');
    const wrapper = overlay.querySelector('.dialog-content-wrapper');
    wrapper.classList.add('search-modal-container');

    const inner = overlay.querySelector('.dialog-inner-content');

    const i18n = {
      en: {
        placeholder: "Search services, doctors, pricing, FAQs...",
        emptyTitle: "Type above or pick a suggested topic",
        emptyHint: "Press ESC anytime to exit or ⌘K to open",
        noResults: "No results found for",
        noResultsHint: "Try searching for Veneers, Implants, Dr. Aleksejevs, or Sedation",
        categories: {
          services: "Services",
          team: "Specialists",
          pricing: "Price List",
          faq: "FAQ",
          portfolio: "Portfolio"
        },
        tags: ["Veneers", "Implants", "ALL-ON-X", "Hygiene", "Sedation", "Diagnostics", "Price list", "Dr. Aleksejevs"]
      },
      lv: {
        placeholder: "Meklēt pakalpojumus, ārstus, cenas, BUJ...",
        emptyTitle: "Ievadiet vaicājumu vai izvēlieties tēmu",
        emptyHint: "Nospiediet ESC, lai aizvērtu, vai ⌘K, lai atvērtu",
        noResults: "Nekas netika atrasts vaicājumam",
        noResultsHint: "Mēģiniet meklēt Venīri, Implanti, Dr. Aleksejevs vai Sedācija",
        categories: {
          services: "Pakalpojumi",
          team: "Speciālisti",
          pricing: "Cenrādis",
          faq: "BUJ",
          portfolio: "Portfolio"
        },
        tags: ["Venīri", "Implanti", "ALL-ON-X", "Higiēna", "Sedācija", "Diagnostika", "Cenrādis", "Dr. Aleksejevs"]
      },
      ru: {
        placeholder: "Поиск услуг, врачей, цен, вопросов...",
        emptyTitle: "Введите запрос или выберите тему выше",
        emptyHint: "Нажмите ESC для выхода или ⌘K для открытия",
        noResults: "Ничего не найдено по запросу",
        noResultsHint: "Попробуйте поискать Виниры, Импланты, Д-р Алексеев или Седация",
        categories: {
          services: "Услуги",
          team: "Специалисты",
          pricing: "Прейскурант",
          faq: "Частые вопросы",
          portfolio: "Портфолио"
        },
        tags: ["Виниры", "Импланты", "ALL-ON-X", "Гигиена", "Седация", "Диагностика", "Цены", "Д-р Алексеев"]
      }
    }[lang] || {
      placeholder: "Search services, doctors, pricing, FAQs...",
      emptyTitle: "Type above or pick a suggested topic",
      emptyHint: "Press ESC anytime to exit or ⌘K to open",
      noResults: "No results found for",
      noResultsHint: "Try searching for Veneers, Implants, Dr. Aleksejevs, or Sedation",
      categories: {
        services: "Services",
        team: "Specialists",
        pricing: "Price List",
        faq: "FAQ",
        portfolio: "Portfolio"
      },
      tags: ["Veneers", "Implants", "ALL-ON-X", "Hygiene", "Sedation", "Diagnostics", "Price list", "Dr. Aleksejevs"]
    };

    inner.innerHTML = `
      <div class="search-modal-input-wrapper">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" class="search-modal-input" id="search-modal-input" placeholder="${i18n.placeholder}" autofocus autocomplete="off" spellcheck="false">
        <button id="search-modal-clear" style="display:none; border:none; background:none; color:var(--color-cream); cursor:pointer; padding:4px; opacity:0.6;" aria-label="Clear search">✕</button>
      </div>

      <div class="search-quick-tags" id="search-quick-tags">
        ${i18n.tags.map(t => `<button type="button" class="search-quick-tag" data-tag="${t}">${t}</button>`).join('')}
      </div>

      <div class="search-modal-results" id="search-modal-results" role="listbox">
        <div style="text-align:center; padding:36px 16px; opacity:0.65;">
          <p style="font-size:15px; margin-bottom:6px;">${i18n.emptyTitle}</p>
          <span style="font-size:12px; color:var(--color-accent);">${i18n.emptyHint}</span>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px; padding-top:12px; border-top:1px solid rgba(221,239,222,0.1); font-size:11px; opacity:0.6;">
        <span style="display:flex; gap:12px;">
          <span><kbd style="background:rgba(221,239,222,0.15); padding:1px 5px; border-radius:3px;">↑</kbd> <kbd style="background:rgba(221,239,222,0.15); padding:1px 5px; border-radius:3px;">↓</kbd> navigate</span>
          <span><kbd style="background:rgba(221,239,222,0.15); padding:1px 5px; border-radius:3px;">↵</kbd> select</span>
        </span>
        <span><kbd style="background:rgba(221,239,222,0.15); padding:1px 5px; border-radius:3px;">esc</kbd> close</span>
      </div>
    `;

    const input = inner.querySelector('#search-modal-input');
    const clearBtn = inner.querySelector('#search-modal-clear');
    const resultsContainer = inner.querySelector('#search-modal-results');
    let highlightedIndex = -1;

    setTimeout(() => { if (input) input.focus(); }, 50);

    function stripHtml(html) {
      if (!html) return '';
      const div = document.createElement('div');
      div.innerHTML = html;
      return div.textContent || div.innerText || '';
    }

    function doSearch(rawQuery) {
      const q = (rawQuery || '').trim().toLowerCase();
      if (clearBtn) clearBtn.style.display = q ? 'block' : 'none';

      if (!q) {
        resultsContainer.innerHTML = `
          <div style="text-align:center; padding:36px 16px; opacity:0.65;">
            <p style="font-size:15px; margin-bottom:6px;">${i18n.emptyTitle}</p>
            <span style="font-size:12px; color:var(--color-accent);">${i18n.emptyHint}</span>
          </div>
        `;
        highlightedIndex = -1;
        return;
      }

      // Collect matches across data sources
      const matches = {
        services: [],
        team: [],
        pricing: [],
        faq: [],
        portfolio: []
      };

      // 1. Services
      if (Array.isArray(data.servicesData)) {
        data.servicesData.forEach(s => {
          if (s.title && s.title.toLowerCase().includes(q)) {
            matches.services.push({
              title: s.title,
              detail: `Service ${s.number || ''}`,
              action: () => { closeModal(); window.openServiceModal(s.id); }
            });
          }
        });
      }

      // 2. Team
      if (Array.isArray(data.teamData)) {
        data.teamData.forEach(t => {
          if ((t.name && t.name.toLowerCase().includes(q)) || (t.role && t.role.toLowerCase().includes(q))) {
            matches.team.push({
              title: t.name,
              detail: t.role,
              action: () => { closeModal(); window.openTeamModal(t.id); }
            });
          }
        });
      }

      // 3. Pricing
      if (Array.isArray(data.pricingData)) {
        data.pricingData.forEach(cat => {
          if (Array.isArray(cat.items)) {
            cat.items.forEach(item => {
              const desc = stripHtml(item.descriptionHtml);
              if (item.title.toLowerCase().includes(q) || desc.toLowerCase().includes(q)) {
                matches.pricing.push({
                  title: item.title,
                  detail: item.price ? `€${item.price}` : cat.title,
                  action: () => {
                    closeModal();
                    setTimeout(() => {
                      if (window.lenis) window.lenis.scrollTo('#pricing');
                      else document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                });
              }
            });
          }
        });
      }

      // 4. FAQ
      if (Array.isArray(data.faqData)) {
        data.faqData.forEach(cat => {
          if (Array.isArray(cat.items)) {
            cat.items.forEach(faq => {
              const ans = stripHtml(faq.answerHtml);
              if (faq.question.toLowerCase().includes(q) || ans.toLowerCase().includes(q)) {
                matches.faq.push({
                  title: faq.question,
                  detail: cat.title || 'FAQ',
                  action: () => {
                    closeModal();
                    setTimeout(() => {
                      if (window.lenis) window.lenis.scrollTo('#faq');
                      else document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                });
              }
            });
          }
        });
      }

      // 5. Portfolio
      if (Array.isArray(data.portfolioData)) {
        data.portfolioData.forEach(p => {
          const tagsStr = (p.tags || []).join(' ').toLowerCase();
          if ((p.title && p.title.toLowerCase().includes(q)) || tagsStr.includes(q)) {
            matches.portfolio.push({
              title: p.title || (p.tags || []).join(', '),
              detail: (p.tags || []).join(' • '),
              action: () => { closeModal(); window.openPortfolioModal(p.id); }
            });
          }
        });
      }

      const totalMatches = matches.services.length + matches.team.length + matches.pricing.length + matches.faq.length + matches.portfolio.length;

      if (totalMatches === 0) {
        resultsContainer.innerHTML = `
          <div style="text-align:center; padding:36px 16px; opacity:0.75;">
            <p style="font-size:15px; margin-bottom:6px;">${i18n.noResults} <em>"${rawQuery.replace(/[<>&]/g, '')}"</em></p>
            <span style="font-size:12px; opacity:0.6;">${i18n.noResultsHint}</span>
          </div>
        `;
        highlightedIndex = -1;
        return;
      }

      let html = '';
      let itemIndex = 0;
      const allActionableItems = [];

      const renderGroup = (groupKey, items) => {
        if (!items || items.length === 0) return;
        html += `<div class="search-result-group">
          <div class="search-result-group-title">${i18n.categories[groupKey]} (${items.length})</div>`;
        items.forEach(it => {
          const currentIdx = itemIndex++;
          allActionableItems.push(it);
          html += `
            <a href="javascript:void(0)" class="search-result-item" data-index="${currentIdx}" role="option">
              <div style="display:flex; align-items:center; gap:10px; max-width:70%;">
                <span style="font-size:10px; text-transform:uppercase; letter-spacing:0.08em; padding:3px 7px; border-radius:4px; background:rgba(219,192,147,0.15); color:var(--color-bronze-orange); font-weight:600; flex-shrink:0;">${i18n.categories[groupKey]}</span>
                <span style="font-weight:500; font-size:14px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${it.title}</span>
              </div>
              <div style="display:flex; align-items:center; gap:8px; opacity:0.7; font-size:12px; flex-shrink:0;">
                <span>${it.detail}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </div>
            </a>
          `;
        });
        html += `</div>`;
      };

      renderGroup('services', matches.services);
      renderGroup('team', matches.team);
      renderGroup('pricing', matches.pricing);
      renderGroup('faq', matches.faq);
      renderGroup('portfolio', matches.portfolio);

      resultsContainer.innerHTML = html;
      highlightedIndex = -1;

      // Click binding
      resultsContainer.querySelectorAll('.search-result-item').forEach(el => {
        el.onclick = (e) => {
          e.preventDefault();
          const idx = parseInt(el.getAttribute('data-index'), 10);
          if (allActionableItems[idx]) {
            allActionableItems[idx].action();
          }
        };
      });

      window._searchItems = allActionableItems;
    }

    input.addEventListener('input', (e) => {
      doSearch(e.target.value);
    });

    clearBtn.addEventListener('click', () => {
      input.value = '';
      input.focus();
      doSearch('');
    });

    inner.querySelectorAll('.search-quick-tag').forEach(tagBtn => {
      tagBtn.addEventListener('click', () => {
        const val = tagBtn.getAttribute('data-tag');
        input.value = val;
        input.focus();
        doSearch(val);
      });
    });

    // Keyboard navigation within search results
    input.addEventListener('keydown', (e) => {
      const items = resultsContainer.querySelectorAll('.search-result-item');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex + 1) % items.length;
        updateHighlight(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
        updateHighlight(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (highlightedIndex >= 0 && items[highlightedIndex]) {
          items[highlightedIndex].click();
        } else if (items[0]) {
          items[0].click();
        }
      }
    });

    function updateHighlight(items) {
      items.forEach((it, idx) => {
        if (idx === highlightedIndex) {
          it.style.background = 'rgba(221, 239, 222, 0.16)';
          it.style.borderColor = 'var(--color-accent)';
          it.scrollIntoView({ block: 'nearest' });
        } else {
          it.style.background = '';
          it.style.borderColor = '';
        }
      });
    }
  };

  // 7. Toast Notification Helper
  window.showToast = function (message, duration = 3500) {
    let toast = document.querySelector('.toast-notification');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-notification';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span>${message}</span>
    `;
    requestAnimationFrame(() => toast.classList.add('is-visible'));

    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('is-visible');
    }, duration);
  };

  // Escape key listener to close active modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  window.closeModal = closeModal;
  window.openTeamModal = window.openTeamMemberModal;
})();
