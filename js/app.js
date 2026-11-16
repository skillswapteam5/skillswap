/* =====================================================================
   SkillSwap - Shared code for all app pages
   ---------------------------------------------------------------------
   - Builds the sidebar and top bar
   - Protects pages (redirects to login if not logged in)
   - Helper functions: toast messages, modals, avatars, tags...
   ===================================================================== */

/* ---------- Simple SVG icons (no icon library needed) ---------- */
var ICONS = {
  home:     '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  sparkles: '<path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"/>',
  search:   '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  swap:     '<path d="M7 4L3 8l4 4"/><path d="M3 8h14"/><path d="M17 20l4-4-4-4"/><path d="M21 16H7"/>',
  folder:   '<path d="M3 6a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/>',
  passport: '<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8 17h8"/>',
  gift:     '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8"/><path d="M12 8v12"/><path d="M12 8c-2-4-6-4-6-1s6 1 6 1c0 0 6 2 6-1s-4-3-6 1"/>',
  file:     '<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h6"/>',
  logout:   '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 17l-5-5 5-5"/><path d="M5 12h11"/>',
  menu:     '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close:    '<path d="M6 6l12 12M18 6L6 18"/>',
  refresh:  '<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'
};

function icon(name) {
  return '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
         'stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || "") + '</svg>';
}

/* ---------- Menu items of the sidebar ---------- */
var MENU = [
  { page: "dashboard", label: "Dashboard",           icon: "home",     url: "dashboard.html" },
  { page: "matching",  label: "AI Skill Matching",   icon: "sparkles", url: "matching.html" },
  { page: "explore",   label: "Explore Skills",      icon: "search",   url: "explore.html" },
  { page: "exchanges", label: "Skill Exchange",      icon: "swap",     url: "exchanges.html" },
  { page: "projects",  label: "Projects",            icon: "folder",   url: "projects.html" },
  { page: "passport",  label: "Skill Passport",      icon: "passport", url: "passport.html" },
  { page: "rewards",   label: "Points & Rewards",    icon: "gift",     url: "rewards.html" },
  { page: "cv",        label: "AI CV Analysis",      icon: "file",     url: "cv-analysis.html" }
];

