const {z} = require("zod");

const userloginSchema = z.object({

email : z 
.string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string"
})
.email({ message: "Email is invalid" })
.trim(),

password: z
    .string({
         required_error: "Password is required",
         invalid_type_error: "Password must be a string"
    })
    .nonempty("Password is required")
    
})

module.exports = {
    userloginSchema
}