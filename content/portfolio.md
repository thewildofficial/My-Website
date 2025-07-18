---
---
<style>
/* Base animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

/* Apply animations to elements */
.animate-fade-in {
  animation: fadeIn 0.8s ease forwards;
  opacity: 0;
}

.animate-pulse:hover {
  animation: pulse 1s infinite;
}

.delay-100 { animation-delay: 0.1s; }
.delay-200 { animation-delay: 0.2s; }
.delay-300 { animation-delay: 0.3s; }
.delay-400 { animation-delay: 0.4s; }
.delay-500 { animation-delay: 0.5s; }

/* Enhanced styling */
.gradient-text {
  background: linear-gradient(45deg, #4568DC, #B06AB3, #4568DC);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientFlow 3s ease infinite;
}

.gradient-border {
  position: relative;
  border-radius: 10px;
  padding: 1px;
  background: linear-gradient(45deg, #4568DC, #B06AB3, #4568DC);
  background-size: 200% auto;
  animation: gradientFlow 3s ease infinite;
}

.project-card {
  transition: transform 0.3s, box-shadow 0.3s;
  border-left: 4px solid transparent;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
}

.project-card h3 {
  background: linear-gradient(45deg, #6B8DD6, #C490C4, #6B8DD6);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientFlow 4s ease infinite;
  font-weight: 600;
  margin-top: 0;
}

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  border-left: 4px solid #4568DC;
}

.floating {
  animation: float 3s ease-in-out infinite;
}

.tech-tags {
  margin-top: 15px;
}

.tech-tag {
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.1);
  color: #B06AB3;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8em;
  margin: 4px 4px 4px 0;
}

/* Dark mode compatibility */
.intro-box {
  background-color: rgba(30, 30, 30, 0.7);
  color: #f0f0f0;
  padding: 20px;
  border-radius: 9px;
}

/* For light mode if needed */
@media (prefers-color-scheme: light) {
  .intro-box {
    background-color: white;
    color: #333;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .language-container {
    flex-direction: column;
    align-items: center;
  }
}

.extracurriculars-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding-left: 0;
  list-style: none;
}

.extracurricular-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 25px;
  transition: transform 0.3s, box-shadow 0.3s;
  border-left: 4px solid transparent;
}

.extracurricular-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  border-left-color: #4568DC;
}

