require("dotenv").config();
const User = require("../models/user");
const bcrypt=require('bcrypt');
const crypto = require('crypto-json');

exports.registerUser = (req,res) => {

    if(!req.body.email || !req.body.password) {
        return res.status(400).json({ msg: "Either email or password field is empty" });
    }
     User.findOne({email: req.body.email})
    .then(async (user) => {
        console.log(user);
        if(user) 
        {    
            res.status(403).json({"msg": "Email already registered with some other account !!"});
            return;
        }

            const salt= await bcrypt.genSalt(13);
            const encryptedPassword =await bcrypt.hash(req.body.password, salt);
        
            var newUser= new User({
                email: req.body.email,
                password: encryptedPassword,
                isVerified : false
            });
            if (req.body.firstname)
                newUser.firstname = req.body.firstname;
            if (req.body.lastname)
                newUser.lastname = req.body.lastname;

            await newUser.save();
            res.status(201).json({"msg": "User Registration Successfull !!",data : newUser});
            return;
    })
    .catch((err)=> {
        res.status(500).json({error: err});
    })

}

exports.loginUser = async (req,res) => {

    if(!req.body.email || !req.body.password) 
    {
        return res.status(400).json({ msg: "Either email or password field is empty" });
    }

    await User.findOne({email: req.body.email})
    .then(async (user)=> {
        if(user) 
        {
            await bcrypt.compare(req.body.password,user.password,async (err,same) => {
                 if(!err && same) {
                     
                    
                    var exp =  Date.now()+20000          //20 sec lifetime
                    var info=user._id;
                     
                     var token=await bcrypt.hash(info,10);
                     

                     user.token=token;
                     user.expireTime=exp;
                     await user.save();
                     res.status(200).json({"msg" : "logged in",token: token});
                     return;
                 }
                 if(!err && !same) {
                    res.status(401).json({"msg": "Unauthorized !! Incorrect Password"});
                    return;
                 }
                 if(err) {
                    res.status(500).json({error: err});
                    return;
                 }
            })
        }
        else {
            res.status(404).json({"msg": "Email Not Found !!"});
            return;
        }
    })
    .catch((err) => {
        res.status(500).json({error: err});
    })
}

exports.logoutUser = (req,res) => {
     //TODO TASK   
}