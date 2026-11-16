/* AI CV Analysis page: paste or upload a CV, get skills, score, strengths and weaknesses */

var cvText = "";
var cvRole = "Frontend Developer";
var result = null;

App.start("cv", function () {
  var roles = Object.keys(CVAnalyzer.ROLES).map(function (r) {
    return '<option' + (r === cvRole ? " selected" : "") + '>' + r + '</option>';
  }).join("");

  document.getElementById("content").innerHTML =
    '<div class="welcome mb"><div><h2>📄 AI CV Analysis</h2>' +
    '<p>Paste or upload your CV. The AI detects your skills, finds weak points and tells you what to learn next for your target job.</p></div></div>' +
    '<div class="grid grid-3">' +
      '<div class="card">' +
        '<h3 class="mb">1. Your CV</h3>' +
        '<div class="form">' +
          '<label class="upload-box" for="cvFile">📎 <b>Upload a .txt file</b><br><span class="small">or paste your CV text below</span></label>' +
          '<input type="file" id="cvFile" accept=".txt,text/plain" class="hidden">' +
          '<textarea id="cvText" rows="12" placeholder="Paste your CV here...">' + esc(cvText) + '</textarea>' +
          '<button class="btn btn-light btn-sm" id="sampleBtn">Use a sample CV</button>' +
          '<label>Target job<select id="cvRole">' + roles + '</select></label>' +
          '<button class="btn btn-primary btn-lg" id="analyzeBtn">✨ Analyse my CV</button>' +
          '<p class="small muted">Tip: for a PDF or Word CV, open it, copy all the text and paste it here.</p>' +
        '</div>' +
      '</div>' +
      '<div class="span-2" id="cvResult">' + (result ? resultHtml(result) :
        '<div class="card">' + emptyState("🤖", "Your analysis will appear here.<br>Upload or paste your CV, then click <b>Analyse my CV</b>.") + '</div>') + '</div>' +
    '</div>';

  document.getElementById("cvText").oninput = function () { cvText = this.value; };
  document.getElementById("cvRole").onchange = function () { cvRole = this.value; };
  document.getElementById("sampleBtn").onclick = function () {
    cvText = CVAnalyzer.SAMPLE_CV;
    document.getElementById("cvText").value = cvText;
  };
  document.getElementById("cvFile").onchange = function () {
    var file = this.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      cvText = reader.result;
      document.getElementById("cvText").value = cvText;
      App.toast("CV loaded: " + file.name);
    };
    reader.readAsText(file);
  };
  document.getElementById("analyzeBtn").onclick = analyse;
});

function analyse() {
  if (cvText.trim().split(/\s+/).length < 15) {
    App.toast("Please paste your CV first (or use the sample CV).", "error");
    return;
  }
  var box = document.getElementById("cvResult");
  var steps = ["Reading your CV...", "Detecting skills and keywords...", "Checking CV structure...", "Comparing with " + cvRole + " requirements...", "Writing recommendations..."];
  box.innerHTML = '<div class="card ai-loading"><div class="spinner"></div><h3>AI is analysing your CV</h3><p class="ai-step" id="aiStep">' + steps[0] + '</p></div>';
  if (window.innerWidth < 900) box.scrollIntoView({ behavior: "smooth" });
  var i = 0;
  var timer = setInterval(function () {
    i++;
    var el = document.getElementById("aiStep");
    if (i < steps.length && el) { el.textContent = steps[i]; return; }
    clearInterval(timer);
    result = CVAnalyzer.analyze(cvText, cvRole);
    var bonus = Store.cvBonus();
    App.refresh();
    if (bonus) App.toast("First CV analysis done! +10 points");
  }, 500);
}

