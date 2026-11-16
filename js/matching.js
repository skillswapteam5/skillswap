/* =====================================================================
   SkillSwap - "AI" Skill Matching
   ---------------------------------------------------------------------
   This is a simple scoring algorithm that simulates an AI recommender.
   For every user it calculates a match score (0 - 99%) using:
     1. How many of the wanted skills they teach      (40 + up to 15 points)
     2. Their teaching level (Advanced is best)        (up to 15 points)
     3. Do they want to learn something YOU teach?     (20 points = perfect swap)
     4. Their rating from reviews                      (up to 12 points)
     5. Their activity (Skill Points)                  (up to 7 points)
   ===================================================================== */

var Matcher = {

  LEVEL_POINTS: { Advanced: 15, Intermediate: 10, Beginner: 5 },

  findMatches: function (me, wantedSkillIds) {
    var wanted = wantedSkillIds.map(Number);
    var results = [];

    Store.getUsers().forEach(function (user) {
      if (user.id === me.id) return;

      // 1. Skills this user teaches that I want
      var matched = user.teach.filter(function (t) { return wanted.indexOf(t.skill) !== -1; });
      if (!matched.length) return;
      var score = 40 + 15 * (matched.length / wanted.length);
      var reasons = [];
      reasons.push("Teaches " + matched.map(function (t) { return Store.skillName(t.skill); }).join(", "));

      // 2. Best teaching level
      var bestLevel = 0;
      matched.forEach(function (t) { bestLevel = Math.max(bestLevel, Matcher.LEVEL_POINTS[t.level] || 5); });
      score += bestLevel;
      if (bestLevel === 15) reasons.push("Advanced level teacher");

      // 3. Reciprocal swap: they want to learn what I teach
      var reciprocal = user.learn.filter(function (l) {
        return me.teach.some(function (t) { return t.skill === l.skill; });
      }).map(function (l) { return l.skill; });
      if (reciprocal.length) {
        score += 20;
        reasons.push("Wants to learn " + reciprocal.map(Store.skillName).join(", ") + " from you");
      }

      // 4. Rating
      var rating = Store.getRating(user.id);
      score += rating.count ? (rating.average / 5) * 12 : 6;
      if (rating.count && rating.average >= 4.5) reasons.push("Highly rated (" + rating.average + "★)");

      // 5. Activity
      score += Math.min(user.points / 800, 1) * 7;

      results.push({
        user: user,
        score: Math.min(99, Math.round(score)),
        matched: matched,
        reciprocal: reciprocal,
        reasons: reasons
      });
    });

    return results.sort(function (a, b) { return b.score - a.score; });
  },

  // Used on the dashboard: matches for all the skills I want to learn
  recommendedFor: function (me, limit) {
    if (!me.learn.length) return [];
    var ids = me.learn.map(function (l) { return l.skill; });
    return Matcher.findMatches(me, ids).slice(0, limit || 3);
  }
};
