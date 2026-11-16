/* Explore page: search skills and the people who teach them */

var CATEGORY_EMOJI = {
  "Web Development": "🌐", "Programming": "💻", "Data & AI": "🤖", "Design": "🎨", "Media": "🎬",
  "Business": "📈", "Soft Skills": "🗣️", "Languages": "🌍", "Arts & Music": "🎸", "Other": "⭐"
};

var view = "skills";          // "skills" or "people"
var category = "All";
var searchText = "";
var focusSkill = null;        // when a skill card is clicked, show its teachers

App.start("explore", function () {
  var categories = ["All"];
  Store.getSkills().forEach(function (s) { if (categories.indexOf(s.category) === -1) categories.push(s.category); });

  document.getElementById("content").innerHTML =
    '<div class="toolbar">' +
      '<div class="search-box">' + icon("search") + '<input id="search" placeholder="Search skills or people... (e.g. Python, design, Sara)" value="' + esc(searchText) + '"></div>' +
      '<div class="tabs"><button class="tab' + (view === "skills" ? " active" : "") + '" data-view="skills">Skills</button>' +
      '<button class="tab' + (view === "people" ? " active" : "") + '" data-view="people">People</button></div>' +
    '</div>' +
    '<div class="chips mb" id="cats">' + categories.map(function (c) {
      return '<button class="chip' + (c === category ? " active" : "") + '" data-cat="' + esc(c) + '">' + (CATEGORY_EMOJI[c] || "") + ' ' + esc(c) + '</button>';
    }).join("") + '</div>' +
    '<div id="list"></div>';

  var input = document.getElementById("search");
  input.oninput = function () { searchText = input.value; focusSkill = null; renderList(); };
  renderList();
});

function renderList() {
  var q = searchText.trim().toLowerCase();
  var users = Store.getUsers().filter(function (u) { return u.id !== App.user.id; });
  var box = document.getElementById("list");

  if (focusSkill) { box.innerHTML = renderTeachersOf(focusSkill, users); return; }

  if (view === "skills") {
    var skills = Store.getSkills().filter(function (s) {
      return (category === "All" || s.category === category) && (!q || s.name.toLowerCase().indexOf(q) !== -1);
    });
    if (!skills.length) { box.innerHTML = '<div class="card">' + emptyState("🔍", "No skills found. Try another search.") + '</div>'; return; }
    box.innerHTML = '<div class="grid grid-auto">' + skills.map(function (s) {
      var teachers = users.filter(function (u) { return u.teach.some(function (t) { return t.skill === s.id; }); }).length;
      var learners = users.filter(function (u) { return u.learn.some(function (l) { return l.skill === s.id; }); }).length;
      return '<div class="card skill-card" data-skill="' + s.id + '">' +
        '<div class="skill-emoji">' + (CATEGORY_EMOJI[s.category] || "⭐") + '</div>' +
        '<h4>' + esc(s.name) + '</h4><span class="small muted">' + esc(s.category) + '</span>' +
        '<div class="row small"><span class="tag">' + teachers + ' teacher' + (teachers === 1 ? "" : "s") + '</span>' +
        '<span class="tag blue">' + learners + ' learner' + (learners === 1 ? "" : "s") + '</span></div></div>';
    }).join("") + '</div>';
  } else {
    var people = users.filter(function (u) {
      var skillNames = u.teach.concat(u.learn).map(function (x) { return Store.skillName(x.skill).toLowerCase(); }).join(" ");
      var inCategory = category === "All" || u.teach.some(function (t) { var s = Store.findSkill(t.skill); return s && s.category === category; });
      var matchesText = !q || u.name.toLowerCase().indexOf(q) !== -1 || u.title.toLowerCase().indexOf(q) !== -1 || skillNames.indexOf(q) !== -1;
      return inCategory && matchesText;
    });
    box.innerHTML = people.length ? '<div class="grid grid-auto">' + people.map(personCard).join("") + '</div>'
                                  : '<div class="card">' + emptyState("🔍", "No people found. Try another search.") + '</div>';
  }
}

function renderTeachersOf(skillId, users) {
  var skill = Store.findSkill(skillId);
  var teachers = users.filter(function (u) { return u.teach.some(function (t) { return t.skill === skill.id; }); });
  return '<div class="row-between mb"><div><button class="btn btn-light btn-sm" id="backBtn">← All skills</button></div>' +
    '<a href="matching.html?skills=' + skill.id + '" class="btn btn-soft btn-sm">✨ AI match for ' + esc(skill.name) + '</a></div>' +
    '<h3 class="mb">People who teach ' + esc(skill.name) + '</h3>' +
    (teachers.length ? '<div class="grid grid-auto">' + teachers.map(function (u) { return personCard(u, skill.id); }).join("") + '</div>'
                     : '<div class="card">' + emptyState("🌱", "Nobody teaches " + esc(skill.name) + " yet. Be the first!") + '</div>');
}

function personCard(u, skillId) {
  return '<div class="card person-card">' +
    '<div class="person-top">' + avatar(u) + '<div><h4>' + esc(u.name) + '</h4><div class="small muted">' + esc(u.title) + '</div></div></div>' +
    '<div class="small">' + ratingText(u.id) + '</div>' +
    '<div><div class="label-sm">Teaches</div><div class="tags">' + u.teach.map(function (t) {
      return skillTag(t.skill, t.skill === skillId ? "" : "blue");
    }).join("") + '</div></div>' +
    '<div><div class="label-sm">Wants to learn</div><div class="tags">' + u.learn.map(function (l) { return skillTag(l.skill, "gray"); }).join("") + '</div></div>' +
    '<div class="actions"><a class="btn btn-light btn-sm" href="passport.html?id=' + u.id + '">Passport</a>' +
    '<button class="btn btn-primary btn-sm" data-swap="' + u.id + '" data-skill="' + (skillId || "") + '">Request swap</button></div>' +
  '</div>';
}

document.getElementById("content").addEventListener("click", function (e) {
  var t = e.target;
  var tab = t.closest("[data-view]");
  if (tab) { view = tab.dataset.view; focusSkill = null; App.refresh(); return; }
  var cat = t.closest("[data-cat]");
  if (cat) { category = cat.dataset.cat; focusSkill = null; App.refresh(); return; }
  var card = t.closest(".skill-card");
  if (card) { focusSkill = Number(card.dataset.skill); renderList(); window.scrollTo(0, 0); return; }
  if (t.closest("#backBtn")) { focusSkill = null; renderList(); return; }
  var swap = t.closest("[data-swap]");
  if (swap) openSwapModal(swap.dataset.swap, swap.dataset.skill);
});
