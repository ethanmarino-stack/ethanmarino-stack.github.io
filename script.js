// Core interactions for the redesigned site
document.addEventListener('DOMContentLoaded', () => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const vantaBackground = document.getElementById('vanta-bg');
  let vantaEffect = null;
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function initVanta() {
    if (prefersReduced || !vantaBackground || !window.VANTA?.TOPOLOGY) return;
    vantaEffect = window.VANTA.TOPOLOGY({
      el: vantaBackground,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      scaleMobile: 0.75,
      color: 0x4e5b96,
      backgroundColor: 0x061018
    });
  }

  function loadVantaWhenIdle() {
    if (prefersReduced || !vantaBackground) return;
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.1.9/p5.min.js')
      .then(() => loadScript('https://cdn.jsdelivr.net/npm/vanta@0.5.24/dist/vanta.topology.min.js'))
      .then(initVanta)
      .catch(() => {});
  }

  window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(loadVantaWhenIdle, {timeout: 2000});
    } else {
      window.setTimeout(loadVantaWhenIdle, 500);
    }
  }, {once: true});

  // Header nav toggle for mobile
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.querySelector('.site-nav');
  menuToggle?.addEventListener('click', () => {
    const open = siteNav.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  // Close mobile nav when clicking outside
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (!siteNav) return;
    const clickOnToggle = menuToggle ? (menuToggle.contains(target) || target === menuToggle) : false;
    const isClickInsideNav = siteNav.contains(target) || clickOnToggle;
    if (!isClickInsideNav && siteNav.classList.contains('open')){
      siteNav.classList.remove('open');
      if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Logo click: smooth scroll to top (no style changes)
  const logo = document.querySelector('.logo');
  logo?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Intersection reveal
  if (!prefersReduced) {
    const panels = document.querySelectorAll('.panel');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in-view');
      });
    }, {threshold:0.12});
    panels.forEach(p => io.observe(p));
  }

  // Splash / opening animation
  const loader = document.getElementById('loader');
  const splash = document.getElementById('splash');
  let loaderExitTimer = null;
  function removeLoader() {
    if (!loader) return;
    if (loaderExitTimer) window.clearTimeout(loaderExitTimer);
    loader.remove();
  }
  if (prefersReduced) {
    removeLoader();
    splash?.remove();
  } else if (loader) {
    splash?.addEventListener('animationend', () => splash.remove(), {once: true});
    window.setTimeout(() => {
      loader.classList.add('leaving');
      splash?.classList.add('ready');
      loader.addEventListener('transitionend', (event) => {
        if (event.propertyName === 'opacity') removeLoader();
      }, {once: true});
      loaderExitTimer = window.setTimeout(removeLoader, 900);
    }, 3000);
  }

  // Trip scroller: drag to scroll
  const scroller = document.querySelector('.trip-scroller');
  if (scroller) {
    let isDown=false, startX, scrollLeft;
    scroller.addEventListener('mousedown', (e)=>{
      isDown=true;scroller.classList.add('dragging');startX=e.pageX - scroller.offsetLeft;scrollLeft=scroller.scrollLeft;
    });
    document.addEventListener('mouseup', ()=>{isDown=false;scroller.classList.remove('dragging')});
    scroller.addEventListener('mousemove',(e)=>{if(!isDown) return; e.preventDefault();const x=e.pageX - scroller.offsetLeft;const walk=(x-startX)*1.2;scroller.scrollLeft=scrollLeft-walk});
  }

  // Lightbox for images
  const lb = document.getElementById('lightbox');
  const lbImg = lb?.querySelector('.lb-img');
  const lbClose = lb?.querySelector('.lb-close');
  document.querySelectorAll('img').forEach(img => {
    // Project cards and Journey photos have their own click behavior.
    if (img.closest('.journey-grid, .project')) return;
    img.addEventListener('click', (e) => {
      const target = e.currentTarget;
      if (!lb || !lbImg) return;
      lbImg.src = target.src;
      lbImg.alt = target.alt || '';
      lb.setAttribute('aria-hidden','false');
    });
  });
  lbClose?.addEventListener('click', ()=> lb?.setAttribute('aria-hidden','true'));
  lb?.addEventListener('click', (e)=>{if(e.target===lb) lb.setAttribute('aria-hidden','true')});

  // Make whole project cards clickable and keyboard-accessible (open GitHub repo)
  document.querySelectorAll('.project').forEach(project => {
    const repo = project.dataset.repo;
    if (!repo) return;
    project.addEventListener('click', (e) => {
      // open repo in new tab
      window.open(repo, '_blank', 'noopener,noreferrer');
    });
    project.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        window.open(repo, '_blank', 'noopener,noreferrer');
      }
    });
  });

  // Smooth scroll for header links
  const journeyOverlay = document.getElementById('journeyOverlay');
  const journeyGrid = document.querySelector('.journey-grid');
  const journeyClose = document.querySelector('.overlay-close');
  let journeyCloseTimer = null;

  // Image list for the journey grid (add objects with src + caption)
  const journeyImages = [
    {src:'images/versailles.jpg', caption:'Versailles, France — Palace of Versailles and gardens.'},
    {src:'images/paris.jpg', caption:'Paris, France — city exploration and landmarks.'},
    {src:'images/barcelona.jpg', caption:'Barcelona, Spain — city exploration and gothic architecture.'},
    {src:'images/madrid.jpg', caption:'Madrid, Spain — city exploration and Royal Palace.'},
    {src:'images/vatican.jpg', caption:'Vatican City, Vatican — solo exploration, museums and Sistine Chapel.'},
    {src:'images/rome.jpg', caption:'Rome, Italy — solo city exploration and ancient ruins.'},
    {src:'images/pisa.jpg', caption:'Pisa, Italy — solo city exploration and leaning tower.'},
    {src:'images/milan.jpg', caption:'Milan, Italy — solo city exploration and architecture.'},
    {src:'images/dorta.jpg', caption:'Lake D\'orta, Italy — exploration and swimming in the nice lake.'},
    {src:'images/switzerland.jpg', caption:'Mürren, Switzerland — solo alpine adventure and classic Swiss village.'},
    {src:'images/osceola.jpg', caption:'Mt. Osceola & East Osceola, New Hampshire — classic WMNF traverse (NH48 5/48 & 6/48)'},
    {src:'images/washington.jpg', caption:'Mt. Washington, New Hampshire — brutal weather, rewarding summit on the huntington ravine trail. The most dangerous trail in the region. (NH48 4/48)'},
    {src:'images/acadia.jpg', caption:'Acadia, Maine — coastal exploration and wildlife viewing.'},
    {src:'images/pleasant.jpg', caption:'Pleasant Mountain, Maine — Short day hike with great views.'},
    {src:'images/wheeler.jpg', caption:'Wheeler Peak, New Mexico — high alpine ridge and views.'},
    {src:'images/palo.jpg', caption:'Palo Duro Canyon, Texas — vast layered canyons.'},
    {src:'images/guadalupe.jpg', caption:'Guadalupe Peak, Texas — desert summit and backpacking trip.'},
    {src:'images/franconia.jpg', caption:'Franconia Ridge, New Hampshire — classic New England traverse. (NH48 2/48 & 3/48)'},
    {src:'images/cannon.jpg', caption:'Cannon Mountain, New Hampshire — alpine approaches and climbs. (NH48 1/48)'},
    {src:'images/bigbend.jpg', caption:'Big Bend, Texas — canyons and night skies.'}
  ];

  function populateJourney(){
    if (!journeyGrid) return;
    journeyGrid.innerHTML = '';

    journeyImages.forEach(obj=>{
      const item = document.createElement('div'); item.className='item';
      item.setAttribute('role', 'gridcell');
      item.tabIndex = 0;
      const img = document.createElement('img'); img.src=obj.src; img.alt=obj.caption || 'Journey photo'; img.loading='lazy'; img.decoding='async'; img.fetchPriority='low';
      img.dataset.caption = obj.caption || '';
      img.addEventListener('click', ()=> openCaption(img.src || obj.src, obj.caption || ''));
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openCaption(img.src || obj.src, obj.caption || '');
        }
      });
      item.appendChild(img);
      journeyGrid.appendChild(item);
    });
  }

  function openJourney(){
    if (journeyCloseTimer) {
      window.clearTimeout(journeyCloseTimer);
      journeyCloseTimer = null;
    }
    populateJourney();
    if (!journeyOverlay) return;
    journeyOverlay.classList.remove('closing');
    journeyOverlay.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function closeJourney(){
    if (!journeyOverlay || journeyOverlay.getAttribute('aria-hidden') !== 'false') return;
    // start closing animation
    journeyOverlay.classList.add('closing');
    // close caption first
    if (typeof closeCaption === 'function') closeCaption();
    // after animation, fully hide overlay and cleanup
    journeyCloseTimer = window.setTimeout(()=>{
      journeyOverlay.setAttribute('aria-hidden','true');
      journeyOverlay.classList.remove('closing');
      document.body.style.overflow = '';
      if (!prefersReduced && !vantaEffect) initVanta();
      journeyCloseTimer = null;
    }, 350);
  }
  // Handle nav clicks: open journey or scroll; auto-close journey when selecting other tabs
  document.querySelectorAll('.site-nav a').forEach(a=>a.addEventListener('click', (e)=>{
    const href = a.getAttribute('href');
    siteNav?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open menu');
    if (href === '#journey'){
      e.preventDefault(); openJourney();
      return;
    }
    // if journey overlay open, close it when navigating to another tab
    if (journeyOverlay && journeyOverlay.getAttribute('aria-hidden') === 'false') closeJourney();
    e.preventDefault();
    const target=document.querySelector(href); if(target) target.scrollIntoView({behavior:'smooth'});
  }));

  journeyClose?.addEventListener('click', closeJourney);
  journeyOverlay?.addEventListener('click', (e)=>{ if (e.target === journeyOverlay) closeJourney(); });
  const captionPanel = document.getElementById('captionPanel');
  const captionClose = captionPanel?.querySelector('.caption-close');
  const captionImage = captionPanel?.querySelector('.caption-image');
  const captionContent = captionPanel?.querySelector('.caption-content');

  document.addEventListener('keydown', (e)=>{
    if (e.key === 'Escape'){
      if (lb && lb.getAttribute('aria-hidden') === 'false'){
        lb.setAttribute('aria-hidden','true');
        return;
      }
      // prefer closing caption panel first
      if (captionPanel && captionPanel.getAttribute('aria-hidden') === 'false'){
        if (typeof closeCaption === 'function') closeCaption();
        return;
      }
      if (emailModal && emailModal.getAttribute('aria-hidden') === 'false'){
        if (typeof closeEmail === 'function') closeEmail();
        return;
      }
      closeJourney();
    }
  });

  // Caption panel logic: open a separate window with text when a journey image is clicked
  function openCaption(src, text){
    if (!captionPanel || !captionImage || !captionContent) return;
    captionImage.src = src;
    captionImage.alt = text;
    captionContent.textContent = text;
    captionPanel.setAttribute('aria-hidden','false');
    journeyOverlay?.classList.add('caption-open');
    journeyOverlay?.querySelector('.overlay-inner')?.style.setProperty('overflow', 'hidden');
  }
  function closeCaption(){
    if (!captionPanel) return;
    captionPanel.setAttribute('aria-hidden','true');
    journeyOverlay?.classList.remove('caption-open');
    journeyOverlay?.querySelector('.overlay-inner')?.style.removeProperty('overflow');
  }
  captionClose?.addEventListener('click', closeCaption);
  captionPanel?.addEventListener('click', (e)=>{ if (e.target === captionPanel) closeCaption(); });

  // Email modal handlers
  const emailBtn = document.getElementById('contactEmail');
  const emailModal = document.getElementById('emailModal');
  const emailClose = emailModal?.querySelector('.email-close');
  function openEmail(){
    if (!emailModal) return;
    emailModal.classList.remove('closing');
    emailModal.setAttribute('aria-hidden','false');
    document.body.style.overflow='hidden';
  }
  function closeEmail(){
    if (!emailModal) return;
    // trigger closing animation
    emailModal.classList.add('closing');
    setTimeout(()=>{
      emailModal.setAttribute('aria-hidden','true');
      emailModal.classList.remove('closing');
      document.body.style.overflow='';
    }, 300);
  }
  emailBtn?.addEventListener('click', (e)=>{ e.preventDefault(); openEmail(); });
  emailClose?.addEventListener('click', ()=> closeEmail());
  emailModal?.addEventListener('click', (e)=>{ if (e.target === emailModal) closeEmail(); });

  // Update populateJourney to bind click handlers (handled above)
  // (we add event listeners when creating the images below)
});
