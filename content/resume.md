---
---
<style>
/* Static Resume Styles - Clean and Professional */
.gradient-text {
  background: linear-gradient(45deg, #4568DC, #B06AB3, #4568DC);
  background-size: 200% auto;
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-border {
  position: relative;
  border-radius: 10px;
  padding: 1px;
  background: linear-gradient(45deg, #4568DC, #B06AB3, #4568DC);
  background-size: 200% auto;
}

.resume-section {
  margin: 40px 0;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid #4568DC;
}

.project-card {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 15px;
  border-left: 4px solid transparent;
  border-left-color: #4568DC;
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

.intro-box {
  background-color: rgba(30, 30, 30, 0.7);
  color: #f0f0f0;
  padding: 20px;
  border-radius: 9px;
}

@media (prefers-color-scheme: light) {
  .intro-box {
    background-color: white;
    color: #333;
  }
}

.stats-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  margin: 40px 0;
  text-align: center;
}

.stat-item {
  padding: 15px;
  margin: 10px;
}

.stat-number {
  font-size: 2.5em;
  font-weight: bold;
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
  border-left: 4px solid #4568DC;
}

.extracurricular-card strong {
  display: flex;
  align-items: center;
  font-size: 1.2em;
  margin-bottom: 10px;
}

.extracurricular-icon {
  font-size: 1.5em;
  margin-right: 15px;
  display: inline-block;
  width: 30px;
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
  color: #fff;
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

.language-container {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  justify-content: center;
}

.language-item {
  background: rgba(69, 104, 220, 0.1);
  padding: 15px;
  border-radius: 8px;
  width: 120px;
  text-align: center;
}

.language-item:nth-child(even) {
  background: rgba(176, 106, 179, 0.1);
}

.timeline {
  position: relative;
  max-width: 1200px;
  margin: 20px auto;
}

.timeline-line {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 4px;
  background: linear-gradient(to bottom, #4568DC, #B06AB3);
  transform: translateX(-50%);
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
  clear: both;
}

.timeline-item:nth-child(odd) {
  padding-right: 50%;
  text-align: right;
}

.timeline-item:nth-child(even) {
  padding-left: 50%;
}

.timeline-content {
  position: relative;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #4568DC;
}

.timeline-item:nth-child(odd) .timeline-content {
  margin-right: 30px;
}

.timeline-item:nth-child(even) .timeline-content {
  margin-left: 30px;
}

.timeline-date {
  position: absolute;
  background: linear-gradient(45deg, #4568DC, #B06AB3);
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8em;
  top: 10px;
}

.timeline-item:nth-child(odd) .timeline-date {
  right: -110px;
}

.timeline-item:nth-child(even) .timeline-date {
  left: -110px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .language-container {
    flex-direction: column;
    align-items: center;
  }
  
  .timeline-line {
    left: 20px;
  }
  
  .timeline-item {
    padding-left: 40px !important;
    padding-right: 0 !important;
    text-align: left !important;
  }
  
  .timeline-content {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  
  .timeline-date {
    position: relative !important;
    left: 0 !important;
    right: 0 !important;
    display: inline-block;
    margin-bottom: 10px;
  }
}

.header-section {
  text-align: center;
  padding: 60px 20px;
  background: linear-gradient(135deg, rgba(13, 17, 23, 0.9) 0%, rgba(13, 17, 23, 0.95) 100%);
  border-radius: 15px;
  margin-bottom: 40px;
}

.header-section h1 {
  font-size: 4em;
  margin-bottom: 10px;
}

.header-section h3 {
  color: #e0e0e0;
  font-weight: 300;
  margin-bottom: 20px;
}

.header-section p {
  font-style: italic;
  opacity: 0.8;
  font-size: 1.2em;
}
</style>

<!-- Header Section -->
<div class="header-section">
  <h1 class="gradient-text">Aban Hasan</h1>
  <h3>⚡ Student | 🌐 Cybernaut | 🚀 Innovator</h3>
  <p>Building the digital future, one project at a time</p>
</div>

<!-- Professional Summary -->
<div class="gradient-border">
  <div class="intro-box">
    <h2 class="gradient-text">Professional Summary</h2>
    <p>Passionate technologist with expertise in AI/ML, cybersecurity, and full-stack development. Currently pursuing advanced education at Scalar School of Technology (3% acceptance rate) and IIT Madras BS Data Science program. Proven track record of building impactful projects that serve thousands of users, with strong foundations in algorithms, system design, and emerging technologies.</p>
  </div>
</div>

<!-- Key Statistics -->
<div class="stats-container">
  <div class="stat-item">
    <div class="stat-number gradient-text">5000+</div>
    <div class="stat-label">Users Impacted</div>
  </div>
  <div class="stat-item">
    <div class="stat-number gradient-text">150+</div>
    <div class="stat-label">Books Read</div>
  </div>
  <div class="stat-item">
    <div class="stat-number gradient-text">5+</div>
    <div class="stat-label">Languages</div>
  </div>
</div>

<!-- Education -->
<div class="resume-section">
  <h2 class="gradient-text">🎓 Education</h2>
  
  <div class="project-card">
    <h3>Scalar School of Technology - Bangalore, India 🇮🇳</h3>
    <p><strong>Advanced Computer Science Program</strong> | 2024 - Present</p>
    <p>One of India's most selective tech programs with ~3% acceptance rate. Intensive curriculum focused on algorithms, system design, and full-stack development alongside top-tier peers.</p>
    <div class="tech-tags">
      <span class="tech-tag">Advanced Algorithms</span>
      <span class="tech-tag">System Design</span>
      <span class="tech-tag">Full-Stack Development</span>
    </div>
  </div>

  <div class="project-card">
    <h3>IIT Madras - Remote</h3>
    <p><strong>BS Data Science & Applications</strong> | 2024 - Present</p>
    <p>4-year Bachelor's degree program combining statistical foundations with practical applications in data science and machine learning.</p>
    <div class="tech-tags">
      <span class="tech-tag">Statistical Modeling</span>
      <span class="tech-tag">Machine Learning</span>
      <span class="tech-tag">Data Analytics</span>
      <span class="tech-tag">Python</span>
    </div>
  </div>

  <div class="project-card">
    <h3>IIT Ropar - Remote</h3>
    <p><strong>Minor Degree in Artificial Intelligence</strong> | 2022 - Present</p>
    <p>Prestigious program providing comprehensive knowledge in AI/ML technologies and their applications.</p>
  </div>

  <div class="project-card">
    <h3>Carleton University - Ottawa, Canada 🇨🇦</h3>
    <p><strong>Computer Science (Year 1 Completed)</strong> | 2023</p>
    <p>Built strong foundation in CS fundamentals before transitioning to specialized programs in India.</p>
  </div>
</div>

<!-- Featured Projects -->
<div class="resume-section">
  <h2 class="gradient-text">🛠️ Featured Projects</h2>

  <div class="project-card">
    <h3><a href="https://geomonitor.abanhasan.net/" target="_blank">🌎 GeoMonitor</a></h3>
    <p>A sophisticated real-time geopolitical news aggregator that analyzes global flashpoints using advanced AI. The system automatically translates content from multiple languages, ranks significance, and visualizes developments on interactive maps.</p>
    <div class="tech-tags">
      <span class="tech-tag">AI/ML</span>
      <span class="tech-tag">NLP</span>
      <span class="tech-tag">Data Visualization</span>
      <span class="tech-tag">Cross-Platform</span>
    </div>
  </div>

  <div class="project-card">
    <h3><a href="https://www.projectskilltree.com/" target="_blank">🌱 Project Skilltree</a></h3>
    <p>Revolutionary Discord bot serving 5,000+ users, gamifying self-improvement journeys. Developed significant portions of the bot interface and API, creating an engaging system for tracking personal growth.</p>
    <div class="tech-tags">
      <span class="tech-tag">Discord API</span>
      <span class="tech-tag">Gamification</span>
      <span class="tech-tag">UX Design</span>
      <span class="tech-tag">API Development</span>
    </div>
  </div>

  <div class="project-card">
    <h3><a href="https://thewildofficial.github.io/monkey-typewriter/" target="_blank">🐒 Monkey Typewriter Simulation</a></h3>
    <p>Elegant visualization of the "infinite monkey theorem" using Bayesian statistics. Interactive algorithm demonstrating probability theory through engaging visual interface.</p>
    <div class="tech-tags">
      <span class="tech-tag">Bayesian Statistics</span>
      <span class="tech-tag">Data Visualization</span>
      <span class="tech-tag">Web App</span>
    </div>
  </div>

  <div class="project-card">
    <h3><a href="https://nexusaurora.org/" target="_blank">🚀 Nexus Aurora</a></h3>
    <p>Former project lead at open-source space colonization community. Winners of 2020 Mars Society City State Competition. Designed door security systems using RFIDs and developed community Discord bot.</p>
    <div class="tech-tags">
      <span class="tech-tag">RFID Systems</span>
      <span class="tech-tag">Community Management</span>
      <span class="tech-tag">Bot Development</span>
    </div>
  </div>
</div>

<!-- Professional Experience -->
<div class="resume-section">
  <h2 class="gradient-text">💼 Professional Experience</h2>

  <div class="project-card">
    <h3>🧠 AI Intern - Clevered.com</h3>
    <p><strong>4-month Artificial Intelligence Internship</strong> | 2020</p>
    <p>Mentored by senior Oxford professor. Developed sentiment analysis website predicting emotional responses of tweets using Natural Language Processing.</p>
    <div class="tech-tags">
      <span class="tech-tag">NLP</span>
      <span class="tech-tag">Sentiment Analysis</span>
      <span class="tech-tag">Predictive Modeling</span>
      <span class="tech-tag">Python</span>
    </div>
  </div>

  <div class="project-card">
    <h3>💼 Sales Representative</h3>
    <p><strong>Door-to-Door Sales</strong> | Summer 2023</p>
    <p>Generated $20K in sales over 2 months. Gained valuable experience in interpersonal skills, resilience, customer service, and service delivery.</p>
  </div>
</div>

<!-- Publications -->
<div class="resume-section">
  <h2 class="gradient-text">📚 Publications</h2>

  <div class="project-card">
    <h3><a href="https://www.amazon.com/Perspective-Artificial-Intelligence-Aban-Hasan/dp/1678985988" target="_blank">📚 Perspective AI</a></h3>
    <p>Co-authored book presenting a teenager's perspective on artificial intelligence and its future impact. Published in Grade 8, demonstrating early interest in AI ethics and social implications.</p>
  </div>
</div>

<!-- Technical Skills & Achievements -->
<div class="resume-section">
  <h2 class="gradient-text">🔧 Technical Skills & Achievements</h2>

  <div class="project-card">
    <h3>🔐 Cybersecurity Excellence</h3>
    <p>Ranked in top 2% of hackers on TryHackMe.com. Strong foundation in defensive and offensive security practices through extensive CTF participation.</p>
    <div class="tech-tags">
      <span class="tech-tag">Cybersecurity</span>
      <span class="tech-tag">Penetration Testing</span>
      <span class="tech-tag">CTF</span>
    </div>
  </div>

  <div class="project-card">
    <h3>💻 Technical Proficiencies</h3>
    <div class="tech-tags">
      <span class="tech-tag">Python</span>
      <span class="tech-tag">JavaScript</span>
      <span class="tech-tag">AI/ML</span>
      <span class="tech-tag">NLP</span>
      <span class="tech-tag">Data Science</span>
      <span class="tech-tag">Cybersecurity</span>
      <span class="tech-tag">Full-Stack Development</span>
      <span class="tech-tag">System Design</span>
      <span class="tech-tag">Discord API</span>
      <span class="tech-tag">Data Visualization</span>
    </div>
  </div>
</div>

<!-- Languages -->
<div class="resume-section">
  <h2 class="gradient-text">🌍 Languages</h2>
  <div class="language-container">
    <div class="language-item">
      <span style="font-size: 2em;">🇺🇸</span><br>
      <strong>English</strong><br>
      Native
    </div>
    <div class="language-item">
      <span style="font-size: 2em;">🇨🇦</span><br>
      <strong>French</strong><br>
      B1
    </div>
    <div class="language-item">
      <span style="font-size: 2em;">🇩🇪</span><br>
      <strong>German</strong><br>
      A2
    </div>
    <div class="language-item">
      <span style="font-size: 2em;">🇾🇪</span><br>
      <strong>Arabic</strong><br>
      Beginner
    </div>
  </div>
</div>

<!-- Leadership & Extracurriculars -->
<div class="resume-section">
  <h2 class="gradient-text">🌟 Leadership & Extracurriculars</h2>

  <ul class="extracurriculars-grid">
    <li class="extracurricular-card">
      <strong><span class="extracurricular-icon">🏛️</span>Model United Nations</strong>
      5-time MUN winner. Developed public speaking, critical thinking, and collaborative skills with focus on geopolitics and debate.
    </li>
    <li class="extracurricular-card">
      <strong><span class="extracurricular-icon">🌱</span>Community Builder</strong>
      Founded Self-Improvement Club at Carleton University, growing membership to 50+ students. Focused on accountability and shared growth.
    </li>
    <li class="extracurricular-card">
      <strong><span class="extracurricular-icon">🎓</span>Academic Leadership</strong>
      Served as School Valedictorian and Student Council member. Developed conflict resolution and negotiation skills.
    </li>
    <li class="extracurricular-card">
      <strong><span class="extracurricular-icon">🌍</span>Multilingual Excellence</strong>
      National level contestant of French Word Power examination. Applied skills in real-world D2D sales in Gatineau.
    </li>
    <li class="extracurricular-card">
      <strong><span class="extracurricular-icon">📚</span>Continuous Learning</strong>
      Read 150+ books across Self-Development, Finance, Strategy, History, and Philosophy in the past two years.
    </li>
    <li class="extracurricular-card">
      <strong><span class="extracurricular-icon">🏋️</span>Holistic Development</strong>
      Active in Weightlifting, Chess, Tennis, Taekwondo, and Horse-back riding for discipline and strategic thinking.
    </li>
  </ul>
</div>



## 📊 Career Timeline

**2025** - **GeoMonitor Launch**  
Developed and launched cross-platform geopolitical news aggregator with AI-powered translation and analysis.

**2024** - **Return to Bangalore 🇮🇳**  
Strategic decision to attend Scalar School of Technology and pursue parallel degree from IIT Madras.

**2023** - **Carleton Year 1 🇨🇦**  
Completed first year of Computer Science degree, building strong foundation before pivoting to specialized path.

**2022** - **IIT Ropar AI Program**  
Started prestigious IIT program on Artificial Intelligence to deepen knowledge in rapidly evolving field.

**2020** - **Clevered.com Internship**  
Completed 4-month AI internship mentored by Oxford professor, developing sentiment analysis for social media.

**2019** - **Published "Perspective AI"**  
Co-authored and published first book on artificial intelligence from a teenager's perspective.

---

**Contact Information:**
- Website: [abanhasan.net](https://abanhasan.net)
- GitHub: [thewildofficial](https://github.com/thewildofficial)
- TryHackMe: [thewildofficial](https://tryhackme.com/p/thewildofficial)