const express = require("express");
const router = express.Router();

// 1. Apne Middlewares Import Karo (Spelling Theek Kar Di Gayi Hai)
const authMiddleware = require("../middleware/authmiddleware"); 
const userValidationMiddleware = require("../middleware/uservalidation"); 

// 2. Apna Naya Schema aur Controllers Import Karo
const { calendarEventSchema } = require("../validators/calendarValidator"); 
const { getEvents, addEvent, updateEvent, deleteEvent } = require("../controller/calendar.controller.js");

// 🔴 AUTH MIDDLEWARE: Ye route sirf tabhi chalega jab user Login hoga
router.use(authMiddleware);

// 🟢 GET aur DELETE routes
router.get("/", getEvents);
router.delete("/:id", deleteEvent);

// 🛡️ POST aur PUT routes (Yahan userValidationMiddleware ka sahi naam use kiya hai)
router.post("/", userValidationMiddleware(calendarEventSchema), addEvent);
router.put("/:id", userValidationMiddleware(calendarEventSchema), updateEvent);

module.exports = router;