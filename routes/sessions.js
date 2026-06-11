const express = require("express");
const timermodel = require("../models/studysession");
const dailysessionmodel = require("../models/daysession");
const router = express.Router();

// session mai hi hum time(studysesssion) and daysession store kar rahe hai...

router.post("/session/start", async function (req, res) {
  try {
    const userId = req.user.id;
    const { daySessionId } = req.body;

    const daySession = await dailysessionmodel.findOne({
  _id: daySessionId,
  userId,
});

if (!daySession) {
  return res.status(404).json({
    message: "Day session not found",
  });
}

if (daySession.status === "completed") {
  return res.status(400).json({
    message: "This day session is already completed",
  });
}

    const runningSession = await timermodel.findOne({
      daySessionId,
      userId,
      status: "running",
    });

    if (runningSession) {
      return res.status(400).json({
        message: "A session is already running",
      });
    }



    const session = await timermodel.create({
      daySessionId,
      userId,
      startTime: new Date(),
      status: "running",
    });

    res.status(201).json({
      message: "Session started",
      session,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});

//---------------------------------------------------------------------------------------

router.patch("/session/:id/pause", async function (req, res) {
  try {
    const userId = req.user.id;
    const session = await timermodel.findOne({
      _id: req.params.id,
      userId,
    });

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (session.status !== "running") {
      return res.status(400).json({
        message: "Session is not running",
      });
    }

    const endTime = new Date();

    session.duration =
      (session.duration || 0) +
      Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000);

    session.endTime = endTime;
    session.status = "paused";

    await session.save();

    res.status(200).json({
      message: "Session paused successfully",
      session,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//---------------------------------------------------------------------------------------

router.post("/session/:id/resume", async (req, res) => {
  try {
    const userId = req.user.id;

    const oldSession = await timermodel.findOne({
      _id: req.params.id,
      userId,
    });

    if (!oldSession) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (oldSession.status !== "paused") {
      return res.status(400).json({
        message: "Only paused sessions can be resumed",
      });
    }

    const daySession = await dailysessionmodel.findOne({
  _id: oldSession.daySessionId,
  userId,
});

if (daySession.status === "completed") {
  return res.status(400).json({
    message: "This day session is already completed",
  });
}

    const runningSession = await timermodel.findOne({
      daySessionId: oldSession.daySessionId,
      userId,
      status: "running",
    });

    if (runningSession) {
      return res.status(400).json({
        message: "Another session is already running",
      });
    }

    const newSession = await timermodel.create({
      daySessionId: oldSession.daySessionId,
      userId,
      startTime: new Date(),
      status: "running",
    });

    res.status(201).json({
      message: "Session resumed",
      session: newSession,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//---------------------------------------------------------------------------------------

router.patch("/day/:id/complete", async (req, res) => {
  try {
    const userId = req.user.id;

    const daySession = await dailysessionmodel.findOne({
      _id: req.params.id,
      userId,
    });

   

    if (!daySession) {
      return res.status(404).json({
        message: "Day session not found",
      });
    }

     if (daySession.status === "completed") {
  return res.status(400).json({
    message: "Day session already completed",
  });
}

    // Agar koi session abhi bhi running hai to usko close karo
    const runningSession = await timermodel.findOne({
      daySessionId: req.params.id,
      userId,
      status: "running",
    });

    if (runningSession) {
      const endTime = new Date();

      runningSession.duration =
        (runningSession.duration || 0) +
        Math.floor(
          (endTime.getTime() - runningSession.startTime.getTime()) / 1000,
        );

      runningSession.endTime = endTime;
      runningSession.status = "completed";

      await runningSession.save();
    }

    // Fresh sessions fetch karo
    const sessions = await timermodel.find({
      daySessionId: req.params.id,
      userId,
    });

    const totalTime = sessions.reduce(
      (sum, session) => sum + (session.duration || 0),
      0,
    );

    daySession.totalDaytime = totalTime;
    daySession.status = "completed";

    await daySession.save();

    return res.status(200).json({
      message: "Day session completed",
      totalTime,
      totalSessions: sessions.length,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});


//---------------------------------------------------------------------------------------


router.get("/day/:daySessionId/sessions", async (req, res) => {
  try {
    const userId = req.user.id;

    const sessions = await timermodel
      .find({
        daySessionId: req.params.daySessionId,
        userId,
      })
      .sort({ startTime: 1 });

    res.status(200).json({
      sessions,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//---------------------------------------------------------------------------------------

router.delete("/session/:id", async (req, res) => {
  try {
    const userId = req.user.id;

    const session = await timermodel.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    res.status(200).json({
      message: "Session deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//---------------------------------------------------------------------------------------

router.patch("/day/:id", async function (req, res) {
  try {
    const userId = req.user.id;
    const { title, deadline } = req.body;

    const updateData = {};

    if (title) updateData.title = title;
    if (deadline) updateData.deadline = deadline;

    const daySession = await dailysessionmodel.findOneAndUpdate(
      {
        _id: req.params.id,
        userId,
      },
      updateData,
      {
        new: true,
      },
    );

    if (!daySession) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    res.status(200).json({
      message: "session is updated",
      daySession,
    });
  } catch (err) {
    res.status(500).json({
      message: "Something went wrong",
      error: err.message,
    });
  }
});
