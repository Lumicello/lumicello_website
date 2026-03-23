/**
 * @fileoverview Main JavaScript for Lumicello website
 * Handles scroll animations, mobile navigation, carousels, and interactive features.
 * @author Lumicello Development Team
 * @version 1.0.0
 */

/**
 * Initialize all page functionality when DOM is ready.
 * Sets up scroll observers, navigation, carousels, and interactive elements.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Scroll Observer - reveals elements as they enter viewport
    /** @type {IntersectionObserverInit} */
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1,
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    revealElements.forEach(el => observer.observe(el));

    // Navbar Scroll Effect
    // Note: .nav-wrapper scroll behavior is handled by components.js initNavScroll()
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // Mobile Menu
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileBtn.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when clicking a link
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // Testimonial Carousel
    let slideIndex = 1;
    // Only run if carousel exists
    if (document.querySelector('.quote-carousel')) {
        showSlides(slideIndex);

        // Auto advance every 5 seconds
        setInterval(() => {
            slideIndex++;
            showSlides(slideIndex);
        }, 5000);
    }

    // Kit Image Carousels
    initKitCarousels();

    // Kit Journey Scroller (mobile)
    initKitJourneyScroller();

    // Cinematic Curio Types Experience
    initCurioCinema();

    // Lazy Loading for Images
    initLazyLoading();
});

/**
 * Navigate to a specific slide in the testimonial carousel.
 * @param {number} n - The slide number to display (1-indexed)
 */
function currentSlide(n) {
    showSlides((slideIndex = n));
}

/**
 * Display a specific slide in the testimonial carousel.
 * Handles wrapping at the beginning and end of the carousel.
 * @param {number} n - The slide number to display (1-indexed)
 */
function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName('quote-slide');
    let dots = document.getElementsByClassName('dot');

    if (slides.length === 0) return;

    if (n > slides.length) {
        slideIndex = 1;
    }
    if (n < 1) {
        slideIndex = slides.length;
    }

    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = 'none';
        slides[i].classList.remove('active');
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(' active', '');
    }

    slides[slideIndex - 1].style.display = 'block';
    slides[slideIndex - 1].classList.add('active');
    dots[slideIndex - 1].className += ' active';
}

/**
 * Initialize all kit image carousels on the page.
 * Sets up dot navigation, click-to-lightbox, and touch swipe support.
 */
