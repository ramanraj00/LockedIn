
const userValidationMiddleware = (schema) => {

    return (req,res,next) => {

        const result = schema.safeParse(req.body);

        if(!result.success){
            return res.status(400).json({
                message:'Validation Failed',
                errors:result.error.errors
            });
        }

        req.body = result.data; 
        next()
    }
}

module.exports = userValidationMiddleware;