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

        const userIds = users.map(u => u._id);
        const userIdsStr = users.map(u => u._id.toString());

        // 1. Bulk Fetch Today's Sessions
        const todaySessions = await dailysessionmodel.find({ 
            userId: { $in: userIds }, 
            date: { $gte: startOfDay, $lte: endOfDay } 
        }).lean();
        
        const xpByUserId = {};
        todaySessions.forEach(s => {
            const uid = s.userId.toString();
            xpByUserId[uid] = (xpByUserId[uid] || 0) + (s.totalDaytime || 0);
        });

        // 2. Bulk Fetch Tasks to get active daySessionIds
        const tasks = await taskmodel.find({ userId: { $in: userIds } }, 'daySessionId userId').lean();
        const tasksSessionIdsByUserId = {};
        tasks.forEach(t => {
            const uid = t.userId.toString();
            if(!tasksSessionIdsByUserId[uid]) tasksSessionIdsByUserId[uid] = new Set();
            if(t.daySessionId) tasksSessionIdsByUserId[uid].add(t.daySessionId.toString());
        });

        // 3. Bulk Fetch ALL Study Days for Streak Calculation
        const allStudyDays = await dailysessionmodel.find({ userId: { $in: userIds } }).sort({ date: 1 }).lean();
        const studyDaysByUserId = {};
        
        allStudyDays.forEach(s => {
            const uid = s.userId.toString();
            if (!studyDaysByUserId[uid]) studyDaysByUserId[uid] = [];
            
            const hasTask = tasksSessionIdsByUserId[uid] && tasksSessionIdsByUserId[uid].has(s._id.toString());
            if ((s.totalDaytime > 0) || hasTask) {
                studyDaysByUserId[uid].push(s);
            }
        });

        // 4. Calculate everything in memory synchronously
        const leaderboardData = users.map(user => {
            const uid = user._id.toString();
            const xp = xpByUserId[uid] || 0;
            const studyDays = studyDaysByUserId[uid] || [];
            
            let longestStreak = 0;
            let currentStreak = 0;

            if (studyDays.length > 0) {
              let streak = 1;

              // A. Calculate Longest Streak
              for (let i = 0; i < studyDays.length; i++) {
                if (i > 0) {
                  const prev = new Date(studyDays[i - 1].date);
                  const curr = new Date(studyDays[i].date);
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
              
              const diffFromToday = Math.floor((startOfDay - lastStudyDate) / (1000 * 60 * 60 * 24));
              if (diffFromToday > 1) {
                currentStreak = 0;
              }
            }

            return {
                id: user._id,
                name: user.name,
                avatar: user.imageUrl || user.avatar || user.picture || null,
                xp: xp,
                currentStreak: currentStreak,
                longestStreak: longestStreak, 
                badges: user.badges || [],
                createdAt: user.createdAt ? new Date(user.createdAt).getTime() : user._id.getTimestamp().getTime()
            };
        });

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