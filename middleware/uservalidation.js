


const userValidationmiddleware = (schema) => {

    return (req,res,next) => {

        const result = schema.safeParse(req.body);

        if(!result.sucess){
            return res.status(400).json({
                message:'Validation Failed',
                errors:result.error.errors
            });
        }

        req.body = result.data; 
        next()
    }
}

module.exports = userValidationmiddleware;