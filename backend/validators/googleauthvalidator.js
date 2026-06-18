const {z} = require("zod");

const googleAuthSchema = z.object({

    token:z.string()
});

module.exports = googleAuthSchema;