var App = {
  user: null,

  /* Call this at the start of every app page.
     It checks login, builds the layout, then runs the page code. */
  start: function (pageName, render) {
    App.user = Store.currentUser();
    if (!App.user) {
      window.location.href = "login.html";
      return;
    }
    App.buildLayout(pageName);
    App.refresh = function () {
      App.user = Store.currentUser();
      App.updateUserBox();
      render();
    };
    render();
  },

  buildLayout: function (pageName) {
    var links = MENU.map(function (item) {
      var badge = item.page === "exchanges" ? '<span class="nav-badge" id="navBadge"></span>' : "";
      return '<a href="' + item.url + '" class="nav-link' + (item.page === pageName ? " active" : "") + '">' +
             icon(item.icon) + '<span>' + item.label + '</span>' + badge + '</a>';
    }).join("");

    document.getElementById("sidebar").innerHTML =
      '<a href="index.html" class="brand"><img src="images/logo.svg" alt="SkillSwap logo"><span>SkillSwap</span></a>' +
      '<nav class="nav">' + links + '</nav>' +
      '<div class="sidebar-bottom">' +
        '<button class="nav-link" id="resetBtn" title="Restore the original sample data">' + icon("refresh") + '<span>Reset demo data</span></button>' +
        '<button class="nav-link" id="logoutBtn">' + icon("logout") + '<span>Log out</span></button>' +
      '</div>';

    var current = MENU.find(function (m) { return m.page === pageName; });
    document.getElementById("topbar").innerHTML =
      '<button class="icon-btn menu-btn" id="menuBtn" aria-label="Open menu">' + icon("menu") + '</button>' +
      '<h1 class="page-title">' + (current ? current.label : "") + '</h1>' +
      '<a href="passport.html" class="user-box" id="userBox"></a>';
    App.updateUserBox();

    // Mobile menu
    var overlay = document.createElement("div");
    overlay.className = "sidebar-overlay";
    document.body.appendChild(overlay);
    function toggleMenu(open) { document.body.classList.toggle("menu-open", open); }
    document.getElementById("menuBtn").onclick = function () { toggleMenu(true); };
    overlay.onclick = function () { toggleMenu(false); };

    document.getElementById("logoutBtn").onclick = function () {
      Store.logout();
      window.location.href = "index.html";
    };
    document.getElementById("resetBtn").onclick = function () {
      App.confirm("Reset demo data?", "All accounts, requests and projects you created will be removed and the original sample data will be restored.", function () {
        Store.resetAll();
        window.location.href = "login.html";
      });
    };
  },

  updateUserBox: function () {
    var u = App.user;
    document.getElementById("userBox").innerHTML =
      '<span class="points-pill">⚡ ' + u.points + ' pts</span>' +
      avatar(u, "sm") + '<span class="user-name">' + esc(u.name.split(" ")[0]) + '</span>';
    // Red badge on "Skill Exchange" = number of new requests
    var pending = Store.getStats(u.id).pendingIncoming;
    var badge = document.getElementById("navBadge");
    badge.textContent = pending;
    badge.classList.toggle("hidden", !pending);
  },

  /* ---------- Toast message ---------- */
  toast: function (message, type) {
    var box = document.getElementById("toastBox");
    if (!box) {
      box = document.createElement("div");
      box.id = "toastBox";
      box.className = "toast-box";
      document.body.appendChild(box);
    }
    var t = document.createElement("div");
    t.className = "toast " + (type || "success");
    t.textContent = message;
    box.appendChild(t);
    setTimeout(function () { t.classList.add("hide"); }, 2800);
    setTimeout(function () { t.remove(); }, 3200);
  },

  /* ---------- Modal (popup window) ---------- */
  openModal: function (title, bodyHtml, wide) {
    App.closeModal();
    var m = document.createElement("div");
    m.className = "modal-backdrop";
    m.id = "modal";
    m.innerHTML =
      '<div class="modal' + (wide ? " wide" : "") + '" role="dialog" aria-modal="true">' +
        '<div class="modal-head"><h3>' + title + '</h3>' +
        '<button class="icon-btn" data-close aria-label="Close">' + icon("close") + '</button></div>' +
        '<div class="modal-body">' + bodyHtml + '</div>' +
      '</div>';
    m.addEventListener("click", function (e) {
      if (e.target === m || e.target.closest("[data-close]")) App.closeModal();
    });
    document.body.appendChild(m);
    return m;
  },

  closeModal: function () {
    var m = document.getElementById("modal");
    if (m) m.remove();
  },

  confirm: function (title, text, onYes) {
    var m = App.openModal(esc(title),
      '<p class="muted">' + esc(text) + '</p>' +
      '<div class="modal-actions"><button class="btn btn-light" data-close>Cancel</button>' +
      '<button class="btn btn-primary" id="confirmYes">Yes, continue</button></div>');
    m.querySelector("#confirmYes").onclick = function () { App.closeModal(); onYes(); };
  },

  /* Runs an action from Store. Shows a success message, or the error message. */
  run: function (action, successMessage) {
    try {
      action();
      if (successMessage) App.toast(successMessage);
      App.refresh();
      return true;
    } catch (err) {
      App.toast(err.message, "error");
      return false;
    }
  }
};

/* ---------- Small HTML helper functions ---------- */

