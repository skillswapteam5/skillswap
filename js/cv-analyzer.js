/* =====================================================================
   SkillSwap - "AI" CV Analyzer
   ---------------------------------------------------------------------
   Reads the CV text and:
     - detects skills using a keyword list
     - checks which important CV sections exist
     - gives a score, strengths and weaknesses
     - compares the skills with a target job and suggests what to learn
   It works with demo logic (keywords), no real AI service is used.
   ===================================================================== */

var CVAnalyzer = {

  // Skill name (must match a skill in data.js when possible) -> keywords to search
  SKILL_KEYWORDS: {
    "HTML & CSS":         ["html", "css", "bootstrap", "tailwind", "responsive"],
    "JavaScript":         ["javascript", "js", "es6", "jquery", "dom"],
    "PHP":                ["php", "laravel"],
    "Python":             ["python", "pandas", "numpy", "django", "flask"],
    "Java":               ["java", "spring"],
    "C++":                ["c++", "cpp"],
    "Mobile Development": ["flutter", "android", "ios", "kotlin", "swift", "mobile"],
    "Cyber Security":     ["security", "cyber", "penetration", "network security"],
    "SQL & Databases":    ["sql", "mysql", "database", "postgresql", "mongodb"],
    "Data Analysis":      ["data analysis", "analytics", "power bi", "tableau", "statistics"],
    "Machine Learning":   ["machine learning", "deep learning", "tensorflow", "scikit", "neural"],
    "Cloud Computing":    ["cloud", "aws", "azure", "firebase"],
    "UI/UX Design":       ["ui/ux", "ux", "user experience", "wireframe", "prototype", "usability"],
    "Graphic Design":     ["photoshop", "illustrator", "graphic design", "branding", "canva"],
    "Figma":              ["figma"],
    "Video Editing":      ["premiere", "after effects", "video editing", "final cut"],
    "Photography":        ["photography", "lightroom", "camera"],
    "Content Writing":    ["content writing", "copywriting", "blog", "writing"],
    "Digital Marketing":  ["marketing", "seo", "social media", "ads", "campaign"],
    "Project Management": ["project management", "scrum", "agile", "jira", "trello"],
    "Excel":              ["excel", "spreadsheet"],
    "Public Speaking":    ["presentation", "public speaking", "presented", "speaker"],
    "Leadership":         ["leader", "led a team", "team lead", "president", "head of", "managed"],
    "English":            ["english", "ielts", "toefl"],
    "French":             ["french"],
    "German":             ["german"],
    "Git & GitHub":       ["git", "github"]
  },

  // Target jobs and the skills they need
  ROLES: {
    "Frontend Developer":  ["HTML & CSS", "JavaScript", "UI/UX Design", "Git & GitHub", "Figma", "English"],
    "Backend Developer":   ["PHP", "SQL & Databases", "Python", "Git & GitHub", "Cloud Computing", "Cyber Security"],
    "Data Scientist":      ["Python", "Machine Learning", "Data Analysis", "SQL & Databases", "Excel", "Public Speaking"],
    "UI/UX Designer":      ["UI/UX Design", "Figma", "Graphic Design", "HTML & CSS", "Public Speaking", "English"],
    "Digital Marketer":    ["Digital Marketing", "Content Writing", "Graphic Design", "Data Analysis", "Video Editing", "English"],
    "Mobile Developer":    ["Mobile Development", "JavaScript", "UI/UX Design", "Cloud Computing", "Git & GitHub", "SQL & Databases"]
  },

  SECTIONS: {
    "Contact information": ["@", "phone", "email", "linkedin", "+20", "mobile:"],
    "Summary / Objective": ["summary", "objective", "profile", "about me"],
    "Education":           ["education", "university", "bachelor", "faculty", "degree", "gpa"],
    "Experience":          ["experience", "internship", "intern", "worked", "employment", "freelance"],
    "Projects":            ["project"],
    "Skills section":      ["skills", "technologies", "tools"],
    "Certificates":        ["certificate", "certification", "course", "certified"]
  },

  SAMPLE_CV:
    "Omar Khaled\n" +
    "Email: omar.khaled@email.com | Phone: +20 100 000 0000 | LinkedIn: linkedin.com/in/omarkhaled\n\n" +
    "SUMMARY\n" +
    "Computer Science student passionate about building responsive websites and learning AI.\n\n" +
    "EDUCATION\n" +
    "Bachelor of Computer Science - Cairo University (2023 - 2027), GPA 3.4\n\n" +
    "EXPERIENCE\n" +
    "Front-end Intern - Tech Startup (Summer 2026)\n" +
    "- Built responsive pages using HTML, CSS and JavaScript\n" +
    "- Worked with the design team to convert wireframes into web pages\n\n" +
    "PROJECTS\n" +
    "- University Club Website: HTML, CSS, JavaScript\n" +
    "- AI Study Buddy Chatbot (team project): built the chat interface\n\n" +
    "SKILLS\n" +
    "HTML, CSS, JavaScript, Bootstrap, Git, GitHub, English (fluent), Excel\n",

  analyze: function (text, role) {
    var lower = " " + text.toLowerCase().replace(/[\n\r\t]+/g, " ") + " ";
    var self = this;

    // 1. Detect skills
    var detected = [];
    Object.keys(this.SKILL_KEYWORDS).forEach(function (skill) {
      var found = self.SKILL_KEYWORDS[skill].some(function (word) {
        return self.containsWord(lower, word);
      });
      if (found) detected.push(skill);
    });

    // 2. Check sections
    var sections = Object.keys(this.SECTIONS).map(function (name) {
      var ok = self.SECTIONS[name].some(function (w) { return lower.indexOf(w) !== -1; });
      return { name: name, found: ok };
    });
    var sectionsFound = sections.filter(function (s) { return s.found; }).length;

    // 3. Compare with target role
    var needed = this.ROLES[role] || [];
    var haveForRole = needed.filter(function (s) { return detected.indexOf(s) !== -1; });
    var missing = needed.filter(function (s) { return detected.indexOf(s) === -1; });

    // 4. Other checks
    var words = text.trim().split(/\s+/).filter(Boolean).length;
    var hasNumbers = /\d+\s*(%|percent|users|students|projects|people|clients)/i.test(text);
    var actionVerbs = ["built", "developed", "designed", "led", "created", "managed", "improved", "launched"];
    var verbsUsed = actionVerbs.filter(function (v) { return lower.indexOf(v) !== -1; }).length;

    // 5. Score (out of 100)
    var score = 0;
    score += (sectionsFound / sections.length) * 35;                 // structure
    score += Math.min(detected.length / 8, 1) * 25;                  // skills
    score += needed.length ? (haveForRole.length / needed.length) * 25 : 0; // role fit
    score += words >= 150 && words <= 800 ? 7 : words >= 80 ? 4 : 1;     // length
    score += Math.min(verbsUsed / 3, 1) * 5;                         // action verbs
    score += hasNumbers ? 3 : 0;                                     // measurable results
    score = Math.round(Math.min(score, 100));

    // 6. Strengths & weaknesses
    var strengths = [], weaknesses = [];
    if (detected.length >= 5) strengths.push("Good variety of skills (" + detected.length + " detected).");
    if (haveForRole.length >= Math.ceil(needed.length / 2)) strengths.push("Strong match for " + role + " (" + haveForRole.length + "/" + needed.length + " key skills).");
    sections.forEach(function (s) {
      if (s.found && (s.name === "Experience" || s.name === "Projects")) strengths.push("Includes a clear " + s.name.toLowerCase() + " section.");
    });
    if (verbsUsed >= 3) strengths.push("Uses strong action verbs (built, developed, designed...).");
    if (detected.indexOf("Git & GitHub") !== -1) strengths.push("Mentions Git / GitHub which employers like.");

    sections.forEach(function (s) {
      if (!s.found) weaknesses.push("Missing \"" + s.name + "\" section.");
    });
    if (!hasNumbers) weaknesses.push("No measurable results. Add numbers, e.g. \"improved speed by 30%\" or \"used by 200 students\".");
    if (words < 150) weaknesses.push("CV is quite short (" + words + " words). Add more details about your work.");
    if (words > 800) weaknesses.push("CV is long (" + words + " words). Try to keep it to 1-2 pages.");
    if (missing.length) weaknesses.push("Missing key skills for " + role + ": " + missing.join(", ") + ".");
    if (verbsUsed < 3) weaknesses.push("Use more action verbs to describe your achievements.");
    if (!strengths.length) strengths.push("You have a starting point. Follow the tips to improve your CV.");

    return {
      score: score,
      detected: detected,
      sections: sections,
      role: role,
      haveForRole: haveForRole,
      missing: missing,
      strengths: strengths,
      weaknesses: weaknesses,
      words: words
    };
  },

  // Checks a keyword as a whole word (so "java" is not found inside "javascript")
  containsWord: function (text, word) {
    var escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("(^|[^a-z0-9+#])" + escaped + "($|[^a-z0-9+#])").test(text);
  }
};