function initKitCarousels() {
    const carousels = document.querySelectorAll('.kit-carousel');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.kit-carousel-track');
        const dots = carousel.querySelectorAll('.kit-dot');
        const images = carousel.querySelectorAll('.kit-carousel-track img');
        let currentIndex = 0;

        // Dot click handlers
        dots.forEach((dot, index) => {
            dot.addEventListener('click', e => {
                e.stopPropagation();
                currentIndex = index;
                updateCarousel();
            });
        });

        // Click on image to open lightbox
        images.forEach(img => {
            img.addEventListener('click', () => {
                const imageSrcs = Array.from(images).map(i => i.src || i.dataset.src);
                const imageAlts = Array.from(images).map(i => i.alt);
                openKitLightbox(imageSrcs, imageAlts, currentIndex);
            });
        });

        // Swipe support for touch devices
        let touchStartX = 0;
        let touchEndX = 0;

        carousel.addEventListener(
            'touchstart',
            e => {
                touchStartX = e.changedTouches[0].screenX;
            },
            { passive: true }
        );

        carousel.addEventListener(
            'touchend',
            e => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            },
            { passive: true }
        );

        /**
         * Handle swipe gesture to navigate carousel.
         * @private
         */
        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;

            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0 && currentIndex < images.length - 1) {
                    currentIndex++;
                } else if (diff < 0 && currentIndex > 0) {
                    currentIndex--;
                }
                updateCarousel();
            }
        }

        /**
         * Update carousel position and dot states.
         * @private
         */
        function updateCarousel() {
            track.style.transform = `translateX(-${currentIndex * 50}%)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
    });
}

/**
 * Open a fullscreen lightbox for viewing kit images.
 * Supports keyboard navigation, touch swipe, and smooth crossfade transitions.
 * @param {string[]} imageSrcs - Array of image source URLs
 * @param {string[]} imageAlts - Array of image alt text descriptions
 * @param {number} [startIndex=0] - Initial image index to display
 */
function openKitLightbox(imageSrcs, imageAlts, startIndex = 0) {
    // Create lightbox if it doesn't exist
    let lightbox = document.querySelector('.kit-lightbox');

    if (!lightbox) {
        lightbox = document.createElement('div');
        lightbox.className = 'kit-lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-overlay"></div>
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Close lightbox">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <button class="lightbox-nav lightbox-prev" aria-label="Previous image">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <div class="lightbox-image-container">
                    <img class="lightbox-image" src="" alt="">
                </div>
                <button class="lightbox-nav lightbox-next" aria-label="Next image">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                </button>
                <div class="lightbox-counter"></div>
                <div class="lightbox-dots"></div>
            </div>
        `;
        document.body.appendChild(lightbox);
    }

    const lightboxImage = lightbox.querySelector('.lightbox-image');
    const dotsContainer = lightbox.querySelector('.lightbox-dots');
    const counterEl = lightbox.querySelector('.lightbox-counter');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const overlay = lightbox.querySelector('.lightbox-overlay');

    let currentIndex = startIndex;
    let isTransitioning = false;

    // Create dots
    dotsContainer.innerHTML = imageSrcs
        .map(
            (_, i) =>
                `<button class="lightbox-dot ${i === currentIndex ? 'active' : ''}" aria-label="View image ${i + 1}"></button>`
        )
        .join('');

    const dots = dotsContainer.querySelectorAll('.lightbox-dot');

    /**
     * Transition to a new image with crossfade effect.
     * @param {number} newIndex - Index of the image to transition to
     */
    function transitionToImage(newIndex) {
        if (isTransitioning || newIndex === currentIndex) return;
        isTransitioning = true;

        // Fade out current image
        lightboxImage.classList.add('transitioning');

        setTimeout(() => {
            // Update to new image
            currentIndex = newIndex;
            lightboxImage.src = imageSrcs[currentIndex];
            lightboxImage.alt = imageAlts[currentIndex];
            updateUI();

            // Fade in new image
            setTimeout(() => {
                lightboxImage.classList.remove('transitioning');
                isTransitioning = false;
            }, 50);
        }, 250); // Match CSS transition duration
    }

    /**
     * Update lightbox UI elements (dots, nav buttons, counter).
     */
    function updateUI() {
        dots.forEach((dot, i) => dot.classList.toggle('active', i === currentIndex));
        prevBtn.style.opacity = currentIndex === 0 ? '0.3' : '1';
        prevBtn.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
        nextBtn.style.opacity = currentIndex === imageSrcs.length - 1 ? '0.3' : '1';
        nextBtn.style.pointerEvents = currentIndex === imageSrcs.length - 1 ? 'none' : 'auto';
        counterEl.textContent = `${currentIndex + 1} / ${imageSrcs.length}`;
    }

    /**
     * Update lightbox with current image.
     */
    function updateLightbox() {
        lightboxImage.src = imageSrcs[currentIndex];
        lightboxImage.alt = imageAlts[currentIndex];
        updateUI();
    }

    /**
     * Close the lightbox and restore body scroll.
     */
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.classList.remove('no-scroll');
    }

    // Event listeners with smooth transitions
    prevBtn.onclick = () => {
        if (currentIndex > 0) transitionToImage(currentIndex - 1);
    };
    nextBtn.onclick = () => {
        if (currentIndex < imageSrcs.length - 1) transitionToImage(currentIndex + 1);
    };
    closeBtn.onclick = closeLightbox;
    overlay.onclick = closeLightbox;

    dots.forEach((dot, i) => {
        dot.onclick = () => transitionToImage(i);
    });

    // Keyboard navigation with transitions
    const keyHandler = e => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft' && currentIndex > 0) transitionToImage(currentIndex - 1);
        if (e.key === 'ArrowRight' && currentIndex < imageSrcs.length - 1)
            transitionToImage(currentIndex + 1);
    };

    document.removeEventListener('keydown', keyHandler);
    document.addEventListener('keydown', keyHandler);

    // Touch swipe for lightbox with transitions
    let touchStartX = 0;
    const imageContainer = lightbox.querySelector('.lightbox-image-container');

    imageContainer.ontouchstart = e => {
        touchStartX = e.changedTouches[0].screenX;
    };
    imageContainer.ontouchend = e => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            if (diff > 0 && currentIndex < imageSrcs.length - 1)
                transitionToImage(currentIndex + 1);
            else if (diff < 0 && currentIndex > 0) transitionToImage(currentIndex - 1);
        }
    };

    // Show lightbox
    updateLightbox();
    lightbox.classList.add('active');
    document.body.classList.add('no-scroll');
}

