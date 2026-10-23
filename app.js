const header = `
<header class="site-header"><a class="brand" href="index.html" aria-label="Peach Limited home"><img class="brand-logo" src="peach-logo.jpeg" alt="Peach Limited logo"></a><button class="menu-toggle" aria-label="Toggle navigation" aria-expanded="false"><span></span><span></span></button><nav class="main-nav"><a href="index.html" data-nav="home">Home</a><a href="about.html" data-nav="about">About</a><a href="team.html" data-nav="team">Meet the team</a><a href="projects.html" data-nav="projects">Projects</a><a href="gallery.html" data-nav="gallery">Gallery</a><a href="contact.html" data-nav="contact">Contact</a><a class="nav-cta" href="contact.html">Let's talk ↗</a></nav></header>`;
const footer = `<footer class="site-footer"><div class="footer-top"><div><a class="brand footer-brand" href="index.html"><img class="brand-logo" src="peach-logo.jpeg" alt="Peach Limited logo"></a><p>Thoughtful property.<br>Considered places.</p></div><div class="footer-nav"><span class="eyebrow">EXPLORE</span><a href="about.html">About us</a><a href="team.html">Meet the team</a><a href="projects.html">Projects</a><a href="gallery.html">Gallery</a><a href="contact.html">Contact</a><a href="privacy.html">Privacy notice</a></div><div class="footer-contact"><span class="eyebrow">START A CONVERSATION</span><a href="mailto:admin@pieach.com"  target="_blank">admin@pieach.com ↗</a><span>Lagos, Nigeria</span><div class="social-links"><a href="https://www.instagram.com/pieachltd/?hl=en" target="_blank" rel="noopener noreferrer" aria-label="Pieach Limited on Instagram">Instagram ↗</a><a href="https://www.linkedin.com/company/pieachltd/" target="_blank" rel="noopener noreferrer" aria-label="Pieach Limited on LinkedIn">LinkedIn ↗</a></div></div></div><div class="footer-bottom"><span>© <span id="year"></span> Pieach Limited. All rights reserved.</span><span>Designed with intention.</span></div></footer>`;
document.getElementById('site-header').innerHTML = header;
document.getElementById('site-footer').innerHTML = footer;
document.getElementById('year').textContent = new Date().getFullYear();
const current = document.body.dataset.page;
document.querySelectorAll('[data-nav]').forEach(a => { if(a.dataset.nav === current || (current === 'project' && a.dataset.nav === 'projects')) a.classList.add('active'); });
const toggle = document.querySelector('.menu-toggle');
toggle.addEventListener('click', () => { const open = document.body.classList.toggle('menu-open'); toggle.setAttribute('aria-expanded', String(open)); });
document.querySelectorAll('.main-nav a').forEach(a => a.addEventListener('click', () => { document.body.classList.remove('menu-open'); toggle.setAttribute('aria-expanded','false'); }));
const form = document.getElementById('contactForm');
if(form) form.addEventListener('submit', e => { e.preventDefault(); const d = new FormData(form); const subject = encodeURIComponent('Website enquiry — ' + d.get('subject')); const body = encodeURIComponent(`Name: ${d.get('name')}\nEmail: ${d.get('email')}\nPhone: ${d.get('phone') || 'Not provided'}\nTopic: ${d.get('subject')}\n\nMessage:\n${d.get('message')}`); document.getElementById('formSuccess').textContent = 'Opening your email app with the enquiry details…'; window.location.href = `mailto:hello@pieachlimited.com?subject=${subject}&body=${body}`; });

