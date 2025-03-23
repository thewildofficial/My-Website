// Custom JavaScript functions

// Toggle Table of Contents visibility
function toggleTOC() {
    const toc = document.getElementById('toc');
    if (toc) {
        toc.classList.toggle('show-toc');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling for TOC links
    const tocLinks = document.querySelectorAll('#TableOfContents a');
    tocLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Highlight the section briefly
                targetElement.classList.add('highlight-section');
                setTimeout(() => {
                    targetElement.classList.remove('highlight-section');
                }, 2000);
                
                // On mobile, hide TOC after clicking a link
                if (window.innerWidth < 1200) {
                    document.getElementById('toc').classList.remove('show-toc');
                }
            }
        });
    });
});
