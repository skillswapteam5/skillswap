/* Dashboard page: overview of the user's skills, progress, requests and projects */

App.start("dashboard", function () {
  var me = App.user;
  var stats = Store.getStats(me.id);
  var level = Store.getLevel(me.points);
  var exchanges = Store.getMyExchanges();
  var incoming = exchanges.filter(function (e) { return e.to === me.id && e.status === "pending"; });
  var myProjects = Store.getProjects().filter(function (p) { return Store.isMember(p, me.id); });
  var matches = Matcher.recommendedFor(me, 3);
  var isNew = getParam("welcome") === "1";

  var html = "";

  // Welcome banner
  html +=
    '<div class="welcome mb">' +
      '<div><h2>' + (isNew ? "Welcome to SkillSwap, " : "Welcome back, ") + esc(me.name.split(" ")[0]) + '! 👋</h2>' +
      '<p>' + (isNew ? "You earned 50 welcome points. Let's find your first skill swap!"
                     : "You have " + incoming.length + " new request" + (incoming.length === 1 ? "" : "s") + " and " + stats.projectsActive + " active project" + (stats.projectsActive === 1 ? "" : "s") + ".") + '</p></div>' +
      '<a href="matching.html" class="btn btn-light">✨ Find AI matches</a>' +
    '</div>';

  // Stat cards
  html +=
    '<div class="grid grid-4 mb">' +
      statCard("⚡", "", me.points, "Skill Points") +
      statCard(level.icon, "blue", level.name, "Current level") +
      statCard("🤝", "green", stats.exchangesCompleted, "Completed swaps") +
      statCard("📁", "orange", stats.projectsActive, "Active projects") +
    '</div>';

  html += '<div class="grid grid-3 mb">';

  // My skills
  html +=
    '<div class="card">' +
      '<div class="card-head"><h3>🎓 Skills I teach</h3><a href="passport.html" class="small">Manage</a></div>' +
      (me.teach.length ? me.teach.map(function (t) {
        return '<div class="skill-row"><span>' + esc(Store.skillName(t.skill)) + '</span><span class="lvl ' + levelClass(t.level) + '">' + t.level + '</span></div>';
      }).join("") : emptyState("🎓", "No teaching skills yet.", '<a href="passport.html" class="btn btn-soft btn-sm">Add skill</a>')) +
    '</div>';

  // Learning progress
  html +=
    '<div class="card">' +
      '<div class="card-head"><h3>📚 Learning progress</h3><span class="small muted">Use + / - to update</span></div>' +
      (me.learn.length ? me.learn.map(function (l) {
        return '<div class="skill-progress">' +
          '<div class="row-between"><span>' + esc(Store.skillName(l.skill)) + '</span>' +
          '<span class="row"><span class="small muted">' + l.progress + '%</span>' +
          '<span class="step-btns"><button data-progress="' + l.skill + '" data-step="-10" aria-label="Decrease">−</button>' +
          '<button data-progress="' + l.skill + '" data-step="10" aria-label="Increase">+</button></span></span></div>' +
          progressBar(l.progress) + '</div>';
      }).join("") : emptyState("📚", "No learning goals yet.", '<a href="passport.html" class="btn btn-soft btn-sm">Add goal</a>')) +
    '</div>';

  // Level progress
  html +=
    '<div class="card">' +
      '<div class="card-head"><h3>🏆 Level progress</h3><a href="rewards.html" class="small">Rewards</a></div>' +
      '<div class="center"><div style="font-size:44px">' + level.icon + '</div><h3>' + level.name + '</h3>' +
      '<p class="muted small">' + (level.next ? (level.next.min - me.points) + " points to " + level.next.name : "Highest level reached!") + '</p></div>' +
      '<div class="mt">' + progressBar(level.percent) + '</div>' +
      '<div class="row-between small muted mt"><span>' + me.points + ' pts</span><span>' + (level.next ? level.next.min + " pts" : "MAX") + '</span></div>' +
    '</div>';

  html += '</div><div class="grid grid-2 mb">';

  // Incoming requests
  html +=
    '<div class="card">' +
      '<div class="card-head"><h3>📩 New swap requests</h3><a href="exchanges.html" class="small">View all</a></div>' +
      (incoming.length ? '<div class="list">' + incoming.slice(0, 3).map(function (e) {
        var from = Store.findUser(e.from);
        return '<div class="list-item">' + avatar(from) +
          '<div class="grow"><b>' + esc(from.name) + '</b>' +
          '<div class="small muted">Offers <b>' + esc(Store.skillName(e.offer)) + '</b> for <b>' + esc(Store.skillName(e.want)) + '</b></div></div>' +
          '<button class="btn btn-primary btn-sm" data-accept="' + e.id + '">Accept</button>' +
          '<button class="btn btn-light btn-sm" data-decline="' + e.id + '">Decline</button></div>';
      }).join("") + '</div>' : emptyState("📭", "No new requests right now.")) +
    '</div>';

  // AI recommended matches
  html +=
    '<div class="card">' +
      '<div class="card-head"><h3>✨ Recommended for you</h3><a href="matching.html" class="small">More matches</a></div>' +
      (matches.length ? '<div class="list">' + matches.map(function (m) {
        return '<div class="list-item">' + avatar(m.user) +
          '<div class="grow"><b>' + esc(m.user.name) + '</b>' +
          '<div class="small muted">Teaches ' + esc(m.matched.map(function (t) { return Store.skillName(t.skill); }).join(", ")) + '</div></div>' +
          '<span class="tag">' + m.score + '% match</span>' +
          '<button class="btn btn-soft btn-sm" data-swap="' + m.user.id + '" data-skill="' + m.matched[0].skill + '">Swap</button></div>';
      }).join("") + '</div>' : emptyState("🔍", "Add skills you want to learn to get matches.")) +
    '</div>';

  html += '</div>';

  // My projects
  html +=
    '<div class="card">' +
      '<div class="card-head"><h3>📁 My projects</h3><a href="projects.html" class="small">Browse projects</a></div>' +
      (myProjects.length ? '<div class="grid grid-3">' + myProjects.map(function (p) {
        var progress = Store.projectProgress(p);
        return '<a href="projects.html?open=' + p.id + '" class="card project-card" style="box-shadow:none">' +
          '<div class="row-between"><h4 style="color:var(--text)">' + esc(p.title) + '</h4>' + statusBadge(p.status) + '</div>' +
          '<div class="row-between small muted"><span>' + p.members.length + ' members</span><span>' + progress + '%</span></div>' +
          progressBar(progress) + '</a>';
      }).join("") + '</div>' : emptyState("📁", "You haven't joined any projects yet.", '<a href="projects.html" class="btn btn-soft btn-sm">Find a project</a>')) +
    '</div>';

  document.getElementById("content").innerHTML = html;
});

function statCard(emoji, color, value, label) {
  return '<div class="card stat-card"><div class="stat-icon ' + color + '">' + emoji + '</div>' +
         '<div><div class="stat-value">' + esc(value) + '</div><div class="stat-label">' + label + '</div></div></div>';
}

// One click handler for all buttons on the page
document.getElementById("content").addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.progress) {
    var item = App.user.learn.find(function (l) { return l.skill === Number(b.dataset.progress); });
    var newValue = item.progress + Number(b.dataset.step);
    App.run(function () { Store.updateProgress(item.skill, newValue); },
            newValue >= 100 && item.progress < 100 ? "🎉 Learning goal completed! +30 points" : null);
  }
  if (b.dataset.accept) App.run(function () { Store.respondExchange(b.dataset.accept, true); }, "Request accepted! +20 points");
  if (b.dataset.decline) App.run(function () { Store.respondExchange(b.dataset.decline, false); }, "Request declined.");
  if (b.dataset.swap) openSwapModal(b.dataset.swap, b.dataset.skill);
});
