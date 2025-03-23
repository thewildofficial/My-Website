// Toggle TOC visibility
document.addEventListener('DOMContentLoaded', function() {
    const toc = document.getElementById('toc');
    if (!toc) return;

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-btn';
    closeButton.innerHTML = '×';
    closeButton.onclick = () => {
        toc.classList.add('collapsed');
    };
    toc.appendChild(closeButton);

    // Add expand button
    const expandButton = document.createElement('button');
    expandButton.className = 'expand-btn';
    expandButton.innerHTML = '▶';
    expandButton.onclick = () => {
        toc.classList.remove('collapsed');
    };
    toc.appendChild(expandButton);

    // Highlight active section
    function highlightActiveSection() {
        const sections = document.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]');
        let currentSection = null;
        let currentDistance = Infinity;

        sections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const distance = Math.abs(rect.top);

            if (distance < currentDistance && rect.top >= -100 && rect.top <= 200) {
                currentSection = section;
                currentDistance = distance;
            }
        });

        if (currentSection) {
            const tocLinks = document.querySelectorAll('#TableOfContents a');
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection.id}`) {
                    link.classList.add('active');
                }
            });
        }
    }

    // Update active section on scroll
    window.addEventListener('scroll', highlightActiveSection);
    highlightActiveSection();
});
