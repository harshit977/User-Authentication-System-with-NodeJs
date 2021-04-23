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

                    var exp =  parseInt(Date.now())+parseInt(process.env.expire);       //lifetime 1 minute
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
     if(req.user) 
     {
         console.log(req.user);
            try {
                var count=0;
                await req.user.tokens.map(async (token)=> {
     
                     const decipher= await crypto.createDecipher(algorithm,key);
                     var data=await decipher.update(token.token,'hex','utf8');
                     data+=decipher.final('utf8');
                     var exp=data.split('.')[1];
         
                     if((token.token != req.token) && (Date.now()<=exp)) {
                         //do nothing
                      }
                      else {
                          console.log(count);
                          req.user.tokens.splice(count, 1);
                          console.log(req.user.tokens);
                          count--;
                      } 
                      count++;   
                  })
                  await req.user.save();
                  return res.status(200).json({data: req.user});
             }
             catch(err) {
                 return res.status(500).json({error: "Something went wrong !!"});
              } 
        }
     else {
        return res.status(400).json({"msg": "You are not logged In !!"});
     }  
}

exports.dumpUsers = (req,res) => {         //dump all users except admin 
    if(!req.user) {
         res.status(401).json({error: "UnAuthorized !!"});
    }
    User.find((err, users)=> {
        if(err) {
            return res.status(404).json({error: err});
        }
        users=users.filter((user)=>{

            if(user.admin===true)
            return true;
            else
            user.remove();
            return false;
        })
        return res.status(200).json({"msg": "Dump Successfull !!"});
    })   
} 