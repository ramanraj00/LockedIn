// for authentican we have auth 


const ratelimit = require("express-rate-limit");
const usermodel = require("../models/users");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET){
    throw new Error ("JWT SECRET is not defined or missing")
}
const express = require("express");
const router = express.Router();
const userValidationMiddleware = require("../middleware/uservalidation");
const { userValidSchema } = require("../validators/user.validator");
const {userloginSchema} = require("../validators/login.validator");
const { forgetpasswordvalidatorSchemna } = require("../validators/forgetemailvalidator");
const sendResetEmail = require("../Services/emailServices");
const {resetPasswordSchema} = require("../validators/resetPasswordvalidator");


// so one user cant try to login contunusly and prevent brute force 
const loginLimiter = ratelimit({
    windowMs:15*60*1000, // We are tracking requests for 15 minutes
    max:5, //A single IP address can only make 5 requests in 15 minutes.
    message:"Too many Login attempts, Try again Later"
})


// Signup route 

router.post("/signup", userValidationMiddleware(userValidSchema),loginLimiter, async function(req,res){ // signup routes

try {
const name = req.body.name;
const email = req.body.email.toLowerCase();
const password = req.body.password;
const imageUrl = req.body.imageUrl;

const existingUser = await usermodel.findOne({email});
// to check same email cant signup again
if(existingUser){
    return res.status(400).json({
        message:"Unable to create account"
    });
};


const hasedPassword = await bcrypt.hash(password,10) // hassing the password using bycrpt library

await usermodel.create({
    name:name,
    email:email,
    password:hasedPassword,
    imageUrl:imageUrl
});


res.status(201).json({
    message:"Account created Successfully"
});

}

catch(err){
    res.status(500).json({
        message: "Error creating account",
        error: err.message
    });
}

});


// password forget 

router.post("/forgetPassword",userValidationMiddleware(forgetpasswordvalidatorSchemna), async function(req,res){

    try {
        const email = req.body.email.toLowerCase();
        const emailexist = await usermodel.findOne({email});
        if(!emailexist){
            return res.json({
          message: "If this email exists, reset link has been sent",
        });
        }
        if(emailexist){
            const token = jwt.sign({
                id:emailexist._id.toString()
            }, JWT_SECRET,{expiresIn: "10min" })
 
            emailexist.resetToken = token;
            emailexist.resetTokenExpiry = Date.now() +  10 * 60 * 1000;
            await emailexist.save()

            await sendResetEmail (email,token);

             return res.json({
              message: "If this email exists, reset link has been sent",
           });


            
        }

    }

    catch(error){

        console.error(error);
        return res.status(500).json({
            message:"Something went wrong"
        });

    }
});

router.post("/reset-password/:token", userValidationMiddleware(resetPasswordSchema), async function(req, res) {
    
    try {

        const token = req.params.token;
        const password = req.body.password;

       let decoded;

try {
    decoded = jwt.verify(token, JWT_SECRET);
} catch (err) {
    return res.status(400).json({
        message: "Invalid or Expired token"
    });
}
        const user = await usermodel.findById(decoded.id);

        if(!user ){
            
         return res.status(400).json({
            message:"Invalid  token"
         });
        }

        if(user.resetTokenExpiry < Date.now()){
            return res.status(400).json({
                message:"Token Expired"
            })
        }
        const hasedPassword = await bcrypt.hash(password,10);


       user.password = hasedPassword;

       user.resetToken = undefined;
       user.resetTokenExpiry = undefined;

       await user.save()

        res.status(201).json({
            message:"Password created succesfully"
        })


    } catch(error){

         console.error(error);
        return res.status(500).json({
            message:"Something went wrong"
        });

    }


})





// SignIn Route 

router.post("/signin",userValidationMiddleware(userloginSchema), loginLimiter, async function(req,res){

try {

const email = req.body.email;
const password = req.body.password;

const user = await usermodel
.findOne({email})
.select("+password");

if(!user){
    return res.status(401).json({
        message:"Please enter Valid credentials"
    });
} 

const isMatch = await bcrypt.compare(password, user.password) // here we compare the password in our db vs password client send



if(isMatch){
    const token = jwt.sign({
        id: user._id.toString() //for token we are using jwt
    },JWT_SECRET,{ expiresIn: "7d" })
   return res.json({
        token:token,
        message:"Login Successful"
    });
} else{
    return res.status(401).json({
        message:"Please enter Valid credentials"
    });
}

    }

    catch(err){
        res.status(500).json({
            message: "Login error",
            error: err.message
        });
    }

});


module.exports = router
