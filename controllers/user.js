require("dotenv").config();
const User = require("../models/user");
const bcrypt=require('bcrypt');
var crypto=require('crypto');
const user = require("../models/user");
const algorithm = 'aes256';
const key=process.env.secretKey;



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

                    var exp =  Date.now()+20000;       //lifetime
                    var token=user._id+'.'+exp;
                    
                    const cipher=crypto.createCipher(algorithm,key);
                    var encrypted=cipher.update(token,'utf8','hex')+cipher.final('hex');
                                     
                     user.tokens.push({token: encrypted});
                     await user.save();
               
                     res.status(200).json({"msg" : "logged in",token: encrypted});
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

exports.logoutUser = async (req,res) => {
     if(req.id) 
     {
         User.findOne({"_id":req.id})
         .then(async (user)=>{
        try {
            await user.tokens.filter(async (token)=> {

                const decipher= await crypto.createDecipher(algorithm,key);
                var data=await decipher.update(token.token,'hex','utf8');
                data+=decipher.final('utf8');
                var exp=data.split('.')[1];
    
                console.log("date "+exp);
                console.log(req.token);
                console.log(token.token);
    
                 if(token.token !=req.token && Date.now()<=exp) {
                    return true;
                 } 
                 return false;   
             })
             await user.save();
        }
        catch(err) {
            res.status(500).json({error: "Something went wrong !!"});
         }   
         })
         .catch((err)=>{
            res.status(401).json({"msg": "UnAuthorized !!",error: err})
         })     
     }
     else {
        res.status(400).json({"msg": "You are not logged In !!"});
     }  
}