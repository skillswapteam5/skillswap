/* AI Skill Matching page: choose skills to learn -> get recommended people */

var selectedSkills = [];
var lastResults = null;
var initialized = false;

App.start("matching", function () {
  var me = App.user;

  // First visit: pre-select skills from the URL (?skills=1,2) or from the user's learning list
  if (!initialized) {
    initialized = true;
    var fromUrl = getParam("skills");
    selectedSkills = fromUrl ? fromUrl.split(",").map(Number).filter(Boolean)
                             : me.learn.map(function (l) { return l.skill; });
  }

  var chips = Store.getSkills().map(function (s) {
    var on = selectedSkills.indexOf(s.id) !== -1;
    return '<button class="pick-chip' + (on ? " on" : "") + '" data-skill="' + s.id + '">' + esc(s.name) + '</button>';
  }).join("");

  document.getElementById("content").innerHTML =
    '<div class="welcome mb">' +
      '<div><h2>✨ AI Skill Matching</h2>' +
      '<p>Pick the skills you want to learn. Our AI ranks people by skill level, ratings and how well you can swap with each other.</p></div>' +
    '</div>' +
    '<div class="card mb">' +
      '<div class="card-head"><h3>What do you want to learn?</h3><span class="small muted" id="selCount">' + selectedSkills.length + ' selected</span></div>' +
      '<div class="skill-picker" id="picker">' + chips + '</div>' +
      '<div class="row mt wrap"><button class="btn btn-primary btn-lg" id="findBtn">✨ Find my best matches</button>' +
      '<button class="btn btn-light" id="clearBtn">Clear</button></div>' +
    '</div>' +
    '<div id="results"></div>';

  document.getElementById("picker").onclick = function (e) {
    var chip = e.target.closest(".pick-chip");
    if (!chip) return;
    var id = Number(chip.dataset.skill);
    var i = selectedSkills.indexOf(id);
    if (i === -1) selectedSkills.push(id); else selectedSkills.splice(i, 1);
    chip.classList.toggle("on");
    document.getElementById("selCount").textContent = selectedSkills.length + " selected";
  };
  document.getElementById("clearBtn").onclick = function () {
    selectedSkills = [];
    lastResults = null;
    App.refresh();
  };
  document.getElementById("findBtn").onclick = runMatching;

  if (lastResults) showResults(lastResults, false);
});

function runMatching() {
  var box = document.getElementById("results");
  if (!selectedSkills.length) {
    App.toast("Please choose at least one skill.", "error");
    return;
  }
  // Fake "AI thinking" animation, then show results
  var steps = ["Analysing your skill profile...", "Scanning community members...", "Calculating compatibility scores...", "Ranking the best matches..."];
  box.innerHTML = '<div class="card ai-loading"><div class="spinner"></div><h3>AI is finding your matches</h3><p class="ai-step" id="aiStep">' + steps[0] + '</p></div>';
  box.scrollIntoView({ behavior: "smooth", block: "start" });
  var i = 0;
  var timer = setInterval(function () {
    i++;
    var el = document.getElementById("aiStep");
    if (i < steps.length && el) { el.textContent = steps[i]; return; }
    clearInterval(timer);
    lastResults = Matcher.findMatches(App.user, selectedSkills);
    showResults(lastResults, true);
  }, 450);
}

function showResults(results, scroll) {
  var box = document.getElementById("results");
  if (!results.length) {
    box.innerHTML = '<div class="card">' + emptyState("🤔", "No one teaches these skills yet. Try other skills, or check back later!") + '</div>';
    return;
  }
  box.innerHTML =
    '<div class="row-between mb"><h3>' + results.length + ' match' + (results.length === 1 ? "" : "es") + ' found</h3>' +
    '<span class="small muted">Sorted by AI match score</span></div>' +
    results.map(function (m, index) {
      return '<div class="card match-card">' +
        '<div class="score-ring" style="--p:' + m.score + '"><span>' + m.score + '%</span></div>' +
        '<div class="grow">' +
          '<div class="row wrap">' + avatar(m.user, "sm") + '<b>' + esc(m.user.name) + '</b>' +
          (index === 0 ? '<span class="tag green">🏆 Best match</span>' : "") +
          (m.reciprocal.length ? '<span class="tag blue">⇄ Perfect swap</span>' : "") + '</div>' +
          '<div class="small muted mt">' + esc(m.user.title) + ' · ' + ratingText(m.user.id) + '</div>' +
          '<ul class="reasons">' + m.reasons.map(function (r) { return '<li>' + esc(r) + '</li>'; }).join("") + '</ul>' +
        '</div>' +
        '<div class="match-actions">' +
          '<button class="btn btn-primary btn-sm" data-swap="' + m.user.id + '" data-skill="' + m.matched[0].skill + '">Request swap</button>' +
          '<a class="btn btn-light btn-sm" href="passport.html?id=' + m.user.id + '">View passport</a>' +
        '</div></div>';
    }).join("");
  if (scroll) box.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.getElementById("content").addEventListener("click", function (e) {
  var b = e.target.closest("[data-swap]");
  if (b) openSwapModal(b.dataset.swap, b.dataset.skill);
});
