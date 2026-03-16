// Smooth initial load
window.addEventListener('load', () => {
  document.body.classList.remove('loading');
});

// Section reveal on scroll — includes both section and .portfolio-section
const revealTargets = document.querySelectorAll('section, .portfolio-section');

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  },
  { threshold: 0.1 }
);

revealTargets.forEach(el => observer.observe(el));

// Smooth nav scrolling
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});

// Email modal logic
const emailBtn = document.querySelector('.email-btn');
const modal = document.getElementById('emailModal');
const closeBtn = modal.querySelector('.close');

emailBtn.addEventListener('click', () => {
  modal.classList.add('active');
});

closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
});

modal.addEventListener('click', e => {
  if (e.target === modal) {
    modal.classList.remove('active');
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    modal.classList.remove('active');
  }
});

// ── Slideshow ──────────────────────────────────────────────────────────────
(function () {
  const track = document.getElementById('slideshowTrack');
  const dots = document.querySelectorAll('#slideDots .dot');
  const prevBtn = document.querySelector('.slide-arrow.left');
  const nextBtn = document.querySelector('.slide-arrow.right');

  if (!track || !prevBtn || !nextBtn) return;

  const slides = track.querySelectorAll('.slide');
  const total = slides.length;
  let current = 0;

  function goTo(index) {
    // Wrap around
    current = (index + total) % total;
    track.style.transform = `translateX(-${current * 100}%)`;

    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  prevBtn.addEventListener('click', () => goTo(current - 1));
  nextBtn.addEventListener('click', () => goTo(current + 1));

  dots.forEach(dot => {
    dot.addEventListener('click', () => goTo(Number(dot.dataset.index)));
  });

  // Keyboard arrow support when focused inside the slideshow
  document.addEventListener('keydown', e => {
    const portfolio = document.getElementById('portfolio');
    if (!portfolio) return;
    const rect = portfolio.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;

    if (e.key === 'ArrowLeft') goTo(current - 1);
    if (e.key === 'ArrowRight') goTo(current + 1);
  });

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  track.addEventListener('touchend', e => {
    const delta = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      goTo(delta > 0 ? current + 1 : current - 1);
    }
  });
})();