.extracurricular-card strong {
  display: flex;
  align-items: center;
  font-size: 1.2em;
  margin-bottom: 10px;
  background: linear-gradient(45deg, #6B8DD6, #C490C4, #6B8DD6);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientFlow 4s ease infinite;
  font-weight: 600;
}

.extracurricular-icon {
  font-size: 1.5em;
  margin-right: 15px;
  display: inline-block;
  width: 30px; /* For alignment */
  text-align: center;
}

.philosophy-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.philosophy-card {
  background: rgba(30, 30, 30, 0.7);
  color: #f0f0f0;
  padding: 25px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.philosophy-card h3 {
  font-size: 1.3em;
  margin: 0 0 15px 0;
  background: linear-gradient(45deg, #6B8DD6, #C490C4, #6B8DD6);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientFlow 4s ease infinite;
  font-weight: 600;
  border-left: 3px solid #B06AB3;
  padding-left: 10px;
}

.philosophy-card p {
  font-style: italic;
  opacity: 0.8;
  flex-grow: 1;
}

.philosophy-card a {
  color: #4568DC;
  text-decoration: none;
  font-weight: bold;
  margin-top: 15px;
  align-self: flex-start;
}

.journey-container {
    position: relative;
    width: 100vw;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    margin-top: 80px;
    margin-bottom: 80px;
}

.journey-step {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: sticky;
    top: 0;
    margin: 0;
    padding: 0 20px;
    color: #fff;
}

.journey-step-0, .journey-step-1, .journey-step-2, .journey-step-3 {
    background-size: cover;
    background-position: center;
    background-attachment: fixed; /* Parallax effect */
}

.journey-step-0 {
    background-image: linear-gradient(45deg, rgba(10, 10, 15, 0.9), rgba(20, 20, 20, 0.95));
    z-index: 0;
}

.journey-step-1 {
    background-image: linear-gradient(45deg, rgba(20, 30, 80, 0.8), rgba(30, 20, 50, 0.85));
    z-index: 1;
}

.journey-step-2 {
    background-image: linear-gradient(45deg, rgba(100, 40, 20, 0.8), rgba(30, 10, 10, 0.9));
    z-index: 2;
}

.journey-step-3 {
    background-image: linear-gradient(45deg, rgba(176, 106, 179, 0.7), rgba(69, 104, 220, 0.8));
    z-index: 3;
}

.journey-content {
    text-align: center;
    max-width: 750px;
    padding: 50px;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 15px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transform: translateY(30px);
    opacity: 0;
    animation: journey-fade-in 0.8s ease-out forwards;
}

@keyframes journey-fade-in {
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.journey-content h1 {
    font-size: 4em;
    margin-bottom: 10px;
}

.journey-content h2 {
    font-size: 3em;
    margin-bottom: 15px;
}

.journey-content p, .journey-content blockquote {
    font-size: 1.2em;
    line-height: 1.7;
    color: #e0e0e0;
}

.journey-content blockquote {
    font-style: italic;
    border: none;
    padding: 0;
    margin: 25px 0;
    opacity: 0.9;
}

.flag-emoji {
    opacity: 1 !important;
}

/* Timeline title styling */
.timeline-title {
  background: linear-gradient(45deg, #6B8DD6, #C490C4, #6B8DD6);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradientFlow 4s ease infinite;
  font-weight: 600;
  margin-top: 0;
}
</style>

<!-- Script imports for enhanced animations -->
<script src="/js/3d-background.js" defer></script>
<script src="/js/credential-viewer.js" defer></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
  // Fix for header visibility - redundant but ensures it works
  setTimeout(function() {
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
  }, 100);
});
</script>

<!-- Interactive Contact Widget -->
<div id="contact-widget" style="position: fixed; bottom: 20px; right: 20px; z-index: 1000;">
  <div class="contact-button animate-pulse" style="width: 60px; height: 60px; background: linear-gradient(45deg, #4568DC, #B06AB3); border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
    <span style="font-size: 24px; color: white;">💬</span>
  </div>
  <div id="contact-popup" style="position: absolute; bottom: 70px; right: 0; width: 300px; background: white; border-radius: 8px; padding: 15px; box-shadow: 0 5px 20px rgba(0,0,0,0.2); display: none;">
    <h3 style="margin-top: 0; color: #4568DC;">Get In Touch</h3>
    <p style="font-size: 0.9em;">I'm always interested in new opportunities and collaborations!</p>
    <form id="contact-form" name="contact" method="POST" data-netlify="true" style="display: flex; flex-direction: column;">
      <input type="email" name="email" placeholder="Your Email" style="margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      <textarea name="message" placeholder="Your Message" rows="3" style="margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
      <button type="submit" style="background: linear-gradient(45deg, #4568DC, #B06AB3); border: none; color: white; padding: 8px; border-radius: 4px; cursor: pointer;">Send Message</button>
    </form>
  </div>
</div>

<script>
  // Contact widget functionality
  document.addEventListener('DOMContentLoaded', function() {
    const contactButton = document.querySelector('.contact-button');
    const contactPopup = document.getElementById('contact-popup');
    
    if (contactButton && contactPopup) {
      contactButton.addEventListener('click', function() {
        if (contactPopup.style.display === 'none') {
          contactPopup.style.display = 'block';
        } else {
          contactPopup.style.display = 'none';
        }
      });
    }
  });
</script>

<div class="journey-container">
    <div class="journey-step journey-step-0">
        <div class="journey-content">
            <h1 align="center" class="gradient-text">Aban Hasan</h1>
            <h3 align="center" style="color: #e0e0e0; font-weight: 300;">⚡ Student | 🌐 Cybernaut | 🚀 Innovator</h3>
            <p align="center" style="font-style: italic; opacity: 0.8;">Building the digital future, one project at a time</p>
        </div>
    </div>
    <div class="journey-step journey-step-1">
        <div class="journey-content">
            <h2 class="gradient-text">Technical Arsenal <span class="flag-emoji">⚙️</span></h2>
            <p>From low-level systems programming in C++ to high-level AI orchestration with Python, I've built expertise across the full technology stack. My passion for cybersecurity has earned me top 2% ranking on TryHackMe, while my systems knowledge spans from RFID hardware design to distributed cloud architectures.</p>
        </div>
    </div>
    <div class="journey-step journey-step-2">
        <div class="journey-content">
            <h2 class="gradient-text">Global Impact <span class="flag-emoji">🌍</span></h2>
            <p>My projects have reached over 5,000+ users globally through Project Skilltree, while GeoMonitor provides real-time insights to analysts worldwide. From winning Mars colonization competitions to mentoring peers in algorithmic thinking, I focus on building solutions that scale beyond individual use cases.</p>
        </div>
    </div>
    <div class="journey-step journey-step-3">
        <div class="journey-content">
            <h2 class="gradient-text">Innovation Philosophy <span class="flag-emoji">🚀</span></h2>
            <p>I believe in solving problems at their mathematical core rather than surface symptoms. Whether it's using Bayesian statistics for probability visualization or NLP for geopolitical analysis, my approach combines rigorous theory with practical implementation to create truly intelligent systems.</p>
        </div>
    </div>
</div>

<div class="gradient-border animate-fade-in delay-400">
  <div class="intro-box">
    <p>I've been immersed in the world of code since I was 12 years old. After starting my journey at Carleton University in Ottawa 🇨🇦, I made the strategic decision to return to my roots in Bangalore 🇮🇳. I am now pursuing a highly specialized and intensive tech education, combining the best of industry-focused learning and rigorous academic programs to solve real-world problems.</p>
  </div>
</div>

<!-- Animated Stats Counter -->
<div class="stats-container animate-fade-in" style="display: flex; flex-wrap: wrap; justify-content: space-around; margin: 40px 0; text-align: center;">
  <div class="stat-item" style="padding: 15px; margin: 10px;">
    <div class="stat-number gradient-text" style="font-size: 2.5em; font-weight: bold;" data-target="5000">0</div>
    <div class="stat-label">Users Impacted</div>
  </div>
  <div class="stat-item" style="padding: 15px; margin: 10px;">
    <div class="stat-number gradient-text" style="font-size: 2.5em; font-weight: bold;" data-target="150">0</div>
    <div class="stat-label">Books Read</div>
  </div>
  <div class="stat-item" style="padding: 15px; margin: 10px;">
    <div style="font-size: 2.5em; font-weight: bold;">
      <span class="stat-number gradient-text" style="display: inline-block;" data-target="5">0</span><span class="gradient-text" style="display: inline-block;">+</span>
    </div>
    <div class="stat-label">Languages</div>
  </div>
</div>

<script>
  // Animated counter
  document.addEventListener('DOMContentLoaded', function() {
    function animateValue(obj, start, end, duration) {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    }
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = document.querySelectorAll('.stat-number');
          counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            animateValue(counter, 0, target, 2000);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    const statsContainer = document.querySelector('.stats-container');
    if (statsContainer) {
      observer.observe(statsContainer);
    }
  });
</script>

<h1 class="gradient-text animate-fade-in">🛠️ Featured Projects</h1>

<div class="project-card animate-fade-in delay-100">
  <h3><a href="https://geomonitor.abanhasan.net/" target="_blank">🌎 GeoMonitor</a></h3>
  <p>A sophisticated real-time geopolitical news aggregator that analyzes global flashpoints using advanced AI. The system automatically translates content from multiple languages, ranks significance, and visualizes developments on interactive maps. This cross-platform solution provides crucial geopolitical insights through visual representation and intelligent analysis.</p>
  <div class="tech-tags">
    <span class="tech-tag">AI/ML</span>
    <span class="tech-tag">NLP</span>
    <span class="tech-tag">Data Visualization</span>
    <span class="tech-tag">Cross-Platform</span>
  </div>
</div>

<div class="project-card animate-fade-in delay-200">
  <h3><a href="https://www.projectskilltree.com/" target="_blank">🌱 Project Skilltree</a></h3>
  <p>A revolutionary discord bot/app used by over 5,000+ users which aims to gamify the journey of self improvement. I was instrumental in developing significant parts of the bot interface and API, creating an engaging system that helps users track their growth and stay motivated.</p>
  <div class="tech-tags">
    <span class="tech-tag">Discord API</span>
    <span class="tech-tag">Gamification</span>
    <span class="tech-tag">UX Design</span>
    <span class="tech-tag">API Development</span>
  </div>
</div>

<div class="project-card animate-fade-in delay-300">
  <h3><a href="https://thewildofficial.github.io/monkey-typewriter/" target="_blank">🐒 Monkey Typewriter Simulation</a></h3>
  <p>An elegant visualization of the famous "infinite monkey theorem" using Bayesian statistics. This interactive algorithm demonstrates how long it would take a monkey randomly typing to produce specific literary works. The simulation provides insights into probability theory and randomness through an engaging visual interface.</p>
  <div class="tech-tags">
    <span class="tech-tag">Bayesian Statistics</span>
    <span class="tech-tag">Data Visualization</span>
    <span class="tech-tag">Web App</span>
  </div>
</div>

<div class="project-card animate-fade-in delay-400">
  <h3>🧠 Clevered.com Internship <a href="/documents/Aban-AI Internship.pdf" target="_blank">[View Certificate]</a></h3>
  <p>Successfully completed a 4-month long internship on Artificial Intelligence(AI), mentored by a senior Oxford professor. I developed a project that involved a website which predicts and forecasts sentiment and emotional response of any tweet using Natural Language Processing (NLP).</p>
  <div class="tech-tags">
    <span class="tech-tag">NLP</span>
    <span class="tech-tag">Sentiment Analysis</span>
    <span class="tech-tag">Predictive Modeling</span>
    <span class="tech-tag">Python</span>
  </div>
</div>

<div class="project-card animate-fade-in delay-500">
  <h3><a href="https://nexusaurora.org/" target="_blank">🚀 Nexus Aurora</a></h3>
  <p>Former project lead at Nexus Aurora, An open-source space colonization community (Winners of the <a href="https://www.marssociety.org/news/2020/10/23/top-5-winners-of-mars-city-state-design-competition-announced/" target="_blank">2020 Mars Society City State Competition</a>). My work involved designing door security systems using RFIDs, facilitating discussions about sports and linguistics on Mars, and developing the community's Discord bot.</p>
  <div class="tech-tags">
    <span class="tech-tag">RFID Systems</span>
    <span class="tech-tag">Community Management</span>
    <span class="tech-tag">Bot Development</span>
  </div>
</div>

<div class="project-card animate-fade-in delay-100">
  <h3><a href="https://www.amazon.com/Perspective-Artificial-Intelligence-Aban-Hasan/dp/1678985988" target="_blank">📚 Perspective AI</a></h3>
  <p>I co-authored this book along with a schoolmate during my grade 8. It presents a teenager's perspective on the advent of artificial intelligence, and how we predict AI will impact our lives and the future. This early work demonstrates my long-standing interest in the ethical and social implications of technology.</p>
</div>

<div class="project-card animate-fade-in delay-200">
  <h3><a href="https://tryhackme.com/p/thewildofficial" target="_blank">🔐 TryHackMe and CTFs</a></h3>
  <p>I have always had a deep interest in cybersecurity, and this obsession has led me to being ranked in the top 2% of hackers on tryhackme.com, a website which organizes hacking challenges. My passion for security has equipped me with a strong foundation in defensive and offensive security practices.</p>
  <div class="tech-tags">
    <span class="tech-tag">Cybersecurity</span>
    <span class="tech-tag">Penetration Testing</span>
    <span class="tech-tag">CTF</span>
  </div>
</div>

<div class="project-card animate-fade-in delay-300">
  <h3><a href="https://www.iitrpr.ac.in/iit-ropar-ai" target="_blank">🎓 IIT Ropar Minor in AI/ML</a></h3>
  <p>Currently in my final semester of the prestigious Minor Degree from the IIT program on Artificial Intelligence. This program has equipped me with crucial knowledge in a rapidly transforming digital landscape, preparing me to navigate both the opportunities and challenges of advanced AI systems.</p>
</div>

<div class="project-card animate-fade-in delay-400">
  <h3>🚀 Scaler School of Technology</h3>
  <p>Currently attending Scaler School of Technology in Bangalore 🇮🇳 — one of India's most selective tech programs with an acceptance rate of around 3%. The curriculum focuses on building rock-solid fundamentals in computer science, algorithms, and system design, learning alongside some of the brightest minds in tech.</p>
  <div class="tech-tags">
    <span class="tech-tag">Advanced Algorithms</span>
    <span class="tech-tag">System Design</span>
    <span class="tech-tag">Full-Stack Development</span>
  </div>
</div>

<div class="project-card animate-fade-in delay-500">
  <h3>📊 IIT Madras - BS Data Science & Applications</h3>
  <p>Pursuing the 4-year Bachelor's degree program in Data Science and Applications from IIT Madras in parallel with my Scaler studies. This program combines statistical foundations with practical applications, giving me a comprehensive understanding of how data drives decision-making in the modern world.</p>
  <div class="tech-tags">
    <span class="tech-tag">Statistical Modeling</span>
    <span class="tech-tag">Machine Learning</span>
    <span class="tech-tag">Data Analytics</span>
    <span class="tech-tag">Python</span>
  </div>
</div>

<div class="animate-fade-in delay-400" style="text-align: center; margin: 30px 0;">
  <a href="https://tryhackme.com/r/p/thewildofficial" target="_blank" class="animate-pulse">
    <figure class="floating">
      <img src="/images/tryhackme.png" alt="TryHackMe" style="border-radius: 5px; max-width: 100%;" />
      <figcaption style="margin-top: 10px; font-style: italic;">(Used to hold) top 1% of hackers on TryHackMe.com!</figcaption>
    </figure>
  </a>
</div>

<hr style="border: 0; height: 1px; background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(69, 104, 220, 0.75), rgba(0, 0, 0, 0));">

<div class="animate-fade-in">
  <p align="center"><b class="gradient-text">✨ My Github Activity ✨</b></p>
  <script
    src="https://cdn.rawgit.com/IonicaBizau/github-calendar/gh-pages/dist/github-calendar.min.js"
  >
  </script>

  <link
    rel="stylesheet"
    href="https://cdn.rawgit.com/IonicaBizau/github-calendar/gh-pages/dist/github-calendar.css"
  />

  <div class="calendar gradient-border" style="padding: 10px; border-radius: 8px;">
      Loading Github Data...
  </div>

  <script>
      new GitHubCalendar(".calendar", "thewildofficial", { responsive: true });
  </script>
</div>

<hr style="border: 0; height: 1px; background-image: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(176, 106, 179, 0.75), rgba(0, 0, 0, 0)); margin: 40px 0;">

<h1 class="gradient-text animate-fade-in">🌟 Extracurriculars and Initiatives</h1>

<ul class="extracurriculars-grid animate-fade-in">
  <li class="extracurricular-card delay-100">
    <strong><span class="extracurricular-icon">🌍</span>Multilingual Communicator</strong>
    National level contestant of the French Word Power examination. I speak French to a moderate level of proficiency (B1), and have put it to the test doing D2D sales in Gatineau.
  </li>
  <li class="extracurricular-card delay-200">
    <strong><span class="extracurricular-icon">🏛️</span>Diplomatic Excellence</strong>
    5-time Model United Nations (MUN) winner. Participating in MUNs has honed my public speaking, critical thinking, and collaborative skills, feeding my interest in geopolitics and debate.
  </li>
  <li class="extracurricular-card delay-300">
    <strong><span class="extracurricular-icon">📚</span>Voracious Reader</strong>
    I've read over 150 books in the last two years spanning Self-Development, Finance, Strategy, History, and Philosophy, constantly broadening my perspective.
  </li>
  <li class="extracurricular-card delay-400">
    <strong><span class="extracurricular-icon">🌱</span>Community Builder</strong>
    Founded a "Self-Improvement Club" at Carleton University, growing it to over 50 members. This taught me the power of accountability, discipline, and shared growth.
  </li>
  <li class="extracurricular-card delay-100">
    <strong><span class="extracurricular-icon">🎓</span>Campus Leader</strong>
    Served as School Valedictorian and Student Council member. These roles taught me conflict resolution and the art of finding amicable, win-win solutions.
  </li>
  <li class="extracurricular-card delay-200">
    <strong><span class="extracurricular-icon">💼</span>Sales Experience</strong>
    Generated $20K in sales over 2 months doing door-to-door sales. This experience was a masterclass in interpersonal skills, resilience, customer service, and service delivery.
  </li>
  <li class="extracurricular-card delay-300">
    <strong><span class="extracurricular-icon">🏋️</span>Holistic Development</strong>
    Beyond tech and academics, I pursue hobbies that build discipline and strategy, including Weightlifting, Chess, Tennis, Taekwondo, and Horse-back riding.
  </li>
  <li class="extracurricular-card delay-400">
    <strong><span class="extracurricular-icon">🤝</span>Community Engager</strong>
    As a frequent volunteer in school events, I find purpose in constructively engaging with my community, learning to stick to my promises and contribute to greater causes.
  </li>
</ul>

<h2 class="gradient-text animate-fade-in">🌍 Languages Spoken</h2>
<div class="language-container animate-fade-in" style="display: flex; flex-wrap: wrap; gap: 15px; justify-content: center;">
    <div class="floating" style="background: rgba(69, 104, 220, 0.1); padding: 15px; border-radius: 8px; width: 120px; text-align: center; transition: all 0.3s;">
        <span style="font-size: 2em;">🇺🇸</span><br>
        <strong>English</strong><br>
        Native
    </div>
    <div class="floating" style="animation-delay: 0.5s; background: rgba(176, 106, 179, 0.1); padding: 15px; border-radius: 8px; width: 120px; text-align: center; transition: all 0.3s;">
        <span style="font-size: 2em;">🇨🇦</span><br>
        <strong>French</strong><br>
        B1
    </div>
    <div class="floating" style="animation-delay: 1s; background: rgba(69, 104, 220, 0.1); padding: 15px; border-radius: 8px; width: 120px; text-align: center; transition: all 0.3s;">
        <span style="font-size: 2em;">🇩🇪</span><br>
        <strong>German</strong><br>
        A2
    </div>
    <div class="floating" style="animation-delay: 1.5s; background: rgba(176, 106, 179, 0.1); padding: 15px; border-radius: 8px; width: 120px; text-align: center; transition: all 0.3s;">
        <span style="font-size: 2em;">🇾🇪</span><br>
        <strong>Arabic</strong><br>
        Beginner
    </div>
</div>



<script>
// Add animation trigger on scroll
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.animate-fade-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, {
        threshold: 0.1
    });
    
    animatedElements.forEach(element => {
        element.style.animationPlayState = 'paused';
        observer.observe(element);
    });
});
</script>

