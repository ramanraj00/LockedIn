const CalendarEvent = require("../models/calendar");

// 🟢 GET ALL EVENTS
exports.getEvents = async (req, res) => {
    try {
        const userId = req.user.id;
        const events = await CalendarEvent.find({ userId });
        res.status(200).json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ message: "Failed to fetch events" });
    }
};

// 🟢 ADD NEW EVENT
exports.addEvent = async (req, res) => {
    try {
        const userId = req.user.id;
        const { title, date, color, type } = req.body;

        if (!title || !date) {
            return res.status(400).json({ message: "Title and date are required" });
        }

        const newEvent = await CalendarEvent.create({
            userId,
            title,
            date,
            color,
            type
        });

        res.status(201).json(newEvent);
    } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).json({ message: "Failed to add event" });
    }
};

// 🟢 UPDATE EVENT
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { title, date, color, type } = req.body;

        const updatedEvent = await CalendarEvent.findOneAndUpdate(
            { _id: id, userId },
            { title, date, color, type },
            { new: true }
        );

        if (!updatedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json(updatedEvent);
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({ message: "Failed to update event" });
    }
};

// 🟢 DELETE EVENT
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deletedEvent = await CalendarEvent.findOneAndDelete({ _id: id, userId });

        if (!deletedEvent) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).json({ message: "Failed to delete event" });
    }
};