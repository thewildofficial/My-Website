// Portfolio Page Enhanced Interactivity

document.addEventListener('DOMContentLoaded', function() {
    initPortfolioPage();
});

function initPortfolioPage() {
    // Only run on portfolio page
    if (!document.querySelector('.journey-container')) return;
    
    initIntersectionObserver();
    initStatsCounter();
    initProjectCardEffects();
    initContactWidget();
    initParallaxJourney();
}

// Intersection Observer for animations
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.project-card, .extracurricular-card, .stats-container').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced stats counter
function initStatsCounter() {
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = document.querySelectorAll('.stat-number');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    if (target) {
                        animateValue(counter, 0, target, 2000);
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
        observer.observe(statsContainer);
    }
}

// Enhanced project card effects
function initProjectCardEffects() {
    document.querySelectorAll('.project-card').forEach(card => {
        // Add 3D tilt effect
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
}

// Contact widget functionality
function initContactWidget() {
    const contactButton = document.querySelector('.contact-button');
    const contactPopup = document.getElementById('contact-popup');
    
    if (contactButton && contactPopup) {
        contactButton.addEventListener('click', function() {
            if (contactPopup.style.display === 'none' || !contactPopup.style.display) {
                contactPopup.style.display = 'block';
            } else {
                contactPopup.style.display = 'none';
            }
        });

        // Close popup when clicking outside
        document.addEventListener('click', function(e) {
            if (!contactButton.contains(e.target) && !contactPopup.contains(e.target)) {
                contactPopup.style.display = 'none';
            }
        });
    }
}

// Parallax effect for journey steps
function initParallaxJourney() {
    window.addEventListener('scroll', () => {
        const journeySteps = document.querySelectorAll('.journey-step');
        journeySteps.forEach((step, index) => {
            const rect = step.getBoundingClientRect();
            const speed = 0.3;
            const yPos = rect.top * speed;
            const content = step.querySelector('.journey-content');
            if (content) {
                content.style.transform = `translateY(${yPos}px)`;
            }
        });
    });
}

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading animation styles
const loadingStyles = `
<style>
.loading-animation {
    text-align: center;
    padding: 2rem;
    color: var(--faded-text);
    font-style: italic;
}

.loading-animation::after {
    content: '';
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid var(--faded-text);
    border-radius: 50%;
    border-top-color: var(--highlight-color);
    animation: spin 1s ease-in-out infinite;
    margin-left: 10px;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(-10px); }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', loadingStyles);

// Enhanced extracurricular card effects
document.querySelectorAll('.extracurricular-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        const icon = this.querySelector('.extracurricular-icon');
        if (icon) {
            icon.style.transform = 'scale(1.2) rotate(5deg)';
            icon.style.transition = 'transform 0.3s ease';
        }
    });

    card.addEventListener('mouseleave', function() {
        const icon = this.querySelector('.extracurricular-icon');
        if (icon) {
            icon.style.transform = 'scale(1) rotate(0deg)';
        }
    });
});

// Add dynamic background effects
function createFloatingElements() {
    const container = document.querySelector('main');
    if (!container) return;

    for (let i = 0; i < 3; i++) {
        const element = document.createElement('div');
        element.className = 'floating-bg-element';
        element.style.cssText = `
            position: fixed;
            width: 100px;
            height: 100px;
            background: radial-gradient(circle, rgba(255, 51, 133, 0.1) 0%, transparent 70%);
            border-radius: 50%;
            pointer-events: none;
            z-index: -1;
            animation: float-bg ${8 + i * 2}s ease-in-out infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        container.appendChild(element);
    }
}

// Background floating animation
const bgStyles = `
<style>
@keyframes float-bg {
    0%, 100% { transform: translate(0, 0) scale(1); }
    25% { transform: translate(30px, -30px) scale(1.1); }
    50% { transform: translate(-20px, 20px) scale(0.9); }
    75% { transform: translate(20px, -10px) scale(1.05); }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', bgStyles);
createFloatingElements();
