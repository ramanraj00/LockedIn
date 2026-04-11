const {z} = require ("zod")

const forgetpasswordvalidatorSchemna = z.object({

    email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string"
    })
    .email({ message: "Email is invalid" }),

});

module.exports = {
    forgetpasswordvalidatorSchemna
}