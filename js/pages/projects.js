/* Collaborative Projects page: browse, create, join projects and manage tasks */

var filter = "all";
var openProjectId = getParam("open") ? Number(getParam("open")) : null;

App.start("projects", function () {
  var me = App.user;
  var projects = Store.getProjects();
  var filters = { all: "All projects", open: "Open", in_progress: "In progress", completed: "Completed", mine: "My projects" };

  var list = projects.filter(function (p) {
    if (filter === "all") return true;
    if (filter === "mine") return Store.isMember(p, me.id);
    return p.status === filter;
  });

  document.getElementById("content").innerHTML =
    '<div class="row-between mb wrap">' +
      '<div class="chips">' + Object.keys(filters).map(function (k) {
        return '<button class="chip' + (k === filter ? " active" : "") + '" data-filter="' + k + '">' + filters[k] + '</button>';
      }).join("") + '</div>' +
      '<button class="btn btn-primary" id="newProjectBtn">+ Create project</button>' +
    '</div>' +
    (list.length ? '<div class="grid grid-auto">' + list.map(function (p) { return projectCard(p, me); }).join("") + '</div>'
                 : '<div class="card">' + emptyState("📁", "No projects here yet.", '<button class="btn btn-soft btn-sm" id="newProjectBtn2">Create the first one</button>') + '</div>');

  // Keep the details popup open after an action (join, add task...)
  if (openProjectId) openProjectModal(openProjectId);
});

function projectCard(p, me) {
  var progress = Store.projectProgress(p);
  var owner = Store.findUser(p.owner);
  var member = Store.isMember(p, me.id);
  var full = p.members.length >= p.max;
  return '<div class="card project-card" data-open="' + p.id + '">' +
    '<div class="row-between">' + statusBadge(p.status) + (member ? '<span class="tag green">✓ Member</span>' : full && p.status !== "completed" ? '<span class="tag gray">Team full</span>' : "") + '</div>' +
    '<h4>' + esc(p.title) + '</h4>' +
    '<p class="small muted">' + esc(p.description) + '</p>' +
    '<div class="tags">' + p.skills.map(function (s) { return '<span class="tag blue">' + esc(s) + '</span>'; }).join("") + '</div>' +
    '<div><div class="row-between small muted mb" style="margin-bottom:6px"><span>Progress</span><span>' + progress + '%</span></div>' + progressBar(progress) + '</div>' +
    '<div class="row-between"><div class="member-stack">' + p.members.map(function (m) { return avatar(Store.findUser(m.user), "sm"); }).join("") + '</div>' +
    '<span class="small muted">' + p.members.length + '/' + p.max + ' members · by ' + esc(owner.name.split(" ")[0]) + '</span></div>' +
  '</div>';
}

