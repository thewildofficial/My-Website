// Stagewise Toolbar Integration for Hugo
// Only loads in development mode (when running hugo server)

(function() {
    'use strict';
    
    // Check if we're in development mode
    // Hugo doesn't have a built-in way to detect this, so we'll check for development indicators
    const isDevelopment = 
        window.location.hostname === 'localhost' || 
        window.location.hostname === '127.0.0.1' ||
        window.location.port !== '' ||
        window.location.search.includes('stagewise=true'); // Allow manual activation

    if (!isDevelopment) {
        console.log('Stagewise: Not in development mode, skipping toolbar initialization');
        return;
    }

    // Dynamic import of stagewise toolbar
    async function initializeStagewise() {
        try {
            // Try loading from locally installed package
            const { initToolbar } = await import('https://cdn.jsdelivr.net/npm/@stagewise/toolbar@0.4.8/+esm');
            
            initToolbar({
                plugins: [],
                // Additional config options can be added here
                position: 'bottom-right',
                theme: 'auto'
            });
            
            console.log('Stagewise toolbar initialized successfully');
        } catch (error) {
            console.warn('Failed to initialize Stagewise toolbar from CDN:', error);
            
            // Alternative CDN fallback
            try {
                const { initToolbar } = await import('https://unpkg.com/@stagewise/toolbar@0.4.8/dist/index.js');
                initToolbar({ 
                    plugins: [],
                    position: 'bottom-right',
                    theme: 'auto'
                });
                console.log('Stagewise toolbar loaded from unpkg CDN');
            } catch (cdnError) {
                console.error('Failed to load Stagewise from any CDN:', cdnError);
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeStagewise);
    } else {
        initializeStagewise();
    }
})(); 