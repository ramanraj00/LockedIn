// here we are getting tasks of user of per day...

const express = require("express");
const taskmodel = require("../models/tasks");
const router = express.Router();

//  for adding user task in db ------------------------------------------------------------------------

router.post("/addtask", async function(req,res){

    try {
        
        const userId = req.user.id;
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

//  to get user task on the basis of user id and daysession ------------------------------------------------------------------------

router.get("/gettask/:daySessionId", async function(req,res){

    try {
    
        const userId = req.user.id;
        const {daySessionId} = req.params;

        const task = await taskmodel.find({
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

//  to patch the existing task on the basis of taskid (every task has unique id) ------------------------------------------------------------------------

router.patch("/patchtask/:taskId", async function(req,res){

     try {

        const userId = req.user.id;
        const {taskId} = req.params;
        const { isCompleted } = req.body;
        const tasks = await  taskmodel.findOneAndUpdate(
            {_id:taskId,userId, daySessionId},
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

//  to delete the exiting task on the basis of taskid
// ------------------------------------------------------------------------


router.delete("/deletetask/:taskId",async function(req,res){

    try{

        const userId = req.user.id
        const {taskId} = req.params;

        const task = await taskmodel.findOneAndDelete(
         {_id: taskId,userId, daySessionId}
        );

        if(!task){
            return res.status(404).json({
                message:"Task not found"
            })
        }

        res.status(200).json({
            message:"Task Deleted Successfully"
        })

    } catch(err){

        res.status(500).json({
            message:"Something went wrong"
        })

    }
})
