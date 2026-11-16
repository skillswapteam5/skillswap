/* Skill Passport page: a portfolio of skills, projects, badges and reviews.
   passport.html          -> my passport (editable)
   passport.html?id=3     -> another user's passport */

App.start("passport", function () {
  var me = App.user;
  var user = Store.findUser(getParam("id") || me.id) || me;
  var isMe = user.id === me.id;
  var level = Store.getLevel(user.points);
  var rating = Store.getRating(user.id);
  var stats = Store.getStats(user.id);
  var reviews = Store.getReviews(user.id);
  var badges = Store.getBadges(user.id);
  var projects = Store.getProjects().filter(function (p) { return Store.isMember(p, user.id); });
  var completed = projects.filter(function (p) { return p.status === "completed"; });
  var current = projects.filter(function (p) { return p.status !== "completed"; });

  var html =
    '<div class="card passport-hero mb">' +
      '<div class="passport-cover"></div>' +
      '<div class="passport-info">' +
        avatar(user, "lg") +
        '<div class="grow"><h2>' + esc(user.name) + ' <span class="tag">' + level.icon + ' ' + level.name + '</span></h2>' +
        '<div class="muted">' + esc(user.title) + (user.university ? ' · ' + esc(user.university) : "") + '</div>' +
        '<div class="small mt">' + ratingText(user.id) + '</div></div>' +
        '<div class="row wrap no-print">' +
          (isMe ? '<button class="btn btn-light" id="editBtn">✏️ Edit profile</button>'
                : '<button class="btn btn-primary" data-swap="' + user.id + '">Request swap</button>') +
          '<button class="btn btn-light" id="shareBtn">🔗 Share</button>' +
          '<button class="btn btn-light" id="printBtn">⬇ Save PDF</button>' +
        '</div>' +
      '</div>' +
      (user.bio ? '<p style="padding:0 24px 18px">' + esc(user.bio) + '</p>' : "") +
      '<div class="passport-stats">' +
        '<div><b>⚡ ' + user.points + '</b><span class="small muted">Skill Points</span></div>' +
        '<div><b>' + user.teach.length + '</b><span class="small muted">Skills taught</span></div>' +
        '<div><b>' + stats.exchangesCompleted + '</b><span class="small muted">Swaps completed</span></div>' +
        '<div><b>' + completed.length + '</b><span class="small muted">Projects completed</span></div>' +
        '<div><b>' + (rating.count ? rating.average + "★" : "-") + '</b><span class="small muted">' + rating.count + ' reviews</span></div>' +
        '<div><b>' + formatDate(user.joined) + '</b><span class="small muted">Member since</span></div>' +
      '</div>' +
    '</div>';

  html += '<div class="grid grid-2 mb">';

  // Teaching skills
  html += '<div class="card"><div class="card-head"><h3>🎓 Verified teaching skills</h3>' +
    (isMe ? '<button class="btn btn-soft btn-sm no-print" data-add="teach">+ Add</button>' : "") + '</div>' +
    (user.teach.length ? user.teach.map(function (t) {
      return '<div class="skill-row"><b>' + esc(Store.skillName(t.skill)) + '</b>' +
        '<span class="row"><span class="lvl ' + levelClass(t.level) + '">' + t.level + '</span>' +
        (isMe ? '<button class="remove-x no-print" title="Remove" data-remove-teach="' + t.skill + '">×</button>' : "") + '</span></div>';
    }).join("") : emptyState("🎓", "No teaching skills yet.")) + '</div>';

  // Learning skills
  html += '<div class="card"><div class="card-head"><h3>📚 Currently learning</h3>' +
    (isMe ? '<button class="btn btn-soft btn-sm no-print" data-add="learn">+ Add</button>' : "") + '</div>' +
    (user.learn.length ? user.learn.map(function (l) {
      return '<div class="skill-progress"><div class="row-between"><span>' + esc(Store.skillName(l.skill)) + '</span>' +
        '<span class="row"><span class="small muted">' + l.progress + '%</span>' +
        (isMe ? '<button class="remove-x no-print" title="Remove" data-remove-learn="' + l.skill + '">×</button>' : "") + '</span></div>' +
        progressBar(l.progress) + '</div>';
    }).join("") : emptyState("📚", "No learning goals yet.")) + '</div>';

  html += '</div>';

  // Badges
  html += '<div class="card mb"><div class="card-head"><h3>🏅 Badges</h3><span class="small muted">' +
    badges.filter(function (b) { return b.earned; }).length + ' / ' + badges.length + ' earned</span></div>' +
    '<div class="badges">' + badges.map(function (b) {
      return '<div class="badge' + (b.earned ? "" : " locked") + '" title="' + esc(b.desc) + '"><div class="b-icon">' + b.icon + '</div><b>' + b.name + '</b><small>' + b.desc + '</small></div>';
    }).join("") + '</div></div>';

  html += '<div class="grid grid-2">';

  // Projects
  html += '<div class="card"><div class="card-head"><h3>🏆 Projects</h3></div>' +
    (projects.length ? '<div class="list">' + completed.concat(current).map(function (p) {
      var role = p.members.find(function (m) { return m.user === user.id; }).role;
      return '<a class="list-item" style="color:inherit" href="projects.html?open=' + p.id + '">' +
        '<div class="stat-icon ' + (p.status === "completed" ? "green" : "blue") + '" style="width:40px;height:40px;font-size:18px">' + (p.status === "completed" ? "✅" : "⏳") + '</div>' +
        '<div class="grow"><b>' + esc(p.title) + '</b><div class="small muted">' + esc(role) + ' · ' + p.skills.map(esc).join(", ") + '</div></div>' +
        statusBadge(p.status) + '</a>';
    }).join("") + '</div>' : emptyState("📁", "No projects yet.")) + '</div>';

  // Reviews
  html += '<div class="card"><div class="card-head"><h3>⭐ Reviews</h3><span class="small muted">' + rating.count + ' total</span></div>' +
    (reviews.length ? reviews.map(function (r) {
      var from = Store.findUser(r.from);
      return '<div class="review"><div class="row">' + avatar(from, "sm") +
        '<div class="grow"><b class="small">' + esc(from.name) + '</b><div>' + stars(r.rating) + '</div></div>' +
        '<span class="small muted">' + formatDate(r.date) + '</span></div>' +
        (r.comment ? '<p class="small mt">' + esc(r.comment) + '</p>' : "") + '</div>';
    }).join("") : emptyState("⭐", "No reviews yet.")) + '</div>';

  html += '</div>';

  document.getElementById("content").innerHTML = html;
  if (!isMe) document.querySelector(".page-title").textContent = user.name.split(" ")[0] + "'s Skill Passport";

  // Buttons
  var editBtn = document.getElementById("editBtn");
  if (editBtn) editBtn.onclick = openEditModal;
  var printBtn = document.getElementById("printBtn");
  printBtn.onclick = function () { window.print(); };
  // Printing is blocked when the site is shown inside another website (online preview)
  if (window.self !== window.top) printBtn.classList.add("hidden");
  document.getElementById("shareBtn").onclick = function () {
    var link = window.location.href.split("?")[0] + "?id=" + user.id;
    try {
      navigator.clipboard.writeText(link).then(function () { App.toast("Passport link copied!"); },
        function () { App.toast("Link: " + link); });
    } catch (e) { App.toast("Link: " + link); }
  };
});

