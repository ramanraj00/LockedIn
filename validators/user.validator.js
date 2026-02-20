const { z } = require("zod");

const userValidSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters" })
    .max(50)
    .trim(),

  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string"
    })
    .email({ message: "Email is invalid" }),

  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" })
    .regex(/[!@#$%^&*]/, "Must include special character")
    .max(100),

     imageUrl: z
     .string()
     .url()
    

});

module.exports = {
  userValidSchema
};
