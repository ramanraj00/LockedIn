const express = require("express");
const timermodel = require("../models/studysession");
const dailysessionmodel = require("../models/daysession");
const router = express.Router();

// 1. WORKSPACE SESSION START
router.post("/session/start", async function (req, res) {
  try {
    const userId = req.user.id;
    const { daySessionId } = req.body;

    const daySession = await dailysessionmodel.findOne({ _id: daySessionId, userId });
    if (!daySession) return res.status(404).json({ message: "Day session not found" });
    if (daySession.status === "completed") return res.status(400).json({ message: "This day session is already completed" });

    const runningSession = await timermodel.findOne({ daySessionId, userId, status: "running" });
    if (runningSession) return res.status(400).json({ message: "A session is already running" });

    const session = await timermodel.create({
      daySessionId,
      userId,
      startTime: new Date(),
      status: "running",
    });

    res.status(201).json({ message: "Session started", session });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// 2. UPDATE WORKSPACE DAY (Title, Deadline, Status)
router.patch("/day/:id", async function (req, res) {
  try {
    const userId = req.user.id;
    const { title, deadline, status } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (deadline) updateData.deadline = deadline;
    if (status) updateData.status = status;

    const daySession = await dailysessionmodel.findOneAndUpdate(
      { _id: req.params.id, userId },
      updateData,
      { new: true }
    );

    if (!daySession) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({ message: "session is updated", daySession });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// 3. CASCADE DELETE DAY
router.delete("/day/:id", async function (req, res) {
    try {
        const userId = req.user.id;
        const daySession = await dailysessionmodel.findOne({ _id: req.params.id, userId });
        if (!daySession) return res.status(404).json({ message: "Day session not found" });
        
        await timermodel.deleteMany({ daySessionId: req.params.id, userId });
        const taskmodel = require("../models/tasks");
        await taskmodel.deleteMany({ daySessionId: req.params.id });
        await dailysessionmodel.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ message: "Day session and all related data deleted" });
    } catch (err) {
        res.status(500).json({ message: "Something went wrong", error: err.message });
    }
});

// 4. RESUME WORKSPACE SESSION
router.post("/session/:id/resume", async (req, res) => {
  try {
    const userId = req.user.id;

    const oldSession = await timermodel.findOne({ _id: req.params.id, userId });
    if (!oldSession) return res.status(404).json({ message: "Session not found" });
    if (oldSession.status !== "paused") return res.status(400).json({ message: "Only paused sessions can be resumed" });

    const daySession = await dailysessionmodel.findOne({ _id: oldSession.daySessionId, userId });
    if (daySession.status === "completed") return res.status(400).json({ message: "This day session is already completed" });

    const runningSession = await timermodel.findOne({ daySessionId: oldSession.daySessionId, userId, status: "running" });
    if (runningSession) return res.status(400).json({ message: "Another session is already running" });

    const newSession = await timermodel.create({
      daySessionId: oldSession.daySessionId,
      userId,
      startTime: new Date(),
      status: "running",
    });

    res.status(201).json({ message: "Session resumed", session: newSession });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. 🔥 FIX 1: COMPLETE WORKSPACE (Combines workspace chunks + stopwatch backup time)
router.patch("/day/:id/complete", async (req, res) => {
  try {
    const userId = req.user.id;

    const daySession = await dailysessionmodel.findOne({ _id: req.params.id, userId });
    if (!daySession) return res.status(404).json({ message: "Day session not found" });
    if (daySession.status === "completed") return res.status(400).json({ message: "Day session already completed" });

    const runningSession = await timermodel.findOne({ daySessionId: req.params.id, userId, status: "running" });

    if (runningSession) {
      const endTime = new Date();
      runningSession.duration = (runningSession.duration || 0) + Math.floor((endTime.getTime() - runningSession.startTime.getTime()) / 1000);
      runningSession.endTime = endTime;
      runningSession.status = "completed";
      await runningSession.save();
    }

    const sessions = await timermodel.find({ daySessionId: req.params.id, userId });
    const totalTime = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);

    // 🔥 MAIN LOGIC: Workspace Time + Stopwatch Time
    daySession.totalDaytime = totalTime + (daySession.stopwatchTime || 0);
    daySession.status = "completed";

    await daySession.save();

    return res.status(200).json({ message: "Day session completed", totalTime: daySession.totalDaytime, totalSessions: sessions.length });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// 6. GET ALL SESSIONS FOR A DAY
router.get("/day/:daySessionId/sessions", async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await timermodel.find({ daySessionId: req.params.daySessionId, userId }).sort({ startTime: 1 });
    res.status(200).json({ sessions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 7. DELETE SINGLE SESSION
router.delete("/session/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const session = await timermodel.findOneAndDelete({ _id: req.params.id, userId });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 8. GET ALL WORKSPACES
router.get("/day/all", async (req, res) => {
  try {
    const userId = req.user.id;
    const daySessions = await dailysessionmodel.find({ userId }).sort({ date: -1 });
    res.status(200).json({ daySessions });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// 9. CREATE NEW DAY WORKSPACE
router.post("/day/add", async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await dailysessionmodel.findOne({ userId, date: today });
    if (existing) return res.status(400).json({ message: "Workspace for today already exists" });

    const newDay = await dailysessionmodel.create({ title: "My Workspace", date: today, userId });
    res.status(201).json({ message: "Workspace created", daySession: newDay });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// 10. PAUSE WORKSPACE SESSION
router.patch("/session/:id/pause", async (req, res) => {
  try {
    const userId = req.user.id;
    const session = await timermodel.findOne({ _id: req.params.id, userId, status: "running" });

    if (!session) return res.status(404).json({ message: "Running session not found" });

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

    session.endTime = endTime;
    session.duration = (session.duration || 0) + duration;
    session.status = "paused";

    await session.save();
    res.status(200).json({ message: "Session paused", session });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// 11. 🔥 FIX 2: RESET ROUTE (Resets stopwatch backup time too)
router.delete("/day/:id/sessions/reset", async (req, res) => {
  try {
    const userId = req.user.id;
    const daySessionId = req.params.id;

    await timermodel.deleteMany({ daySessionId, userId });

    const daySession = await dailysessionmodel.findOneAndUpdate(
      { _id: daySessionId, userId },
      { $set: { totalDaytime: 0, stopwatchTime: 0, status: "active" } }, 
      { new: true }
    );

    if (!daySession) return res.status(404).json({ message: "Day session not found" });

    res.status(200).json({ message: "Timer reset to 00:00:00 successfully", daySession });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

// ==========================================
// 🔥 ZERO-WASTE SECURE STOPWATCH ROUTES 🔥
// ==========================================

// 12. START STOPWATCH
router.post("/stopwatch/start", async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let daySession = await dailysessionmodel.findOne({ userId, date: today });
    if (!daySession) {
      daySession = await dailysessionmodel.create({ title: "My Workspace", date: today, userId });
    }

    const runningSessions = await timermodel.find({ userId, status: "running" });
    for (let r of runningSessions) {
        const d = Math.floor((new Date() - r.startTime) / 1000);
        await dailysessionmodel.updateOne(
            { _id: r.daySessionId }, 
            { $inc: { totalDaytime: d, stopwatchTime: d } } // 🔥 ADD to both
        );
        await timermodel.deleteOne({ _id: r._id });
    }

    const session = await timermodel.create({
      daySessionId: daySession._id,
      userId,
      startTime: new Date(), 
      status: "running"
    });

    res.status(201).json({ success: true, sessionId: session._id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 13. 🔥 FIX 3: STOPWATCH STOP (Stores duration in stopwatch backup field)
router.post("/stopwatch/stop", async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId, isFinalSave } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daySession = await dailysessionmodel.findOne({ userId, date: today });
    if (!daySession) return res.status(200).json({ success: true });

    let duration = 0;
    if (sessionId) {
        const session = await timermodel.findOne({ _id: sessionId, userId, status: "running" });
        if (session) {
            duration = Math.floor((new Date() - session.startTime) / 1000);
            await timermodel.deleteOne({ _id: session._id });
        }
    }

    const updateData = { $inc: { totalDaytime: duration, stopwatchTime: duration } }; // 🔥 ADD to both
    
    if (isFinalSave) updateData.$inc.totalSessions = 1;

    if (duration > 0 || isFinalSave) {
        await dailysessionmodel.updateOne({ _id: daySession._id }, updateData);
    }

    res.status(200).json({ success: true, duration });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 14. GET TODAY'S STATS
router.get("/stopwatch/today-stats", async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const daySession = await dailysessionmodel.findOne({ userId, date: today });
    if (!daySession) return res.status(200).json({ success: true, totalDaytime: 0, totalSessions: 0 });

    res.status(200).json({ 
        success: true, 
        totalDaytime: daySession.totalDaytime || 0, 
        totalSessions: daySession.totalSessions || 0 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/session/:id/pause", async (req, res) => {
  try {
    const userId = req.user.id;
    const session = await timermodel.findOne({ _id: req.params.id, userId, status: "running" });

    if (!session) return res.status(404).json({ message: "Running session not found" });

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

    session.endTime = endTime;
    session.duration = (session.duration || 0) + duration;
    session.status = "paused";

    await session.save();

    // 🔥 FIX: Incremental Update! 
    // Jaise hi user Save karega, time direct Dashboard (totalDaytime) me jud jayega!
    await dailysessionmodel.updateOne(
      { _id: session.daySessionId },
      { $inc: { totalDaytime: duration } }
    );

    res.status(200).json({ message: "Session paused", session });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
});

router.delete("/session/:id", async (req, res) => {
  try {
    const userId = req.user.id;
    const session = await timermodel.findOneAndDelete({ _id: req.params.id, userId });
    
    if (!session) return res.status(404).json({ message: "Session not found" });
    
    // 🔥 FIX: Agar timer chunk delete hota hai, toh dashboard se uska time minus kar do
    if (session.duration > 0) {
       await dailysessionmodel.updateOne(
           { _id: session.daySessionId },
           { $inc: { totalDaytime: -session.duration } }
       );
    }
    
    res.status(200).json({ message: "Session deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;