function openEditModal() {
  var u = App.user;
  var m = App.openModal("Edit profile",
    '<form class="form" id="editForm">' +
      '<label>Full name<input name="name" value="' + esc(u.name) + '"></label>' +
      '<label>Title / Major<input name="title" value="' + esc(u.title) + '"></label>' +
      '<label>University or company<input name="university" value="' + esc(u.university) + '"></label>' +
      '<label>Bio<textarea name="bio" rows="3">' + esc(u.bio) + '</textarea></label>' +
      '<div class="modal-actions"><button type="button" class="btn btn-light" data-close>Cancel</button>' +
      '<button type="submit" class="btn btn-primary">Save changes</button></div>' +
    '</form>');
  m.querySelector("#editForm").onsubmit = function (e) {
    e.preventDefault();
    var f = e.target;
    if (App.run(function () {
      Store.updateProfile({ name: f.name.value, title: f.title.value, university: f.university.value, bio: f.bio.value });
    }, "Profile updated.")) App.closeModal();
  };
}

function openAddSkillModal(type) {
  var u = App.user;
  var have = (type === "teach" ? u.teach : u.learn).map(function (x) { return x.skill; });
  var options = Store.getSkills().filter(function (s) { return have.indexOf(s.id) === -1; }).map(function (s) {
    return '<option value="' + s.id + '">' + esc(s.name) + '</option>';
  }).join("");
  var m = App.openModal(type === "teach" ? "Add a skill you can teach" : "Add a skill to learn",
    '<form class="form" id="skillForm">' +
      '<label>Choose a skill<select name="skill"><option value="">-- Select --</option>' + options + '</select></label>' +
      '<label>Or type a new skill<input name="newSkill" placeholder="e.g. Blender 3D"></label>' +
      (type === "teach" ? '<label>Your level<select name="level"><option>Beginner</option><option selected>Intermediate</option><option>Advanced</option></select></label>' : "") +
      '<div class="modal-actions"><button type="button" class="btn btn-light" data-close>Cancel</button>' +
      '<button type="submit" class="btn btn-primary">Add skill</button></div>' +
    '</form>');
  m.querySelector("#skillForm").onsubmit = function (e) {
    e.preventDefault();
    var f = e.target;
    if (App.run(function () {
      var id = f.skill.value;
      if (f.newSkill.value.trim()) id = Store.findOrCreateSkill(f.newSkill.value).id;
      if (!id) throw new Error("Please choose or type a skill.");
      Store.addSkill(type, id, f.level ? f.level.value : null);
    }, "Skill added.")) App.closeModal();
  };
}

document.getElementById("content").addEventListener("click", function (e) {
  var b = e.target.closest("button");
  if (!b) return;
  var d = b.dataset;
  if (d.add) openAddSkillModal(d.add);
  if (d.removeTeach) App.run(function () { Store.removeSkill("teach", d.removeTeach); }, "Skill removed.");
  if (d.removeLearn) App.run(function () { Store.removeSkill("learn", d.removeLearn); }, "Skill removed.");
  if (d.swap) openSwapModal(d.swap);
});
