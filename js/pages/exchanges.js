/* Skill Exchange page: send, accept, decline, complete and review swap requests */

var activeTab = "incoming";

App.start("exchanges", function () {
  var me = App.user;
  var all = Store.getMyExchanges();

  var groups = {
    incoming:  all.filter(function (e) { return e.to === me.id && e.status === "pending"; }),
    outgoing:  all.filter(function (e) { return e.from === me.id && e.status === "pending"; }),
    active:    all.filter(function (e) { return e.status === "accepted"; }),
    completed: all.filter(function (e) { return e.status === "completed"; }),
    history:   all.filter(function (e) { return e.status === "rejected" || e.status === "cancelled"; })
  };
  var labels = { incoming: "📩 Incoming", outgoing: "📤 Sent", active: "🔄 Active", completed: "✅ Completed", history: "🗂️ History" };

  var tabs = Object.keys(groups).map(function (key) {
    return '<button class="tab' + (key === activeTab ? " active" : "") + '" data-tab="' + key + '">' +
           labels[key] + '<span class="count">' + groups[key].length + '</span></button>';
  }).join("");

  var list = groups[activeTab];
  var emptyText = {
    incoming: "No new requests. Share your skills to get more requests!",
    outgoing: "You have no pending sent requests.",
    active: "No active exchanges. Accept a request to start one.",
    completed: "No completed exchanges yet.",
    history: "No declined or cancelled requests."
  };

  document.getElementById("content").innerHTML =
    '<div class="row-between mb wrap">' +
      '<div class="tabs">' + tabs + '</div>' +
      '<a href="explore.html" class="btn btn-primary">+ New swap request</a>' +
    '</div>' +
    '<div class="card">' +
      (list.length ? list.map(function (e) { return exchangeItem(e, me); }).join('<hr style="border:none;border-top:1px solid var(--border);margin:16px 0">')
                   : emptyState("🔄", emptyText[activeTab], '<a href="matching.html" class="btn btn-soft btn-sm">Find people with AI</a>')) +
    '</div>' +
    '<div class="card mt"><h3 class="mb">How skill exchange works</h3>' +
      '<div class="grid grid-4 small">' +
        '<div><b>1. Send</b><p class="muted">Choose a person, a skill you want and a skill you offer.</p></div>' +
        '<div><b>2. Accept</b><p class="muted">When they accept, you both get <b>+20 points</b>.</p></div>' +
        '<div><b>3. Learn</b><p class="muted">Meet, teach each other, then mark it complete for <b>+50 points</b>.</p></div>' +
        '<div><b>4. Review</b><p class="muted">Rate each other to build trust (<b>+5 points</b>).</p></div>' +
      '</div></div>';
});

function exchangeItem(e, me) {
  var outgoing = e.from === me.id;
  var other = Store.findUser(outgoing ? e.to : e.from);
  // What I teach and what I learn in this exchange
  var iTeach = outgoing ? e.offer : e.want;
  var iLearn = outgoing ? e.want : e.offer;

  var actions = "";
  if (e.status === "pending" && !outgoing) {
    actions = '<button class="btn btn-primary btn-sm" data-accept="' + e.id + '">✓ Accept</button>' +
              '<button class="btn btn-light btn-sm" data-decline="' + e.id + '">Decline</button>';
  } else if (e.status === "pending" && outgoing) {
    actions = '<span class="small muted">Waiting for ' + esc(other.name.split(" ")[0]) + ' to reply...</span>' +
              '<button class="btn btn-danger btn-sm" data-cancel="' + e.id + '">Cancel request</button>';
  } else if (e.status === "accepted") {
    actions = '<button class="btn btn-success btn-sm" data-complete="' + e.id + '">Mark as completed</button>' +
              '<button class="btn btn-light btn-sm" data-contact="' + other.id + '">Contact</button>';
  } else if (e.status === "completed") {
    actions = Store.hasReviewed(e.id, me.id)
      ? '<span class="tag green">✓ You reviewed this exchange</span>'
      : '<button class="btn btn-soft btn-sm" data-review="' + e.id + '">★ Leave a review</button>';
  }

  return '<div class="exchange">' + avatar(other) +
    '<div class="grow">' +
      '<div class="row-between wrap"><div><b>' + esc(other.name) + '</b> <span class="small muted">· ' + esc(other.title) + '</span></div>' +
      '<div class="row">' + statusBadge(e.status) + '<span class="small muted">' + formatDate(e.date) + '</span></div></div>' +
      '<div class="swap-line"><span class="muted">You teach</span>' + skillTag(iTeach) +
      '<span class="swap-arrow">⇄</span><span class="muted">You learn</span>' + skillTag(iLearn, "blue") + '</div>' +
      (e.message ? '<div class="exchange-msg">💬 ' + esc(e.message) + '</div>' : "") +
      '<div class="exchange-actions">' + actions + '</div>' +
    '</div></div>';
}

