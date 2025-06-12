// Enhanced Credentials Page JavaScript - Modern Interactions & Animations

document.addEventListener('DOMContentLoaded', function() {
    // Add body class for credentials page
    document.body.classList.add('credentials-page-active');
    
    // Initialize all interactions
    initScrollAnimations();
    initProgressBars();
    initCardInteractions();
    initParallaxEffects();
    initTypewriterEffect();
    initIntersectionObserver();
    initFloatingParticles();
    
    // Enhanced modal functionality
    initEnhancedModal();
    
    // Initialize performance monitoring
    console.log('🎨 Credentials page enhanced animations loaded successfully!');
});

// Smooth scroll animations for elements
function initScrollAnimations() {
    const scrollElements = document.querySelectorAll('.credential-card, .location-marker, .reflection-card');
    
    const elementInView = (el, dividend = 1) => {
        const elementTop = el.getBoundingClientRect().top;
        return (
            elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
        );
    };

    const displayScrollElement = (element) => {
        element.classList.add('scrolled');
    };

    const hideScrollElement = (element) => {
        element.classList.remove('scrolled');
    };

    const handleScrollAnimation = () => {
        scrollElements.forEach((el) => {
            if (elementInView(el, 1.25)) {
                displayScrollElement(el);
            } else {
                hideScrollElement(el);
            }
        })
    }

    window.addEventListener('scroll', () => {
        handleScrollAnimation();
    });
}

// Animated progress bars
function initProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill');
    
    const animateProgressBar = (progressBar) => {
        const targetWidth = progressBar.style.width || progressBar.getAttribute('data-width') || '0%';
        progressBar.style.width = '0%';
        
        setTimeout(() => {
            progressBar.style.width = targetWidth;
        }, 300);
    };

    // Intersection Observer for progress bars
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.progress-fill');
                if (progressBar) {
                    animateProgressBar(progressBar);
                }
            }
        });
    }, {
        threshold: 0.5
    });

    // Observe progress containers
    document.querySelectorAll('.progress-container').forEach(container => {
        progressObserver.observe(container.parentElement);
    });
}

