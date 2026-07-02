// ====================
// Mobile Menu Toggle
// ====================

const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });
}

// ====================
// Smooth Scroll for Navigation
// ====================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ====================
// Enhanced Navbar with Scroll Effects
// ====================

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;

    if (navbar) {
        if (scrollTop > 50) {
            navbar.style.boxShadow = '0 12px 30px rgba(0,0,0,0.15)';
        } else {
            navbar.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
        }
    }
});

// ====================
// Hero Stats Fade-Out on Scroll
// ====================
// As the user starts scrolling down, the Experience / Projects /
// Client Satisfaction stats smoothly fade out and hide.

const heroStats = document.getElementById('heroStats');

if (heroStats) {
    const FADE_THRESHOLD = 60; // px scrolled before stats start hiding

    const updateHeroStats = () => {
        if (window.scrollY > FADE_THRESHOLD) {
            heroStats.classList.add('is-hidden');
        } else {
            heroStats.classList.remove('is-hidden');
        }
    };

    window.addEventListener('scroll', updateHeroStats, { passive: true });
    updateHeroStats();
}

// ====================
// Advanced Intersection Observer for Animations
// ====================

const observerOptions = {
    threshold: [0, 0.1, 0.5],
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
            entry.target.style.visibility = 'visible';

            if (!entry.target.hasAttribute('data-animated')) {
                entry.target.setAttribute('data-animated', 'true');
            }
        }
    });
}, observerOptions);

const animatableElements = document.querySelectorAll(
    '.project-row, .service-card, .skill-orb, .expertise-card, ' +
    '.github-card, .testimonial-card, .journey-item, .studio-stat, ' +
    '.tech-category'
);

animatableElements.forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px) scale(0.95)';
    el.style.transition = `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${(index % 6) * 0.08}s`;
    el.style.visibility = 'hidden';
    observer.observe(el);
});

// ====================
// Generic Horizontal Slider / Carousel Controller
// ====================
// Powers both the "What I Do" (expertise) slider and the
// "What I Offer" (services) carousel. Works via scroll-snap,
// with arrow buttons and dot indicators kept in sync.

function initSlider({ trackId, prevId, nextId, dotsId, cardSelector }) {
    const track = document.getElementById(trackId);
    if (!track) return;

    const prevBtn = document.getElementById(prevId);
    const nextBtn = document.getElementById(nextId);
    const dotsWrap = document.getElementById(dotsId);

    const getCards = () => Array.from(track.querySelectorAll(cardSelector));

    function buildDots() {
        if (!dotsWrap) return;
        dotsWrap.innerHTML = '';
        const cards = getCards();
        cards.forEach((_, i) => {
            const dot = document.createElement('span');
            dot.className = 'slider-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => scrollToCard(i));
            dotsWrap.appendChild(dot);
        });
    }

    function scrollToCard(index) {
        const cards = getCards();
        const card = cards[index];
        if (!card) return;
        track.scrollTo({
            left: card.offsetLeft - track.offsetLeft,
            behavior: 'smooth'
        });
    }

    function getActiveIndex() {
        const cards = getCards();
        const trackLeft = track.scrollLeft;
        let closestIndex = 0;
        let closestDistance = Infinity;
        cards.forEach((card, i) => {
            const distance = Math.abs(card.offsetLeft - track.offsetLeft - trackLeft);
            if (distance < closestDistance) {
                closestDistance = distance;
                closestIndex = i;
            }
        });
        return closestIndex;
    }

    function updateDots() {
        if (!dotsWrap) return;
        const activeIndex = getActiveIndex();
        Array.from(dotsWrap.children).forEach((dot, i) => {
            dot.classList.toggle('active', i === activeIndex);
        });
    }

    function scrollByOneCard(direction) {
        const cards = getCards();
        if (!cards.length) return;
        const currentIndex = getActiveIndex();
        const targetIndex = Math.min(
            Math.max(currentIndex + direction, 0),
            cards.length - 1
        );
        scrollToCard(targetIndex);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => scrollByOneCard(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => scrollByOneCard(1));

    let scrollTimeout;
    track.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateDots, 100);
    }, { passive: true });

    buildDots();
}

initSlider({
    trackId: 'expertiseSlider',
    prevId: 'expertisePrev',
    nextId: 'expertiseNext',
    dotsId: 'expertiseDots',
    cardSelector: '.expertise-card'
});

