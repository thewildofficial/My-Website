// 3D Background Effect for Portfolio
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the portfolio page
    if (document.querySelector('.project-card')) {
        initThreeDBackground();
    }
});

function initThreeDBackground() {
    // Add canvas container if it doesn't exist
    if (!document.getElementById('bg-canvas-container')) {
        const container = document.createElement('div');
        container.id = 'bg-canvas-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            z-index: -10;
            opacity: 0.15;
            pointer-events: none;
            overflow: hidden;
        `;
        
        document.body.prepend(container);
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'bg-canvas';
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
        `;
        
        container.appendChild(canvas);
        
        // Initialize animation
        initAnimation(canvas);
    }
}

function initAnimation(canvas) {
    // Get canvas context
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Mouse position for interactive effect
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    
    // Create grid points
    const spacing = 50;
    const points = [];
    const columns = Math.ceil(canvas.width / spacing) + 1;
    const rows = Math.ceil(canvas.height / spacing) + 1;
    
    // Create points
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            points.push({
                x: i * spacing,
                y: j * spacing,
                originalX: i * spacing,
                originalY: j * spacing,
                vx: 0,
                vy: 0,
                color: `rgba(${Math.floor(Math.random() * 50) + 69}, ${Math.floor(Math.random() * 50) + 104}, ${Math.floor(Math.random() * 50) + 220}, 0.7)`
            });
        }
    }
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    });
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Smooth mouse following
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        
        // Update and draw points
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            
            // Calculate distance from mouse
            const dx = mouseX - p.x;
            const dy = mouseY - p.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Apply force away from mouse
            const force = Math.max(100 - distance, 0) * 0.02;
            const angle = Math.atan2(dy, dx);
            
            // Update velocity
            p.vx += -Math.cos(angle) * force;
            p.vy += -Math.sin(angle) * force;
            
            // Spring back to original position
            p.vx += (p.originalX - p.x) * 0.03;
            p.vy += (p.originalY - p.y) * 0.03;
            
            // Damping
            p.vx *= 0.85;
            p.vy *= 0.85;
            
            // Update position
            p.x += p.vx;
            p.y += p.vy;
            
            // Draw point
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw connections
        ctx.strokeStyle = 'rgba(69, 104, 220, 0.15)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            
            // Connect to nearby points
            for (let j = i + 1; j < points.length; j++) {
                const p2 = points[j];
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.globalAlpha = 1 - distance / 100;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                }
            }
        }
    }
    
    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Start animation
    animate();
}