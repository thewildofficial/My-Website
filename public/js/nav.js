document.addEventListener('DOMContentLoaded', function() {
    const header = document.getElementById('site-header');
    let lastScrollY = window.scrollY;
    let ticking = false;

    function updateHeader() {
        // Show header at the top of the page
        if (window.scrollY < 100) {
            header.classList.remove('nav-hidden');
            return;
        }

        // Hide header when scrolling down, show when scrolling up
        if (window.scrollY > lastScrollY) {
            header.classList.add('nav-hidden');
        } else {
            header.classList.remove('nav-hidden');
        }

        lastScrollY = window.scrollY;
        ticking = false;
    }

    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                updateHeader();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
});
