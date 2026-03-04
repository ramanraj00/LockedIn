const express = require("express");
const { cache } = require("react");
const router = express.Router();

router.post("/addtask", async function(req,res){

    try {

        const user = req.user.id;
        const {title , description , deadline , daySessionId} = req.body;

        const task = await taskmodel.create({
            title,
            description,
            deadline,
            daySessionId
        })

        res.status(201).json({
            message:"Task Cretaed",
            task
        })

    } catch(err) {
        res.status(500).json({
            message:"Error creating task",
            error: err.message
        })
    }

})


router.get("/gettask",function(req,res){

    try {
    
        const user = req.user.id;
        




    } catch(err){




    }

})


router.patch("/patchtask",function(req,res){

})


router.delete("/deletetask",function(req,res){

})
