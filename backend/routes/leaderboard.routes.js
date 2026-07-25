const express = require("express");
const router = express.Router();

const User = require("../models/users");
const dailysessionmodel = require("../models/daysession");
const taskmodel = require("../models/tasks");

// GET /api/leaderboard
router.get("/", async (req, res) => {
    try {
        const users = await User.find({});
        
        // 🔥 FIX 1: Exact Midnight ke bajaye poore din ki Time Range banayenge
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const leaderboardData = [];

        for (const user of users) {
            // 🔥 FIX 2: Range query lagayenge taki agar Date me thoda bhi timestamp difference ho, tab bhi box mil jaye!
            const todaySession = await dailysessionmodel.findOne({ 
                userId: user._id, 
                date: { $gte: startOfDay, $lte: endOfDay } 
            });
            
            // Ab pakka tumhara 18 min wala data yahan load hoga!
            const xp = todaySession ? (todaySession.totalDaytime || 0) : 0;

            // 2. Gather Data for Streaks
            const daySessionsWithTasks = await taskmodel.distinct("daySessionId", { userId: user._id });
            const studyDays = await dailysessionmodel
              .find({ 
                userId: user._id, 
                $or: [
                  { totalDaytime: { $gt: 0 } },
                  { _id: { $in: daySessionsWithTasks } }
                ]
              })
              .sort({ date: 1 });

            let longestStreak = 0;
            let currentStreak = 0;

            if (studyDays.length > 0) {
              let streak = 1;

              // A. Calculate Longest Streak
              for (let i = 0; i < studyDays.length; i++) {
                const session = studyDays[i];

                if (i > 0) {
                  const prev = new Date(studyDays[i - 1].date);
                  const curr = new Date(session.date);
                  const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));

                  if (diffDays === 1) {
                    streak++;
                  } else {
                    longestStreak = Math.max(longestStreak, streak);
                    streak = 1;
                  }
                }
              }
              longestStreak = Math.max(longestStreak, streak);

              // B. Calculate Current Streak
              currentStreak = 1;
              for (let i = studyDays.length - 1; i > 0; i--) {
                const curr = new Date(studyDays[i].date);
                const prev = new Date(studyDays[i - 1].date);
                const diffDays = Math.floor((curr - prev) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                  currentStreak++;
                } else {
                  break;
                }
              }

              const lastStudyDate = new Date(studyDays[studyDays.length - 1].date);
              lastStudyDate.setHours(0, 0, 0, 0);
              
              // startOfDay se diff compare karenge purane logic ke bajaye (Zada accurate)
              const diffFromToday = Math.floor((startOfDay - lastStudyDate) / (1000 * 60 * 60 * 24));
              if (diffFromToday > 1) {
                currentStreak = 0;
              }
            }

            const userBadges = user.badges || [];

            // 🔥 Store all data temporarily for advanced sorting
            leaderboardData.push({
                id: user._id,
                name: user.name,
                avatar: user.imageUrl || null,
                xp: xp,
                currentStreak: currentStreak,
                longestStreak: longestStreak, 
                badges: userBadges,
                // MongoDB ki ID ke andar timestamp chhupa hota hai!
                createdAt: user.createdAt ? new Date(user.createdAt).getTime() : user._id.getTimestamp().getTime()
            });
        }

        // ==========================================
        // 3. 🔥 ULTIMATE TIE-BREAKER SORTING LOGIC 🔥
        // ==========================================
        leaderboardData.sort((a, b) => {
            if (b.xp !== a.xp) return b.xp - a.xp; // Rule 1: XP
            if (b.currentStreak !== a.currentStreak) return b.currentStreak - a.currentStreak; // Rule 2: Current Streak
            if (b.longestStreak !== a.longestStreak) return b.longestStreak - a.longestStreak; // Rule 3: Longest Streak
            return a.createdAt - b.createdAt; // Rule 4: Oldest User first
        });

        // ==========================================
        // 4. Send Clean Data to Frontend
        // ==========================================
        const finalData = leaderboardData.map(u => ({
            id: u.id,
            name: u.name,
            avatar: u.avatar,
            xp: u.xp,
            streak: u.currentStreak,
            badges: u.badges
        }));

        res.status(200).json(finalData);
    } catch (err) {
        console.error("Leaderboard Error:", err);
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
});

module.exports = router;