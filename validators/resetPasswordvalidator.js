const {z} = require("zod");

const resetPasswordSchema = z.object({

     password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[!@#$%^&*]/, "Must include special character")
    .max(100),

})

module.exports = ({
    resetPasswordSchema
})
