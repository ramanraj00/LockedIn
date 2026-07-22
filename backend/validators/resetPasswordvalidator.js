const { z } = require("zod");

const resetPasswordSchema = z.object({
     password: z
    .string()
    // 🔥 Same here, strict regex removed
    .min(60, { message: "Invalid password hash length" })
    .max(100),
});

module.exports = {
    resetPasswordSchema
};