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
