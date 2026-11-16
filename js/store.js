/* =====================================================================
   SkillSwap - Data store (works like a small backend inside the browser)
   ---------------------------------------------------------------------
   Instead of a database, all data is saved in the browser's localStorage
   as one JSON object. Every page uses the functions in "Store" to read
   and change data. If something is not allowed, the function throws an
   Error with a friendly message, and the page shows it to the user.
   ===================================================================== */

var Store = (function () {

  var DB_KEY = "skillswap_db_v1";       // where all data is saved
  var SESSION_KEY = "skillswap_user";   // id of the logged-in user
  var EMAIL_KEY = "skillswap_last_email"; // last email used, to fill the login form
  var memory = {};                      // backup if localStorage is blocked
  var db = null;

  /* ---------- Safe localStorage helpers ---------- */
  function readKey(key) {
    try { return localStorage.getItem(key); } catch (e) { return memory[key] || null; }
  }
  function writeKey(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { memory[key] = value; }
  }
  function removeKey(key) {
    try { localStorage.removeItem(key); } catch (e) { delete memory[key]; }
  }

  // Checks if the browser really lets us save data (it can be blocked, e.g. in private mode)
  function canSave() {
    try {
      localStorage.setItem("skillswap_test", "1");
      localStorage.removeItem("skillswap_test");
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ---------- Load / save ---------- */
  function load() {
    if (db) return db;
    var saved = readKey(DB_KEY);
    if (saved) {
      try { db = JSON.parse(saved); } catch (e) { db = null; }
    }
    if (!db) {
      db = JSON.parse(JSON.stringify(SEED_DATA)); // fresh copy of the sample data
      save();
    }
    return db;
  }
  function save() { writeKey(DB_KEY, JSON.stringify(db)); }

  function resetAll() {
    removeKey(DB_KEY);
    removeKey(SESSION_KEY);
    db = null;
    load();
  }

  /* ---------- Small helpers ---------- */
  function today() { return new Date().toISOString().slice(0, 10); }
  function nextId(list) {
    var max = 0;
    list.forEach(function (item) { if (item.id > max) max = item.id; });
    return max + 1;
  }
  function findUser(id) { return load().users.find(function (u) { return u.id === Number(id); }); }
  function findSkill(id) { return load().skills.find(function (s) { return s.id === Number(id); }); }
  function skillName(id) { var s = findSkill(id); return s ? s.name : "Unknown skill"; }
  function fail(message) { throw new Error(message); }

  function addPoints(userId, points, reason) {
    var user = findUser(userId);
    if (!user) return;
    user.points += points;
    load().transactions.push({ user: user.id, points: points, reason: reason, date: today() });
  }

  /* ---------- Session (login) ---------- */
  function currentUser() {
    var id = Number(readKey(SESSION_KEY));
    return id ? findUser(id) || null : null;
  }
  function requireUser() {
    var user = currentUser();
    if (!user) fail("Please log in first.");
    return user;
  }

  function register(data) {
    var d = load();
    var name = (data.name || "").trim();
    var email = (data.email || "").trim().toLowerCase();
    var password = data.password || "";

    if (name.length < 3) fail("Please enter your full name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fail("Please enter a valid email address.");
    if (password.length < 6) fail("Password must be at least 6 characters.");
    if (d.users.some(function (u) { return u.email === email; })) fail("This email is already registered. Try logging in.");

    var colors = ["#6C4CF1", "#3B82F6", "#8B5CF6", "#0EA5E9", "#EC4899", "#10B981", "#F59E0B", "#14B8A6"];
    var user = {
      id: nextId(d.users),
      name: name,
      email: email,
      password: password, // NOTE: demo only. A real website must hash passwords on a server.
      title: (data.title || "").trim() || "SkillSwap Member",
      university: (data.university || "").trim(),
      bio: (data.bio || "").trim(),
      color: colors[Math.floor(Math.random() * colors.length)],
      points: 0,
      joined: today(),
      teach: (data.teach || []).map(function (t) { return { skill: Number(t.skill), level: t.level || "Intermediate" }; }),
      learn: (data.learn || []).map(function (id) { return { skill: Number(id), progress: 0 }; })
    };
    d.users.push(user);
    addPoints(user.id, 50, "Welcome bonus for joining SkillSwap");
    if (user.teach.length && user.learn.length) addPoints(user.id, 25, "Completed your profile");
    writeKey(SESSION_KEY, String(user.id));
    writeKey(EMAIL_KEY, user.email);
    save();
    return user;
  }

  function login(email, password) {
    email = (email || "").trim().toLowerCase();
    var user = load().users.find(function (u) { return u.email === email; });
    if (!user) fail("No account with this email in this browser. Accounts are saved in the browser you signed up with, so use the same browser (and the same way of opening the site), or create a new account.");
    if (user.password !== password) fail("Wrong password. Please try again.");
    writeKey(SESSION_KEY, String(user.id));
    writeKey(EMAIL_KEY, user.email);
    return user;
  }

  function logout() { removeKey(SESSION_KEY); }
  function lastEmail() { return readKey(EMAIL_KEY) || ""; }

  /* ---------- Skills ---------- */
  function getSkills() { return load().skills; }

  // Find a skill by name, or create it if it does not exist
  function findOrCreateSkill(name, category) {
    var d = load();
    name = (name || "").trim();
    if (!name) fail("Please enter a skill name.");
    var found = d.skills.find(function (s) { return s.name.toLowerCase() === name.toLowerCase(); });
    if (found) return found;
    var skill = { id: nextId(d.skills), name: name, category: category || "Other" };
    d.skills.push(skill);
    save();
    return skill;
  }

  function addSkill(type, skillId, level) {
    var user = requireUser();
    skillId = Number(skillId);
    if (!findSkill(skillId)) fail("Skill not found.");
    if (type === "teach") {
      var t = user.teach.find(function (x) { return x.skill === skillId; });
      if (t) t.level = level || t.level;
      else user.teach.push({ skill: skillId, level: level || "Intermediate" });
    } else {
      if (!user.learn.some(function (x) { return x.skill === skillId; })) user.learn.push({ skill: skillId, progress: 0 });
    }
    save();
  }

  function removeSkill(type, skillId) {
    var user = requireUser();
    var list = type === "teach" ? "teach" : "learn";
    user[list] = user[list].filter(function (x) { return x.skill !== Number(skillId); });
    save();
  }

  function updateProgress(skillId, progress) {
    var user = requireUser();
    var item = user.learn.find(function (x) { return x.skill === Number(skillId); });
    if (!item) return;
    var before = item.progress;
    item.progress = Math.max(0, Math.min(100, Number(progress)));
    if (before < 100 && item.progress === 100) {
      addPoints(user.id, 30, "Finished learning goal: " + skillName(skillId));
    }
    save();
    return item.progress;
  }

  function updateProfile(data) {
    var user = requireUser();
    if (!data.name || data.name.trim().length < 3) fail("Please enter your full name.");
    user.name = data.name.trim();
    user.title = (data.title || "").trim();
    user.university = (data.university || "").trim();
    user.bio = (data.bio || "").trim();
    save();
  }

  /* ---------- Users & profiles ---------- */
  function getUsers() { return load().users; }

  function getRating(userId) {
    var list = load().reviews.filter(function (r) { return r.to === Number(userId); });
    if (!list.length) return { average: 0, count: 0 };
    var sum = list.reduce(function (a, r) { return a + r.rating; }, 0);
    return { average: Math.round((sum / list.length) * 10) / 10, count: list.length };
  }

  function getReviews(userId) {
    return load().reviews
      .filter(function (r) { return r.to === Number(userId); })
      .sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  function getStats(userId) {
    userId = Number(userId);
    var d = load();
    var myExchanges = d.exchanges.filter(function (e) { return e.from === userId || e.to === userId; });
    var myProjects = d.projects.filter(function (p) { return isMember(p, userId); });
    return {
      exchangesCompleted: myExchanges.filter(function (e) { return e.status === "completed"; }).length,
      exchangesActive: myExchanges.filter(function (e) { return e.status === "accepted"; }).length,
      pendingIncoming: myExchanges.filter(function (e) { return e.status === "pending" && e.to === userId; }).length,
      projectsJoined: myProjects.length,
      projectsCompleted: myProjects.filter(function (p) { return p.status === "completed"; }).length,
      projectsActive: myProjects.filter(function (p) { return p.status !== "completed"; }).length
    };
  }

  /* ---------- Skill exchanges ---------- */
  function getMyExchanges() {
    var user = requireUser();
    return load().exchanges
      .filter(function (e) { return e.from === user.id || e.to === user.id; })
      .sort(function (a, b) { return b.date.localeCompare(a.date) || b.id - a.id; });
  }

  function sendExchange(toId, offerSkill, wantSkill, message) {
    var d = load();
    var user = requireUser();
    toId = Number(toId);
    if (toId === user.id) fail("You cannot send a request to yourself.");
    if (!findUser(toId)) fail("User not found.");
    if (!offerSkill || !wantSkill) fail("Please choose the skill you offer and the skill you want.");
    var duplicate = d.exchanges.some(function (e) {
      return e.from === user.id && e.to === toId && e.want === Number(wantSkill) && e.status === "pending";
    });
    if (duplicate) fail("You already sent this request. Wait for a reply.");
    var ex = {
      id: nextId(d.exchanges), from: user.id, to: toId,
      offer: Number(offerSkill), want: Number(wantSkill),
      message: (message || "").trim(), status: "pending", date: today()
    };
    d.exchanges.push(ex);
    save();
    return ex;
  }

  function findExchange(id) {
    var ex = load().exchanges.find(function (e) { return e.id === Number(id); });
    if (!ex) fail("Request not found.");
    return ex;
  }

  function respondExchange(id, accept) {
    var user = requireUser();
    var ex = findExchange(id);
    if (ex.to !== user.id || ex.status !== "pending") fail("You cannot respond to this request.");
    ex.status = accept ? "accepted" : "rejected";
    if (accept) {
      addPoints(ex.from, 20, "Exchange accepted with " + user.name);
      addPoints(ex.to, 20, "Exchange accepted with " + findUser(ex.from).name);
    }
    save();
  }

  function cancelExchange(id) {
    var user = requireUser();
    var ex = findExchange(id);
    if (ex.from !== user.id || ex.status !== "pending") fail("You cannot cancel this request.");
    ex.status = "cancelled";
    save();
  }

  function completeExchange(id) {
    var user = requireUser();
    var ex = findExchange(id);
    if ((ex.from !== user.id && ex.to !== user.id) || ex.status !== "accepted") fail("This exchange cannot be completed.");
    ex.status = "completed";
    addPoints(ex.from, 50, "Exchange completed with " + findUser(ex.to).name);
    addPoints(ex.to, 50, "Exchange completed with " + findUser(ex.from).name);
    save();
  }

  function hasReviewed(exchangeId, userId) {
    return load().reviews.some(function (r) { return r.exchange === Number(exchangeId) && r.from === Number(userId); });
  }

  function reviewExchange(id, rating, comment) {
    var d = load();
    var user = requireUser();
    var ex = findExchange(id);
    if (ex.status !== "completed") fail("You can only review completed exchanges.");
    if (ex.from !== user.id && ex.to !== user.id) fail("You are not part of this exchange.");
    if (hasReviewed(ex.id, user.id)) fail("You already reviewed this exchange.");
    rating = Number(rating);
    if (rating < 1 || rating > 5) fail("Please choose a rating from 1 to 5 stars.");
    var otherId = ex.from === user.id ? ex.to : ex.from;
    d.reviews.push({ id: nextId(d.reviews), exchange: ex.id, from: user.id, to: otherId,
      rating: rating, comment: (comment || "").trim(), date: today() });
    addPoints(user.id, 5, "Wrote a review for " + findUser(otherId).name);
    if (rating === 5) addPoints(otherId, 10, "Received a 5-star review");
    save();
  }

  /* ---------- Projects ---------- */
  function isMember(project, userId) {
    return project.members.some(function (m) { return m.user === Number(userId); });
  }

  function projectProgress(project) {
    if (project.status === "completed") return 100;
    if (!project.tasks.length) return 0;
    var done = project.tasks.filter(function (t) { return t.done; }).length;
    return Math.round((done / project.tasks.length) * 100);
  }

  function getProjects() {
    return load().projects.slice().sort(function (a, b) { return b.date.localeCompare(a.date); });
  }

  function findProject(id) {
    var p = load().projects.find(function (x) { return x.id === Number(id); });
    if (!p) fail("Project not found.");
    return p;
  }

  function createProject(data) {
    var d = load();
    var user = requireUser();
    var title = (data.title || "").trim();
    if (title.length < 4) fail("Please enter a project title (at least 4 characters).");
    if ((data.description || "").trim().length < 10) fail("Please write a short description (at least 10 characters).");
    var skills = (data.skills || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    var project = {
      id: nextId(d.projects), owner: user.id, title: title,
      description: data.description.trim(), skills: skills,
      max: Math.max(2, Math.min(10, Number(data.max) || 4)),
      status: "open", date: today(),
      members: [{ user: user.id, role: "Project Lead" }], tasks: []
    };
    d.projects.push(project);
    addPoints(user.id, 10, "Created a project: " + title);
    save();
    return project;
  }

  function joinProject(id, role) {
    var user = requireUser();
    var p = findProject(id);
    if (isMember(p, user.id)) fail("You are already a member of this project.");
    if (p.status === "completed") fail("This project is already completed.");
    if (p.members.length >= p.max) fail("Sorry, this project team is full.");
    p.members.push({ user: user.id, role: (role || "").trim() || "Team Member" });
    if (p.members.length >= p.max) p.status = "in_progress";
    addPoints(user.id, 15, "Joined project: " + p.title);
    save();
  }

  function leaveProject(id) {
    var user = requireUser();
    var p = findProject(id);
    if (p.owner === user.id) fail("The project lead cannot leave the project.");
    p.members = p.members.filter(function (m) { return m.user !== user.id; });
    if (p.status === "in_progress" && p.members.length < p.max) p.status = "open";
    save();
  }

  function addTask(projectId, title) {
    var user = requireUser();
    var p = findProject(projectId);
    if (!isMember(p, user.id)) fail("Only team members can add tasks.");
    title = (title || "").trim();
    if (!title) fail("Please write the task title.");
    var allTasks = [];
    load().projects.forEach(function (x) { allTasks = allTasks.concat(x.tasks); });
    p.tasks.push({ id: nextId(allTasks), title: title, done: false });
    save();
  }

  function toggleTask(projectId, taskId) {
    var user = requireUser();
    var p = findProject(projectId);
    if (!isMember(p, user.id)) fail("Only team members can update tasks.");
    if (p.status === "completed") fail("This project is already completed.");
    var t = p.tasks.find(function (x) { return x.id === Number(taskId); });
    if (t) t.done = !t.done;
    save();
  }

  function completeProject(id) {
    var user = requireUser();
    var p = findProject(id);
    if (p.owner !== user.id) fail("Only the project lead can mark the project as completed.");
    if (p.status === "completed") fail("This project is already completed.");
    p.status = "completed";
    p.tasks.forEach(function (t) { t.done = true; });
    p.members.forEach(function (m) { addPoints(m.user, 100, "Project completed: " + p.title); });
    save();
  }

  /* ---------- Points & rewards ---------- */
  var LEVELS = [
    { name: "Beginner", min: 0,    icon: "🌱" },
    { name: "Explorer", min: 200,  icon: "🧭" },
    { name: "Expert",   min: 500,  icon: "🚀" },
    { name: "Master",   min: 1000, icon: "👑" }
  ];

  function getLevel(points) {
    var current = LEVELS[0], next = null;
    for (var i = 0; i < LEVELS.length; i++) {
      if (points >= LEVELS[i].min) { current = LEVELS[i]; next = LEVELS[i + 1] || null; }
    }
    var percent = next ? Math.round(((points - current.min) / (next.min - current.min)) * 100) : 100;
    return { name: current.name, icon: current.icon, next: next, percent: percent };
  }

  function getRewards() { return load().rewards; }

  function getTransactions(userId) {
    return load().transactions
      .filter(function (t) { return t.user === Number(userId); })
      .reverse();
  }

  function getRedemptions(userId) {
    return load().redemptions.filter(function (r) { return r.user === Number(userId); }).reverse();
  }

  function redeemReward(rewardId) {
    var d = load();
    var user = requireUser();
    var reward = d.rewards.find(function (r) { return r.id === Number(rewardId); });
    if (!reward) fail("Reward not found.");
    if (user.points < reward.cost) fail("You need " + (reward.cost - user.points) + " more points for this reward.");
    addPoints(user.id, -reward.cost, "Redeemed reward: " + reward.title);
    d.redemptions.push({ user: user.id, reward: reward.id, title: reward.title, icon: reward.icon, date: today() });
    save();
  }

  function getLeaderboard() {
    return load().users.slice().sort(function (a, b) { return b.points - a.points; }).slice(0, 10);
  }

  // Badges are calculated from the user's activity
  function getBadges(userId) {
    var user = findUser(userId);
    var stats = getStats(userId);
    var rating = getRating(userId);
    var hasPremium = getRedemptions(userId).some(function (r) { return r.reward === 1; });
    return [
      { icon: "🤝", name: "First Swap",   desc: "Complete your first skill exchange", earned: stats.exchangesCompleted >= 1 },
      { icon: "👥", name: "Team Player",  desc: "Join 2 collaborative projects",       earned: stats.projectsJoined >= 2 },
      { icon: "🏆", name: "Project Hero", desc: "Complete a project with a team",     earned: stats.projectsCompleted >= 1 },
      { icon: "⭐", name: "Top Rated",    desc: "Average rating of 4.5+ (2+ reviews)", earned: rating.count >= 2 && rating.average >= 4.5 },
      { icon: "📚", name: "Mentor",       desc: "Teach 3 or more skills",              earned: user.teach.length >= 3 },
      { icon: "🔥", name: "Rising Star",  desc: "Reach 300 Skill Points",              earned: user.points >= 300 },
      { icon: "🏅", name: "Premium",      desc: "Redeem the Premium Profile Badge",    earned: hasPremium }
    ];
  }

  function cvBonus() {
    var user = requireUser();
    var already = load().transactions.some(function (t) { return t.user === user.id && t.reason === "First AI CV Analysis"; });
    if (already) return false;
    addPoints(user.id, 10, "First AI CV Analysis");
    save();
    return true;
  }

  /* ---------- Public functions ---------- */
  return {
    resetAll: resetAll, canSave: canSave,
    // session
    register: register, login: login, logout: logout, lastEmail: lastEmail, currentUser: currentUser,
    // skills
    getSkills: getSkills, findSkill: findSkill, skillName: skillName, findOrCreateSkill: findOrCreateSkill,
    addSkill: addSkill, removeSkill: removeSkill, updateProgress: updateProgress,
    // users
    getUsers: getUsers, findUser: findUser, updateProfile: updateProfile,
    getRating: getRating, getReviews: getReviews, getStats: getStats, getBadges: getBadges,
    // exchanges
    getMyExchanges: getMyExchanges, sendExchange: sendExchange, respondExchange: respondExchange,
    cancelExchange: cancelExchange, completeExchange: completeExchange,
    reviewExchange: reviewExchange, hasReviewed: hasReviewed,
    // projects
    getProjects: getProjects, findProject: findProject, isMember: isMember, projectProgress: projectProgress,
    createProject: createProject, joinProject: joinProject, leaveProject: leaveProject,
    addTask: addTask, toggleTask: toggleTask, completeProject: completeProject,
    // points & rewards
    LEVELS: LEVELS, getLevel: getLevel, getRewards: getRewards, getTransactions: getTransactions,
    getRedemptions: getRedemptions, redeemReward: redeemReward, getLeaderboard: getLeaderboard,
    cvBonus: cvBonus
  };
})();
