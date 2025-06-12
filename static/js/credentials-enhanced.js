// Enhanced Credentials Page JavaScript - Simplified World Map Animation

console.log('🚀 Starting credentials page initialization...');

// Initialize immediately when script loads
(function() {
    console.log('📍 Script loaded, setting up listeners...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCredentialsPage);
    } else {
        initCredentialsPage();
    }
})();

function initCredentialsPage() {
    console.log('🎯 Initializing credentials page...');
    
    // Add body class
    document.body.classList.add('credentials-page-active');
    console.log('✅ Body class added');
    
    // Initialize world map immediately
    setTimeout(() => {
        initWorldMap();
    }, 100);
    
    // Initialize other features
    initBasicAnimations();
    
    console.log('✨ Credentials page initialization complete');
}

function initWorldMap() {
    console.log('🌍 Creating world map canvas...');
    
    try {
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'worldMapCanvas';
        canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -1;
            opacity: 0.5;
            pointer-events: none;
            background: transparent;
        `;
        
        // Add to body
        document.body.insertBefore(canvas, document.body.firstChild);
        console.log('✅ Canvas created and added to DOM');
        
        // Set canvas size
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.log(`📐 Canvas size: ${canvas.width}x${canvas.height}`);
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('❌ Failed to get 2D context');
            return;
        }
        
        // Animation variables
        let dots = [];
        let connections = [];
        let frame = 0;
        
        // Create world dots
        function createDots() {
            console.log('🔵 Creating dots...');
            dots = [];
            
            // Simple world map regions
            const regions = [
                { x: 0.15, y: 0.25, w: 0.25, h: 0.3, count: 20 }, // North America
                { x: 0.45, y: 0.2, w: 0.15, h: 0.2, count: 15 },  // Europe
                { x: 0.65, y: 0.15, w: 0.3, h: 0.4, count: 25 },  // Asia
                { x: 0.45, y: 0.35, w: 0.15, h: 0.25, count: 12 }, // Africa
                { x: 0.25, y: 0.5, w: 0.1, h: 0.3, count: 10 },   // South America
                { x: 0.8, y: 0.65, w: 0.12, h: 0.1, count: 8 }    // Australia
            ];
            
            regions.forEach(region => {
                for (let i = 0; i < region.count; i++) {
                    const x = (region.x + Math.random() * region.w) * canvas.width;
                    const y = (region.y + Math.random() * region.h) * canvas.height;
                    
                    dots.push({
                        x: x,
                        y: y,
                        originalX: x,
                        originalY: y,
                        opacity: 0.3 + Math.random() * 0.7,
                        size: 1 + Math.random() * 2,
                        phase: Math.random() * Math.PI * 2,
                        isActive: Math.random() < 0.2
                    });
                }
            });
            
            console.log(`✅ Created ${dots.length} dots`);
        }
        
        // Animation loop
        function animate() {
            frame++;
            
            // Clear canvas with dithered background
            ctx.fillStyle = '#0A0E1A';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add dithering pattern
            if (frame % 3 === 0) { // Only every 3rd frame for performance
                ctx.globalAlpha = 0.3;
                for (let x = 0; x < canvas.width; x += 8) {
                    for (let y = 0; y < canvas.height; y += 8) {
                        if (Math.random() < 0.1) {
                            ctx.fillStyle = Math.random() < 0.5 ? '#1A1F2E' : '#0F1218';
                            ctx.fillRect(x, y, 2, 2);
                        }
                    }
                }
                ctx.globalAlpha = 1;
            }
            
            // Update and draw dots
            dots.forEach((dot, index) => {
                // Update properties
                const time = frame * 0.01;
                dot.opacity = 0.3 + Math.sin(time + dot.phase) * 0.3;
                dot.x = dot.originalX + Math.sin(time * 0.5 + dot.phase) * 1;
                dot.y = dot.originalY + Math.cos(time * 0.3 + dot.phase) * 1;
                
                // Random flicker
                if (Math.random() < 0.02) {
                    dot.opacity *= 0.3;
                }
                
                // Draw dot
                const alpha = Math.max(0.1, dot.opacity);
                
                if (dot.isActive) {
                    ctx.shadowColor = '#E2E8F0';
                    ctx.shadowBlur = 4;
                    ctx.fillStyle = `rgba(248, 250, 252, ${alpha})`;
                } else {
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = `rgba(203, 213, 225, ${alpha * 0.8})`;
                }
                
                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
                ctx.fill();
                
                // Pixelation effect
                if (Math.random() < 0.2) {
                    ctx.fillStyle = `rgba(148, 163, 184, ${alpha * 0.4})`;
                    ctx.fillRect(
                        Math.floor(dot.x / 3) * 3,
                        Math.floor(dot.y / 3) * 3,
                        2, 2
                    );
                }
            });
            
            // Create connections occasionally
            if (frame % 60 === 0 && connections.length < 5) {
                const dot1 = dots[Math.floor(Math.random() * dots.length)];
                const dot2 = dots[Math.floor(Math.random() * dots.length)];
                
                if (dot1 !== dot2) {
                    const distance = Math.sqrt(
                        Math.pow(dot1.x - dot2.x, 2) + Math.pow(dot1.y - dot2.y, 2)
                    );
                    
                    if (distance < 300) {
                        connections.push({
                            dot1: dot1,
                            dot2: dot2,
                            progress: 0,
                            opacity: 0.5 + Math.random() * 0.3
                        });
                    }
                }
            }
            
            // Update and draw connections
            for (let i = connections.length - 1; i >= 0; i--) {
                const conn = connections[i];
                conn.progress += 0.02;
                
                if (conn.progress >= 1) {
                    connections.splice(i, 1);
                    continue;
                }
                
                // Draw connection
                const currentX = conn.dot1.x + (conn.dot2.x - conn.dot1.x) * conn.progress;
                const currentY = conn.dot1.y + (conn.dot2.y - conn.dot1.y) * conn.progress;
                
                const gradient = ctx.createLinearGradient(conn.dot1.x, conn.dot1.y, conn.dot2.x, conn.dot2.y);
                gradient.addColorStop(0, `rgba(99, 102, 241, ${conn.opacity * 0.7})`);
                gradient.addColorStop(0.5, `rgba(139, 92, 246, ${conn.opacity})`);
                gradient.addColorStop(1, `rgba(6, 182, 212, ${conn.opacity * 0.5})`);
                
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1;
                ctx.globalAlpha = conn.opacity * (1 - conn.progress * 0.5);
                
                ctx.beginPath();
                ctx.moveTo(conn.dot1.x, conn.dot1.y);
                ctx.lineTo(currentX, currentY);
                ctx.stroke();
                
                // Draw pulse
                ctx.fillStyle = `rgba(248, 250, 252, ${conn.opacity})`;
                ctx.shadowColor = '#6366F1';
                ctx.shadowBlur = 3;
                ctx.beginPath();
                ctx.arc(currentX, currentY, 2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.globalAlpha = 1;
                ctx.shadowBlur = 0;
            }
            
            requestAnimationFrame(animate);
        }
        
        // Handle resize
        function handleResize() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            createDots(); // Recreate dots for new size
        }
        
        window.addEventListener('resize', handleResize);
        
        // Start animation
        createDots();
        animate();
        
        console.log('🎯 World map animation started successfully!');
        
    } catch (error) {
        console.error('❌ Error creating world map:', error);
    }
}

function initBasicAnimations() {
    console.log('🎨 Initializing basic animations...');
    
    // Simple card hover effects
    const cards = document.querySelectorAll('.credential-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
    
    // Intersection observer for fade-in
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    });
    
    // Observe elements
    document.querySelectorAll('.credential-card, .location-marker').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease';
        observer.observe(el);
    });
    
    console.log('✅ Basic animations initialized');
}

// Add basic styles
const style = document.createElement('style');
style.textContent = `
    .credential-card {
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .credential-card:hover {
        box-shadow: 0 20px 40px rgba(0,0,0,0.2);
    }
`;
document.head.appendChild(style);

console.log('🎉 Credentials enhanced script loaded!'); 