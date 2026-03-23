/**
 * JAWAB - Strict Corporate JS
 */

document.addEventListener('DOMContentLoaded', () => {
    
    /* -------------------------------------------------------------
       1. Intersection Observer for Scroll Reveals
    ------------------------------------------------------------- */
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    revealElements.forEach((el) => {
        const delay = el.getAttribute('data-reveal-delay') || '0ms';
        el.style.transitionDelay = delay;
    });

    const revealOptions = {
        root: null,
        rootMargin: '0px 0px -5% 0px', // Trigger a bit earlier
        threshold: 0.1
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-revealed');
                // Strict templates usually unobserve to avoid re-triggering
                observer.unobserve(entry.target);
            }
        });
    }, revealOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });

    /* -------------------------------------------------------------
       2. Parallax (Very slight, linear feel)
    ------------------------------------------------------------- */
    const heroGraphic = document.querySelector('.hero-parallax');
    if (heroGraphic) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                // Extremely stiff, minor parallax 
                heroGraphic.style.transform = `translateY(${scrolled * 0.08}px)`;
            }
        });
    }
});
