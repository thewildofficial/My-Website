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

/* Responsive adjustments */
@media (max-width: 768px) {
  .language-container {
    flex-direction: column;
    align-items: center;
  }
}
</style>

<h1 align="center" class="gradient-text animate-fade-in">Aban Hasan</h1>

<h3 align="center" class="animate-fade-in delay-200">⚡ Student | 🌐 Cybernaut | 🚀 Innovator</h3>

<p align="center" class="animate-fade-in delay-300">
  <i>Building the digital future, one project at a time</i>
</p>

<div class="gradient-border animate-fade-in delay-400">
  <div style="background: white; padding: 20px; border-radius: 9px;">
    <p>I've been immersed in the world of code since I was 12 years old. What began as curiosity evolved into a passion that drives me to explore the endless possibilities of the digital frontier. My journey combines technical expertise with a deep appreciation for how technology can solve real-world problems.</p>
  </div>
</div>

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
  <h3>🧠 Clevered.com Internship</h3>
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

<!---



# Extracurriculars and Initiatives

I am a firm believer that every person must be the leader of their own mind.I have an affinity for leadership roles because I have a deep desire to see meaningful improvements in myself, in people around me and society as a whole:


* This is precisely why I ran for Student council in grade 12. Through being a council member, I organised school events, contributed to associations/clubs, and served as a collaborator between students and staff. 
* I have attended plenty of Model United Nations contests and public speaking workshops, where I have learnt the importance of interpersonal skills.
* My desire for finding a circle of individuals on self-improvement led me to join the online community of a popular youtuber known as [Hamza](https://www.youtube.com/c/Hamza97/videos). In this community I have actively participated and have given lectures on topics like Social Skills, Debating and Reading. For my contributions, I have been recognized and nominated as the moderator of the discord server.
* In this community, I found a persisting pain point of people in general, who perceived that although they are working to improve themselves, it was challenging to track their habits and monitor their progress. This lead me to collaborate with members of the community in creating [project skill tree](https://www.projectskilltree.com/).
* Skill Tree is a discord bot interface (and future app) aimed to "gamify" and chart one's self improvement journey. It is currently used by over 5000 unique users, and charts habits like Journalling, Meditation and Weightlifting. I worked extensively on the front-end and API of this Interface. Working on this project taught me a lot about teamwork, User Experience, Deadlines and Marketing.
* OpenAI GPT-3 Official Beta tester, I was among the first to use GPT-3 Technology, with special approval from the OpenAI CEO.
* My earliest venture was when I, as a 14 year old during class 8 where along with my two other classmates found a company, where we organised discussions and participated in our cities tech competitions. I learnt a lot about business stratagies and a taste of what it means to be a CEO/Founder.


<p align="center">Top 2% of TryHackMe Hackers, with over X points!</p>


<p align="center">Github Contribution Heatmap</p>


<style type="text/css">table{
border : 1px solid #000000;
} </style>
<table id="activity-table" class="summaryTable " summary="" style="border : 1px solid #000000;">
    <thead>
        <tr>
           <th scope="col" style="width: 10em;">Start Date</th>
            <th scope="col" style="width: 10em;">To Date</th>
            <th scope="col" style="width: 17em;">Activity</th>
            <th scope="col" style="width: 15em;">Employer</th>
        </tr>
    </thead>
    <tbody>
        <tr class="row-even">
            <td style="width: 10em;">2022-09</td>
            <td style="width: 10em;">2022-09</td>
            <td style="width: 17em;">DataScience 101 Certified</td>
            <td style="width: 15em;">IBM</td>
        </tr>
        <tr class="row-odd">
            <td style="width: 10em;">2022-09</td>
            <td style="width: 10em;">2022-09</td>
            <td style="width: 17em;">French Word Power A2.1</td>
            <td style="width: 15em;">Bereau Du Quebec, Mumbai</td>
        </tr>
        <tr class="row-even">
            <td style="width: 10em;">2022-09</td>
            <td style="width: 10em;">2022-10</td>
            <td style="width: 17em;">MUN - Special Mention</td>
            <td style="width: 15em;">Harvard Student Agencies</td>
        </tr>
        <tr class="row-odd">
            <td style="width: 10em;">2022-06</td>
            <td style="width: 10em;">2022-09</td>
            <td style="width: 17em;">AI - Internship</td>
            <td style="width: 15em;">clevered.com</td>
        </tr>
        <tr class="row-even">
            <td style="width: 10em;">2022-04</td>
            <td style="width: 10em;">Present</td>
            <td style="width: 17em;">Student Council-Class Rep</td>
            <td style="width: 15em;">St Aloysius PU College</td>
        </tr>
        <tr class="row-odd">
            <td style="width: 10em;">2021-11</td>
            <td style="width: 10em;">2021-11</td>
            <td style="width: 17em;">Hard Sell contest winner</td>
            <td style="width: 15em;">St Aloysius PU College</td>
        </tr>
        <tr class="row-even">
            <td style="width: 10em;">2021-09</td>
            <td style="width: 10em;">2021-09</td>
            <td style="width: 17em;">SAPMUN 2021 Winner</td>
            <td style="width: 15em;">St Aloysius PU College</td>
        </tr>
        <tr class="row-odd">
            <td style="width: 10em;">2021-05</td>
            <td style="width: 10em;">2021-05</td>
            <td style="width: 17em;">Quiz Winner</td>
            <td style="width: 15em;">St Aloysius PU College</td>
        </tr>
        <tr class="row-even">
            <td style="width: 10em;">2020-11</td>
            <td style="width: 10em;">2020-11</td>
            <td style="width: 17em;">Debate Workshop</td>
            <td style="width: 15em;">Debate Mate</td>
        </tr>
        <tr class="row-odd">
            <td style="width: 10em;">2020-08</td>
            <td style="width: 10em;">2020-08</td>
            <td style="width: 17em;">French-A1 Certified</td>
            <td style="width: 15em;">Busuu</td>
        </tr>
        <tr class="row-even">
            <td style="width: 10em;">2020-04</td>
            <td style="width: 10em;">2021-03</td>
            <td style="width: 17em;">Computer Club Secretary</td>
            <td style="width: 15em;">St Aloysius PU College</td>
        </tr>
        <tr class="row-odd">
            <td style="width: 10em;">2020-01</td>
            <td style="width: 10em;">Present</td>
            <td style="width: 17em;">Lead Developer</td>
            <td style="width: 15em;">projec­tskilltree.com</td>
        </tr>
        <tr class="row-even">
            <td style="width: 10em;">2019-11</td>
            <td style="width: 10em;">2019-11</td>
            <td style="width: 17em;">SAPMUN 2019 Participant</td>
            <td style="width: 15em;">St Aloysius PU College</td>
        </tr>
        <tr class="row-odd">
            <td style="width: 10em;">2019-11</td>
            <td style="width: 10em;">2020-06</td>
            <td style="width: 17em;">Project Lead</td>
            <td style="width: 15em;">Nexus Aurora</td>
        </tr>
        <tr class="row-even">
            <td style="width: 10em;">2019-11</td>
            <td style="width: 10em;">2019-11</td>
            <td style="width: 17em;">Science Expo Participant</td>
            <td style="width: 15em;">Vikaas College</td>
        </tr>
        <tr class="row-odd">
            <td style="width: 10em;">2019-09</td>
            <td style="width: 10em;">2019-12</td>
            <td style="width: 17em;">Book Author</td>
            <td style="width: 15em;">BookTitle: Perspective AI</td>
        </tr>
        <tr class="row-even">
            <td style="width: 10em;">2019-06</td>
            <td style="width: 10em;">2020-04</td>
            <td style="width: 17em;">Class Valedi­ctorian</td>
            <td style="width: 15em;">St Theresa's School</td>
        </tr>
        <tr class="row-odd">
            <td style="width: 10em;">2018-02</td>
            <td style="width: 10em;">2018-02</td>
            <td style="width: 17em;">National Champion</td>
            <td style="width: 15em;">Conquest IQ Olympiad</td>
        </tr>
        <tr class="row-even">
            <td style="width: 10em;">2017-09</td>
            <td style="width: 10em;">2018-06</td>
            <td style="width: 17em;">District Winner</td>
            <td style="width: 15em;">Wiz National Spell Bee</td>
        </tr>
    </tbody>
</table>

---
