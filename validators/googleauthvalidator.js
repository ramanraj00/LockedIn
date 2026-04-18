const {z} = require("zod");

const googleAuthSchema = z.object({

    token: string (required)
});

module.exports({
    googleAuthSchema
})