<!-- Timeline Widget -->
<h2 class="gradient-text animate-fade-in">📊 Career Timeline</h2>
<div class="timeline animate-fade-in" style="position: relative; max-width: 1200px; margin: 20px auto;">
  <div class="timeline-line" style="position: absolute; top: 0; bottom: 0; left: 50%; width: 4px; background: linear-gradient(to bottom, #4568DC, #B06AB3); transform: translateX(-50%);"></div>
  
  <div class="timeline-item" style="position: relative; margin-bottom: 30px; padding-right: 50%; clear: both; text-align: right;">
    <div class="timeline-content project-card" style="position: relative; margin-right: 30px;">
      <span class="timeline-date" style="position: absolute; right: -110px; background: linear-gradient(45deg, #B06AB3, #4568DC); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8em;">2019</span>
      <h3 class="timeline-title">Published "Perspective AI"</h3>
      <p>Co-authored and published my first book on artificial intelligence from a teenager's perspective.</p>
    </div>
  </div>
  
  <div class="timeline-item" style="position: relative; margin-bottom: 30px; padding-left: 50%; clear: both;">
    <div class="timeline-content project-card" style="position: relative; margin-left: 30px;">
      <span class="timeline-date" style="position: absolute; left: -110px; background: linear-gradient(45deg, #4568DC, #B06AB3); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8em;">2020</span>
      <h3 class="timeline-title">Clevered.com Internship</h3>
      <p>Completed a 4-month AI internship mentored by an Oxford professor, developing sentiment analysis for social media.</p>
    </div>
  </div>
  
  <div class="timeline-item" style="position: relative; margin-bottom: 30px; padding-right: 50%; clear: both; text-align: right;">
    <div class="timeline-content project-card" style="position: relative; margin-right: 30px;">
      <span class="timeline-date" style="position: absolute; right: -110px; background: linear-gradient(45deg, #B06AB3, #4568DC); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8em;">2021-22</span>
      <h3 class="timeline-title">Boards, JEE and Competitive Exams</h3>
      <p>Intensive preparation period focusing on Indian board examinations and competitive entrance tests, building strong foundations in mathematics, physics, and analytical thinking that would prove crucial for my technical journey ahead.</p>
    </div>
  </div>
  
  <div class="timeline-item" style="position: relative; margin-bottom: 30px; padding-left: 50%; clear: both;">
    <div class="timeline-content project-card" style="position: relative; margin-left: 30px;">
      <span class="timeline-date" style="position: absolute; left: -110px; background: linear-gradient(45deg, #4568DC, #B06AB3); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8em;">2023</span>
      <h3 class="timeline-title">Carleton Year 1 🇨🇦</h3>
      <p>Completed the first year of my Computer Science degree at Carleton University, where I built a strong foundation and a community of like-minded peers before pivoting to a more specialized path.</p>
    </div>
  </div>
  
  <div class="timeline-item" style="position: relative; margin-bottom: 30px; padding-right: 50%; clear: both; text-align: right;">
    <div class="timeline-content project-card" style="position: relative; margin-right: 30px;">
      <span class="timeline-date" style="position: absolute; right: -110px; background: linear-gradient(45deg, #B06AB3, #4568DC); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8em;">2024</span>
      <h3 class="timeline-title">IIT Ropar AI Program</h3>
      <p>Started the prestigious IIT program on Artificial Intelligence to deepen my knowledge in this rapidly evolving field.</p>
    </div>
  </div>
  
  <div class="timeline-item" style="position: relative; margin-bottom: 30px; padding-right: 50%; clear: both; text-align: right;">
    <div class="timeline-content project-card" style="position: relative; margin-right: 30px;">
      <span class="timeline-date" style="position: absolute; right: -110px; background: linear-gradient(45deg, #B06AB3, #4568DC); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8em;">2025</span>
      <h3 class="timeline-title">Return to Bangalore 🇮🇳</h3>
      <p>Made the strategic decision to return to India to attend Scalar School of Technology and pursue a parallel degree from IIT Madras, focusing on deep, specialized tech education.</p>
    </div>
  </div>
  
  <div class="timeline-item" style="position: relative; margin-bottom: 30px; padding-left: 50%; clear: both;">
    <div class="timeline-content project-card" style="position: relative; margin-left: 30px;">
      <span class="timeline-date" style="position: absolute; left: -110px; background: linear-gradient(45deg, #4568DC, #B06AB3); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8em;">2025</span>
      <h3 class="timeline-title">GeoMonitor Launch</h3>
      <p>Developed and launched the cross-platform geopolitical news aggregator with AI-powered translation and analysis.</p>
    </div>
  </div>
  
  <div class="timeline-item" style="position: relative; margin-bottom: 30px; padding-right: 50%; clear: both; text-align: right;">
    <div class="timeline-content project-card" style="position: relative; margin-right: 30px;">
      <span class="timeline-date" style="position: absolute; right: -110px; background: linear-gradient(45deg, #B06AB3, #4568DC); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8em;">2025-2029</span>
      <h3 class="timeline-title">Undergraduate Degree in Computer Science</h3>
      <p>Pursuing intensive tech education at Scaler School of Technology in Bangalore, focusing on building rock-solid fundamentals in computer science, algorithms, and system design, along with a BS in Data Science & Applications from IIT Madras (IITM).</p>
    </div>
  </div>
</div>