/**
 * Initialize the mobile kit journey scroller.
 * Provides horizontal scroll navigation with progress tracking on mobile devices.
 * Only activates on screens <= 768px width.
 */
function initKitJourneyScroller() {
    const wrapper = document.querySelector('.kits-journey-wrapper');
    const grid = document.querySelector('.kits-grid');
    const cards = document.querySelectorAll('.kits-grid .kit-card');
    const dots = document.querySelectorAll('.journey-dot');
    const progressFill = document.querySelector('.journey-progress-fill');
    const kitNumEl = document.querySelector('.current-kit-num');
    const kitNameEl = document.querySelector('.current-kit-name');

    if (!wrapper || !grid || cards.length === 0) return;

    /** @type {string[]} Kit names for the indicator display */
    const kitNames = [
        'First Gazes',
        'Tummy Time Discovery',
        'Grasp & Spin',
        'Peek & Find',
        'Stack & Sort',
        'Push & Play',
        'Explore & Express',
        'Sort & Stack',
        'Build & Create',
        'Imagine & Play',
    ];

    /**
     * Check if viewport is mobile size.
     * @returns {boolean} True if viewport width <= 768px
     */
    const isMobile = () => window.innerWidth <= 768;

    let currentIndex = 0;
    let isScrolling = false;
    let scrollTimeout;

    /**
     * Update progress indicator based on scroll position.
     * Calculates which card is most centered in the viewport.
     */
    function updateProgress() {
        if (!isMobile()) return;

        const scrollLeft = grid.scrollLeft;
        const cardWidth = cards[0].offsetWidth + parseInt(getComputedStyle(grid).gap || 16);
        const firstCardOffset = cards[0].offsetLeft - grid.offsetLeft;

        // Calculate which card is most centered
        const adjustedScroll = scrollLeft + grid.offsetWidth / 2 - firstCardOffset;
        const newIndex = Math.round(adjustedScroll / cardWidth);
        const clampedIndex = Math.max(0, Math.min(newIndex, cards.length - 1));

        if (clampedIndex !== currentIndex) {
            currentIndex = clampedIndex;
            updateUI();
        }
    }

    /**
     * Update all UI elements (dots, cards, progress bar, kit name).
     */
    function updateUI() {
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'passed');
            if (index === currentIndex) {
                dot.classList.add('active');
            } else if (index < currentIndex) {
                dot.classList.add('passed');
            }
        });

        // Update cards (active state)
        cards.forEach((card, index) => {
            if (index === currentIndex) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // Update progress bar
        if (progressFill) {
            const progress = (currentIndex / (cards.length - 1)) * 100;
            progressFill.style.width = `${progress}%`;
        }

        // Update kit name indicator
        if (kitNumEl) kitNumEl.textContent = currentIndex + 1;
        if (kitNameEl) kitNameEl.textContent = kitNames[currentIndex] || '';
    }

    /**
     * Scroll to a specific card with smooth animation.
     * @param {number} index - Index of the card to scroll to
     */
    function scrollToCard(index) {
        if (!isMobile() || index < 0 || index >= cards.length) return;

        const card = cards[index];
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const gridCenter = grid.offsetWidth / 2;
        const scrollTarget = cardCenter - gridCenter;

        // Custom eased scroll for consistent speed (300ms, same for all cards)
        const start = grid.scrollLeft;
        const distance = scrollTarget - start;
        const duration = 300;
        let startTime = null;

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);
            
            grid.scrollLeft = start + distance * eased;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }

        requestAnimationFrame(animate);
    }

    // Dot click handlers
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            scrollToCard(index);
        });
    });

    // Scroll event listener with debounce
    grid.addEventListener(
        'scroll',
        () => {
            if (!isMobile()) return;

            // Debounce the progress update
            if (!isScrolling) {
                isScrolling = true;
                requestAnimationFrame(() => {
                    updateProgress();
                    isScrolling = false;
                });
            }

            // Clear existing timeout
            clearTimeout(scrollTimeout);

            // Final update after scroll ends
            scrollTimeout = setTimeout(() => {
                updateProgress();
            }, 100);
        },
        { passive: true }
    );

    // Touch end - snap and update
    grid.addEventListener(
        'touchend',
        () => {
            if (!isMobile()) return;
            setTimeout(updateProgress, 150);
        },
        { passive: true }
    );

    // Window resize handler
    let resizeTimeout;
    window.addEventListener(
        'resize',
        () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (isMobile()) {
                    updateProgress();
                    updateUI();
                } else {
                    // Reset on desktop
                    cards.forEach(card => card.classList.remove('active'));
                }
            }, 200);
        },
        { passive: true }
    );

    // Initial state
    if (isMobile()) {
        updateUI();
        cards[0].classList.add('active');
    }
}

