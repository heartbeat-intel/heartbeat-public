/**
 * Scroll-triggered reveal animations using IntersectionObserver.
 * Add class="reveal" to any element to fade it up on scroll.
 * Children with [data-reveal-delay] get staggered delays.
 */
function initReveal() {
  const elements = document.querySelectorAll('.reveal');

  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');

          // Stagger children
          const children = entry.target.querySelectorAll('[data-reveal-delay]');
          children.forEach((child, index) => {
            const el = child as HTMLElement;
            const delay = el.dataset.revealDelay
              ? parseInt(el.dataset.revealDelay)
              : index * 100;
            el.style.transitionDelay = `${delay}ms`;
            el.classList.add('revealed');
          });

          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elements.forEach((el) => observer.observe(el));
}

// Run on DOMContentLoaded and after Astro page transitions
document.addEventListener('DOMContentLoaded', initReveal);
document.addEventListener('astro:page-load', initReveal);
