// Ano dinâmico no rodapé
document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('loaded');
  // Número de WhatsApp usado nos redirecionamentos (DDI+DDD+Número, só dígitos)
  const whatsappNumber = '5511996336323';
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Botão WhatsApp no herói
  const whatsappHeroBtn = document.getElementById('whatsapp-hero-btn');
  if (whatsappHeroBtn) {
    const msg = 'Olá! Quero atendimento pelo WhatsApp.';
    const encoded = encodeURIComponent(msg);
    whatsappHeroBtn.href = `https://wa.me/${whatsappNumber}?text=${encoded}`;
  }

  // Sombra no header ao rolar
  const header = document.querySelector('.site-header');
  const onScrollHeader = () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 2);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader);

  // Toggle do menu mobile
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Fechar menu ao clicar em um link
    nav.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Scrollspy de navegação
  const links = Array.from(document.querySelectorAll('.main-nav a'));
  const sectionEls = Array.from(document.querySelectorAll('section[id]'));
  if ('IntersectionObserver' in window && links.length && sectionEls.length) {
    const map = new Map();
    links.forEach(link => {
      const href = link.getAttribute('href') || '';
      if (href.startsWith('#')) map.set(href.slice(1), link);
    });
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        const link = map.get(id);
        if (!link) return;
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          links.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { threshold: [0.5], rootMargin: '-20% 0px -60% 0px' });
    sectionEls.forEach(s => spy.observe(s));
  }

  // Newsletter simples (mock local)
  const form = document.getElementById('newsletter-form');
  const feedback = document.getElementById('newsletter-feedback');
  if (form && feedback) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = /** @type {HTMLInputElement} */(document.getElementById('email')).value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        feedback.textContent = 'Por favor, informe um e-mail válido.';
        feedback.style.color = '#b91c1c';
        return;
      }
      try {
        const store = JSON.parse(localStorage.getItem('techstore_news') || '[]');
        if (!store.includes(email)) {
          store.push(email);
          localStorage.setItem('techstore_news', JSON.stringify(store));
        }
        feedback.textContent = 'Obrigado! Você receberá novidades em breve.';
        feedback.style.color = '#16a34a';
        form.reset();
      } catch (err) {
        feedback.textContent = 'Inscrição realizada.';
        feedback.style.color = '#16a34a';
      }
    });
  }

  // Revelação suave dos cards ao rolar
  const cards = document.querySelectorAll('.card');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    cards.forEach(c => io.observe(c));
  } else {
    cards.forEach(c => c.classList.add('reveal'));
  }

  // Carrossel de produtos com botão WhatsApp dinâmico
  const produtosSection = document.getElementById('produtos');
  if (produtosSection) {
    const track = produtosSection.querySelector('.carousel-track');
    const prev = produtosSection.querySelector('.carousel-control.prev');
    const next = produtosSection.querySelector('.carousel-control.next');
    const dots = produtosSection.querySelector('.carousel-dots');
    const slides = Array.from(track.querySelectorAll('.product-card'));
    const whatsappBtn = document.getElementById('whatsapp-product-btn');
    const viewport = produtosSection.querySelector('.carousel-viewport');

    // Botão fixo de WhatsApp do carrossel (CTA)

    let current = 0;

    function buildDots() {
      if (!dots) return;
      dots.innerHTML = '';
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.className = 'dot' + (i === current ? ' active' : '');
        b.setAttribute('aria-label', 'Ir para produto ' + (i + 1));
        b.addEventListener('click', () => goTo(i));
        dots.appendChild(b);
      });
    }

    // Mensagem fixa no botão do carrossel (sem variação por produto)
    if (whatsappBtn) {
      const defaultMsg = 'Olá, quero informações sobre um produto.';
      const encoded = encodeURIComponent(defaultMsg);
      whatsappBtn.href = `https://wa.me/${whatsappNumber}?text=${encoded}`;
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      buildDots();
    }

    function syncSlideWidths() {
      if (!viewport) return;
      const w = viewport.clientWidth;
      slides.forEach(s => { s.style.minWidth = w + 'px'; });
    }

    window.addEventListener('resize', syncSlideWidths);
    syncSlideWidths();
    buildDots();

    // Clique no card do carrossel → abrir WhatsApp com mensagem
    slides.forEach(card => {
      card.style.cursor = 'pointer';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'link');
      const getMsg = () => {
        const title = card.getAttribute('data-title') || (card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : 'um produto');
        return card.getAttribute('data-whatsapp-message') || `Olá, quero informações sobre ${title}.`;
      };
      const goWhatsapp = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const encoded = encodeURIComponent(getMsg());
        const url = `https://wa.me/${whatsappNumber}?text=${encoded}`;
        window.open(url, '_blank');
      };
      card.addEventListener('click', goWhatsapp);
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') goWhatsapp(e);
      });
    });

    if (prev) prev.addEventListener('click', () => goTo(current - 1));
    if (next) next.addEventListener('click', () => goTo(current + 1));

    // Autoplay com pausa ao hover
    let autoplayId = setInterval(() => goTo(current + 1), 5000);
    const stopAutoplay = () => { if (autoplayId) { clearInterval(autoplayId); autoplayId = null; } };
    const startAutoplay = () => { if (!autoplayId) autoplayId = setInterval(() => goTo(current + 1), 5000); };
    const hoverTarget = produtosSection.querySelector('.carousel') || produtosSection;
    if (hoverTarget) {
      hoverTarget.addEventListener('mouseenter', stopAutoplay);
      hoverTarget.addEventListener('mouseleave', startAutoplay);
      // Pausar ao focar via teclado
      hoverTarget.addEventListener('focusin', stopAutoplay);
      hoverTarget.addEventListener('focusout', startAutoplay);
    }

    // Suporte a swipe em dispositivos móveis
    let startX = 0;
    let deltaX = 0;
    if (viewport) {
      viewport.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
      viewport.addEventListener('touchmove', (e) => { deltaX = e.touches[0].clientX - startX; });
      viewport.addEventListener('touchend', () => {
        if (Math.abs(deltaX) > 40) {
          goTo(deltaX < 0 ? current + 1 : current - 1);
        }
        startX = 0; deltaX = 0;
      });
    }
  }

  // Black Friday: contagem regressiva
  const bfCountdown = document.getElementById('bf-countdown');
  if (bfCountdown) {
    const rawTarget = bfCountdown.getAttribute('data-target') || '';
    let target = new Date(rawTarget);
    if (isNaN(target.getTime())) {
      // Fallback: fim de novembro do ano atual
      const now = new Date();
      target = new Date(now.getFullYear(), 10, 30, 23, 59, 59); // 30/11 23:59:59
    }

    const units = {
      days: bfCountdown.querySelector('[data-unit="days"]'),
      hours: bfCountdown.querySelector('[data-unit="hours"]'),
      minutes: bfCountdown.querySelector('[data-unit="minutes"]'),
      seconds: bfCountdown.querySelector('[data-unit="seconds"]'),
    };

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      const now = new Date();
      let diff = Math.max(0, target.getTime() - now.getTime());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24)); diff -= d * (1000 * 60 * 60 * 24);
      const h = Math.floor(diff / (1000 * 60 * 60)); diff -= h * (1000 * 60 * 60);
      const m = Math.floor(diff / (1000 * 60)); diff -= m * (1000 * 60);
      const s = Math.floor(diff / 1000);
      if (units.days) units.days.textContent = pad(d);
      if (units.hours) units.hours.textContent = pad(h);
      if (units.minutes) units.minutes.textContent = pad(m);
      if (units.seconds) units.seconds.textContent = pad(s);
    }

    tick();
    const countdownId = setInterval(tick, 1000);
    // Parar se ficar oculto
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.target !== bfCountdown) return;
          if (!e.isIntersecting) {
            clearInterval(countdownId);
          }
        });
      }, { threshold: 0 });
      io.observe(bfCountdown);
    }
  }

  // Newsletter Black Friday
  const bfNewsletter = document.getElementById('bf-newsletter');
  if (bfNewsletter) {
    const emailInput = /** @type {HTMLInputElement} */(document.getElementById('bf-email'));
    const btn = document.getElementById('bf-subscribe');
    const fb = document.getElementById('bf-feedback');
    const validate = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (btn && emailInput && fb) {
      btn.addEventListener('click', () => {
        const email = emailInput.value.trim();
        if (!validate(email)) {
          fb.textContent = 'Por favor, informe um e-mail válido.';
          fb.style.color = '#b91c1c';
          return;
        }
        try {
          const store = JSON.parse(localStorage.getItem('techstore_bf_news') || '[]');
          if (!store.includes(email)) {
            store.push(email);
            localStorage.setItem('techstore_bf_news', JSON.stringify(store));
          }
          fb.textContent = 'Pronto! Você receberá ofertas da Black Friday.';
          fb.style.color = '#16a34a';
          emailInput.value = '';
        } catch (err) {
          fb.textContent = 'Inscrição realizada.';
          fb.style.color = '#16a34a';
        }
      });
    }
  }

  // Clique nos cards da Black Friday → abrir WhatsApp com mensagem
  const bfSection = document.getElementById('blackfriday');
  if (bfSection) {
    const bfCards = bfSection.querySelectorAll('.deal-card');
    bfCards.forEach(card => {
      card.style.cursor = 'pointer';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'link');
      const titleEl = card.querySelector('h3');
      const title = titleEl ? titleEl.textContent.trim() : 'oferta da Black Friday';
      const goWhatsapp = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const encoded = encodeURIComponent(`Olá, tenho interesse na oferta: ${title}`);
        const url = `https://wa.me/${whatsappNumber}?text=${encoded}`;
        window.open(url, '_blank');
      };
      card.addEventListener('click', goWhatsapp);
      card.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') goWhatsapp(e);
      });
    });
  }
});