=====================================================================
  SkillSwap - AI-Powered Skill Exchange Platform (University Project)
=====================================================================

SkillSwap is an interactive website prototype where users can teach
skills they have, learn new skills from others, and collaborate on
real-world projects.

Built with ONLY:  HTML + CSS + Vanilla JavaScript
- No database, no PHP, no frameworks, no installation, no internet needed.
- All data (accounts, requests, projects, points) is saved in the
  browser using localStorage.


---------------------------------------------------------------------
 1. HOW TO RUN (choose ANY one option)
---------------------------------------------------------------------

 OPTION A - Easiest (no software needed)
   1. Copy the "skillswap" folder to the laptop.
   2. Open the folder and double-click "index.html".
   3. The website opens in the browser (Chrome / Edge / Firefox).

 OPTION B - Using XAMPP
   1. Install XAMPP (https://www.apachefriends.org).
   2. Copy the "skillswap" folder into:  C:\xampp\htdocs\
   3. Open the XAMPP Control Panel and click "Start" next to Apache.
      (MySQL is NOT needed.)
   4. Open the browser and go to:   http://localhost/skillswap/

 OPTION C - Online link to share
   Upload the whole "skillswap" folder to any free static hosting,
   for example Netlify Drop (https://app.netlify.com/drop): drag and
   drop the folder and you get a public link to share.


---------------------------------------------------------------------
 2. DEMO ACCOUNT
---------------------------------------------------------------------

   Email:     demo@skillswap.com
   Password:  123456

   (The login page has a "Use demo account" button.)

   Other sample users (same password 123456):
   sara@skillswap.com, youssef@skillswap.com, nour@skillswap.com,
   karim@skillswap.com, laila@skillswap.com, ahmed@skillswap.com,
   mariam@skillswap.com, hana@skillswap.com, ziad@skillswap.com

   You can also create a new account from the "Sign up" page.

   TIP: To see both sides of a skill exchange, send a request from
   one account, log out, log in as the other user and accept it.


---------------------------------------------------------------------
 3. FEATURES / PAGES
---------------------------------------------------------------------

  index.html         Landing page (logo, introduction, Get Started)
  signup.html        3-step sign up (account, profile, skills)
  login.html         Log in (with demo account button)
  dashboard.html     User dashboard: points, level, skills, learning
                     progress (+/- buttons), new requests, AI
                     recommendations, projects
  matching.html      AI Skill Matching: choose skills -> ranked people
                     with a match score and the reasons
  explore.html       Explore Skills: search, filter by category,
                     switch between Skills and People
  exchanges.html     Skill Exchange: send / accept / decline / cancel,
                     mark as completed, leave a star review
  projects.html      Collaborative Projects: create, join, leave,
                     add and tick tasks, complete project
  passport.html      Skill Passport: portfolio with skills, badges,
                     projects, reviews; edit profile; Save as PDF
                     (passport.html?id=3 shows another user)
  rewards.html       Skill Points & Rewards: balance, levels, how to
                     earn, rewards store, history, leaderboard
  cv-analysis.html   AI CV Analysis: paste or upload a .txt CV ->
                     score, detected skills, sections, strengths,
                     weaknesses, skills to learn, find mentors

  "Reset demo data" (bottom of the sidebar) restores the original
  sample data at any time.


---------------------------------------------------------------------
 4. ABOUT THE "AI" FEATURES
---------------------------------------------------------------------

  This is a prototype, so the AI features use smart demo logic
  instead of a real AI service:

  - AI Skill Matching (js/matching.js): a scoring algorithm. It gives
    points for: teaching the wanted skills, teaching level, a
    "perfect swap" (they want a skill you teach), rating, activity.

  - AI CV Analysis (js/cv-analyzer.js): keyword detection of skills
    and CV sections, compared with the skills each target job needs.


---------------------------------------------------------------------
 5. FOLDER STRUCTURE
---------------------------------------------------------------------

  skillswap/
  |-- index.html, login.html, signup.html     (public pages)
  |-- dashboard.html ... cv-analysis.html     (app pages)
  |-- css/
  |   |-- style.css          All the design (colors at the top)
  |-- images/
  |   |-- logo.svg           Logo + browser tab icon
  |-- js/
  |   |-- data.js            Sample data (users, skills, projects...)
  |   |-- store.js           Saves/reads data (like a small backend)
  |   |-- app.js             Sidebar, top bar, popups, helpers
  |   |-- matching.js        AI matching algorithm
  |   |-- cv-analyzer.js     AI CV analysis logic
  |   |-- pages/             One JavaScript file per page
  |-- README.txt


---------------------------------------------------------------------
 6. HOW TO CHANGE THINGS
---------------------------------------------------------------------

  - Colors:        css/style.css -> the variables at the top (:root)
  - Sample data:   js/data.js  (then click "Reset demo data")
  - Point values:  js/store.js (search for addPoints)
  - Rewards list:  js/data.js -> rewards


---------------------------------------------------------------------
 7. GOOD TO KNOW
---------------------------------------------------------------------

  - Data is saved per browser. Each laptop/browser starts with the
    same sample data. Accounts made on one laptop do not appear on
    another (there is no server, this is a prototype).
  - Clearing the browser history/site data also resets the data.
  - Works on mobile and laptop (responsive design).
  - Passwords are stored as plain text in the browser, which is fine
    for a demo but a real product would need a server and hashing.
