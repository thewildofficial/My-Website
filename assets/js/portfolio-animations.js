// Enhanced portfolio animations
document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations
    initScrollAnimations();
    initParticleBackground();
    initSkillBars();
    initTypingEffect();
    initProjectCards();
    
    // Fix for header elements that might not be showing
    fixHeaderVisibility();
});

// Fix header visibility issues
function fixHeaderVisibility() {
    const header = document.querySelector('h1.gradient-text');
    const introBox = document.querySelector('.gradient-border.animate-fade-in');
    
    if (header) {
        header.style.opacity = '1';
        header.style.visibility = 'visible';
        header.style.position = 'relative';
        header.style.zIndex = '100';
    }
    
    if (introBox) {
        introBox.style.opacity = '1';
        introBox.style.visibility = 'visible';
        introBox.style.position = 'relative';
        introBox.style.zIndex = '90';
    }
}

// Scroll animations with IntersectionObserver
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(element => {
        element.style.animationPlayState = 'paused';
        observer.observe(element);
    });
}

// Particle background effect for header section
function initParticleBackground() {
    // Create canvas for particles if it doesn't exist
    if (!document.getElementById('particle-canvas')) {
        const headerSection = document.querySelector('h1.gradient-text');
        if (headerSection) {
            const canvas = document.createElement('canvas');
            canvas.id = 'particle-canvas';
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '400px';
            canvas.style.zIndex = '-1';
            
            // Insert canvas before header
            headerSection.parentNode.insertBefore(canvas, headerSection);
            
            // Initialize particles
            initParticles();
        }
    }
}

// Particle animation system
function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const particles = [];
    const particleCount = 50;
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: Math.random() * 3 + 1,
            color: `rgba(${Math.floor(Math.random() * 100) + 155}, ${Math.floor(Math.random() * 100) + 155}, 255, ${Math.random() * 0.5 + 0.1})`,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1
        });
    }
    
    // Animation function
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            
            // Move particles
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Boundary check
            if (p.x < 0 || p.x > canvas.width) p.speedX *= -1;
            if (p.y < 0 || p.y > canvas.height) p.speedY *= -1;
            
            // Draw particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
            
            // Connect nearby particles
            for (let j = i + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(150, 150, 255, ${0.2 * (1 - distance / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Handle resize
    window.addEventListener('resize', () => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    });
}

// Add skill bars with animation
function initSkillBars() {
    // Create skills section if it doesn't exist yet
    if (!document.querySelector('.skills-section')) {
        const extracurriculars = document.querySelector('h1.gradient-text + ul.achievements-list');
        if (extracurriculars) {
            const skillsSection = document.createElement('div');
            skillsSection.className = 'skills-section animate-fade-in';
            skillsSection.innerHTML = `
                <h2 class="gradient-text">🛠️ Technical Skills</h2>
                <div class="skills-container">
                    <div class="skill-group">
                        <h3>Programming</h3>
                        <div class="skill-bar-container">
                            <div class="skill-label">JavaScript</div>
                            <div class="skill-bar-wrapper">
                                <div class="skill-bar" data-level="90"></div>
                            </div>
                        </div>
                        <div class="skill-bar-container">
                            <div class="skill-label">Python</div>
                            <div class="skill-bar-wrapper">
                                <div class="skill-bar" data-level="85"></div>
                            </div>
                        </div>
                        <div class="skill-bar-container">
                            <div class="skill-label">Java</div>
                            <div class="skill-bar-wrapper">
                                <div class="skill-bar" data-level="75"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="skill-group">
                        <h3>AI/ML</h3>
                        <div class="skill-bar-container">
                            <div class="skill-label">NLP</div>
                            <div class="skill-bar-wrapper">
                                <div class="skill-bar" data-level="80"></div>
                            </div>
                        </div>
                        <div class="skill-bar-container">
                            <div class="skill-label">ML Algorithms</div>
                            <div class="skill-bar-wrapper">
                                <div class="skill-bar" data-level="75"></div>
                            </div>
                        </div>
                        <div class="skill-bar-container">
                            <div class="skill-label">Data Visualization</div>
                            <div class="skill-bar-wrapper">
                                <div class="skill-bar" data-level="85"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert skills section before extracurriculars
            extracurriculars.parentNode.insertBefore(skillsSection, extracurriculars);
            
            // Add styles for skill bars
            const style = document.createElement('style');
            style.textContent = `
                .skills-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    justify-content: space-around;
                    margin: 20px 0;
                }
                
                .skill-group {
                    flex: 1;
                    min-width: 300px;
                }
                
                .skill-bar-container {
                    margin-bottom: 15px;
                }
                
                .skill-label {
                    margin-bottom: 5px;
                    font-weight: bold;
                }
                
                .skill-bar-wrapper {
                    height: 10px;
                    background: rgba(200, 200, 200, 0.3);
                    border-radius: 5px;
                    overflow: hidden;
                }
                
                .skill-bar {
                    height: 100%;
                    width: 0%;
                    background: linear-gradient(90deg, #4568DC, #B06AB3);
                    border-radius: 5px;
                    transition: width 1.5s ease-out;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Animate skill bars when they come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bars = entry.target.querySelectorAll('.skill-bar');
                bars.forEach(bar => {
                    const level = bar.getAttribute('data-level');
                    setTimeout(() => {
                        bar.style.width = `${level}%`;
                    }, 200);
                });
            }
        });
    }, { threshold: 0.5 });
    
    const skillsSection = document.querySelector('.skills-section');
    if (skillsSection) {
        observer.observe(skillsSection);
    }
}

// Typing effect for introduction
function initTypingEffect() {
    const introText = document.querySelector('.gradient-border p');
    if (introText) {
        const originalText = introText.textContent;
        introText.textContent = '';
        introText.style.borderRight = '2px solid #4568DC';
        
        let i = 0;
        function typeWriter() {
            if (i < originalText.length) {
                introText.textContent += originalText.charAt(i);
                i++;
                setTimeout(typeWriter, 30);
            } else {
                introText.style.borderRight = 'none';
            }
        }
        
        // Start typing effect with a delay
        setTimeout(typeWriter, 1000);
    }
}

// Interactive project cards
function initProjectCards() {
    const cards = document.querySelectorAll('.project-card');
    
    cards.forEach(card => {
        // Add glowing effect on hover
        card.addEventListener('mouseover', () => {
            card.style.boxShadow = '0 10px 30px rgba(69, 104, 220, 0.3)';
            card.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseout', () => {
            card.style.boxShadow = '';
            card.style.transform = '';
        });
    });
}