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

.project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
  border-left: 4px solid #4568DC;
}

.floating {
  animation: float 3s ease-in-out infinite;
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
</style>

<!-- Script imports for enhanced animations -->
<script src="/js/3d-background.js" defer></script>
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
    <form id="contact-form" style="display: flex; flex-direction: column;">
      <input type="email" placeholder="Your Email" style="margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
      <textarea placeholder="Your Message" rows="3" style="margin-bottom: 10px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
      <button type="button" style="background: linear-gradient(45deg, #4568DC, #B06AB3); border: none; color: white; padding: 8px; border-radius: 4px; cursor: pointer;">Send Message</button>
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

<h1 align="center" class="gradient-text animate-fade-in">Aban Hasan</h1>

<h3 align="center" class="animate-fade-in delay-200">⚡ Student | 🌐 Cybernaut | 🚀 Innovator</h3>

<p align="center" class="animate-fade-in delay-300">
  <i>Building the digital future, one project at a time</i>
</p>

<div class="gradient-border animate-fade-in delay-400">
  <div class="intro-box">
    <p>I've been immersed in the world of code since I was 12 years old. What began as curiosity evolved into a passion that drives me to explore the endless possibilities of the digital frontier. My journey combines technical expertise with a deep appreciation for how technology can solve real-world problems.</p>
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
  <div style="font-size: 0.9em; opacity: 0.8;"><i>Technologies: AI/ML, NLP, Interactive Maps, Cross-platform Development</i></div>
</div>

<div class="project-card animate-fade-in delay-200">
  <h3><a href="https://www.projectskilltree.com/" target="_blank">🌱 Project Skilltree</a></h3>
  <p>A revolutionary discord bot/app used by over 5,000+ users which aims to gamify the journey of self improvement. I was instrumental in developing significant parts of the bot interface and API, creating an engaging system that helps users track their growth and stay motivated.</p>
  <div style="font-size: 0.9em; opacity: 0.8;"><i>Technologies: Discord API, Gamification, User Experience Design</i></div>
</div>

<div class="project-card animate-fade-in delay-300">
  <h3><a href="https://thewildofficial.github.io/monkey-typewriter/" target="_blank">🐒 Monkey Typewriter Simulation</a></h3>
  <p>An elegant visualization of the famous "infinite monkey theorem" using Bayesian statistics. This interactive algorithm demonstrates how long it would take a monkey randomly typing to produce specific literary works. The simulation provides insights into probability theory and randomness through an engaging visual interface.</p>
  <div style="font-size: 0.9em; opacity: 0.8;"><i>Technologies: Bayesian Statistics, Data Visualization, Interactive Web Design</i></div>
</div>

<div class="project-card animate-fade-in delay-400">
  <h3>🧠 Clevered.com Internship <a href="/documents/Aban-AI Internship.pdf" target="_blank">[View Certificate]</a></h3>
  <p>Successfully completed a 4-month long internship on Artificial Intelligence(AI), mentored by a senior Oxford professor. I developed a project that involved a website which predicts and forecasts sentiment and emotional response of any tweet using Natural Language Processing (NLP).</p>
  <div style="font-size: 0.9em; opacity: 0.8;"><i>Technologies: NLP, Sentiment Analysis, Predictive Modeling</i></div>
</div>

<div class="project-card animate-fade-in delay-500">
  <h3><a href="https://nexusaurora.org/" target="_blank">🚀 Nexus Aurora</a></h3>
  <p>Former project lead at Nexus Aurora, An open-source space colonization community (Winners of the <a href="https://www.marssociety.org/news/2020/10/23/top-5-winners-of-mars-city-state-design-competition-announced/" target="_blank">2020 Mars Society City State Competition</a>). My work involved designing door security systems using RFIDs, facilitating discussions about sports and linguistics on Mars, and developing the community's Discord bot.</p>
  <div style="font-size: 0.9em; opacity: 0.8;"><i>Technologies: RFID Systems, Community Management, Bot Development</i></div>
</div>

<div class="project-card animate-fade-in delay-100">
  <h3><a href="https://www.amazon.com/Perspective-Artificial-Intelligence-Aban-Hasan/dp/1678985988" target="_blank">📚 Perspective AI</a></h3>
  <p>I co-authored this book along with a schoolmate during my grade 8. It presents a teenager's perspective on the advent of artificial intelligence, and how we predict AI will impact our lives and the future. This early work demonstrates my long-standing interest in the ethical and social implications of technology.</p>
</div>

<div class="project-card animate-fade-in delay-200">
  <h3><a href="https://tryhackme.com/p/thewildofficial" target="_blank">🔐 TryHackMe and CTFs</a></h3>
  <p>I have always had a deep interest in cybersecurity, and this obsession has led me to being ranked in the top 2% of hackers on tryhackme.com, a website which organizes hacking challenges. My passion for security has equipped me with a strong foundation in defensive and offensive security practices.</p>
</div>

<div class="project-card animate-fade-in delay-300">
  <h3><a href="https://www.iitrpr.ac.in/iit-ropar-ai" target="_blank">🎓 IIT Ropar Minor in AI/ML</a></h3>
  <p>By 2025, I will have completed my Minor Degree from the prestigious IIT program on Artificial Intelligence. This program has equipped me with crucial knowledge in a rapidly transforming digital landscape, preparing me to navigate both the opportunities and challenges of advanced AI systems.</p>
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

<ul class="achievements-list animate-fade-in" style="list-style-type: none; padding-left: 0;">
  <li class="project-card delay-100">
    <strong>🌍 Multilingual Communicator:</strong> National level contestant of the French Word Power examination, Organized by the Quebec Government Office in Mumbai. I speak French to a moderate level of proficiency, estimated to be around B1. (Also sold D2D in Gatineau en français, I guess that's a plus!)
  </li>
  <li class="project-card delay-200">
    <strong>🏛️ Diplomatic Excellence:</strong> 5-time Model United Nations (MUN) winner. My deep interest in leadership and geopolitics lead me to frequently participate in Model United Nations conferences. This has developed my professional and collaborative network, and has immensely benefited my public speaking and critical thinking skills. I also have a borderline obsession with foreign relations, diplomacy, debate, especially when it comes to trade and conflicts around the world.
  </li>
  <li class="project-card delay-300">
    <strong>📚 Voracious Reader:</strong> Read over 150 books in the last two years spanning Self-Development, Finance, Strategy, History, Economics, Health and Philosophy. This has given me wider perspective and broadened my mind to alternative possibilities.
  </li>
  <li class="project-card delay-400">
    <strong>🤝 Community Engager:</strong> Frequent volunteer in school events, I find purpose in constructively engaging with my wider student-community. It has taught me to stick to my promises and shown me the value of contributing to greater causes.
  </li>
  <li class="project-card delay-100">
    <strong>🎓 Campus Leader:</strong> School Valedictorian in grade 10, and Student Council member in grade 11 and 12. I learnt how to resolve conflicts, and find amicable solutions that leads to a win-win.
  </li>
  <li class="project-card delay-200">
    <strong>🌱 Community Builder:</strong> Founder of an unofficial "Self-Improvement Club" at Carleton University, with over 50 engaged members on our discord! I took this initiative to find a sense of brotherhood, and it has lead to a culture of constant growth within my friend-circle. This further has helped me become accountable and disciplined.
  </li>
  <li class="project-card delay-300">
    <strong>💼 Sales Experience:</strong> Door-to-door sales experience with InsightPest Control in Ottawa and Gatineau in the summer of '24. Sold $20K worth of pest control in just 2 months, learning valuable interpersonal skills, sales techniques, customer service, and service delivery.
  </li>
  <li class="project-card delay-400">
    <strong>🏋️ Holistic Development:</strong> Other hobbies include Weightlifting, Chess, Tennis, Taekwondo, and Horse-back riding.
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
      <h3>Published "Perspective AI"</h3>
      <p>Co-authored and published my first book on artificial intelligence from a teenager's perspective.</p>
    </div>
  </div>
  
  <div class="timeline-item" style="position: relative; margin-bottom: 30px; padding-left: 50%; clear: both;">
    <div class="timeline-content project-card" style="position: relative; margin-left: 30px;">
      <span class="timeline-date" style="position: absolute; left: -110px; background: linear-gradient(45deg, #4568DC, #B06AB3); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8em;">2020</span>
      <h3>Clevered.com Internship</h3>
      <p>Completed a 4-month AI internship mentored by an Oxford professor, developing sentiment analysis for social media.</p>
    </div>
  </div>
  
  <div class="timeline-item" style="position: relative; margin-bottom: 30px; padding-right: 50%; clear: both; text-align: right;">
    <div class="timeline-content project-card" style="position: relative; margin-right: 30px;">
      <span class="timeline-date" style="position: absolute; right: -110px; background: linear-gradient(45deg, #B06AB3, #4568DC); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8em;">2022</span>
      <h3>IIT Ropar AI Program</h3>
      <p>Started the prestigious IIT program on Artificial Intelligence to deepen my knowledge in this rapidly evolving field.</p>
    </div>
  </div>
  
  <div class="timeline-item" style="position: relative; margin-bottom: 30px; padding-left: 50%; clear: both;">
    <div class="timeline-content project-card" style="position: relative; margin-left: 30px;">
      <span class="timeline-date" style="position: absolute; left: -110px; background: linear-gradient(45deg, #4568DC, #B06AB3); color: white; padding: 5px 10px; border-radius: 20px; font-size: 0.8em;">2025</span>
      <h3>GeoMonitor Launch</h3>
      <p>Developed and launched the cross-platform geopolitical news aggregator with AI-powered translation and analysis.</p>
    </div>
  </div>
</div>