// Gallery carousel, filters, and accessible lightbox slideshow.
const galleryGrid = document.getElementById('galleryGrid');
if (galleryGrid) {
  const tiles = Array.from(galleryGrid.querySelectorAll('.gallery-tile'));
  const filters = Array.from(document.querySelectorAll('.gallery-filter'));
  const carousel = galleryGrid;
  const carouselCounter = document.getElementById('carouselCounter');
  const carouselProgress = document.getElementById('carouselProgress');
  const carouselToggle = document.getElementById('carouselToggle');
  const lightbox = document.getElementById('galleryLightbox');
  const lbImage = document.getElementById('lightboxImage');
  const lbCaption = document.getElementById('lightboxCaption');
  const lbCounter = document.getElementById('lightboxCounter');
  const lbPlay = document.getElementById('lightboxPlay');
  let visibleTiles = tiles.slice();
  let currentIndex = 0;
  let carouselTimer = null;
  let slideshowTimer = null;
  let carouselPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let slideshowPlaying = false;
  const pad = n => String(n).padStart(2, '0');

  // Cursor-following architectural detail lens. Demo assets are paired from the
  // existing gallery until the client supplies matching renders/SketchUp exports.
  const lens = document.createElement('div');
  lens.className = 'architecture-lens';
  lens.setAttribute('aria-hidden', 'true');
  lens.innerHTML = '<span class="lens-mode">DETAIL VIEW</span><span class="lens-crosshair"></span>';
  document.body.appendChild(lens);
  let activeLensTile = null;
  const lensCapable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const lensModes = ['3D CONCEPT VIEW', 'SKETCH-STYLE STUDY', 'DETAIL VIEW'];
  const lensImages = tiles.map(t => t.querySelector('img').src);
  const moveLens = event => {
    if (!activeLensTile) return;
    const rect = activeLensTile.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const img = activeLensTile.querySelector('img');
    const mode = activeLensTile.dataset.lensMode || 'render';
    const lensImage = activeLensTile.querySelector('.lens-image');
    lens.style.left = `${event.clientX}px`;
    lens.style.top = `${event.clientY}px`;
    lens.style.setProperty('--lens-x', `${Math.max(0, Math.min(100, x / rect.width * 100))}%`);
    lens.style.setProperty('--lens-y', `${Math.max(0, Math.min(100, y / rect.height * 100))}%`);
    lens.style.backgroundImage = `url("${lensImage ? lensImage.src : img.src}")`;
    lens.classList.toggle('is-sketch', mode === 'sketch');
    lens.querySelector('.lens-mode').textContent = mode === 'sketch' ? 'SKETCH-STYLE STUDY' : '3D CONCEPT VIEW';
  };
  if (lensCapable) {
    tiles.forEach((tile, i) => {
      tile.dataset.lensMode = i % 3 === 1 ? 'sketch' : 'render';
      const img = tile.querySelector('img');
      const lensImage = document.createElement('img');
      lensImage.className = 'lens-image';
      lensImage.alt = '';
      lensImage.setAttribute('aria-hidden', 'true');
      // Alternate property photo is temporary demo art.
      lensImage.src = lensImages[(i + 1) % lensImages.length];
      tile.appendChild(lensImage);
      tile.addEventListener('pointerenter', event => {
        activeLensTile = tile;
        moveLens(event);
        lens.classList.add('is-visible');
      });
      tile.addEventListener('pointermove', moveLens);
      tile.addEventListener('pointerleave', () => {
        activeLensTile = null;
        lens.classList.remove('is-visible');
      });
      tile.addEventListener('focus', () => { activeLensTile = tile; lens.classList.remove('is-visible'); });
    });
  }

  const updateCarouselStatus = () => {
    visibleTiles = tiles.filter(t => t.style.display !== 'none');
    if (!visibleTiles.length) return;
    let nearest = 0;
    const left = carousel.scrollLeft;
    visibleTiles.forEach((tile, i) => {
      if (Math.abs(tile.offsetLeft - left) < Math.abs(visibleTiles[nearest].offsetLeft - left)) nearest = i;
    });
    currentIndex = nearest;
    carouselCounter.textContent = `${pad(nearest + 1)} / ${pad(visibleTiles.length)}`;
    carouselProgress.style.width = `${((nearest + 1) / visibleTiles.length) * 100}%`;
  };
  const scrollToTile = index => {
    visibleTiles = tiles.filter(t => t.style.display !== 'none');
    if (!visibleTiles.length) return;
    const target = (index + visibleTiles.length) % visibleTiles.length;
    carousel.scrollTo({left: visibleTiles[target].offsetLeft, behavior: 'smooth'});
    currentIndex = target;
    carouselCounter.textContent = `${pad(target + 1)} / ${pad(visibleTiles.length)}`;
    carouselProgress.style.width = `${((target + 1) / visibleTiles.length) * 100}%`;
  };
  const stopCarouselTimer = () => { if (carouselTimer) clearInterval(carouselTimer); carouselTimer = null; };
  const startCarouselTimer = () => {
    stopCarouselTimer();
    if (carouselPaused || visibleTiles.length < 2) return;
    carouselTimer = setInterval(() => {
      visibleTiles = tiles.filter(t => t.style.display !== 'none');
      scrollToTile(currentIndex + 1);
    }, 4500);
  };
  const updateCarouselToggle = () => {
    carouselToggle.innerHTML = carouselPaused ? '▶ <span>Play</span>' : 'Ⅱ <span>Pause</span>';
    carouselToggle.setAttribute('aria-label', carouselPaused ? 'Start automatic gallery' : 'Pause automatic gallery');
    carouselToggle.setAttribute('aria-pressed', String(carouselPaused));
  };

  const showImage = index => {
    if (!visibleTiles.length) return;
    currentIndex = (index + visibleTiles.length) % visibleTiles.length;
    const tile = visibleTiles[currentIndex];
    const img = tile.querySelector('img');
    lbImage.src = img.src.replace(/w=\d+/, 'w=2200');
    lbImage.alt = img.alt;
    lbCaption.textContent = tile.dataset.caption || img.alt;
    lbCounter.textContent = `${pad(currentIndex + 1)} / ${pad(visibleTiles.length)}`;
  };
  const stopSlideshow = () => {
    if (slideshowTimer) clearInterval(slideshowTimer);
    slideshowTimer = null;
    slideshowPlaying = false;
    lbPlay.textContent = '▶ Play slideshow';
    lbPlay.setAttribute('aria-pressed', 'false');
  };
  const startSlideshow = () => {
    if (slideshowTimer) clearInterval(slideshowTimer);
    slideshowPlaying = true;
    lbPlay.textContent = 'Ⅱ Pause slideshow';
    lbPlay.setAttribute('aria-pressed', 'true');
    slideshowTimer = setInterval(() => showImage(currentIndex + 1), 4000);
  };
  const openLightbox = tile => {
    visibleTiles = tiles.filter(t => t.style.display !== 'none');
    showImage(visibleTiles.indexOf(tile));
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    document.querySelector('.lightbox-close').focus();
  };
  const closeLightbox = () => {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    stopSlideshow();
  };

  tiles.forEach(tile => tile.addEventListener('click', () => openLightbox(tile)));
  filters.forEach(filter => filter.addEventListener('click', () => {
    filters.forEach(f => f.classList.toggle('active', f === filter));
    tiles.forEach(tile => { tile.style.display = (filter.dataset.filter === 'all' || tile.dataset.category === filter.dataset.filter) ? '' : 'none'; });
    carousel.scrollTo({left: 0, behavior: 'smooth'});
    currentIndex = 0;
    updateCarouselStatus();
    startCarouselTimer();
  }));
  document.getElementById('carouselPrev').addEventListener('click', () => scrollToTile(currentIndex - 1));
  document.getElementById('carouselNext').addEventListener('click', () => scrollToTile(currentIndex + 1));
  carouselToggle.addEventListener('click', () => {
    carouselPaused = !carouselPaused;
    updateCarouselToggle();
    startCarouselTimer();
  });
  carousel.addEventListener('scroll', () => { window.requestAnimationFrame(updateCarouselStatus); }, {passive: true});
  carousel.addEventListener('mouseenter', stopCarouselTimer);
  carousel.addEventListener('mouseleave', startCarouselTimer);
  carousel.addEventListener('focusin', stopCarouselTimer);
  carousel.addEventListener('focusout', startCarouselTimer);
  document.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  document.querySelector('.lightbox-prev').addEventListener('click', () => showImage(currentIndex - 1));
  document.querySelector('.lightbox-next').addEventListener('click', () => showImage(currentIndex + 1));
  lbPlay.addEventListener('click', () => slideshowPlaying ? stopSlideshow() : startSlideshow());
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentIndex + 1);
    if (e.key === ' ' && e.target === lbPlay) { e.preventDefault(); slideshowPlaying ? stopSlideshow() : startSlideshow(); }
  });
  updateCarouselToggle();
  updateCarouselStatus();
  startCarouselTimer();
}


/* Accessible scroll reveals and restrained header motion */
document.addEventListener('DOMContentLoaded', () => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  const selectors = [
    'main section h2', 'main section .eyebrow', '.project-card', '.gallery-item',
    '.gallery-card', '.team-card', '.about-grid > *', '.project-grid > *',
    '.gallery-grid > *', '.contact-grid > *', '.feature-card'
  ];
  const elements = [...new Set(selectors.flatMap(selector => Array.from(document.querySelectorAll(selector))))];
  elements.forEach((el, i) => {
    if (el.closest('.site-header, .site-footer')) return;
    el.setAttribute('data-reveal', (i % 7 === 2) ? 'left' : (i % 7 === 4) ? 'right' : 'up');
    el.style.setProperty('--reveal-delay', `${(i % 4) * 70}ms`);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    elements.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -35px 0px' });
  elements.forEach(el => observer.observe(el));
});
