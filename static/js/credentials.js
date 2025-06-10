// Credentials Page Interactive Functionality

document.addEventListener('DOMContentLoaded', function() {
    initCredentialsPage();
});

function initCredentialsPage() {
    // Only run on credentials page
    if (!document.querySelector('.credentials-hero')) return;
    
    initAnimations();
    initProgressBars();
    initDocumentModal();
    initCardInteractions();
    initCounters();
}

// Initialize entrance animations
function initAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe credential cards
    document.querySelectorAll('.credential-card').forEach(card => {
        observer.observe(card);
    });

    // Observe sections
    document.querySelectorAll('.credential-section').forEach(section => {
        observer.observe(section);
    });
}

// Animate progress bars when they come into view
function initProgressBars() {
    const progressObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressFill = entry.target.querySelector('.progress-fill');
                if (progressFill) {
                    const targetWidth = progressFill.style.width;
                    progressFill.style.width = '0%';
                    setTimeout(() => {
                        progressFill.style.width = targetWidth;
                    }, 100);
                }
                progressObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.progress-container').forEach(container => {
        progressObserver.observe(container);
    });
}

// Create modal for PDF documents
function initDocumentModal() {
    // Create modal HTML
    const modalHTML = `
        <div id="doc-modal" class="doc-modal">
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modal-title">Document Viewer</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Loading document...</p>
                    </div>
                    <iframe id="doc-iframe" src="" frameborder="0"></iframe>
                    <div class="modal-error" style="display: none;">
                        <p>Unable to load document. <a id="fallback-link" href="" target="_blank">Click here to open in a new tab</a></p>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Add modal styles
    const modalStyles = `
        <style>
        .doc-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1000;
            display: none;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .doc-modal.show {
            display: flex;
            opacity: 1;
        }
        
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(5px);
        }
        
        .modal-content {
            position: relative;
            width: 90%;
            height: 90%;
            max-width: 1000px;
            margin: auto;
            background: var(--bg-color);
            border-radius: 12px;
            border: 1px solid var(--border-color);
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .modal-header {
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border-color);
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: rgba(17, 17, 17, 0.9);
        }
        
        .modal-header h3 {
            color: var(--text-color);
            margin: 0;
            font-size: 1.2rem;
        }
        
        .modal-close {
            background: none;
            border: none;
            color: var(--text-color);
            font-size: 2rem;
            cursor: pointer;
            padding: 0;
            width: 30px;
            height: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            transition: background-color 0.2s ease;
        }
        
        .modal-close:hover {
            background: rgba(255, 51, 133, 0.2);
        }
        
        .modal-body {
            flex: 1;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .loading-spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            color: var(--text-color);
        }
        
        .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--border-color);
            border-top: 3px solid var(--highlight-color);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        #doc-iframe {
            width: 100%;
            height: 100%;
            border: none;
            display: none;
        }
        
        .modal-error {
            text-align: center;
            color: var(--text-color);
            padding: 2rem;
        }
        
        .modal-error a {
            color: var(--highlight-color);
            text-decoration: none;
        }
        
        @media (max-width: 768px) {
            .modal-content {
                width: 95%;
                height: 95%;
                margin: 2.5% auto;
            }
        }
        </style>
    `;

    document.head.insertAdjacentHTML('beforeend', modalStyles);

    // Handle document links
    document.querySelectorAll('.doc-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openDocumentModal(this.href, this.textContent.trim());
        });
    });

    // Modal event listeners
    const modal = document.getElementById('doc-modal');
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');

    closeBtn.addEventListener('click', closeDocumentModal);
    overlay.addEventListener('click', closeDocumentModal);

    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeDocumentModal();
        }
    });
}

function openDocumentModal(url, title) {
    const modal = document.getElementById('doc-modal');
    const modalTitle = document.getElementById('modal-title');
    const iframe = document.getElementById('doc-iframe');
    const loading = modal.querySelector('.loading-spinner');
    const errorDiv = modal.querySelector('.modal-error');
    const fallbackLink = document.getElementById('fallback-link');

    modalTitle.textContent = title;
    fallbackLink.href = url;

    // Show modal
    modal.classList.add('show');
    loading.style.display = 'flex';
    iframe.style.display = 'none';
    errorDiv.style.display = 'none';

    // Load iframe
    iframe.onload = function() {
        loading.style.display = 'none';
        iframe.style.display = 'block';
    };

    iframe.onerror = function() {
        loading.style.display = 'none';
        errorDiv.style.display = 'block';
    };

    // Set iframe source (try to load PDF)
    iframe.src = url;

    // Fallback for PDF loading issues
    setTimeout(() => {
        if (loading.style.display === 'flex') {
            loading.style.display = 'none';
            errorDiv.style.display = 'block';
        }
    }, 5000);
}

function closeDocumentModal() {
    const modal = document.getElementById('doc-modal');
    const iframe = document.getElementById('doc-iframe');
    
    modal.classList.remove('show');
    setTimeout(() => {
        iframe.src = '';
    }, 300);
}

// Enhanced card interactions
function initCardInteractions() {
    document.querySelectorAll('.credential-card').forEach(card => {
        // Add mouse move effect for 3D tilt
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });

        // Add click effect
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.doc-link') && !e.target.closest('.course-overview-link')) {
                this.style.transform = 'perspective(1000px) scale(0.98) translateY(-2px)';
                setTimeout(() => {
                    this.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
                }, 150);
            }
        });
    });
}

// Animate counters (for acceptance rate)
function initCounters() {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target.querySelector('.percentage');
                if (counter) {
                    animateCounter(counter);
                }
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.rate-circle').forEach(circle => {
        counterObserver.observe(circle);
    });
}

function animateCounter(element) {
    const target = parseInt(element.textContent);
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + '%';
    }, 16);
}

// Add smooth scrolling for better navigation
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

// Add parallax effect to hero section
window.addEventListener('scroll', function() {
    const hero = document.querySelector('.credentials-hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        hero.style.transform = `translateY(${rate}px)`;
    }
});

// Add typing effect to hero title (optional enhancement)
function addTypingEffect() {
    const title = document.querySelector('.journey-header h1');
    if (title) {
        const text = title.textContent;
        title.textContent = '';
        title.style.borderRight = '2px solid var(--highlight-color)';
        
        let i = 0;
        const typeTimer = setInterval(() => {
            title.textContent += text.charAt(i);
            i++;
            if (i >= text.length) {
                clearInterval(typeTimer);
                setTimeout(() => {
                    title.style.borderRight = 'none';
                }, 500);
            }
        }, 100);
    }
}

// Initialize enhanced features
setTimeout(() => {
    // Add some delayed enhancements
    document.querySelectorAll('.credential-card').forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}, 100); 