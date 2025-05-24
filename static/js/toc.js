// Toggle TOC visibility
document.addEventListener('DOMContentLoaded', function() {
    const tocContainer = document.getElementById('TableOfContents');
    if (!tocContainer) {
        console.log('ToC container #TableOfContents not found.');
        return;
    }

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'toc-close-btn';
    closeButton.innerHTML = '×';
    closeButton.setAttribute('aria-label', 'Close Table of Contents');
    closeButton.onclick = () => {
        tocContainer.classList.add('collapsed');
    };

    // Add expand button (to be shown when collapsed)
    const expandButton = document.createElement('button');
    expandButton.className = 'toc-expand-btn';
    expandButton.innerHTML = '☰';
    expandButton.setAttribute('aria-label', 'Open Table of Contents');
    expandButton.onclick = () => {
        tocContainer.classList.remove('collapsed');
    };

    // Add a header to the ToC for the buttons
    const tocHeader = document.createElement('div');
    tocHeader.className = 'toc-header';
    tocHeader.appendChild(expandButton);
    tocHeader.appendChild(closeButton);
    tocContainer.insertBefore(tocHeader, tocContainer.firstChild);
    console.log('ToC buttons added.');

    // Highlight active section
    function highlightActiveSection() {
        const sections = document.querySelectorAll('h2[id], h3[id], h4[id]');
        if (sections.length === 0) return;

        let currentSection = null;
        let smallestTopValue = Infinity;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            if (rect.top >= -5 && rect.top < smallestTopValue) {
                smallestTopValue = rect.top;
                currentSection = section;
            } else if (currentSection == null && rect.top < smallestTopValue) {
                smallestTopValue = rect.top;
                currentSection = section;
            }
        });

        // Corrected selector: directly query for `a` tags within the ul/ol of tocContainer
        const tocLinks = tocContainer.querySelectorAll('ul a, ol a');
        tocLinks.forEach(link => {
            link.classList.remove('active');
        });

        if (currentSection) {
            // Corrected selector: ensure query is within tocContainer
            const activeLink = tocContainer.querySelector(`a[href="#${currentSection.id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    }

    // Update active section on scroll
    window.addEventListener('scroll', highlightActiveSection, { passive: true });
    highlightActiveSection(); // Initial call
});