// ============================================
// CINEMATIC CURIO TYPES EXPERIENCE
// Auto-playing loop when visible - "The Living Light Show"
// ============================================

/**
 * Initialize the cinematic Curio Types animation experience.
 * Creates an auto-playing, looping animation that activates when visible in viewport.
 * Features 4 acts: DISCOVER, ANALYZE, MAP, REVEAL.
 */
function initCurioCinema() {
    const fpCinema = document.getElementById('fp-cinema');
    if (!fpCinema) return;

    const sceneNumEl = fpCinema.querySelector('.fp-scene-num');
    const sceneNameEl = fpCinema.querySelector('.fp-scene-name');
    const sceneDescEl = fpCinema.querySelector('.fp-stage-desc');
    const timelineFill = fpCinema.querySelector('.fp-timeline-fill');
    const dots = fpCinema.querySelectorAll('.fp-dot');

    /**
     * Act configuration with timing and display text.
     * @type {Array<{num: string, name: string, desc: string, duration: number}>}
     */
    const acts = [
        { num: '01', name: 'DISCOVER', desc: 'Constellation emerges', duration: 2200 },
        { num: '02', name: 'EXPLORE', desc: 'Discovering interests', duration: 2500 },
        { num: '03', name: 'CONNECT', desc: 'Connecting the dots', duration: 2800 },
        { num: '04', name: 'REVEAL', desc: 'Your Curio Type', duration: 6000 },
    ];

    let currentAct = 0;
    let isPlaying = false;
    let animationLoop = null;
    let actTimeout = null;

    /**
     * Set the current act and update all UI elements.
     * @param {number} actIndex - Index of the act to display (0-3)
     */
    function setAct(actIndex) {
        currentAct = actIndex;
        const act = acts[actIndex];

        // Update data attribute for CSS animations
        fpCinema.setAttribute('data-act', actIndex + 1);

        // Update scene label
        if (sceneNumEl) sceneNumEl.textContent = act.num;
        if (sceneNameEl) sceneNameEl.textContent = act.name;
        if (sceneDescEl) sceneDescEl.textContent = act.desc;

        // Update timeline progress
        if (timelineFill) {
            const progress = ((actIndex + 1) / acts.length) * 100;
            timelineFill.style.width = `${progress}%`;
        }

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.remove('active', 'passed');
            if (i === actIndex) {
                dot.classList.add('active');
            } else if (i < actIndex) {
                dot.classList.add('passed');
            }
        });
    }

    /**
     * Advance to the next act in the sequence.
     * Loops back to act 0 after completing all acts.
     */
    function nextAct() {
        const nextIndex = (currentAct + 1) % acts.length;

        // If looping back to start, reset animations
        if (nextIndex === 0) {
            fpCinema.removeAttribute('data-act');
            // Brief pause before restarting
            setTimeout(() => {
                setAct(0);
                scheduleNextAct();
            }, 300);
        } else {
            setAct(nextIndex);
            scheduleNextAct();
        }
    }

    /**
     * Schedule the next act transition based on current act duration.
     */
    function scheduleNextAct() {
        if (!isPlaying) return;

        const act = acts[currentAct];
        actTimeout = setTimeout(nextAct, act.duration);
    }

    /**
     * Start the cinema animation loop.
     */
    function startCinema() {
        if (isPlaying) return;

        isPlaying = true;
        fpCinema.classList.add('is-playing');

        // Start from act 1
        setAct(0);
        scheduleNextAct();
    }

    /**
     * Stop the cinema animation loop.
     */
    function stopCinema() {
        isPlaying = false;
        fpCinema.classList.remove('is-playing');

        if (actTimeout) {
            clearTimeout(actTimeout);
            actTimeout = null;
        }
    }

    // Intersection Observer - play when visible
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
                    startCinema();
                } else {
                    // Keep playing briefly when scrolling past
                    // Only stop if really out of view
                    if (entry.intersectionRatio < 0.1) {
                        stopCinema();
                    }
                }
            });
        },
        {
            root: null,
            rootMargin: '0px',
            threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
        }
    );

    observer.observe(fpCinema);

    // Click on dots to jump to act
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (actTimeout) clearTimeout(actTimeout);
            setAct(index);
            scheduleNextAct();
        });
    });

    // Pause on hover (optional - lets user study the animation)
    // fpCinema.addEventListener('mouseenter', () => {
    //     if (actTimeout) clearTimeout(actTimeout);
    // });
    // fpCinema.addEventListener('mouseleave', () => {
    //     if (isPlaying) scheduleNextAct();
    // });
}

