const express = require("express");
const Router = express.Router();
const userDetail = require("../models/users");
const sessionmodel = require("../models/studysession");
const dailysessionmodel = require("../models/daysession");
const express = require("express");

const router = express.Router();

//------------------------------

const User = require("../models/users");
router.get("/dashboard/profile", async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const studyDays = await dailysessionmodel
      .find({
        userId,
        totalDaytime: { $gt: 0 },
      })
      .sort({ date: 1 });

    let longestStreak = 0;
    let currentStreak = 0;

    if (studyDays.length > 0) {
      let streak = 1;

      for (let i = 1; i < studyDays.length; i++) {
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

      longestStreak = Math.max(longestStreak, streak);

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

      const diffFromToday = Math.floor(
        (today - lastStudyDate) / (1000 * 60 * 60 * 24),
      );

      if (diffFromToday > 1) {
        currentStreak = 0;
      }
    }

    return res.status(200).json({
      name: user.name,
      currentStreak,
      longestStreak,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

//------------------------------

router.get("/dashboard/weekly-chart", async (req, res) => {
  try {
    const userId = req.user.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const sessions = await dailysessionmodel
      .find({
        userId,
        date: { $gte: sevenDaysAgo },
      })
      .sort({ date: 1 });

    const weeklyData = sessions.map((session) => ({
      day: session.date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      hours: Number((session.totalDaytime / 3600).toFixed(1)),
    }));

    return res.status(200).json({
      weeklyData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

//------------------------------

router.get("/dashboard/weekly-chart", async (req, res) => {
  try {
    const userId = req.user.id;

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setHours(0, 0, 0, 0);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

    const sessions = await dailysessionmodel
      .find({
        userId,
        date: { $gte: sevenDaysAgo },
      })
      .sort({ date: 1 });

    const weeklyData = sessions.map((session) => ({
      day: session.date.toLocaleDateString("en-US", {
        weekday: "short",
      }),
      hours: Number((session.totalDaytime / 3600).toFixed(1)),
    }));

    return res.status(200).json({
      weeklyData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});
//------------------------------

router.get("/dashboard/heatmap", async (req, res) => {
  try {
    const userId = req.user.id;

    const oneYearAgo = new Date();
    oneYearAgo.setHours(0, 0, 0, 0);
    oneYearAgo.setDate(oneYearAgo.getDate() - 364);

    const sessions = await dailysessionmodel
      .find({
        userId,
        date: { $gte: oneYearAgo },
      })
      .select("date totalDaytime")
      .sort({ date: 1 });

    // Fast lookup map
    const sessionMap = new Map();

    sessions.forEach((session) => {
      const dateKey = session.date.toISOString().split("T")[0];

      sessionMap.set(dateKey, {
        hours: Number((session.totalDaytime / 3600).toFixed(1)),
      });
    });

    const heatmapData = [];

    for (let i = 0; i < 365; i++) {
      const currentDate = new Date(oneYearAgo);
      currentDate.setDate(oneYearAgo.getDate() + i);

      const dateKey = currentDate.toISOString().split("T")[0];

      const sessionData = sessionMap.get(dateKey);

      const hours = sessionData?.hours || 0;

      let intensity = 0;

      if (hours > 0 && hours <= 2) {
        intensity = 1;
      } else if (hours > 2 && hours <= 4) {
        intensity = 2;
      } else if (hours > 4 && hours <= 6) {
        intensity = 3;
      } else if (hours > 6) {
        intensity = 4;
      }

      heatmapData.push({
        date: dateKey,
        hours,
        intensity,
      });
    }

    return res.status(200).json({
      totalDays: heatmapData.length,
      heatmapData,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

module.exports = router;
