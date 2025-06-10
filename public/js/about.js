// About Page Interactions - Expert Level
document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth reveal animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const animatedElements = document.querySelectorAll('.core-section, .interests-section, .physical-section, .philosophy-card, .agency-card, .favorite-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });

    // Enhanced stat counter animation
    const statNumbers = document.querySelectorAll('.stat-card .number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateStat = () => {
            current += step;
            if (current < target) {
                stat.textContent = Math.floor(current);
                requestAnimationFrame(updateStat);
            } else {
                stat.textContent = target;
            }
        };
        
        // Start animation when element is visible
        const statObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    updateStat();
                    statObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        statObserver.observe(stat.closest('.stat-card'));
    });

    // Enhanced pill hover effects
    const pills = document.querySelectorAll('.pill');
    pills.forEach(pill => {
        pill.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px) scale(1.05)';
        });
        
        pill.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Favorite cards 3D tilt effect
    const favoriteCards = document.querySelectorAll('.favorite-card');
    favoriteCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // Staggered animation for favorite cards
    const favoriteCardsGrid = document.querySelectorAll('.items-grid .favorite-card');
    favoriteCardsGrid.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // Parallax effect for hero section
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.about-hero');
        if (hero) {
            hero.style.transform = `translateY(${scrolled * 0.5}px)`;
        }
    });

    // Enhanced contact link interactions
    const contactLinks = document.querySelectorAll('.contact-link');
    contactLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
            this.style.boxShadow = '0 6px 20px rgba(var(--accent-rgb), 0.3)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 4px 16px rgba(var(--accent-rgb), 0.2)';
        });
    });

    // Reading progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 2px;
        background: linear-gradient(90deg, var(--accent) 0%, #7c3aed 100%);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset;
        const docHeight = document.body.offsetHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });

    // Smooth scrolling for internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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

    // Quote animation on hover
    const quotes = document.querySelectorAll('.favorite-card .quote');
    quotes.forEach(quote => {
        quote.addEventListener('mouseenter', function() {
            this.style.color = 'var(--accent)';
            this.style.transform = 'scale(1.02)';
        });
        
        quote.addEventListener('mouseleave', function() {
            this.style.color = 'var(--primary)';
            this.style.transform = 'scale(1)';
        });
    });

    // Enhanced philosophy card interaction
    const philosophyCard = document.querySelector('.philosophy-card');
    if (philosophyCard) {
        philosophyCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.01)';
            this.style.boxShadow = '0 15px 40px rgba(var(--accent-rgb), 0.2)';
        });
        
        philosophyCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    }

    // Agency card interaction
    const agencyCard = document.querySelector('.agency-card');
    if (agencyCard) {
        agencyCard.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.01)';
            this.style.boxShadow = '0 15px 40px rgba(var(--accent-rgb), 0.2)';
        });
        
        agencyCard.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = 'none';
        });
    }

    // Dynamic background effect for hero
    const hero = document.querySelector('.about-hero');
    if (hero) {
        let mouseX = 0;
        let mouseY = 0;
        
        hero.addEventListener('mousemove', function(e) {
            mouseX = (e.clientX / window.innerWidth) * 100;
            mouseY = (e.clientY / window.innerHeight) * 100;
            
            this.style.background = `
                radial-gradient(circle at ${mouseX}% ${mouseY}%, 
                rgba(var(--accent-rgb), 0.1) 0%, 
                rgba(13, 17, 23, 0.95) 40%)
            `;
        });
        
        hero.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, rgba(13, 17, 23, 0.9) 0%, rgba(13, 17, 23, 0.95) 100%)';
        });
    }

    // Performance optimization: debounce scroll events
    let ticking = false;
    function updateOnScroll() {
        // Scroll-dependent animations here
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            requestAnimationFrame(updateOnScroll);
            ticking = true;
        }
    });

    console.log('About page interactions loaded - Expert level UX active');
}); 
setTimeout(initPhilosophyHighlight, 500); 
setTimeout(initPhilosophyHighlight, 500); 