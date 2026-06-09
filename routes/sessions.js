const express = require("express");
const timermodel = require("../models/studysession");
const router = express.Router();

router.post("/addsession", async function (req, res) {
  try {
    const userId = req.user.id;
    const { daySessionId } = req.body;

    const session = await timermodel.create({
      daySessionId,
      userId,
      startTime: new Date(),
      status: "running"
    });

    res.status(201).json({
        messgae:"Session started"
    })


  } catch (err) {

    res.status(500).json({

        messgae:"Something went wrong",
        error: err.message,
    })

  }
});

router.patch("/patch/session/:id/pause", async function (req,res){

  try {

    const userId = req.user.id;
    const session = await timermodel.findOne({
      _id:req.param.id,
      userId
    })
      
    if(!session){
      res.status(404).json({
        message:"Session not found"
      })
    }

    if(session.staus!="running"){
      res.staus(400).json({
        message:"Sessio already paused"
      })
    }

    session.endTime = new Date();
    session.staus = "paused"

    await session.save();


    res.staus(200).json({
      message:"Session paused successfully",
      session
    })

  } catch(err){

     res.status(500).json({
      message: err.message
    });
  }


})

router.post("/session/:id/resume", async (req, res) => {
  try {

    const userId = req.user.id;

    const oldSession = await timermodel.findOne({
      _id: req.params.id,
      userId
    });

    if (!oldSession) {
      return res.status(404).json({
        message: "Session not found"
      });
    }

    const newSession = await timermodel.create({
      daySessionId: oldSession.daySessionId,
      userId,
      startTime: new Date(),
      status: "running"
    });

    res.status(201).json({
      message: "Session resumed",
      session: newSession
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
});


