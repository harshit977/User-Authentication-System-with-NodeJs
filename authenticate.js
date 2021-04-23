require("dotenv").config();
const express = require('express');
const User = require('./models/user');
const bcrypt = require('bcrypt');
var crypto=require('crypto');
var algorithm = 'aes256';
var key=process.env.secretkey;


function extractToken (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
}

exports.verifyUser = async (req,res,next) => {
     var encrypted=extractToken(req);
     if(!encrypted) {
        return res.status(404).json({error: "Auth token Missing"});
     }

     try {
            const decipher= await crypto.createDecipher(algorithm,toString(process.env.secretkey));
            var token=await decipher.update(encrypted,'hex','utf8');
            token+=decipher.final('utf8');
            
            var id=token.split('.')[0];
            var exp=token.split('.')[1];
    
            if(Date.now()>exp) {
                return res.status(401).json({error: "Token Expired !!"});
            }
            await User.findOne({'_id': id , 'tokens.token' : encrypted})
            .then((user)=>{
            if(!user) {
                return res.status(401).json({error: "Unauthorized !!"});
            }
                req.user=user;
                req.token=encrypted;
                return next();
            }) 
            .catch((err)=> {
            return  res.status(500).json(err);
            })
     }
   catch(err) {
       return res.status(401).json({error : "Invalid Token !!"});
   }
     
}

exports.verifyAdmin =  (req,res,next)=> {
    if(req.user.admin===true) {
        return next();
    }
    else
    return res.status(401).json({error: "Admin access required !!"});
}

exports.isVerifiedUser = (req,res,next) => {

    if(!req.body.email || !req.body.password) 
    {
        return res.status(400).json({ "msg": "Either email or password field is empty" });
    }

    User.findOne({email: req.body.email})
    .then((user) => {
      if (user.isVerified) {
          next();              
      }
      else {
          res.status(403).json({"msg" : "Your account has not been verified !!"});
          return;
      } 
  }, (err) => next(err))
  .catch((err) => next(err)) 
}