function openProjectModal(id) {
  var me = App.user;
  var p;
  try { p = Store.findProject(id); } catch (e) { openProjectId = null; return; }
  openProjectId = p.id;
  var member = Store.isMember(p, me.id);
  var isOwner = p.owner === me.id;
  var full = p.members.length >= p.max;
  var progress = Store.projectProgress(p);

  var actionBtn = "";
  if (p.status === "completed") actionBtn = '<span class="tag green">🏆 Project completed</span>';
  else if (isOwner) actionBtn = '<button class="btn btn-success" data-complete="' + p.id + '">Mark project as completed</button>';
  else if (member) actionBtn = '<button class="btn btn-danger" data-leave="' + p.id + '">Leave project</button>';
  else if (full) actionBtn = '<span class="tag gray">Team is full</span>';
  else actionBtn = '<button class="btn btn-primary" data-join="' + p.id + '">Join this project (+15 pts)</button>';

  var m = App.openModal(esc(p.title),
    '<div class="row wrap mb">' + statusBadge(p.status) + '<span class="small muted">Created ' + formatDate(p.date) + '</span></div>' +
    '<p>' + esc(p.description) + '</p>' +
    '<div class="mt"><div class="label-sm">Skills needed</div><div class="tags">' + p.skills.map(function (s) { return '<span class="tag blue">' + esc(s) + '</span>'; }).join("") + '</div></div>' +
    '<div class="mt"><div class="row-between small mb" style="margin-bottom:6px"><b>Progress</b><span>' + progress + '%</span></div>' + progressBar(progress) + '</div>' +
    '<div class="grid grid-2 mt">' +
      '<div><div class="label-sm">Team (' + p.members.length + '/' + p.max + ')</div><div class="list">' +
        p.members.map(function (mem) {
          var u = Store.findUser(mem.user);
          return '<a href="passport.html?id=' + u.id + '" class="list-item" style="color:inherit">' + avatar(u, "sm") +
                 '<div class="grow"><b class="small">' + esc(u.name) + '</b><div class="small muted">' + esc(mem.role) + '</div></div></a>';
        }).join("") + '</div></div>' +
      '<div><div class="label-sm">Tasks</div><div id="taskList">' +
        (p.tasks.length ? p.tasks.map(function (t) {
          return '<label class="task' + (t.done ? " done" : "") + '"><input type="checkbox" data-task="' + t.id + '"' + (t.done ? " checked" : "") +
                 (member && p.status !== "completed" ? "" : " disabled") + '><span class="small">' + esc(t.title) + '</span></label>';
        }).join("") : '<p class="small muted">No tasks yet.</p>') + '</div>' +
        (member && p.status !== "completed" ? '<form class="row mt" id="taskForm"><input name="task" placeholder="New task..." style="padding:8px 12px"><button class="btn btn-soft btn-sm">Add</button></form>' : "") +
      '</div>' +
    '</div>' +
    (!member && !full && p.status !== "completed" ? '<label class="form mt"><span class="label-sm">Your role in the team</span><input id="roleInput" placeholder="e.g. Designer, Developer, Writer"></label>' : "") +
    '<div class="modal-actions">' + actionBtn + '</div>', true);

  // When the popup is closed, forget which project was open
  m.addEventListener("click", function (e) {
    if (e.target === m || e.target.closest("[data-close]")) openProjectId = null;
  });

  m.querySelector(".modal-body").addEventListener("change", function (e) {
    if (e.target.dataset.task) App.run(function () { Store.toggleTask(p.id, e.target.dataset.task); });
  });
  var taskForm = m.querySelector("#taskForm");
  if (taskForm) taskForm.onsubmit = function (e) {
    e.preventDefault();
    var title = taskForm.task.value;
    App.run(function () { Store.addTask(p.id, title); }, "Task added.");
  };
  m.querySelector(".modal-actions").onclick = function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    if (b.dataset.join) {
      var role = (m.querySelector("#roleInput") || {}).value;
      App.run(function () { Store.joinProject(p.id, role); }, "Welcome to the team! +15 points");
    }
    if (b.dataset.leave) {
      App.confirm("Leave this project?", "You can join again later if there is space.", function () {
        App.run(function () { Store.leaveProject(p.id); }, "You left the project.");
      });
    }
    if (b.dataset.complete) {
      App.confirm("Complete this project?", "All tasks will be marked as done and every team member gets +100 points.", function () {
        openProjectId = p.id;
        App.run(function () { Store.completeProject(p.id); }, "🏆 Project completed! +100 points for the whole team");
      });
    }
  };
}

function openCreateModal() {
  openProjectId = null;
  var m = App.openModal("Create a new project",
    '<form class="form" id="createForm">' +
      '<label>Project title<input name="title" placeholder="e.g. Campus Events App"></label>' +
      '<label>Description<textarea name="description" rows="3" placeholder="What will the team build? What is the goal?"></textarea></label>' +
      '<label>Skills needed <span class="small muted">(separate with commas)</span><input name="skills" placeholder="e.g. JavaScript, UI/UX Design, Marketing"></label>' +
      '<label>Team size<select name="max"><option>2</option><option>3</option><option selected>4</option><option>5</option><option>6</option><option>8</option><option>10</option></select></label>' +
      '<div class="modal-actions"><button type="button" class="btn btn-light" data-close>Cancel</button>' +
      '<button type="submit" class="btn btn-primary">Create project</button></div>' +
    '</form>');
  m.querySelector("#createForm").onsubmit = function (e) {
    e.preventDefault();
    var f = e.target;
    var created = null;
    var ok = App.run(function () {
      created = Store.createProject({ title: f.title.value, description: f.description.value, skills: f.skills.value, max: f.max.value });
    }, "Project created! +10 points");
    if (ok) { filter = "mine"; openProjectId = created.id; App.refresh(); }
  };
}

document.getElementById("content").addEventListener("click", function (e) {
  var t = e.target;
  var f = t.closest("[data-filter]");
  if (f) { filter = f.dataset.filter; App.refresh(); return; }
  if (t.closest("#newProjectBtn") || t.closest("#newProjectBtn2")) { openCreateModal(); return; }
  var card = t.closest("[data-open]");
  if (card) openProjectModal(card.dataset.open);
});