function openReviewModal(exchangeId) {
  var e = Store.getMyExchanges().find(function (x) { return x.id === Number(exchangeId); });
  var other = Store.findUser(e.from === App.user.id ? e.to : e.from);
  var rating = 5;
  var m = App.openModal("Review " + esc(other.name),
    '<form class="form" id="reviewForm">' +
      '<div><div class="label-sm">Your rating</div><div class="rating-input" id="ratingStars">' +
        [1, 2, 3, 4, 5].map(function (n) { return '<span data-star="' + n + '" class="on">★</span>'; }).join("") + '</div></div>' +
      '<label>Comment<textarea name="comment" rows="3" placeholder="How was your experience?"></textarea></label>' +
      '<div class="modal-actions"><button type="button" class="btn btn-light" data-close>Cancel</button>' +
      '<button type="submit" class="btn btn-primary">Submit review</button></div>' +
    '</form>');
  m.querySelector("#ratingStars").onclick = function (ev) {
    var s = ev.target.closest("[data-star]");
    if (!s) return;
    rating = Number(s.dataset.star);
    m.querySelectorAll("[data-star]").forEach(function (el) { el.classList.toggle("on", Number(el.dataset.star) <= rating); });
  };
  m.querySelector("#reviewForm").onsubmit = function (ev) {
    ev.preventDefault();
    var comment = ev.target.comment.value;
    if (App.run(function () { Store.reviewExchange(exchangeId, rating, comment); }, "Thanks for your review! +5 points")) App.closeModal();
  };
}

document.getElementById("content").addEventListener("click", function (ev) {
  var b = ev.target.closest("button");
  if (!b) return;
  var d = b.dataset;
  if (d.tab) { activeTab = d.tab; App.refresh(); }
  if (d.accept) App.run(function () { Store.respondExchange(d.accept, true); }, "Exchange accepted! You both earned +20 points.");
  if (d.decline) App.run(function () { Store.respondExchange(d.decline, false); }, "Request declined.");
  if (d.cancel) App.run(function () { Store.cancelExchange(d.cancel); }, "Request cancelled.");
  if (d.complete) {
    App.confirm("Mark this exchange as completed?", "Only do this after you have finished teaching and learning together. You will both earn +50 points.", function () {
      App.run(function () { Store.completeExchange(d.complete); }, "🎉 Exchange completed! +50 points");
      activeTab = "completed";
      App.refresh();
    });
  }
  if (d.review) openReviewModal(d.review);
  if (d.contact) {
    var u = Store.findUser(d.contact);
    App.openModal("Contact " + esc(u.name),
      '<div class="swap-with">' + avatar(u) + '<div><b>' + esc(u.name) + '</b><div class="small muted">' + esc(u.email) + '</div></div></div>' +
      '<p class="muted small">Send an email to agree on a time and place (online or on campus) for your sessions.</p>' +
      '<div class="modal-actions"><a class="btn btn-primary" href="mailto:' + esc(u.email) + '">Send email</a></div>');
  }
});
