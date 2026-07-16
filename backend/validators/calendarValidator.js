// Calendar Event Validator
const { z } = require("zod");
const calendarEventSchema = z.object({
    title: z
        .string({ required_error: "Title is required" })
        .min(1, "Title cannot be empty")
        .max(100),
    
    date: z
        .string({ required_error: "Date is required" })
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
    
    color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid Hex Color")
        .default("#3B82F6")
        .optional(),
    
    type: z
        .enum(["normal", "important", "birthday"])
        .default("normal")
        .optional()
});

module.exports = {
    // ... tumhare purane exports
    calendarEventSchema
};