// ============================================
// EMAIL OBFUSCATION
// Protects email addresses from bot scraping
// See SECURITY_DECISIONS.md for details
// ============================================

/**
 * Initialize email protection by decoding obfuscated email addresses.
 * Converts data attributes into clickable mailto links at runtime to prevent bot scraping.
 *
 * @example
 * // Inline email display (creates clickable mailto link)
 * <span class="protected-email" data-u="contact" data-d="lumicello.com">
 *   <noscript>contact [at] lumicello [dot] com</noscript>
 * </span>
 *
 * @example
 * // Email button (opens mailto on click, no visible email)
 * <button class="protected-email-btn" data-u="contact" data-d="lumicello.com">
 *   Email Us
 * </button>
 */
function initEmailProtection() {
    // Handle inline email displays (creates clickable mailto link)
    document.querySelectorAll('.protected-email').forEach(el => {
        const u = el.dataset.u; // username part
        const d = el.dataset.d; // domain part
        if (!u || !d) return;

        const email = u + '@' + d;

        // Create clickable mailto link
        const link = document.createElement('a');
        link.href = 'mailto:' + email;
        link.textContent = email;
        link.className = 'email-link';

        // Clear any noscript fallback and add the link
        el.innerHTML = '';
        el.appendChild(link);
    });

    // Handle email buttons (opens mailto on click, no visible email)
    document.querySelectorAll('.protected-email-btn').forEach(btn => {
        const u = btn.dataset.u;
        const d = btn.dataset.d;
        if (!u || !d) return;

        const email = u + '@' + d;

        btn.addEventListener('click', e => {
            e.preventDefault();
            window.location.href = 'mailto:' + email;
        });
    });
}

// Initialize email protection when DOM is ready
document.addEventListener('DOMContentLoaded', initEmailProtection);

// ============================================
// SCROLL REVEAL ANIMATION
// Reveals elements with .reveal and .reveal-stagger classes
// Uses IntersectionObserver for better performance
// ============================================

