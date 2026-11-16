/* Skill Points & Rewards page */

var EARN_RULES = [
  ["Join SkillSwap (welcome bonus)", 50],
  ["Complete your profile", 25],
  ["Exchange request accepted", 20],
  ["Complete a skill exchange", 50],
  ["Write a review", 5],
  ["Receive a 5-star review", 10],
  ["Create a project", 10],
  ["Join a project", 15],
  ["Complete a project (each member)", 100],
  ["Finish a learning goal (100%)", 30],
  ["First AI CV analysis", 10]
];

App.start("rewards", function () {
  var me = App.user;
  var level = Store.getLevel(me.points);
  var rewards = Store.getRewards();
  var history = Store.getTransactions(me.id);
  var redeemed = Store.getRedemptions(me.id);
  var leaders = Store.getLeaderboard();
  var earned = history.filter(function (t) { return t.points > 0; }).reduce(function (a, t) { return a + t.points; }, 0);
  var rank = Store.getUsers().slice().sort(function (a, b) { return b.points - a.points; })
    .findIndex(function (u) { return u.id === me.id; });

  var html =
    '<div class="grid grid-3 mb">' +
      '<div class="card points-hero span-2">' +
        '<div class="row-between wrap"><div><div style="opacity:.85">Your balance</div>' +
        '<div class="big-points">⚡ ' + me.points + '</div><div style="opacity:.85">Skill Points</div></div>' +
        '<div style="text-align:right"><div style="font-size:40px">' + level.icon + '</div><b>' + level.name + ' level</b></div></div>' +
        progressBar(level.percent) +
        '<div class="small mt" style="opacity:.9">' + (level.next ? (level.next.min - me.points) + ' more points to reach <b>' + level.next.name + '</b>' : "You reached the highest level! 👑") + '</div>' +
        // Level roadmap
        '<div class="level-road">' + Store.LEVELS.map(function (l) {
          return '<div class="level-step' + (me.points >= l.min ? " reached" : "") + '"><div class="level-icon">' + l.icon + '</div>' +
                 '<b>' + l.name + '</b><span>' + l.min + '+ pts</span></div>';
        }).join("") + '</div>' +
        '<div class="hero-mini-stats">' +
          '<div><b>+' + earned + '</b><span>Total earned</span></div>' +
          '<div><b>' + redeemed.length + '</b><span>Rewards redeemed</span></div>' +
          '<div><b>#' + (rank + 1) + '</b><span>Leaderboard rank</span></div>' +
        '</div>' +
      '</div>' +
      '<div class="card"><h3 class="mb">💡 How to earn points</h3>' +
        EARN_RULES.map(function (r) { return '<div class="earn-row"><span>' + r[0] + '</span><b>+' + r[1] + '</b></div>'; }).join("") +
      '</div>' +
    '</div>';

  // Rewards store
  html += '<div class="card mb"><div class="card-head"><h3>🎁 Rewards store</h3><span class="small muted">Redeem your points</span></div>' +
    '<div class="grid grid-3">' + rewards.map(function (r) {
      var canBuy = me.points >= r.cost;
      return '<div class="card reward-card" style="box-shadow:none">' +
        '<div class="reward-icon">' + r.icon + '</div><b>' + esc(r.title) + '</b>' +
        '<p class="small muted">' + esc(r.description) + '</p>' +
        '<div class="cost">⚡ ' + r.cost + ' pts</div>' +
        '<button class="btn ' + (canBuy ? "btn-primary" : "btn-light") + ' btn-sm btn-block" data-redeem="' + r.id + '"' + (canBuy ? "" : " disabled") + '>' +
          (canBuy ? "Redeem" : "Need " + (r.cost - me.points) + " more") + '</button>' +
      '</div>';
    }).join("") + '</div></div>';

  html += '<div class="grid grid-3">';

  // History
  html += '<div class="card span-2"><div class="card-head"><h3>📜 Points history</h3></div>' +
    (history.length ? '<div class="list">' + history.slice(0, 15).map(function (t) {
      return '<div class="list-item"><div class="grow"><b class="small">' + esc(t.reason) + '</b><div class="small muted">' + formatDate(t.date) + '</div></div>' +
        '<span class="' + (t.points >= 0 ? "tx-plus" : "tx-minus") + '">' + (t.points >= 0 ? "+" : "") + t.points + '</span></div>';
    }).join("") + '</div>' : emptyState("📜", "No points yet.")) +
    (redeemed.length ? '<h4 class="mt mb">My redeemed rewards</h4><div class="tags">' + redeemed.map(function (r) {
      return '<span class="tag green">' + r.icon + ' ' + esc(r.title) + ' · ' + formatDate(r.date) + '</span>';
    }).join("") + '</div>' : "") +
  '</div>';

  // Leaderboard
  html += '<div class="card"><div class="card-head"><h3>🏆 Leaderboard</h3></div><div class="list">' +
    leaders.map(function (u, i) {
      var medal = ["🥇", "🥈", "🥉"][i] || (i + 1);
      return '<a href="passport.html?id=' + u.id + '" class="list-item' + (u.id === me.id ? " me" : "") + '" style="color:inherit">' +
        '<span class="rank">' + medal + '</span>' + avatar(u, "sm") +
        '<div class="grow"><b class="small">' + esc(u.name) + (u.id === me.id ? " (you)" : "") + '</b></div>' +
        '<b class="small" style="color:var(--purple)">' + u.points + '</b></a>';
    }).join("") + '</div></div>';

  html += '</div>';
  document.getElementById("content").innerHTML = html;
});

document.getElementById("content").addEventListener("click", function (e) {
  var b = e.target.closest("[data-redeem]");
  if (!b) return;
  var reward = Store.getRewards().find(function (r) { return r.id === Number(b.dataset.redeem); });
  App.confirm("Redeem " + reward.title + "?", "This will use " + reward.cost + " of your Skill Points.", function () {
    App.run(function () { Store.redeemReward(reward.id); }, "🎉 You redeemed: " + reward.title);
  });
});
