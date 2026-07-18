const express = require("express");
const router = express.Router();

const User = require("../models/users");
const dailysessionmodel = require("../models/daysession");

//------------------------------
// 1. GET PROFILE STATS (WITH ALL NEW ANALYTICS)
//------------------------------
router.get("/dashboard/profile", async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const studyDays = await dailysessionmodel
      .find({ userId, totalDaytime: { $gt: 0 } })
      .sort({ date: 1 });

    // Core Stats
    let longestStreak = 0;
    let currentStreak = 0;
    let totalFocusTimeAllTime = 0; 
    let totalSessionsAllTime = 0;  
    
    // Arrays & Tracking for smart stats
    const dayStats = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 }; // 0 = Sunday
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setHours(0, 0, 0, 0);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    let activeDaysInLast30 = 0;

    if (studyDays.length > 0) {
      let streak = 1;

      for (let i = 0; i < studyDays.length; i++) {
        const session = studyDays[i];

        // 1. Accumulate Totals
        totalFocusTimeAllTime += session.totalDaytime || 0;
        totalSessionsAllTime += session.totalSessions || 0;

        // 2. Track which day of the week is most productive
        const dayOfWeek = new Date(session.date).getDay();
        dayStats[dayOfWeek] += session.totalDaytime || 0;

        // 3. Track Consistency (Active days in last 30 days)
        if (new Date(session.date) >= thirtyDaysAgo) {
          activeDaysInLast30++;
        }

        // 4. Calculate Longest Streak
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

      // 5. Calculate Current Streak
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

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastStudyDate = new Date(studyDays[studyDays.length - 1].date);
      lastStudyDate.setHours(0, 0, 0, 0);

      const diffFromToday = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));
      if (diffFromToday > 1) {
        currentStreak = 0;
      }
    }

    // 6. Calculate Final Derived Stats
    const averageSessionLength = totalSessionsAllTime > 0 
        ? Math.floor(totalFocusTimeAllTime / totalSessionsAllTime) 
        : 0;
    
    const consistency30Days = Math.round((activeDaysInLast30 / 30) * 100);

    const daysName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let maxTime = -1;
    let bestDay = "N/A";
    for (let d = 0; d < 7; d++) {
      if (dayStats[d] > maxTime) {
        maxTime = dayStats[d];
        bestDay = daysName[d];
      }
    }
    const mostProductiveDay = maxTime > 0 ? bestDay : "N/A";

    return res.status(200).json({
      name: user.name,
      currentStreak,
      longestStreak,
      totalFocusTimeAllTime,
      totalSessionsAllTime,
      averageSessionLength,
      consistency30Days,
      mostProductiveDay
    });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

//------------------------------
// 2. GET WEEKLY CHART (FIXED WITH 7-DAY PADDING)
//------------------------------
router.get("/dashboard/weekly-chart", async (req, res) => {
  try {
    const userId = req.user.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const sessions = await dailysessionmodel
      .find({ userId, date: { $gte: sevenDaysAgo } })
      .sort({ date: 1 });

    const sessionMap = new Map();
    sessions.forEach((session) => {
      const dateKey = session.date.toISOString().split("T")[0];
      sessionMap.set(dateKey, Number((session.totalDaytime / 3600).toFixed(1)));
    });

    const weeklyData = [];
    for (let i = 0; i < 7; i++) {
        const currentDate = new Date(sevenDaysAgo);
        currentDate.setDate(currentDate.getDate() + i);
        const dateKey = currentDate.toISOString().split("T")[0];
        const hours = sessionMap.get(dateKey) || 0;
        const dayName = currentDate.toLocaleDateString("en-US", { weekday: "short" });
        
        weeklyData.push({ day: dayName, hours });
    }

    return res.status(200).json({ weeklyData });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

//------------------------------
// 3. GET HEATMAP
//------------------------------
router.get("/dashboard/heatmap", async (req, res) => {
  try {
    const userId = req.user.id;
    const oneYearAgo = new Date();
    oneYearAgo.setHours(0, 0, 0, 0);
    oneYearAgo.setDate(oneYearAgo.getDate() - 364);

    const sessions = await dailysessionmodel
      .find({ userId, date: { $gte: oneYearAgo } })
      .select("date totalDaytime")
      .sort({ date: 1 });

    const sessionMap = new Map();
    sessions.forEach((session) => {
      const dateKey = session.date.toISOString().split("T")[0];
      sessionMap.set(dateKey, { hours: Number((session.totalDaytime / 3600).toFixed(1)) });
    });

    const heatmapData = [];
    for (let i = 0; i < 365; i++) {
      const currentDate = new Date(oneYearAgo);
      currentDate.setDate(oneYearAgo.getDate() + i);
      const dateKey = currentDate.toISOString().split("T")[0];
      const sessionData = sessionMap.get(dateKey);
      const hours = sessionData?.hours || 0;

      let intensity = 0;
      if (hours > 0 && hours <= 2) intensity = 1;
      else if (hours > 2 && hours <= 4) intensity = 2;
      else if (hours > 4 && hours <= 6) intensity = 3;
      else if (hours > 6) intensity = 4;

      heatmapData.push({ date: dateKey, hours, intensity });
    }

    return res.status(200).json({ totalDays: heatmapData.length, heatmapData });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

module.exports = router;