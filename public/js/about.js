// About Page Interactive Functionality

document.addEventListener('DOMContentLoaded', function() {
    initAboutPage();
});

function initAboutPage() {
    // Only run on about page
    if (!document.querySelector('.about-hero')) return;
    
    initIntersectionObserver();
    initParallaxEffect();
    initContactCardEffects();
    initReadingProgress();
}

// Initialize intersection observer for animations
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
    document.querySelectorAll('.interest-card, .contact-card, .philosophy-highlight, .agency-section').forEach(el => {
        observer.observe(el);
    });
}

// Parallax effect for hero section
function initParallaxEffect() {
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.about-hero');
        if (hero) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.2;
            hero.style.transform = `translateY(${rate}px)`;
        }
    });
}

// Enhanced contact card effects
function initContactCardEffects() {
    document.querySelectorAll('.contact-card').forEach(card => {
        // Add 3D tilt effect
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 8;
            const rotateY = (centerX - x) / 8;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
}

// Add reading progress indicator
function initReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="reading-progress-fill"></div>';
    
    const progressStyles = `
    <style>
    .reading-progress {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background: rgba(255, 255, 255, 0.1);
        z-index: 1000;
    }
    
    .reading-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--highlight-color), var(--code-color));
        width: 0%;
        transition: width 0.3s ease;
    }
    </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', progressStyles);
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrolled / maxHeight) * 100;
        
        const progressFill = document.querySelector('.reading-progress-fill');
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
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

// Interest card enhanced interactions
document.querySelectorAll('.interest-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        // Add subtle scale effect to the emoji in the title
        const emoji = this.querySelector('h3').textContent.split(' ')[0];
        const title = this.querySelector('h3');
        if (emoji && title) {
            title.style.transform = 'scale(1.1)';
            title.style.transition = 'transform 0.3s ease';
        }
    });

    card.addEventListener('mouseleave', function() {
        const title = this.querySelector('h3');
        if (title) {
            title.style.transform = 'scale(1)';
        }
    });
});

// Add dynamic background effect to philosophy highlight
function initPhilosophyHighlight() {
    const philosophyBox = document.querySelector('.philosophy-highlight');
    if (philosophyBox) {
        philosophyBox.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, rgba(17, 17, 17, 0.9) 0%, rgba(80, 227, 202, 0.1) 50%, rgba(33, 33, 33, 0.7) 100%)';
        });

        philosophyBox.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, rgba(17, 17, 17, 0.8) 0%, rgba(33, 33, 33, 0.6) 100%)';
        });
    }
}

// Initialize philosophy highlight effect
setTimeout(initPhilosophyHighlight, 500); 