initSlider({
    trackId: 'servicesSlider',
    prevId: 'servicesPrev',
    nextId: 'servicesNext',
    dotsId: 'servicesDots',
    cardSelector: '.service-card'
});

// ====================
// Enhanced Form Handling with Validation
// ====================

const contactFormHome = document.getElementById('contactFormHome');
const contactForm = document.getElementById('contactForm');

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function handleFormSubmit(e, form) {
    e.preventDefault();

    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const subject = form.querySelector('#subject').value.trim();
    const message = form.querySelector('#message').value.trim();

    if (!name || !email || !subject || !message) {
        showNotification('Please fill in all fields.', 'error');
        return;
    }

    if (!validateEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
    }

    if (message.length < 10) {
        showNotification('Message must be at least 10 characters long.', 'error');
        return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    const originalBg = btn.style.background;

    btn.disabled = true;
    btn.textContent = 'Sending...';
    btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    btn.style.opacity = '0.8';

    setTimeout(() => {
        btn.textContent = 'Message Sent Successfully';
        btn.style.background = 'linear-gradient(135deg, #4ade80, #22c55e)';
        btn.style.opacity = '1';

        showNotification("Message sent! I'll get back to you soon.", 'success');

        form.reset();

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = originalBg;
            btn.disabled = false;
        }, 3000);

        console.log({ name, email, subject, message });
    }, 1500);
}

if (contactFormHome) {
    contactFormHome.addEventListener('submit', (e) => handleFormSubmit(e, contactFormHome));
}

if (contactForm) {
    contactForm.addEventListener('submit', (e) => handleFormSubmit(e, contactForm));
}

// ====================
// Notification System
// ====================

function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#60a5fa'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        font-family: 'Inter', sans-serif;
        font-size: 0.9rem;
        font-weight: 500;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        animation: slideInRight 0.4s ease-out;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(40px)';
        setTimeout(() => notification.remove(), 400);
    }, 4000);
}

// Inject keyframes used by the notification system
const styleTag = document.createElement('style');
styleTag.textContent = `
@keyframes slideInRight {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
}
`;
document.head.appendChild(styleTag);

// ====================
// Copy Email to Clipboard
// ====================

function copyEmail(email) {
    navigator.clipboard.writeText(email).then(() => {
        showNotification('Email copied to clipboard!', 'success');
    }).catch(() => {
        showNotification('Failed to copy email', 'error');
    });
}

// ====================
// Counter Animation
// ====================

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const startTime = Date.now();

    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (target - start) * progress);
        element.textContent = current + (element.dataset.suffix || '');

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    update();
}

const statElements = document.querySelectorAll(
    '.stat-number-large, .github-stat-number, .stat-number, .stat-value'
);

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.hasAttribute('data-counted')) {
            const text = entry.target.textContent.trim();
            const match = text.match(/^(\d+)(.*)$/);

            if (match) {
                const number = parseInt(match[1], 10);
                const suffix = match[2] || '';
                entry.target.setAttribute('data-counted', 'true');
                entry.target.dataset.suffix = suffix;
                animateCounter(entry.target, number);
            }
        }
    });
}, { threshold: 0.5 });

statElements.forEach(el => counterObserver.observe(el));

// ====================
// Lazy Loading Images
// ====================

if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                }
                obs.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ====================
// Smooth Page Transitions
// ====================

document.body.style.opacity = '0';

window.addEventListener('load', () => {
    document.body.style.transition = 'opacity 0.3s ease';
    document.body.style.opacity = '1';
});

// ====================
// Button Ripple Effect
// ====================

document.querySelectorAll('.btn, .btn-modern').forEach(button => {
    button.style.position = button.style.position || 'relative';
    button.style.overflow = 'hidden';

    button.addEventListener('click', function (e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            border-radius: 50%;
            background: rgba(255,255,255,0.35);
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
        `;

        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

const rippleStyleTag = document.createElement('style');
rippleStyleTag.textContent = `
@keyframes rippleEffect {
    to { transform: scale(2.5); opacity: 0; }
}
`;
document.head.appendChild(rippleStyleTag);

// ====================
// Scroll Progress Indicator
// ====================

const progressBar = document.createElement('div');
progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    width: 0%;
    background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
    z-index: 9999;
    transition: width 0.1s ease;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
    progressBar.style.width = scrolled + '%';
}, { passive: true });

// ====================
// Initialization Log
// ====================

console.log('Portfolio loaded with enhanced animations, sliders, and interactions.');