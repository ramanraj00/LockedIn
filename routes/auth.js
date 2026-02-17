const usermodel = require("../database/users")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET
const express = require("express");
const app = express()


app.use(express.json());
app.post("/signup", async function(req,res){

try{
const name = req.body.name;
const email = req.body.email;
const password = req.body.password;
const imageUrl = req.body.imageUrl;


const hasedPassword = await bcrypt.hash(password,10)

await usermodel.create({
    name:name,
    email:email,
    password:hasedPassword,
    imageUrl:imageUrl
})


res.json({
    message:"Account created Sucessfully"
})

}

catch(err){
    res.status(500).json({
        message: "Error creating account",
        error: err.message
    })
}

})

app.post("/signin", async function(req,res){

try {

const email = req.body.email;
const password = req.body.password;

const user = await usermodel.findOne({email});

if(!user){
    return res.json({
        message:"User not found"
    })
} 

const isMatch = await bcrypt.compare(password, user.password)

if(isMatch){
    const token = jwt.sign({
        id: user._id.toString()
    },JWT_SECRET)
   return res.json({
        token:token,
        message:"Login Successful"
    })
} else{
    res.json({
        message:"Please enter Valid credentials"
    })
}

    }

    catch(err){
        res.status(500).json({
            message: "Login error",
            error: err.message
        })
    }

})

console.log("suiii")

app.listen(3000);