function resultHtml(r) {
  var verdict = r.score >= 80 ? "Excellent CV 🎉" : r.score >= 60 ? "Good CV, a few improvements needed" : r.score >= 40 ? "Average CV, needs work" : "Needs major improvements";
  var me = App.user;
  var newTeach = r.detected.filter(function (name) {
    var s = Store.getSkills().find(function (x) { return x.name === name; });
    return !s || !me.teach.some(function (t) { return t.skill === s.id; });
  });
  var missingIds = r.missing.map(function (name) {
    var s = Store.getSkills().find(function (x) { return x.name === name; });
    return s ? s.id : null;
  }).filter(Boolean);

  return '<div class="card mb"><div class="row wrap" style="gap:24px">' +
      '<div class="score-ring big" style="--p:' + r.score + '"><span>' + r.score + '<small class="small muted">/ 100</small></span></div>' +
      '<div class="grow"><h3>' + verdict + '</h3>' +
      '<p class="muted small">Target job: <b>' + esc(r.role) + '</b> · ' + r.words + ' words · ' + r.detected.length + ' skills detected</p>' +
      '<div class="mt"><div class="row-between small" style="margin-bottom:6px"><span>Match with ' + esc(r.role) + '</span><b>' + r.haveForRole.length + '/' + (r.haveForRole.length + r.missing.length) + ' key skills</b></div>' +
      progressBar(Math.round(r.haveForRole.length / Math.max(1, r.haveForRole.length + r.missing.length) * 100)) + '</div></div>' +
    '</div></div>' +

    '<div class="grid grid-2 mb">' +
      '<div class="card"><h3 class="mb">🧠 Detected skills</h3>' +
        (r.detected.length ? '<div class="tags">' + r.detected.map(function (s) { return '<span class="tag green">' + esc(s) + '</span>'; }).join("") + '</div>' : '<p class="muted small">No skills detected. Add a clear "Skills" section.</p>') +
        (newTeach.length ? '<button class="btn btn-soft btn-sm mt" id="addTeachBtn">+ Add ' + newTeach.length + ' skill' + (newTeach.length === 1 ? "" : "s") + ' to my profile</button>' : "") +
      '</div>' +
      '<div class="card"><h3 class="mb">🎯 Skills to learn for ' + esc(r.role) + '</h3>' +
        (r.missing.length ? '<div class="tags">' + r.missing.map(function (s) { return '<span class="tag red">' + esc(s) + '</span>'; }).join("") + '</div>' +
          '<div class="row wrap mt"><button class="btn btn-soft btn-sm" id="addLearnBtn">+ Add to learning list</button>' +
          (missingIds.length ? '<a class="btn btn-primary btn-sm" href="matching.html?skills=' + missingIds.join(",") + '">✨ Find mentors</a>' : "") + '</div>'
          : '<p class="small">You have all the key skills for this job! 🎉</p>') +
      '</div>' +
    '</div>' +

    '<div class="grid grid-3">' +
      '<div class="card"><h3 class="mb">📋 CV sections</h3><ul class="check-list">' +
        r.sections.map(function (s) { return '<li class="' + (s.found ? "check-ok" : "check-no") + '">' + s.name + '</li>'; }).join("") + '</ul></div>' +
      '<div class="card"><h3 class="mb">💪 Strengths</h3><ul class="tip-list">' +
        r.strengths.map(function (s) { return '<li class="tip-good">' + esc(s) + '</li>'; }).join("") + '</ul></div>' +
      '<div class="card"><h3 class="mb">⚠️ Weaknesses</h3><ul class="tip-list">' +
        r.weaknesses.map(function (s) { return '<li class="tip-bad">' + esc(s) + '</li>'; }).join("") + '</ul></div>' +
    '</div>';
}

document.getElementById("content").addEventListener("click", function (e) {
  if (e.target.closest("#addTeachBtn")) {
    App.run(function () {
      result.detected.forEach(function (name) {
        var id = Store.findOrCreateSkill(name, "Other").id;
        var already = App.user.teach.some(function (t) { return t.skill === id; });
        if (!already) Store.addSkill("teach", id, "Intermediate");
      });
    }, "Skills added to your Skill Passport.");
  }
  if (e.target.closest("#addLearnBtn")) {
    App.run(function () {
      result.missing.forEach(function (name) { Store.addSkill("learn", Store.findOrCreateSkill(name, "Other").id); });
    }, "Skills added to your learning list.");
  }
});
