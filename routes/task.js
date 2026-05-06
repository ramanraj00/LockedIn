// here we are getting tasks of user of per day...

const express = require("express");
const { cache } = require("react");
const taskmodel = require("../models/tasks");
const router = express.Router();

router.post("/addtask", async function(req,res){

    try {
        const user = req.user.id;
        const {description ,  daySessionId} = req.body;

        const task = await taskmodel.create({
            description, // description to har task ke liye hoga for example , doing this at this time ....
            daySessionId,
            userId
        });

        res.status(201).json({
            message:"Task Cretaed",
            task
        });

    } catch(err) {
        res.status(500).json({
            message:"Error creating task",
            error: err.message
        });
    }

})


router.get("/gettask", async function(req,res){

    try {
    
        const userId = req.user.id;
        const {daySessionId} = req.params;

        const tasks = await taskmodel.find({
            userId,
            daySessionId
        });

        res.json(tasks);



    } catch(err){
        res.status(500).json({
            message:"Error fetching task"
        }
        )

    }

})


router.patch("/patchtask", async function(req,res){

     try {

        const userId = req.user.id;
        const {taskId} = req.params;
        const { isCompleted } = req.body;
        const tasks = await  taskmodel.findOneAndUpdate(
            {_id:taskId,userId},
            {$set:{isCompleted}},
            {new:true}
        );

          res.status(200).json(tasks);


    } catch (err) {

        res.status(500).json({
            message:"Somethng went wrong"
        })

    }

})


router.delete("/deletetask",function(req,res){

})
