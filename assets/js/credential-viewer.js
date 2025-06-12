document.addEventListener('DOMContentLoaded', function() {
    // Check if we are on the credentials page by looking for a unique container
    if (document.querySelector('.credentials-container')) {
        document.body.classList.add('credentials-page-active');

        // Modal handling logic
        const modal = document.getElementById('credentialModal');
        const closeButton = document.querySelector('.modal .close-button');
        // Ensure we are selecting links that are intended to open in the modal (typically PDF links)
        const docLinks = document.querySelectorAll('.credential-card .doc-link[href$=".pdf"]'); 

        if (modal && closeButton) {
            docLinks.forEach(link => {
                link.addEventListener('click', function(event) {
                    event.preventDefault(); // Prevent default link behavior for PDF links

                    const card = link.closest('.credential-card');
                    if (!card) return;

                    const titleElement = card.querySelector('.institution-info h3');
                    const programElement = card.querySelector('.institution-info .program');
                    const descriptionElement = card.querySelector('.card-content .description');
                    
                    const title = titleElement ? titleElement.textContent : 'Credential';
                    const program = programElement ? programElement.textContent : '';
                    const pdfUrl = link.href;
                    const description = descriptionElement ? descriptionElement.textContent : 'No description available.';

                    const modalTitle = document.getElementById('modalTitle');
                    const modalPdfViewer = document.getElementById('modalPdfViewer');
                    const modalDescription = document.getElementById('modalDescription');
                    const modalDirectLink = document.getElementById('modalDirectLink');

                    if (modalTitle) modalTitle.textContent = title + (program ? ` - ${program}` : '');
                    if (modalPdfViewer) modalPdfViewer.src = pdfUrl;
                    if (modalDescription) modalDescription.textContent = description;
                    if (modalDirectLink) modalDirectLink.href = pdfUrl;
                    
                    modal.style.display = 'block';
                    document.body.style.overflow = 'hidden'; // Prevent background scroll when modal is open
                });
            });

            closeButton.onclick = function() {
                modal.style.display = 'none';
                const modalPdfViewer = document.getElementById('modalPdfViewer');
                if (modalPdfViewer) modalPdfViewer.src = ''; // Clear src to stop video/pdf loading
                document.body.style.overflow = ''; // Restore background scroll
            }

            window.onclick = function(event) {
                if (event.target == modal) {
                    modal.style.display = 'none';
                    const modalPdfViewer = document.getElementById('modalPdfViewer');
                    if (modalPdfViewer) modalPdfViewer.src = '';
                    document.body.style.overflow = ''; // Restore background scroll
                }
            }
        }

        // Parallax effect for hero (subtle)
        const hero = document.querySelector('.credentials-hero');
        if (hero) {
            window.addEventListener('scroll', () => {
                const scrollPosition = window.pageYOffset;
                // Apply a subtle parallax effect to the hero's background or a pseudo-element if needed
                // For example, if hero has a ::before for background image:
                // hero.style.setProperty('--hero-bg-y', scrollPosition * 0.2 + 'px');
                // This example assumes direct background manipulation or CSS variables.
            }, { passive: true }); // Use passive listener for scroll performance
        }

        // Animate progress bars on scroll into view
        const progressFills = document.querySelectorAll('.progress-fill');
        
        const animateProgress = (element) => {
            const targetWidth = element.getAttribute('style').match(/width:\s*(\d+)%/);
            if (targetWidth && targetWidth[1]) {
                element.style.width = '0%'; // Reset for animation if not already 0
                setTimeout(() => { // Ensure reset is applied before animation
                    element.style.width = targetWidth[1] + '%';
                }, 50); // Short delay
            }
        };

        if (progressFills.length > 0) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animateProgress(entry.target);
                        observer.unobserve(entry.target); // Animate only once
                    }
                });
            }, { threshold: 0.3 }); // Trigger when 30% of the element is visible

            progressFills.forEach(bar => {
                observer.observe(bar);
            });
        }

        // Dynamic card entrance animation
        const cards = document.querySelectorAll('.credential-card, .reflection-card');
        if (cards.length > 0) {
            const cardObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry, index) => {
                    if (entry.isIntersecting) {
                        entry.target.style.animation = `cardEnterAnimation 0.6s ${index * 0.1}s cubic-bezier(0.25, 0.8, 0.25, 1) forwards`;
                        cardObserver.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }); // Trigger a bit before fully in view

            cards.forEach(card => {
                card.style.opacity = '0'; // Start hidden for animation
                cardObserver.observe(card);
            });
        }
    }
});

// Add CSS for cardEnterAnimation if not already in a global CSS file or the credentials.css
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = `
@keyframes cardEnterAnimation {
    from {
        opacity: 0;
        transform: translateY(40px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}
`;
document.head.appendChild(styleSheet);