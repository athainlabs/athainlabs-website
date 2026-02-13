/* ============================================
   ATHAIN LABS — Interactive Behavior
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ========== Custom Cursor ==========
  const cursor = document.querySelector('.custom-cursor');
  if (cursor && window.innerWidth > 768) {
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth follow with lerp
    function animateCursor() {
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      cursor.style.left = cursorX - 6 + 'px';
      cursor.style.top = cursorY - 6 + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Hover effect on interactive elements
    const hoverables = document.querySelectorAll('a, button, .service-card, .project-card, input, textarea');
    hoverables.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  // ========== Scroll Reveal (IntersectionObserver) ==========
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.05,
    rootMargin: '0px 0px -20px 0px'
  });

  reveals.forEach(el => revealObserver.observe(el));

  // Fallback: force-reveal any still-hidden elements after 4s
  setTimeout(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      el.classList.add('visible');
    });
  }, 4000);

  // ========== Hamburger Menu ==========
  const hamburger = document.querySelector('.hamburger');
  const navOverlay = document.querySelector('.nav-overlay');
  const navLinks = document.querySelectorAll('.nav-links a');

  if (hamburger && navOverlay) {
    hamburger.addEventListener('click', () => {
      navOverlay.classList.toggle('active');
      hamburger.classList.toggle('active');

      // Animate hamburger lines
      const spans = hamburger.querySelectorAll('span');
      if (navOverlay.classList.contains('active')) {
        spans[0].style.transform = 'rotate(45deg) translateY(5.3px)';
        spans[1].style.transform = 'rotate(-45deg) translateY(-5.3px)';
      } else {
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navOverlay.classList.remove('active');
        hamburger.classList.remove('active');
        const spans = hamburger.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.transform = '';
      });
    });
  }

  // ========== Horizontal Project Scroll (Drag) ==========
  const scrollContainer = document.querySelector('.projects-scroll');
  if (scrollContainer) {
    let isDown = false;
    let startX;
    let scrollLeft;

    scrollContainer.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
    });

    scrollContainer.addEventListener('mouseleave', () => { isDown = false; });
    scrollContainer.addEventListener('mouseup', () => { isDown = false; });

    scrollContainer.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollContainer.scrollLeft = scrollLeft - walk;
    });
  }

  // ========== Smooth Scroll for Anchor Links ==========
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ========== Sticky CTA visibility on scroll ==========
  const stickyCta = document.querySelector('.sticky-cta');
  if (stickyCta) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 600) {
        stickyCta.style.opacity = '1';
        stickyCta.style.pointerEvents = 'all';
      } else {
        stickyCta.style.opacity = '0';
        stickyCta.style.pointerEvents = 'none';
      }
    });
    // Start hidden
    stickyCta.style.opacity = '0';
    stickyCta.style.pointerEvents = 'none';
    stickyCta.style.transition = 'opacity 0.4s ease, transform 0.2s ease';
  }

  // ========== Parallax on Hero (Spline handles its own interaction) ==========

  // ========== Form Submission ==========
  const form = document.querySelector('.contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('.submit-btn');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="display:inline;vertical-align:middle;margin-right:6px"><polyline points="20 6 9 17 4 12"/></svg> Message Sent';
      submitBtn.style.background = 'var(--accent-green)';
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '';
        form.reset();
      }, 2500);
    });
  }

  // ========== Navbar background on scroll ==========
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 100) {
        navbar.style.background = 'rgba(5, 5, 16, 0.92)';
      } else {
        navbar.style.background = 'rgba(5, 5, 16, 0.7)';
      }
    });
  }

});