// Escape text before putting it inside HTML (protects against broken HTML / XSS)
function esc(text) {
  return String(text == null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function initials(name) {
  return name.split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();
}

function avatar(user, size) {
  return '<span class="avatar ' + (size || "") + '" style="background:' + esc(user.color) + '">' + esc(initials(user.name)) + '</span>';
}

function stars(rating) {
  var full = Math.round(rating);
  var s = "";
  for (var i = 1; i <= 5; i++) s += i <= full ? "★" : "☆";
  return '<span class="stars">' + s + '</span>';
}

function ratingText(userId) {
  var r = Store.getRating(userId);
  return r.count ? stars(r.average) + ' <b>' + r.average + '</b> <span class="muted">(' + r.count + ')</span>'
                 : '<span class="muted">No reviews yet</span>';
}

function skillTag(skillId, extraClass) {
  return '<span class="tag ' + (extraClass || "") + '">' + esc(Store.skillName(skillId)) + '</span>';
}

function levelClass(level) {
  return level === "Advanced" ? "lvl-adv" : level === "Intermediate" ? "lvl-int" : "lvl-beg";
}

function progressBar(percent) {
  return '<div class="progress"><div class="progress-fill" style="width:' + percent + '%"></div></div>';
}

function formatDate(dateStr) {
  var d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function emptyState(emoji, text, buttonHtml) {
  return '<div class="empty"><div class="empty-icon">' + emoji + '</div><p>' + text + '</p>' + (buttonHtml || "") + '</div>';
}

function statusBadge(status) {
  var labels = { pending: "Pending", accepted: "Active", rejected: "Declined", completed: "Completed",
                 cancelled: "Cancelled", open: "Open", in_progress: "In progress" };
  return '<span class="status status-' + status + '">' + (labels[status] || status) + '</span>';
}

// Read a value from the page URL, e.g. passport.html?id=3  ->  getParam("id") = "3"
function getParam(name) {
  var match = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
  return match ? decodeURIComponent(match[1]) : null;
}

/* ---------- Shared "Request a swap" popup (used in several pages) ---------- */
function openSwapModal(otherUserId, preferredSkillId) {
  var me = Store.currentUser();
  var other = Store.findUser(otherUserId);
  if (!me.teach.length) {
    App.toast("Add a skill you can teach first (from your Skill Passport).", "error");
    return;
  }
  var wantOptions = other.teach.map(function (t) {
    return '<option value="' + t.skill + '"' + (t.skill === Number(preferredSkillId) ? " selected" : "") + '>' +
           esc(Store.skillName(t.skill)) + ' (' + t.level + ')</option>';
  }).join("");
  // Put skills the other person wants to learn first
  var offerList = me.teach.slice().sort(function (a, b) {
    var aw = other.learn.some(function (l) { return l.skill === a.skill; }) ? 0 : 1;
    var bw = other.learn.some(function (l) { return l.skill === b.skill; }) ? 0 : 1;
    return aw - bw;
  });
  var offerOptions = offerList.map(function (t) {
    var wanted = other.learn.some(function (l) { return l.skill === t.skill; });
    return '<option value="' + t.skill + '">' + esc(Store.skillName(t.skill)) + (wanted ? " ★ they want this" : "") + '</option>';
  }).join("");

  var m = App.openModal("Request a skill swap",
    '<div class="swap-with">' + avatar(other) + '<div><b>' + esc(other.name) + '</b><div class="muted small">' + esc(other.title) + '</div></div></div>' +
    '<form id="swapForm" class="form">' +
      '<label>I want to learn<select name="want" required>' + wantOptions + '</select></label>' +
      '<label>In exchange I will teach<select name="offer" required>' + offerOptions + '</select></label>' +
      '<label>Message<textarea name="message" rows="3" placeholder="Say hi and suggest a time to meet...">Hi ' +
        esc(other.name.split(" ")[0]) + '! Would you like to swap skills with me?</textarea></label>' +
      '<div class="modal-actions"><button type="button" class="btn btn-light" data-close>Cancel</button>' +
      '<button type="submit" class="btn btn-primary">Send request</button></div>' +
    '</form>');

  m.querySelector("#swapForm").onsubmit = function (e) {
    e.preventDefault();
    var f = e.target;
    var ok = App.run(function () {
      Store.sendExchange(other.id, f.offer.value, f.want.value, f.message.value);
    }, "Request sent to " + other.name + "!");
    if (ok) App.closeModal();
  };
}

/* ---------- Warning if the browser blocks saving (e.g. private / incognito window) ---------- */
(function () {
  if (Store.canSave()) return;
  var bar = document.createElement("div");
  bar.className = "save-warning";
  bar.textContent = "⚠️ This browser is blocking saving (private window or blocked site data). " +
                    "New accounts and changes will be lost when you close it. Open the site in a normal Chrome or Edge window.";
  document.body.insertBefore(bar, document.body.firstChild);
})();
