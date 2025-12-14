/* ============================================
   MAIN JAVASCRIPT - INTERACTIVITY & ANIMATIONS
   ============================================ */

(function() {
  'use strict';
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // ============================================
  // Header Scroll Effect
  // ============================================
  function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    let lastScroll = 0;
    const scrollThreshold = 40;
    
    function handleScroll() {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      
      if (currentScroll > scrollThreshold) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      
      lastScroll = currentScroll;
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
  }
  
  // ============================================
  // Reveal on Scroll Animations
  // ============================================
  function initRevealAnimations() {
    if (prefersReducedMotion) return;
    
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
    if (revealElements.length === 0) return;
    
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    revealElements.forEach(el => {
      observer.observe(el);
    });
  }
  
  // ============================================
  // Parallax Effect (Subtle)
  // ============================================
  function initParallax() {
    if (prefersReducedMotion) return;
    
    const parallaxElements = document.querySelectorAll('.parallax');
    if (parallaxElements.length === 0) return;
    
    function updateParallax() {
      const scrollY = window.pageYOffset;
      
      parallaxElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const elementHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        if (scrollY + windowHeight > elementTop && scrollY < elementTop + elementHeight) {
          const progress = (scrollY + windowHeight - elementTop) / (windowHeight + elementHeight);
          const translateY = (progress - 0.5) * 20; // Very subtle, max 20px
          el.style.transform = `translateY(${translateY}px)`;
        }
      });
    }
    
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateParallax();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }
  
  // ============================================
  // Smooth Anchor Scrolling
  // ============================================
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#' || href === '') return;
        
        const target = document.querySelector(href);
        if (!target) return;
        
        e.preventDefault();
        
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        
        window.scrollTo({
          top: targetPosition,
          behavior: prefersReducedMotion ? 'auto' : 'smooth'
        });
      });
    });
  }
  
  // ============================================
  // Active Navigation Highlight
  // ============================================
  function initActiveNav() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    const sections = document.querySelectorAll('section[id]');
    
    if (navLinks.length === 0 || sections.length === 0) return;
    
    function updateActiveNav() {
      const scrollY = window.pageYOffset;
      const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
      
      sections.forEach(section => {
        const sectionTop = section.getBoundingClientRect().top + scrollY - headerHeight - 100;
        const sectionBottom = sectionTop + section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollY >= sectionTop && scrollY < sectionBottom) {
          navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${sectionId}`) {
              link.classList.add('active');
            }
          });
        }
      });
    }
    
    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav(); // Initial check
  }
  
  // ============================================
  // FAQ Accordion
  // ============================================
  function initFAQ() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const isExpanded = question.getAttribute('aria-expanded') === 'true';
        const answer = question.nextElementSibling;
        
        // Close all other FAQs
        faqQuestions.forEach(q => {
          if (q !== question) {
            q.setAttribute('aria-expanded', 'false');
            q.nextElementSibling.classList.remove('open');
            q.nextElementSibling.style.maxHeight = '0';
          }
        });
        
        // Toggle current FAQ
        if (isExpanded) {
          question.setAttribute('aria-expanded', 'false');
          answer.classList.remove('open');
          answer.style.maxHeight = '0';
        } else {
          question.setAttribute('aria-expanded', 'true');
          answer.classList.add('open');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    });
  }
  
  // ============================================
  // Contact Form
  // ============================================
  function initContactForm() {
    const form = document.querySelector('#contact-form');
    if (!form) return;
    
    const honeypot = form.querySelector('.honeypot');
    const submitBtn = form.querySelector('button[type="submit"]');
    const loadingEl = form.querySelector('.form-loading');
    const successEl = form.querySelector('.form-success');
    const errorEls = form.querySelectorAll('.form-error');
    
    function validateForm() {
      let isValid = true;
      const phone = form.querySelector('[name="phone"]');
      const name = form.querySelector('[name="name"]');
      const consent = form.querySelector('[name="consent"]');
      
      // Clear previous errors
      errorEls.forEach(el => el.classList.remove('show'));
      
      // Validate phone
      if (phone && !phone.value.trim()) {
        const error = phone.parentElement.querySelector('.form-error');
        if (error) {
          error.textContent = 'Phone number is required';
          error.classList.add('show');
        }
        isValid = false;
      } else if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone.value)) {
        const error = phone.parentElement.querySelector('.form-error');
        if (error) {
          error.textContent = 'Please enter a valid phone number';
          error.classList.add('show');
        }
        isValid = false;
      }
      
      // Validate name
      if (name && !name.value.trim()) {
        const error = name.parentElement.querySelector('.form-error');
        if (error) {
          error.textContent = 'Name is required';
          error.classList.add('show');
        }
        isValid = false;
      }
      
      // Validate consent
      if (consent && !consent.checked) {
        const error = consent.parentElement.querySelector('.form-error');
        if (error) {
          error.textContent = 'Please consent to be contacted';
          error.classList.add('show');
        }
        isValid = false;
      }
      
      return isValid;
    }
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Honeypot check
      if (honeypot && honeypot.value.trim() !== '') {
        return; // Bot detected, silently fail
      }
      
      if (!validateForm()) {
        return;
      }
      
      // Show loading state
      submitBtn.disabled = true;
      if (loadingEl) loadingEl.classList.add('show');
      if (successEl) successEl.classList.remove('show');
      
      // Get form data
      const formData = new FormData(form);
      const data = Object.fromEntries(formData);
      
      try {
        // Replace with actual endpoint later
        const response = await fetch('https://example.com/lead', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        // Simulate success (since endpoint is placeholder)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Show success state
        if (successEl) successEl.classList.add('show');
        form.reset();
        
        // Scroll to success message
        successEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
      } catch (error) {
        console.error('Form submission error:', error);
        // Still show success for demo (replace with actual error handling)
        if (successEl) successEl.classList.add('show');
        form.reset();
      } finally {
        submitBtn.disabled = false;
        if (loadingEl) loadingEl.classList.remove('show');
      }
    });
  }
  
  // ============================================
  // Mobile Menu Toggle
  // ============================================
  function initMobileMenu() {
    const toggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');
    
    if (!toggle || !nav) return;
    
    toggle.addEventListener('click', () => {
      nav.classList.toggle('mobile-open');
      const isOpen = nav.classList.contains('mobile-open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    
    // Close on link click
    const navLinks = nav.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('mobile-open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
  
  // ============================================
  // Initialize Everything
  // ============================================
  function init() {
    initHeader();
    initRevealAnimations();
    initParallax();
    initSmoothScroll();
    initActiveNav();
    initFAQ();
    initContactForm();
    initMobileMenu();
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

