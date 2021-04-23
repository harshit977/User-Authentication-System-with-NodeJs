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
            const decipher= await crypto.createDecipher(algorithm,key);
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
       return res.status(500).json({error : "Something went wrong !!"});
   }
     
}