// Enhanced card interactions
function initCardInteractions() {
    const cards = document.querySelectorAll('.credential-card');
    
    cards.forEach(card => {
        // Mouse move effect for 3D tilt
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth > 768) { // Only on desktop
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px) scale(1.02)`;
            }
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
        
        // Click animation
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.doc-link')) {
                card.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    card.style.transform = '';
                }, 150);
            }
        });
    });
}

// Parallax effects
function initParallaxEffects() {
    const hero = document.querySelector('.credentials-hero');
    
    if (hero) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            hero.style.transform = `translateY(${rate}px)`;
        });
    }
}

// Typewriter effect for hero title
function initTypewriterEffect() {
    const title = document.querySelector('.journey-header h1');
    if (!title) return;
    
    const text = title.textContent;
    title.textContent = '';
    title.style.borderRight = '2px solid';
    title.style.animation = 'blink 1s infinite';
    
    let i = 0;
    const speed = 50;
    
    function typeWriter() {
        if (i < text.length) {
            title.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, speed);
        } else {
            // Remove cursor after typing is complete
            setTimeout(() => {
                title.style.borderRight = 'none';
                title.style.animation = 'none';
            }, 1000);
        }
    }
    
    // Start typing after a short delay
    setTimeout(typeWriter, 500);
}

// Enhanced Intersection Observer for staggered animations
function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('animate-in');
                }, index * 100); // Staggered animation
            }
        });
    }, observerOptions);
    
    // Observe all cards and sections
    document.querySelectorAll('.credential-card, .credentials-section, .location-marker').forEach(el => {
        observer.observe(el);
    });
}

// Enhanced modal with better UX
function initEnhancedModal() {
    const modal = document.getElementById('credentialModal');
    const docLinks = document.querySelectorAll('.doc-link');
    
    if (!modal) return;
    
    // Create loading spinner
    const createSpinner = () => {
        return `
            <div class="modal-loading">
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Loading document...</p>
                </div>
            </div>
        `;
    };
    
    docLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const url = link.href;
            const title = link.getAttribute('aria-label') || 'Document';
            
            // Show modal with loading state
            modal.style.display = 'flex';
            modal.style.opacity = '0';
            modal.innerHTML = `
                <div class="modal-content">
                    <span class="close-button">&times;</span>
                    <h3>${title}</h3>
                    ${createSpinner()}
                </div>
            `;
            
            // Animate in
            requestAnimationFrame(() => {
                modal.style.opacity = '1';
            });
            
            // Load document
            setTimeout(() => {
                modal.querySelector('.modal-content').innerHTML = `
                    <span class="close-button">&times;</span>
                    <h3>${title}</h3>
                    <iframe src="${url}" frameborder="0" style="width:100%; height:70vh; border-radius: 8px; border: 1px solid var(--border-light);"></iframe>
                    <a href="${url}" target="_blank" class="doc-link" style="margin-top: 1rem; align-self: flex-start;">Open in new tab</a>
                `;
                
                // Re-attach close handler
                const closeBtn = modal.querySelector('.close-button');
                closeBtn.addEventListener('click', closeModal);
                
            }, 800); // Simulate loading time
        });
    });
    
    // Close modal function
    function closeModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.style.display === 'flex') {
            closeModal();
        }
    });
}

// Add CSS animations via JavaScript
const addAnimationStyles = () => {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes blink {
            0%, 50% { border-color: transparent; }
            51%, 100% { border-color: var(--accent-primary); }
        }
        
        .credential-card {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .credential-card.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .location-marker {
            opacity: 0;
            transform: scale(0.8);
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .location-marker.animate-in {
            opacity: 1;
            transform: scale(1);
        }
        
        .credentials-section {
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.8s ease-out;
        }
        
        .credentials-section.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .modal-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 300px;
            flex-direction: column;
        }
        
        .loading-spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-light);
            border-top: 3px solid var(--accent-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Smooth scroll behavior */
        html {
            scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
            width: 8px;
        }
        
        ::-webkit-scrollbar-track {
            background: var(--bg-secondary);
        }
        
        ::-webkit-scrollbar-thumb {
            background: var(--gradient-primary);
            border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
            background: var(--accent-secondary);
        }
    `;
    document.head.appendChild(style);
};

// Initialize animation styles
addAnimationStyles();

// Performance optimization: Throttle scroll events
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Floating particles effect
function initFloatingParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'floating-particles';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;
    
    document.body.appendChild(particleContainer);
    
    // Create particles
    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            createParticle(particleContainer);
        }, i * 200);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    const size = Math.random() * 6 + 2;
    const hue = Math.random() * 60 + 200; // Blue-purple range
    
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: linear-gradient(45deg, 
            hsla(${hue}, 70%, 60%, 0.6), 
            hsla(${hue + 30}, 70%, 70%, 0.3));
        border-radius: 50%;
        top: ${Math.random() * 100}vh;
        left: ${Math.random() * 100}vw;
        animation: float ${8 + Math.random() * 8}s ease-in-out infinite;
        filter: blur(1px);
    `;
    
    container.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
        // Create new particle to maintain count
        createParticle(container);
    }, (8 + Math.random() * 8) * 1000);
}

// Add floating animation keyframes
const addFloatingAnimations = () => {
    const style = document.createElement('style');
    style.textContent += `
        @keyframes float {
            0%, 100% {
                transform: translateY(0px) translateX(0px) rotate(0deg);
                opacity: 0;
            }
            10% {
                opacity: 1;
            }
            50% {
                transform: translateY(-100px) translateX(50px) rotate(180deg);
                opacity: 0.8;
            }
            90% {
                opacity: 1;
            }
            100% {
                transform: translateY(-200px) translateX(-30px) rotate(360deg);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
};

// Initialize floating animations
addFloatingAnimations();

// Apply throttling to scroll events
const throttledScroll = throttle(() => {
    // Performance optimized scroll effects
    const scrollPercent = window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight);
    document.documentElement.style.setProperty('--scroll-percent', scrollPercent);
}, 16); // ~60fps

window.addEventListener('scroll', throttledScroll);

// Add scroll-triggered micro-interactions
window.addEventListener('scroll', () => {
    const cards = document.querySelectorAll('.credential-card:not(.animate-in)');
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
            card.classList.add('animate-in');
        }
    });
});

// Enhanced keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});

// Add keyboard navigation styles
const addKeyboardStyles = () => {
    const style = document.createElement('style');
    style.textContent += `
        .keyboard-navigation .credential-card:focus,
        .keyboard-navigation .doc-link:focus,
        .keyboard-navigation .location-marker:focus {
            outline: 2px solid var(--accent-primary);
            outline-offset: 4px;
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);
        }
        
        .credential-card {
            transition: all var(--transition-normal);
        }
        
        .credential-card:focus-visible {
            transform: translateY(-5px);
            box-shadow: var(--shadow-glow);
        }
    `;
    document.head.appendChild(style);
};

addKeyboardStyles(); 