/**
 * Initialize scroll reveal animations for elements with .reveal and .reveal-stagger classes.
 * Uses IntersectionObserver instead of scroll events for better performance.
 * Adds 'visible' class when elements enter viewport.
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-stagger');
    if (revealElements.length === 0) return;

    // Use IntersectionObserver for better performance (no scroll event listener)
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop observing once revealed (one-time animation)
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        {
            root: null,
            rootMargin: '-100px 0px',
            threshold: 0
        }
    );

    revealElements.forEach(el => revealObserver.observe(el));
}

// Initialize scroll reveal when DOM is ready
document.addEventListener('DOMContentLoaded', initScrollReveal);

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================

/**
 * Initialize smooth scrolling for all anchor links (href starting with #).
 * Provides smooth scroll behavior when clicking internal navigation links.
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            // Skip if it's just "#" or empty
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize smooth scroll when DOM is ready
document.addEventListener('DOMContentLoaded', initSmoothScroll);

// ============================================
// SUCCESS MODAL (Contact Form)
// Shows modal after form submission redirect
// ============================================

/**
 * Initialize success modal handling for contact form.
 * Shows modal when URL contains ?submitted=true parameter.
 * Provides close functionality via button, overlay click, or Escape key.
 */
function initSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (!modal) return;

    // Check if form was just submitted
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('submitted') === 'true') {
        modal.classList.remove('hidden');
        // Clean up URL without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Close modal function
    window.closeSuccessModal = function() {
        modal.classList.add('hidden');
    };

    // Close modal on overlay click
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            window.closeSuccessModal();
        }
    });

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            window.closeSuccessModal();
        }
    });
}

/**
 * Initialize lazy loading for images using IntersectionObserver.
 * Images with class "lazy-load" and data-src attribute will load when they enter the viewport.
 * This improves initial page load time by deferring below-the-fold images.
 */
function initLazyLoading() {
    // Get all images with lazy-load class
    const lazyImages = document.querySelectorAll('img.lazy-load[data-src]');

    // Exit if no lazy images found
    if (lazyImages.length === 0) {
        return;
    }

    // Create IntersectionObserver to load images when they enter viewport
    const imageObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;

                    // Load the image
                    img.src = img.dataset.src;

                    // Remove data-src attribute
                    img.removeAttribute('data-src');

                    // Remove lazy-load class
                    img.classList.remove('lazy-load');

                    // Add loaded class for potential CSS transitions
                    img.classList.add('lazy-loaded');

                    // Stop observing this image
                    observer.unobserve(img);
                }
            });
        },
        {
            // Start loading 200px before the image enters viewport
            rootMargin: '200px 0px',
            threshold: 0.01,
        }
    );

    // Observe all lazy images
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize success modal when DOM is ready
document.addEventListener('DOMContentLoaded', initSuccessModal);

// ── Voices marquee: drag-to-scroll ──
(function () {
    const container = document.querySelector('.voices-container');
    if (!container) return;
    const track = container.querySelector('.voices-track');
    let isDragging = false;
    let startX, scrollLeft;

    function pause() { track.style.animationPlayState = 'paused'; }
    function resume() {
        if (!isDragging) track.style.animationPlayState = '';
    }

    container.addEventListener('mousedown', function (e) {
        isDragging = true;
        container.classList.add('is-dragging');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        pause();
    });

    document.addEventListener('mousemove', function (e) {
        if (!isDragging) return;
        e.preventDefault();
        var x = e.pageX - container.offsetLeft;
        container.scrollLeft = scrollLeft - (x - startX);
    });

    document.addEventListener('mouseup', function () {
        if (!isDragging) return;
        isDragging = false;
        container.classList.remove('is-dragging');
        resume();
    });

    // Touch support
    container.addEventListener('touchstart', function (e) {
        startX = e.touches[0].pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
        pause();
    }, { passive: true });

    container.addEventListener('touchmove', function (e) {
        var x = e.touches[0].pageX - container.offsetLeft;
        container.scrollLeft = scrollLeft - (x - startX);
    }, { passive: true });

    container.addEventListener('touchend', function () {
        resume();
    });
})();
