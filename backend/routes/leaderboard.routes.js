const express = require("express");
const router = express.Router();

const User = require("../models/users");
const dailysessionmodel = require("../models/daysession");
const taskmodel = require("../models/tasks");

// GET /api/leaderboard
router.get("/", async (req, res) => {
    try {
        const users = await User.find({});
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const leaderboardData = [];

        for (const user of users) {
            // 1. Get Today's Focus Time (totalDaytime in seconds)
            const todaySession = await dailysessionmodel.findOne({ userId: user._id, date: today });
            const xp = todaySession ? (todaySession.totalDaytime || 0) : 0;

            // 2. Calculate Streak
            // (Same exact logic you used in /dashboard/profile to ensure perfect consistency)
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

            let currentStreak = 0;
            if (studyDays.length > 0) {
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
              const diffFromToday = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));
              if (diffFromToday > 1) {
                currentStreak = 0;
              }
            }

            // Extract badges properly
            const userBadges = user.badges || [];

            leaderboardData.push({
                id: user._id,
                name: user.name,
                avatar: user.imageUrl || null,
                xp: xp,
                streak: currentStreak,
                badges: userBadges
            });
        }

        // 3. Sort by XP (highest first)
        leaderboardData.sort((a, b) => b.xp - a.xp);

        res.status(200).json(leaderboardData);
    } catch (err) {
        console.error("Leaderboard Error:", err);
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
});

module.exports = router;
